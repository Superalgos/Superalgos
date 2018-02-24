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

var buffer = require('buffer').Buffer;
var stream = require('stream');
var util = require('util');

var Constants = require('../util/constants');
var bufferSize = Constants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;

function BrowserFileReadStream(file, options) {
  stream.Readable.call(this, options);

  if (!options) {
    options = {};
  }

  this._fileReader = new FileReader(file); // HTML FileReader
  this._file = file;
  this._size = file.size;
  this._highWaterMark = options.highWaterMark || bufferSize;
  this._offset = 0;
  var self = this;

  this._fileReader.onloadend = function (event) {
    var data = event.target.result;
    var buf = buffer.from(data);
    self.push(buf);
  };

  this._fileReader.onerror = function (error) {
    self.emit('error', error);
  };
}
util.inherits(BrowserFileReadStream, stream.Readable);

BrowserFileReadStream.prototype._read = function() {
  if (this._offset >= this._size) {
    this.push(null);
  } else {
    var end = this._offset + this._highWaterMark;
    var slice = this._file.slice(this._offset, end);
    this._fileReader.readAsArrayBuffer(slice);
    this._offset = end;
  }
};

module.exports = BrowserFileReadStream;