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

var azureCommon = require('./../common.core');
var azureutil = azureCommon.util;
var Constants = require('./../util/constants');
var EventEmitter = require('events').EventEmitter;

/**
* Range stream
*/
function RangeStream(serviceClient, container, blob, options) {
  this.serviceClient = serviceClient;
  this._emitter = new EventEmitter();
  this._paused = false;
  this._emittedAll = false;
  this._emittedRangeIndex = 0;
  this._rangelist = [];
  this._resourcePath = [];
  this._isEmitting = false;
  this._rangeStreamEnded = false;
  this._lengthHeader = Constants.HeaderConstants.CONTENT_LENGTH;
  this._minRangeSize = Constants.BlobConstants.MIN_WRITE_PAGE_SIZE_IN_BYTES;
  this._maxRangeSize = Constants.BlobConstants.DEFAULT_WRITE_PAGE_SIZE_IN_BYTES;
  if (options.rangeStart) {
    this._startOffset = options.rangeStart;
  } else {
    this._startOffset = 0;
  }
  this._dataOffset = this._startOffset;
  if (options.rangeEnd) {
    this._endOffset = options.rangeEnd;
  } else {
    this._endOffset = Number.MAX_VALUE;
  }
  if (container) {
    this._resourcePath.push(container);
  }
  if (blob) {
    this._resourcePath.push(blob); 
  }
}

/**
* Get range list
*/
RangeStream.prototype.list = function (options, callback) {
  var start = this._startOffset;
  var end;
  var singleRangeSize = Constants.BlobConstants.MAX_SINGLE_GET_PAGE_RANGE_SIZE;

  if (this._listFunc === undefined) {
    // the default function puts the whole blob into a single list item
    this._listFunc = this._defaultListFunc;
    end = this._endOffset;
  } else {
    end = Math.min(this._startOffset + singleRangeSize - 1, this._endOffset);
  }
  options.rangeStart = start;
  if (end != Number.MAX_VALUE) {
    options.rangeEnd = end;
  }

  var self = this;
  var onList = function (error, ranges, response) {
    if (error) {
      callback(error);
    } else {
      if (self._rangeStreamEnded) {
        return;
      }

      var totalSize = parseInt(response.headers[self._lengthHeader], 10);
      var endOffset = Math.min(totalSize - 1, self._endOffset);
      var rangeEnd = Math.min(end, endOffset);
  
      if (!ranges.length) {
        // convert single object to range
        // start >= end means there is no valid regions
        ranges.push({ start : start, end : rangeEnd, dataSize: 0 });
      } else if (ranges[ranges.length - 1].end !== rangeEnd) {
        // don't forget the zero chunk at the end of range
        ranges.push({ start : ranges[ranges.length - 1].end + 1, end : rangeEnd, dataSize: 0 });
      }
      
      if (end >= endOffset) {
        self._rangeStreamEnded = true;
      }
      self.resizeAndSaveRanges(ranges);
      self._startOffset += singleRangeSize;
      self._emitRange();
      
      // This is only valid when listing pages because when listing with the default function, the "endOffset" will always equal to or greater than the "end". 
      if (end < endOffset && !self._rangeStreamEnded) {
        process.nextTick(function () {
          ranges = null;
          self.list(options, callback);
          self = null;
        });
      }
    }
  };

  var callArguments = Array.prototype.slice.call(this._resourcePath);
  callArguments.push(options);
  callArguments.push(onList);
  this._listFunc.apply(this.serviceClient, callArguments);
};

/**
* Resize regions:
*   1. Merge small pieces into a range no less than this._minRangeSize
*   2. Split large pieces into ranges no more than this._maxRangeSize
*/
RangeStream.prototype.resizeAndSaveRanges = function (ranges) {
  var rangeList = this._rangelist;
  var holdingRange = { type : 'range', size : 0, dataSize : 0, start : this._startOffset, end : -1 };
  var readingRange = null;
  var rangeSize = 0;

  for (var index = 0; index < ranges.length; index++) {
    readingRange = ranges[index];
    rangeSize = readingRange.end - holdingRange.start + 1;
    
    if (rangeSize < this._minRangeSize) {
      // merge fragment ranges
      this.mergeRanges(holdingRange, readingRange);
    } else {
      if (holdingRange.end != -1) {
        // save the holding range list and hold the reading range
        this.splitAndSaveRanges(holdingRange, rangeList);
        holdingRange = readingRange;
      }
      
      if (this._dataOffset != readingRange.start) {
        // padding zero for empty range and hold the reading range 
        this.putZeroRange(this._dataOffset, readingRange.start - 1, rangeList);
        holdingRange = readingRange;
      } else if (holdingRange.end == -1) {
        // if holdingRange is never set, it means readingRange exceeds MIN_WRITE_FILE_SIZE_IN_BYTES
        this.splitAndSaveRanges(readingRange, rangeList);
        // reading range has been saved, offset the holding start position for calculating the range size in next loop
        holdingRange.start = readingRange.end + 1;
      }
    }
    
    // If it is the last range, put the holding range into list anyway
    if (index == ranges.length - 1 && holdingRange.end > holdingRange.start) {
      this.splitAndSaveRanges(holdingRange, rangeList);
    }
    
    this._dataOffset = readingRange.end + 1;
  }
};

