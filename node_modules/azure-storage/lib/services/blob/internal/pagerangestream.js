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
* PageBlob page range stream
*/
function PageRangeStream(blobServiceClient, container, blob, options) {
  PageRangeStream['super_'].call(this, blobServiceClient, container, blob, options);
  
  if (options.minRangeSize) {
    this._minRangeSize = options.minRangeSize;
  } else {
    this._minRangeSize = Constants.BlobConstants.MIN_WRITE_PAGE_SIZE_IN_BYTES;
  }
  if (options.maxRangeSize) {
    this._maxRangeSize = options.maxRangeSize;
  } else {
    this._maxRangeSize = Constants.BlobConstants.DEFAULT_WRITE_PAGE_SIZE_IN_BYTES;
  }
  this._lengthHeader = Constants.HeaderConstants.BLOB_CONTENT_LENGTH;
  this._listFunc = blobServiceClient.listPageRanges;
}

util.inherits(PageRangeStream, RangeStream);

module.exports = PageRangeStream;
