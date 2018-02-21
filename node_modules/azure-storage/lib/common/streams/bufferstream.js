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

function BufferStream(buffer, options) {
    stream.Readable.call(this, options);

    this._buffer = buffer;
    this._offset = 0;
    this._chunkSize = 4 * 1024 * 1024;
    this._bufferSize = buffer.length;
}

util.inherits(BufferStream, stream.Readable);

BufferStream.prototype._read = function () {
    while (this.push(this._readNextChunk())) {
        continue;
    }
};

BufferStream.prototype._readNextChunk = function () {
    var data = null;

    if (this._offset < this._bufferSize) {
        var end = this._offset + this._chunkSize;
        end = end > this._bufferSize ? this._bufferSize : end;
        data = this._buffer.slice(this._offset, end);
        this._offset = end;
    }

    return data;
};

module.exports = BufferStream;