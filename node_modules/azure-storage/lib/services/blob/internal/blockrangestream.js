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

var Constants = require('./../../../common/util/constants');
var EventEmitter = require('events').EventEmitter;
var BlobUtilities = require('./../blobutilities');

/**
* BlockBlob block range stream
*/
function BlockRangeStream(blobServiceClient, container, blob, options) {
  this.blobServiceClient = blobServiceClient;
  this.container = container;
  this.blob = blob;
  this._emitter = new EventEmitter();
  this._paused = false;
  this._emittedAll = false;
  this._emittedRangeType = null;
  this._emittedRangeIndex = null;
  this._offset = 0;
  this._rangelist = [];
  this._isEmitting = false;
  if (options.rangeStart) {
    this._startOffset = options.rangeStart;
  } else {
    this._startOffset = 0;
  }
  if (options.rangeEnd) {
    this._endOffset = options.rangeEnd;
  } else {
    this._endOffset = Number.MAX_VALUE;
  }
}

/**
* Add event listener
*/
BlockRangeStream.prototype.on = function (event, listener) {
  this._emitter.on(event, listener);
};

/**
* Get block list
*/
BlockRangeStream.prototype.list = function (options, callback) {
  if (!options) {
    options = {};
  }
  
  if (!options.blockListFilter) {
    options.blockListFilter = BlobUtilities.BlockListFilter.ALL;
  }
  
  var self = this;
  this.blobServiceClient.listBlocks(this.container, this.blob, options.blockListFilter, options, function (error, blocklist, response) {
    if (error) {
      callback(error);
    } else {
      var totalSize = parseInt(response.headers[Constants.HeaderConstants.BLOB_CONTENT_LENGTH], 10);
      if (!blocklist.CommittedBlocks) {
        //Convert single block blob to block blob range
        var name = 'NODESDK_BLOCKBLOB_RANGESTREAM';
        blocklist.CommittedBlocks = [{ Name : name, Size : totalSize }];
      }
      
      self._rangelist = blocklist;
      self._emitBlockList();
      self = blocklist = null;
    }
  });
};

/**
* Emit block ranges
*/
BlockRangeStream.prototype._emitBlockList = function () {
  if (this._paused || this._emittedAll || this._isEmitting) return;
  
  var self = this;
  this._getTypeList(function () {
    self._rangelist = null;
    self._emittedAll = true;
    self._emitter.emit('end');
  });
};

/**
* Get the block type list
*/
BlockRangeStream.prototype._getTypeList = function (callback) {
  this._isEmitting = true;
  try {
    var typeStart = false;
    if (this._rangelist) {
      for (var blockType in this._rangelist) {
        if (this._rangelist.hasOwnProperty(blockType)) {
          if (this._emittedRangeType === null || typeStart || this._emittedRangeType == blockType) {
            this._emittedRangeType = blockType;
            typeStart = true;
          } else if (this._emittedRangeType !== blockType) {
            continue;
          }
          
          if (this._paused) {
            return;
          }
          
          this._emitBlockRange (blockType, callback);
        }
      }
    }
  } finally {
    this._isEmitting = false;
  }
};

/**
* Get the block list
*/
BlockRangeStream.prototype._emitBlockRange  = function (blockType, callback) {
  var blockList = this._rangelist[blockType];
  var indexStart = false;
  for (var blockIndex = 0; blockIndex < blockList.length; blockIndex++) {
    if (this._emittedRangeIndex === null || indexStart || this._emittedRangeIndex === blockIndex) {
      this._emittedRangeIndex = blockIndex;
      indexStart = true;
    } else if (this._emittedRangeIndex !== blockIndex) {
      continue;
    }
    
    if (this._paused) {
      return;
    }
    
    var range = blockList[blockIndex];
    // follow the same naming convention of page ranges and json
    range.name = range.Name;
    range.type = blockType;
    range.start = this._offset;
    this._offset += parseInt(range.Size, 10);
    range.end = this._offset - 1;
    delete range.Name;
    delete range.Size;
    
    if (range.start > this._endOffset) {
      break;
    } else if (range.end < this._startOffset) {
      continue;
    } else {
      range.start = Math.max(range.start, this._startOffset);
      range.end = Math.min(range.end, this._endOffset);
      range.size = range.end - range.start + 1;
      range.dataSize = range.size;
      this._emitter.emit('range', range);
    }
  }

  // remove the used range and avoid memory leak
  this._rangelist[blockType] = null;

  callback();
};

/**
* Pause the stream
*/
BlockRangeStream.prototype.pause = function () {
  this._paused = true;
};

/**
* Resume the stream
*/
BlockRangeStream.prototype.resume = function () {
  this._paused = false;
  if (!this._isEmitting) {
    this._emitBlockList();
  }
};

/**
* Stop the stream
*/
BlockRangeStream.prototype.stop = function () {
  this.pause();
  this._emittedAll = true;
  this._emitter.emit('end');
};

module.exports = BlockRangeStream;