/**
* Put a zero range into range list
*/
RangeStream.prototype.putZeroRange = function (startOffset, endOffset, rangeList) {
  var zeroDataRange = { type : 'range', size : -1, dataSize : 0, start : startOffset, end : endOffset };
  this.splitAndSaveRanges(zeroDataRange, rangeList);
};

/**
* Merge small ranges
*/
RangeStream.prototype.mergeRanges = function (holdingRange, readingRange) {
  holdingRange.size = readingRange.end - holdingRange.start + 1;
  holdingRange.dataSize += readingRange.dataSize;
  holdingRange.end = readingRange.end;
  return holdingRange;
};

/**
* Split range into small pieces with maximum _maxRangeSize and minimum _minRangeSize size.
* For example, [0, 10G - 1] => [0, 4MB - 1], [4MB, 8MB - 1] ... [10GB - 4MB, 10GB - 1]
*/
RangeStream.prototype.splitAndSaveRanges = function (range, rangeList) {
  var rangeSize = range.end - range.start + 1;
  var offset = range.start;
  var limitedSize = 0;

  while (rangeSize > 0) {
    var newRange = { type : 'range', size : 0, dataSize : 0, start : -1, end : -1 };
    limitedSize = Math.min(rangeSize, this._maxRangeSize);
    newRange.start = offset;
    newRange.size = limitedSize;
    if (range.dataSize === 0) {
      newRange.dataSize = 0;
    } else {
      newRange.dataSize = limitedSize;
    }
    offset += limitedSize;
    newRange.end = offset - 1;
    rangeList.push(newRange);
    rangeSize -= limitedSize;
  }
};

/**
* Emit a range
*/
RangeStream.prototype._emitRange = function () {
  if (this._paused || this._emittedAll || this._isEmitting) return;
  this._isEmitting = true;
  try {
    for (; this._emittedRangeIndex < this._rangelist.length; this._emittedRangeIndex++) {
      if (this._paused) {
        return;
      }
      var range = this._rangelist[this._emittedRangeIndex];
      this._emitter.emit('range', range);
      this._rangelist[this._emittedRangeIndex] = null;
    }
    
    if (this._rangeStreamEnded) {
      this._rangelist = null;
      this._emittedAll = true;
      this._emitter.emit('end');
    }
  } finally {
    this._isEmitting = false;
  }
};

/**
* The Default list function which puts the whole blob into one range.
*/
RangeStream.prototype._defaultListFunc = function (container, blob, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });
  
  this.getBlobProperties(container, blob, options, function (error, result, response) {
    if (error) {
      callback(error);
    } else {
      var range = [{}];
      range[0].start = options.rangeStart ? Math.max(options.rangeStart, 0) : 0;
      range[0].end = options.rangeEnd ? Math.min(options.rangeEnd, result.contentLength - 1) : result.contentLength - 1;
      range[0].size = range[0].end - range[0].start + 1;
      range[0].dataSize = range[0].size;
      callback(error, range, response);
    }
  });
};

/**
* Add event listener
*/
RangeStream.prototype.on = function (event, listener) {
  this._emitter.on(event, listener);
};

/**
* Pause the stream
*/
RangeStream.prototype.pause = function () {
  this._paused = true;
};

/**
* Resume the stream
*/
RangeStream.prototype.resume = function () {
  this._paused = false;
  if (!this._isEmitting) {
    this._emitRange();
  }
};

/**
* Stop the stream
*/
RangeStream.prototype.stop = function () {
  this.pause();
  this._emittedAll = true;
  this._emitter.emit('end');
};

module.exports = RangeStream;
