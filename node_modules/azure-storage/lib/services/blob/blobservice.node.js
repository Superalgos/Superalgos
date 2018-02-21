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
var BlobService = require('./blobservice.core');
var extend = require('extend');
var fs = require('fs');
var mime = require('browserify-mime');

var azureutil = azureCommon.util;
var Constants = azureCommon.Constants;
var FileReadStream = azureCommon.FileReadStream;
var SpeedSummary = azureCommon.SpeedSummary;
var validate = azureCommon.validate;
var BlobConstants = Constants.BlobConstants;

/**
* Downloads a blob into a file.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             localFileName                               The local path to the file to be downloaded.
* @param {object}             [options]                                   The request options.
* @param {boolean}            [options.skipSizeCheck]                     Skip the size check to perform direct download.
*                                                                         Set the option to true for small blobs.
*                                                                         Parallel download and speed summary won't work with this option on.
* @param {SpeedSummary}       [options.speedSummary]                      The download tracker objects.
* @param {int}                [options.parallelOperationThreadCount]      The number of parallel operations that may be performed when uploading.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {string}             [options.rangeStart]                        Return only the bytes of the blob in the specified range.
* @param {string}             [options.rangeEnd]                          Return only the bytes of the blob in the specified range.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
* @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading blobs.
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
*                                                                         otherwise `[result]{@link BlobResult}` will contain the blob information.
*                                                                         `response` will contain information related to this operation.
* @return {SpeedSummary}
* 
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* blobService.getBlobToLocalFile('taskcontainer', 'task1', 'task1-download.txt', function(error, serverBlob) {
*   if(!error) {
*     // Blob available in serverBlob.blob variable
*   }
*/
BlobService.prototype.getBlobToLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

  validate.validateArgs('getBlobToLocalFile', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.string(localFileName, 'localFileName');
    v.containerNameIsValid(container);
    v.callback(callback);
  });
  
  return this._getBlobToLocalFile(container, blob, localFileName, options, callback);
};

