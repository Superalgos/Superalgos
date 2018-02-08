// 
// Copyright (c) Microsoft and contributors.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
// 

var stream = require('stream');
var util = require('util');

var azureutil = require('../util/util');
var Md5Wrapper = require('../md5-wrapper');
var Constants = require('../util/constants');
var bufferSize = Constants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;

/**
*  Chunk stream
*  1. Calculate md5
*  2. Track reading offset
*  3. Work with customize memory allocator
*  4. Buffer data from stream.
*  @param {object} options stream.Readable options
*/
function ChunkStream(options) {
  stream.Stream.call(this);
  this.writable = this.readable = true;

  if (!options) {
    options = {};
  }

  this._highWaterMark = options.highWaterMark || bufferSize;

  this._paused = undefined; //True/false is the external status from users.

  this._isStreamOpened = false;
  this._offset = 0;
  this._allocator = options.allocator;
  this._streamEnded = false;
  this._md5hash = null;
  this._buffer = null;
  this._internalBufferSize = 0;
  this._outputLengthLimit = 0;
  this._md5sum = undefined;

  if (options.calcContentMd5) {
    this._md5hash = new Md5Wrapper().createMd5Hash();
  }
}

util.inherits(ChunkStream, stream.Stream);

/**
* Set the memory allocator.
*/
ChunkStream.prototype.setMemoryAllocator = function(allocator) {
  this._allocator = allocator;
};

/**
* Set the output length.
*/
ChunkStream.prototype.setOutputLength = function(length) {
  if (length) {
    this._outputLengthLimit = length;
  }
};

/**
* Internal stream ended
*/
ChunkStream.prototype.end = function (chunk, encoding, cb) {
  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk) {
    this.write(chunk, encoding);
  }

  this._streamEnded = true;
  this._flushInternalBuffer();
  
  if (cb) {
    this.once('end', cb);
  }

  this.emit('end');
};

ChunkStream.prototype.finish = function () {
  this.emit('finish');

  this.destroy();
};

ChunkStream.prototype.error = function () {
  this.emit('error');

  this.destroy();
};

ChunkStream.prototype.destroy = function () {
  this.writable = this.readable = false;

  if (this._allocator && azureutil.objectIsFunction(this._allocator.destroy)) {
    this._allocator.destroy();
  }
  
  this.emit('close');
};

ChunkStream.prototype.stop = function () {
  this.destroy();
  this._streamEnded = true;
  this.emit('end');
};

/**
* Add event listener
*/
ChunkStream.prototype.write = function (chunk, encoding) {
  if (!this._isStreamOpened) {
    this._isStreamOpened = true;
  }

  this._buildChunk(chunk, encoding);

  return !this._paused;
};

/**
* Buffer the data into a chunk and emit it
*/
ChunkStream.prototype._buildChunk = function (data) {
  if (typeof data == 'string') {
    data = new Buffer(data);
  }
  var dataSize = data.length;
  var dataOffset = 0;
  do {
    var buffer = null;
    var targetSize = this._internalBufferSize + dataSize;

    if (targetSize < this._highWaterMark) {
      // add the data to the internal buffer and return as it is not yet full
      this._copyToInternalBuffer(data, dataOffset, data.length);
      return;
    } else if (targetSize == this._highWaterMark){
      var canReleaseInnerStreamBuffer = this._stream && this._stream._allocator && this._stream._allocator.releaseBuffer;
      if(this._internalBufferSize === 0 && data.length === this._highWaterMark && !canReleaseInnerStreamBuffer) {
        // set the buffer to the data passed in to avoid creating a new buffer
        buffer = data;
      } else {
        // add the data to the internal buffer and pop that buffer
        this._copyToInternalBuffer(data, dataOffset, data.length);
        buffer = this._popInternalBuffer();
      }
      dataSize = 0;
    } else {
      // add data to the internal buffer until its full, then return it
      // set the dataSize parameter so that additional data is not lost
      var copySize = this._highWaterMark - this._internalBufferSize;
      this._copyToInternalBuffer(data, dataOffset, dataOffset + copySize);
      dataSize -= copySize;
      dataOffset += copySize;
      buffer = this._popInternalBuffer();
    }
    this._emitBufferData(buffer);
  } while(dataSize > 0);
};

