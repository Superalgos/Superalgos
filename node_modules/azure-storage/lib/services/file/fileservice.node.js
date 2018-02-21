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
var azureCommon = require('./../../common/common.node');
var extend = require('extend');
var fs = require('fs');
var FileService = require('./fileservice.core');

var azureutil = azureCommon.util;
var FileReadStream = azureCommon.FileReadStream;
var SpeedSummary = azureCommon.SpeedSummary;
var validate = azureCommon.validate;

/**
* Downloads an Azure file into a file.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {FileService}
* @param {string}             share                                       The share name.
* @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
* @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
* @param {string}             localFileName                               The local path to the file to be downloaded.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
* @param {boolean}            [options.skipSizeCheck]                     Skip the size check to perform direct download.
*                                                                         Set the option to true for small files.
*                                                                         Parallel download and speed summary won't work with this option on.
* @param {SpeedSummary}       [options.speedSummary]                      The download tracker objects.
* @param {int}                [options.parallelOperationThreadCount]      The number of parallel operations that may be performed when uploading.
* @param {string}             [options.rangeStart]                        Return only the bytes of the file in the specified range.
* @param {string}             [options.rangeEnd]                          Return only the bytes of the file in the specified range.
* @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
* @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading files.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information if an error occurs; 
*                                                                         otherwise `[result]{@link FileResult}` will contain the file information.
*                                                                         `response` will contain information related to this operation.
* @return {SpeedSummary}
* 
* @example
* var azure = require('azure-storage');
* var FileService = azure.createFileService();
* FileService.getFileToLocalFile('taskshare', taskdirectory', 'task1', 'task1-download.txt', function(error, serverFile) {
*   if(!error) {
*     // file available in serverFile.file variable
*   }
*/
FileService.prototype.getFileToLocalFile = function (share, directory, file, localFileName, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  userOptions.speedSummary = userOptions.speedSummary || new SpeedSummary(file);

  validate.validateArgs('getFileToLocalFile', function (v) {
    v.string(share, 'share');
    v.stringAllowEmpty(directory, 'directory');
    v.string(file, 'file');
    v.string(localFileName, 'localFileName');
    v.shareNameIsValid(share);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var writeStream = fs.createWriteStream(localFileName);
  writeStream.on('error', function (error) {
    callback(error);
  });

  this.getFileToStream(share, directory, file, writeStream, options, function (error, responseFile, response) {
    if (error) {
      writeStream.end(function () {
        // If the download failed from the beginning, remove the file.
        if (fs.existsSync(localFileName) && writeStream.bytesWritten === 0) {
          fs.unlinkSync(localFileName);
        }
        callback(error, responseFile, response);
      });
    } else {
      callback(error, responseFile, response);
    }
  });
  
  return options.speedSummary;
};


/**
* Uploads a file to storage from a local file. If the file already exists on the service, it will be overwritten.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {FileService}
* @param {string}             share                                         The share name.
* @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
* @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
* @param (string)             localFileName                                 The local path to the file to be uploaded.
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
FileService.prototype.createFileFromLocalFile = function (share, directory, file, localFileName, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createFileFromLocalFile', function (v) {
    v.string(share, 'share');
    v.stringAllowEmpty(directory, 'directory');
    v.string(file, 'file');
    v.string(localFileName, 'localFileName');
    v.shareNameIsValid(share);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(file);

  var self = this;
  fs.stat(localFileName, function(error, stat) {
    if (error) {
      callback(error);
    } else {
      self.createFile(share, directory, file, stat.size, options, function(error) {
        if(error) {
          callback(error);
        } else {
          var stream = new FileReadStream(localFileName, {calcContentMd5: options.storeFileContentMD5});
          self._createFileFromChunkStream(share, directory, file, stream, stat.size, options, callback);
        }
      });
    }
  });

  return options.speedSummary;
};

module.exports = FileService;