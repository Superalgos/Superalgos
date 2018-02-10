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

var util = require('util');
var azureutil = require('../util/util');

/**
* Blob upload/download speed summary
*/
function SpeedSummary (name) {
  this.name = name;
  this._startTime = Date.now();
  this._timeWindowInSeconds = 10;
  this._timeWindow = this._timeWindowInSeconds * 1000;
  this._totalWindowSize = 0;
  this._speedTracks = new Array(this._timeWindowInSeconds);
  this._speedTrackPtr = 0;
  this.totalSize = undefined;
  this.completeSize = 0;
}

/**
* Convert the size to human readable size
*/
function toHumanReadableSize(size, len) {
  if(!size) return '0B';
  if (!len || len <= 0) {
    len = 2;
  }
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  var i = Math.floor( Math.log(size) / Math.log(1024));
  return (size/Math.pow(1024, i)).toFixed(len) + units[i];
}

/**
* Get running seconds
*/
SpeedSummary.prototype.getElapsedSeconds = function(humanReadable) {
  var now = Date.now();
  var seconds = parseInt((now - this._startTime) / 1000, 10);
  if (humanReadable !== false) {
    var s = parseInt(seconds % 60, 10);
    seconds /= 60;
    var m = Math.floor(seconds % 60);
    seconds /= 60;
    var h = Math.floor(seconds);
    seconds = util.format('%s:%s:%s', azureutil.zeroPaddingString(h, 2), azureutil.zeroPaddingString(m, 2), azureutil.zeroPaddingString(s, 2));
  }
  return seconds;
};

/**
* Get complete percentage
* @param {int} len The number of digits after the decimal point.
*/
SpeedSummary.prototype.getCompletePercent = function(len) {
  if (this.totalSize) {
    if(!len || len <= 0) {
      len = 1;
    }
    return (this.completeSize * 100 / this.totalSize).toFixed(len);
  } else {
    if(this.totalSize === 0) {
      return 100;
    } else {
      return 0;
    }
  }
};

/**
* Get average upload/download speed
*/
SpeedSummary.prototype.getAverageSpeed = function(humanReadable) {
  var elapsedTime = this.getElapsedSeconds(false);
  return this._getInternalSpeed(this.completeSize, elapsedTime, humanReadable);
};

/**
* Get instant speed
*/
SpeedSummary.prototype.getSpeed = function(humanReadable) {
  this._refreshSpeedTracks();
  var elapsedTime = this.getElapsedSeconds(false);
  elapsedTime = Math.min(elapsedTime, this._timeWindowInSeconds);
  return this._getInternalSpeed(this._totalWindowSize, elapsedTime, humanReadable);
};

/**
* Get internal speed
*/
SpeedSummary.prototype._getInternalSpeed = function(totalSize, elapsedTime, humanReadable) {
  if (elapsedTime <= 0) {
    elapsedTime = 1;
  }
  var speed = totalSize / elapsedTime;
  if(humanReadable !== false) {
    speed = toHumanReadableSize(speed) + '/s';
  }
  return speed;
};

/**
* Refresh speed tracks
*/
SpeedSummary.prototype._refreshSpeedTracks = function() {
  var now = Date.now();
  var totalSize = 0;
  for(var i = 0; i < this._speedTracks.length; i++) {
    if(!this._speedTracks[i]) continue;
    if(now - this._speedTracks[i].timeStamp <= this._timeWindow) {
      totalSize += this._speedTracks[i].size;
    } else {
      this._speedTracks[i] = null;
    }
  }
  this._totalWindowSize = totalSize;
};

/**
* Increment the complete data size
*/
SpeedSummary.prototype.increment = function(len) {
  this.completeSize += len;
  this._recordSpeed(len);
  return this.completeSize;
};

/**
* record complete size into speed tracks
*/
SpeedSummary.prototype._recordSpeed = function(completeSize) {
  var now = Date.now();
  var track = this._speedTracks[this._speedTrackPtr];
  if(track) {
    var timeDiff = now - track.timeStamp;
    if(timeDiff > this._timeWindow) {
      track.timeStamp = now;
      track.size = completeSize;
    } else if(timeDiff <= 1000) { //1 seconds
      track.size += completeSize;
    } else {
      this._speedTrackPtr = (this._speedTrackPtr + 1) % this._timeWindowInSeconds;
      this._recordSpeed(completeSize);
    }
  } else {
    track = {timeStamp : now, size: completeSize};
    this._speedTracks[this._speedTrackPtr] = track;
  }
};

/**
* Get auto increment function
*/
SpeedSummary.prototype.getAutoIncrementFunction = function(size) {
  var self = this;
  return function(error, retValue) {
    if(!error) {
      var doneSize = 0;
      if((!retValue && retValue !== 0) || isNaN(retValue)) {
        doneSize = size;
      } else {
        doneSize = retValue;
      }
      self.increment(doneSize);
    }
  };
};

/**
* Get total size
*/
SpeedSummary.prototype.getTotalSize = function(humanReadable) {
  if (humanReadable !== false) {
    return toHumanReadableSize(this.totalSize);
  } else {
    return this.totalSize;
  }
};

/**
* Get completed data size
*/
SpeedSummary.prototype.getCompleteSize = function(humanReadable) {
  if (humanReadable !== false) {
    return toHumanReadableSize(this.completeSize);
  } else {
    return this.completeSize;
  }
};

module.exports = SpeedSummary;