/**
* Emit the buffer
*/
ChunkStream.prototype._emitBufferData = function(buffer) {
  var newOffset = this._offset + buffer.length;
  var range = {
    start : this._offset,
    end : newOffset - 1,
    size : buffer.length
  };

  this._offset = newOffset;
  
  if (this._outputLengthLimit > 0) {
    // When the start postion is larger than the limit, no data will be consumed though there is an event to be emitted.
    // So the buffer should not be calculated.
    if (range.start <= this._outputLengthLimit) {
      if (this._offset > this._outputLengthLimit) {
        // Don't use negative end parameter which means the index starting from the end of the buffer
        // to be compatible with node 0.8.
        buffer = buffer.slice(0, buffer.length - (this._offset - this._outputLengthLimit));
      }
      if (this._md5hash) {
        this._md5hash.update(buffer);
      }
    }
  } else if (this._md5hash) {
    this._md5hash.update(buffer);
  }

  this.emit('data', buffer, range);
};

/**
* Copy data into internal buffer
*/
ChunkStream.prototype._copyToInternalBuffer = function(data, start, end) {
  if(start === undefined) start = 0;
  if(end === undefined) end = data.length;
  if (!this._buffer) {
    this._buffer = this._allocateNewBuffer();
    this._internalBufferSize = 0;
  }
  var copied = data.copy(this._buffer, this._internalBufferSize, start, end);
  this._internalBufferSize += copied;

  if (this._stream && this._stream._allocator && this._stream._allocator.releaseBuffer) {
    this._stream._allocator.releaseBuffer(data);
  }

  if(copied != (end - start)) {
    throw new Error('Can not copy entire data to buffer');
  }
};

/**
* Flush internal buffer
*/
ChunkStream.prototype._flushInternalBuffer = function() {
  var buffer = this._popInternalBuffer();
  if (buffer) {
    this._emitBufferData(buffer);
  }
};

/**
* Pop internal buffer
*/
ChunkStream.prototype._popInternalBuffer = function () {
  var buf = null;
  if (!this._buffer || this._internalBufferSize === 0) {
    buf = null;
  } else if(this._internalBufferSize == this._highWaterMark) {
    buf = this._buffer;
  } else {
    buf = this._buffer.slice(0, this._internalBufferSize);
  }

  this._buffer = null;
  this._internalBufferSize = 0;

  return buf;
};

/**
* Allocate a buffer
*/
ChunkStream.prototype._allocateNewBuffer = function() {
  var size = this._highWaterMark;
  if(this._allocator && azureutil.objectIsFunction(this._allocator.getBuffer)) {
    return this._allocator.getBuffer(size);
  } else {
    var buffer = new Buffer(size);
    return buffer;
  }
};

/**
* Get file content md5 when read completely.
*/
ChunkStream.prototype.getContentMd5 = function(encoding) {
  if (!encoding) encoding = 'base64';
  if(!this._md5hash) {
    throw new Error('Can\'t get content md5, please set the calcContentMd5 option for FileReadStream.');
  } else {
    if (this._streamEnded) {
      if (!this._md5sum) {
        this._md5sum = this._md5hash.digest(encoding);
      }
      return this._md5sum;
    } else {
      throw new Error('Stream has not ended.');
    }
  }
};

/**
* Pause chunk stream
*/
ChunkStream.prototype.pause = function() {
  this._paused = true;
};

/**
* Resume read stream
*/
ChunkStream.prototype.resume = function() {
  if (this._paused) {
    this._paused = false;

    this.emit('drain');
  }
};

module.exports = ChunkStream;