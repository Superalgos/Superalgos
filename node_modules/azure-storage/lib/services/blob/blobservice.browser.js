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

var BlobService = require('./blobservice.core');
var azureCommon = require('./../../common/common.browser');
var extend = require('extend');
var mime = require('browserify-mime');

var Constants = azureCommon.Constants;
var azureutil = azureCommon.util;
var BlobConstants = Constants.BlobConstants;
var BrowserFileReadStream = azureCommon.BrowserFileReadStream;
var SpeedSummary = azureCommon.SpeedSummary;
var validate = azureCommon.validate;

/**
* Creates a new block blob. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* (Only available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {File}               browserFile                                   The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                     The request options.
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {object}             [options.contentSettings]                     The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The blob's MD5 hash.
* @param {AccessConditions}   [options.accessConditions]                    The access conditions.
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
* @param {errorOrResult}      callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                           the blob information.
*                                                                           `response` will contain information related to this operation.
* @return {SpeedSummary}
*/
BlobService.prototype.createBlockBlobFromBrowserFile = function (container, blob, browserFile, optionsOrCallback, callback) {
  return this._createBlobFromBrowserFile(container, blob, BlobConstants.BlobTypes.BLOCK, browserFile, optionsOrCallback, callback);
};

/**
* Uploads a page blob from an HTML file. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* (Only available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                           The container name.
* @param {string}             blob                                                The blob name.
* @param {File}               browserFile                                         The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                           The request options.
* @param {SpeedSummary}       [options.speedSummary]                              The upload tracker objects.
* @param {int}                [options.parallelOperationThreadCount]              The number of parallel operations that may be performed when uploading.
* @param {string}             [options.leaseId]                                   The lease identifier.
* @param {string}             [options.transactionalContentMD5]                   An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                                  The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                       Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                                 The default value is false for page blobs.
* @param {bool}               [options.useTransactionalMD5]                       Calculate and send/validate content MD5 for transactions.
* @param {object}             [options.contentSettings]                           The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]               The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]           The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]           The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]              The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]        The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]                The blob's MD5 hash.
* @param {AccessConditions}   [options.accessConditions]                          The access conditions.
* @param {LocationMode}       [options.locationMode]                              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]                       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]                  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]                  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                                 The default value is false.
* @param {errorOrResult}      callback                                            `error` will contain information
*                                                                                 if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                                 the blob information.
*                                                                                 `response` will contain information related to this operation.
* @return {SpeedSummary}
*/
BlobService.prototype.createPageBlobFromBrowserFile = function (container, blob, browserFile, optionsOrCallback, callback) {
  return this._createBlobFromBrowserFile(container, blob, BlobConstants.BlobTypes.PAGE, browserFile, optionsOrCallback, callback);
};

/**
* Creates a new append blob from an HTML File object. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* If you want to append data to an already existing blob, please look at appendFromBrowserFile.
* (Only available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {File}               browserFile                                   The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {string}             [options.leaseId]                             The lease identifier. 
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {object}             [options.contentSettings]                     The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The blob's MD5 ahash.
* @param {AccessConditions}   [options.accessConditions]                    The access conditions.
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
* @param {errorOrResult}      callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                           the blob information.
*                                                                           `response` will contain information related to this operation.
* @return {SpeedSummary}
*/
BlobService.prototype.createAppendBlobFromBrowserFile = function (container, blob, browserFile, optionsOrCallback, callback) {
  return this._createBlobFromBrowserFile(container, blob, BlobConstants.BlobTypes.APPEND, browserFile, optionsOrCallback, callback);
};

/**
* Appends to an append blob from an HTML File object. Assumes the blob already exists on the service.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* (Only available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {File}               browserFile                                   The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {object}             [options.contentSettings]                     The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The blob's MD5 hash.
* @param {AccessConditions}   [options.accessConditions]                    The access conditions.
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
* @param {errorOrResult}      callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                           the blob information.
*                                                                           `response` will contain information related to this operation.
* @return {SpeedSummary}
*/
BlobService.prototype.appendFromBrowserFile = function (container, blob, browserFile, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('appendFromBrowserFile', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.browserFileIsValid(browserFile);
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);  

  var stream = new BrowserFileReadStream(browserFile);
  var streamCallback = function (appendError, blob, response) {
    if (azureutil.objectIsFunction(stream.destroy)) {
        stream.destroy();
    }
    callback(appendError, blob, response);
  };
  this._uploadBlobFromStream(false, container, blob, BlobConstants.BlobTypes.APPEND, stream, browserFile.size, options, streamCallback);

  return options.speedSummary;
};

// Private methods

/**
* Creates a new blob (Block/Page/Append). If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* (Only available in the JavaScript Client Library for Browsers)
*
* @ignore
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param {File}               browserFile                                   The File object to be uploaded created by HTML File API.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {object}             [options.contentSettings]                     The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The MD5 hash of the blob content.
* @param {AccessConditions}   [options.accessConditions]                    The access conditions.
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
* @param {errorOrResult}      callback                                      The callback function.
*
* @return {SpeedSummary}
*
*/
BlobService.prototype._createBlobFromBrowserFile = function (container, blob, blobType, browserFile, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('_createBlobFromBrowserFile', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobTypeIsValid(blobType);
    v.browserFileIsValid(browserFile);
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);
  
  var self = this;
  var creationCallback = function (createError, createBlob, createResponse) {
    if (createError) {
      callback(createError, createBlob, createResponse);
    } else {
      // Automatically detect the mime type
      if(azureutil.tryGetValueChain(options, ['contentSettings','contentType'], undefined) === undefined) {
        azureutil.setObjectInnerPropertyValue(options, ['contentSettings','contentType'], mime.lookup(browserFile.name));
      }

      var stream = new BrowserFileReadStream(browserFile);
      var streamCallback = function (createError, createBlob, createResponse) {
        if (azureutil.objectIsFunction(stream.destroy)) {
          stream.destroy();
        }
        callback(createError, createBlob, createResponse);
      };
      self._uploadBlobFromStream(true, container, blob, blobType, stream, browserFile.size, options, streamCallback);
    }
  };

  this._createBlob(container, blob, blobType, browserFile.size, options, creationCallback);
  
  return options.speedSummary;
};

module.exports = BlobService;