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
var fs = require('fs');
var validator = require('validator');

var Md5Wrapper = require('../md5-wrapper');
var Constants = require('../util/constants');
var bufferSize = Constants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;

var EventEmitter = require('events').EventEmitter;

/**
*  File read stream
*  1. Calculate md5
*  2. Track reading offset
*  3. Work with customize memory allocator
*  4. Buffer data from stream.
*  @param {object} options stream.Readable options
*/
function FileReadStream(path, options) {
  stream.Stream.call(this);
  this.readable = true;

  if(!options) {
    options = {};
  }

  this._destroyed = false;
  this._streamEnded = false;
  this._fd = null;
  this._fileName = undefined;
  this._highWaterMark = options.highWaterMark || bufferSize;
  this._offset = 0;
  this._paused = undefined;
  this._allocator = options.allocator;
  this._fileName = path;

  this._md5hash = null;
  this._md5sum = undefined;

  if (options.calcContentMd5) {
    this._md5hash = new Md5Wrapper().createMd5Hash();
  }

  this._open();
}

util.inherits(FileReadStream, stream.Stream);

/**
* Open file
*/
FileReadStream.prototype._open = function () {
  var flags = 'r';
  var self = this;
  fs.open(this._fileName, flags, function(error, fd) {
    if (error) {
      self.emit('error', error);
    } else {
      self._fd = fd;
      self.emit('open', fd);
    }
  });
};

/**
* Add event listener
*/
FileReadStream.prototype.on = function(event, listener) {
  if (event === 'data' && this._paused === undefined) {
    this._paused = false;
    this._emitData();
  }

  return EventEmitter.prototype.on.call(this, event, listener);
};

/**
* Set memory allocator
*/
FileReadStream.prototype.setMemoryAllocator = function(allocator) {
  this._allocator = allocator;
};

/**
* Get buffer
*/
FileReadStream.prototype._getBuffer = function(size) {
  if(this._allocator && this._allocator.getBuffer) {
    return this._allocator.getBuffer(size);
  } else {
    var buffer = new Buffer(size);
    return buffer;
  }
};

/**
* Release buffer
*/
FileReadStream.prototype._releaseBuffer = function(buffer) {
  if(this._allocator && this._allocator.releaseBuffer) {
    this._allocator.releaseBuffer(buffer);
  }
};

/**
* Emit the data from file
*/
FileReadStream.prototype._emitData = function() {
  var self = this;
  if(!this._fd) {
    this.once('open', function() {
      self._emitData();
    });
    return;
  }

  if (this._paused || this._streamEnded) {
    return;
  }
  var buffer = this._getBuffer(this._highWaterMark);
  fs.read(this._fd, buffer, 0, this._highWaterMark, this._offset, function(error, bytesRead, readBuffer) {
    if (error) {
      self.emit('error', error);
      return;
    }

    if(bytesRead === 0) {
      if(!self._streamEnded) {
        self._streamEnded = true;
        self.emit('end');
      }
      return;
    }

    var range = {
      start : self._offset,
      end : self._offset + bytesRead - 1,
      size : bytesRead
    };

    var data;
    if(bytesRead == self._highWaterMark) {
      data = readBuffer;
    } else {
      data = readBuffer.slice(0, bytesRead);
      //Release the current buffer since we created a new one
      self._releaseBuffer(readBuffer);
    }

    if(self._md5hash) {
      self._md5hash.update(data);
    }

    self.emit('data', data, range);

    // cleanup
    self._offset += bytesRead;
    buffer = readBuffer = data = null;
    self._emitData();
  });
};

/**
* Get file content md5 when read completely.
*/
FileReadStream.prototype.getContentMd5 = function(encoding) {
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
      throw new Error('FileReadStream has not ended.');
    }
  }
};

/**
* Pause chunk stream
*/
FileReadStream.prototype.pause = function() {
  this._paused = true;
};

/**
* Resume read stream
*/
FileReadStream.prototype.resume = function() {
  var previousState = this._paused;
  if (this._paused) {
    this._paused = false;

    if(previousState === true) {
      //Only start to emit data when it's in pause state
      this._emitData();
    }
  }
};

FileReadStream.prototype.finish = function () {
  this.destroy();
};

FileReadStream.prototype.destroy = function () {
  if (this._destroyed) {
    return;
  }

  var self = this;
  this.readable = false;

  function close(fd) {
    fs.close(fd || self._fd, function(err) {
      if (err) {
        self.emit('error', err);
      }
      else {
        self.emit('close');
      }
    });
    self._fd = null;
    self._destroyed = true;
  }

  // when the stream is closed immediately after creating it
  if (!validator.isInt('' + this._fd)) {
    this.once('open', close);
    return;
  }

  close();
};

FileReadStream.prototype.stop = function () {
  this.destroy();
  this._streamEnded = true;
  this.emit('end');
};

module.exports = FileReadStream;