/**
* Uploads a page blob from file. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                           The container name.
* @param {string}             blob                                                The blob name.
* @param {string}             localFileName                                       The local path to the file to be uploaded.
* @param {object}             [options]                                           The request options.
* @param {SpeedSummary}       [options.speedSummary]                              The upload tracker objects.
* @param {int}                [options.parallelOperationThreadCount]              The number of parallel operations that may be performed when uploading.
* @param {string}             [options.leaseId]                                   The lease identifier.
* @param {string}             [options.transactionalContentMD5]                   An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                                  The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                       Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                                 The default value is false for page blobs.
* @param {bool}               [options.useTransactionalMD5]                       Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blobTier]                                  For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
BlobService.prototype.createPageBlobFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  return this._createBlobFromLocalFile(container, blob, BlobConstants.BlobTypes.PAGE, localFileName, optionsOrCallback, callback);
};

/**
* Creates a new block blob. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             localFileName                                 The local path to the file to be uploaded.
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
BlobService.prototype.createBlockBlobFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  return this._createBlobFromLocalFile(container, blob, BlobConstants.BlobTypes.BLOCK, localFileName, optionsOrCallback, callback);
};

/**
* Creates a new append blob from a local file. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* If you want to append data to an already existing blob, please look at appendFromLocalFile.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             localFileName                                 The local path to the file to be uploaded.
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
BlobService.prototype.createAppendBlobFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  return this._createBlobFromLocalFile(container, blob, BlobConstants.BlobTypes.APPEND, localFileName, optionsOrCallback, callback);
};

/**
* Appends to an append blob from a local file. Assumes the blob already exists on the service.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* (Not available in the JavaScript Client Library for Browsers)
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             localFileName                                 The local path to the file to be uploaded.
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
BlobService.prototype.appendFromLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('appendFromLocalFile', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.string(localFileName, 'localFileName');
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);

  var self = this;
  fs.stat(localFileName, function (error, stat) {
    if (error) {
      callback(error);
    } else {
      var stream = new FileReadStream(localFileName, { calcContentMd5: options.storeBlobContentMD5 });
      var streamCallback = function (appendError, blob, response) {
        if (azureutil.objectIsFunction(stream.destroy)) {
          stream.destroy();
        }
        callback(appendError, blob, response);
      };
      self._uploadBlobFromStream(false, container, blob, BlobConstants.BlobTypes.APPEND, stream, stat.size, options, streamCallback);
    }
  });
  
  return options.speedSummary;
};

// Private methods

/**
* Creates a new blob (Block/Page/Append). If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @ignore
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param {string}             localFileName                                 The local path to the file to be uploaded.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
BlobService.prototype._createBlobFromLocalFile = function (container, blob, blobType, localFileName, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('_createBlobFromLocalFile', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobTypeIsValid(blobType);
    v.string(localFileName, 'localFileName');
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);

  var self = this;
  var size = 0;
  
  var creationCallback = function (createError, createBlob, createResponse) {
    if (createError) {
      callback(createError, createBlob, createResponse);
    } else {
      // Automatically detect the mime type
      if(azureutil.tryGetValueChain(options, ['contentSettings','contentType'], undefined) === undefined) {
        azureutil.setObjectInnerPropertyValue(options, ['contentSettings','contentType'], mime.lookup(localFileName));
      }

      var stream = new FileReadStream(localFileName, { calcContentMd5: options.storeBlobContentMD5 });
      var streamCallback = function (createError, createBlob, createResponse) {
        if (azureutil.objectIsFunction(stream.destroy)) {
          stream.destroy();
        }
        callback(createError, createBlob, createResponse);
      };
      self._uploadBlobFromStream(true, container, blob, blobType, stream, size, options, streamCallback);
    }
  };

  // Check the file size to determine the upload method: single request or chunks
  fs.stat(localFileName, function (error, stat) {
    if (error) {
      callback(error);
    } else {
      size = stat.size;
      self._createBlob(container, blob, blobType, size, options, creationCallback);
    }
  });
  
  return options.speedSummary;
};

/**
* Downloads a blob into a file.
* @ignore
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             localFileName                               The local path to the file to be downloaded.
* @param {object}             [options]                                   The request options.
* @param {boolean}            [options.skipSizeCheck]                     Skip the size check to perform direct download.
*                                                                         Set the option to true for small blobs.
*                                                                         Parallel download and speed summary won't work with this option on.
* @param {SpeedSummary}       [options.speedSummary]                      The download tracker objects.
* @param {int}                [options.parallelOperationThreadCount]      The number of parallel operations that may be performed when uploading.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {string}             [options.rangeStart]                        Return only the bytes of the blob in the specified range.
* @param {string}             [options.rangeEnd]                          Return only the bytes of the blob in the specified range.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
* @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading blobs.
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
*                                                                         otherwise `result` will contain the blob information.
*                                                                         `response` will contain information related to this operation.
* @return {SpeedSummary}
* 
*/
BlobService.prototype._getBlobToLocalFile = function (container, blob, localFileName, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);
  
  var writeStream = fs.createWriteStream(localFileName, { 'highWaterMark': BlobConstants.MAX_QUEUED_WRITE_DISK_BUFFER_SIZE });
  writeStream.on('error', function (error) {
    callback(error);
  });
  
  this.getBlobToStream(container, blob, writeStream, options, function (error, responseBlob, response) {
    if (error) {
      writeStream.end(function () {
        // If the download failed from the beginning, remove the file.
        if (fs.existsSync(localFileName) && writeStream.bytesWritten === 0) {
          fs.unlinkSync(localFileName);
        }
        callback(error, responseBlob, response);
      });
    } else {
      callback(error, responseBlob, response);
    }
  });
  
  return options.speedSummary;
};

module.exports = BlobService;