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

// Module dependencies.
var FileService = require('./fileservice.core');
var azureCommon = require('./../../common/common.browser');
var extend = require('extend');

var azureutil = azureCommon.util;
var BrowserFileReadStream = azureCommon.BrowserFileReadStream;
var SpeedSummary = azureCommon.SpeedSummary;
var validate = azureCommon.validate;
var ChunkStreamWithStream = azureCommon.ChunkStreamWithStream;

/**
* Uploads a file to storage from an HTML File object. If the file already exists on the service, it will be overwritten.
* (Only available in the JavaScript Client Library for Browsers)
*
* @this {FileService}
* @param {string}             share                                         The share name.
* @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
* @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
* @param {File}               browserFile                                   The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
* @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for files.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {object}             [options.contentSettings]                     The file's content settings.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to. 
*                                                                           Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]            The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                           execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                           The default value is false.
* @param {errorOrResult}      callback                                      `error` will contain information if an error occurs; 
*                                                                           otherwise `[result]{@link FileResult}` will contain the file information.
*                                                                           `response` will contain information related to this operation.
* @return {SpeedSummary}
*/
FileService.prototype.createFileFromBrowserFile = function (share, directory, file, browserFile, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createFileFromBrowserFile', function (v) {
    v.string(share, 'share');
    v.stringAllowEmpty(directory, 'directory');
    v.string(file, 'file');
    v.browserFileIsValid(browserFile);
    v.shareNameIsValid(share);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(file);

  var self = this;
  this.createFile(share, directory, file, browserFile.size, options, function (error) {
    if (error) {
      callback(error);
    } else {
      var stream = new BrowserFileReadStream(browserFile);
      var chunkStream = new ChunkStreamWithStream(stream, { calcContentMd5: options.storeFileContentMD5 });
      self._createFileFromChunkStream(share, directory, file, chunkStream, browserFile.size, options, callback);
    }
  });

  return options.speedSummary;
};

module.exports = FileService;