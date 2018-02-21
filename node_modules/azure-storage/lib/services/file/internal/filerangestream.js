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
var RangeStream = require('./../../../common/streams/rangestream');
var Constants = require('./../../../common/util/constants');

/**
* File range stream
*/
function FileRangeStream(fileServiceClient, share, directory, file, options) {
  FileRangeStream['super_'].call(this, fileServiceClient, null, null, options);
    
  this._lengthHeader = Constants.HeaderConstants.FILE_CONTENT_LENGTH;
  if (options.minRangeSize) {
    this._minRangeSize = options.minRangeSize;
  } else {
    this._minRangeSize = Constants.FileConstants.MIN_WRITE_FILE_SIZE_IN_BYTES;
  }
  if (options.maxRangeSize) {
    this._maxRangeSize = options.maxRangeSize;
  } else {
    this._maxRangeSize = Constants.FileConstants.DEFAULT_WRITE_SIZE_IN_BYTES;
  }
  this._listFunc = fileServiceClient.listRanges;
  this._resourcePath.push(share);
  this._resourcePath.push(directory);
  this._resourcePath.push(file);
}

util.inherits(FileRangeStream, RangeStream);

module.exports = FileRangeStream;
