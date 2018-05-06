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
var qs = require('querystring');
var url = require('url');
var util = require('util');
var _ = require('underscore');
var extend = require('extend');

var azureCommon = require('./../../common/common.core');
var BlockRangeStream = require('./internal/blockrangestream');
var Md5Wrapper = require('./../../common/md5-wrapper');
var PageRangeStream = require('./internal/pagerangestream');
var RangeStream = require('./../../common/streams/rangestream');
var azureutil = azureCommon.util;
var SR = azureCommon.SR;
var validate = azureCommon.validate;
var StorageServiceClient = azureCommon.StorageServiceClient;
var WebResource = azureCommon.WebResource;

// Constants
var Constants = azureCommon.Constants;
var BlobConstants = Constants.BlobConstants;
var HeaderConstants = Constants.HeaderConstants;
var QueryStringConstants = Constants.QueryStringConstants;
var RequestLocationMode = Constants.RequestLocationMode;

// Streams
var BatchOperation = azureCommon.BatchOperation;
var SpeedSummary = azureCommon.SpeedSummary;
var ChunkAllocator = azureCommon.ChunkAllocator;
var ChunkStream = azureCommon.ChunkStream;
var ChunkStreamWithStream = azureCommon.ChunkStreamWithStream;

// Models requires
var AclResult = azureCommon.AclResult;
var ServiceStatsParser = azureCommon.ServiceStatsParser;
var BlockListResult = require('./models/blocklistresult');
var BlobResult = require('./models/blobresult');
var ContainerResult = require('./models/containerresult');
var LeaseResult = require('./models/leaseresult');

var BlobUtilities = require('./blobutilities');

// Errors requires
var errors = require('../../common/errors/errors');
var ArgumentError = errors.ArgumentError;
var ArgumentNullError = errors.ArgumentNullError;
var StorageError = errors.StorageError;

/**
* Creates a new BlobService object.
* If no connection string or storageaccount and storageaccesskey are provided,
* the AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY environment variables will be used.
* @class
* The BlobService class is used to perform operations on the Microsoft Azure Blob Service.
* The Blob Service provides storage for binary large objects, and provides
* functions for working with data stored in blobs as either streams or pages of data.
* 
* For more information on the Blob Service, as well as task focused information on using it in a Node.js application, see
* [How to Use the Blob Service from Node.js](http://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-blob-storage/).
* The following defaults can be set on the blob service.
* singleBlobPutThresholdInBytes                       The default maximum size, in bytes, of a blob before it must be separated into blocks.
* defaultEnableReuseSocket                            The default boolean value to enable socket reuse when uploading local files or streams.
*                                                     If the Node.js version is lower than 0.10.x, socket reuse will always be turned off.
* defaultTimeoutIntervalInMs                          The default timeout interval, in milliseconds, to use for request made via the Blob service.
* defaultClientRequestTimeoutInMs                     The default timeout of client requests, in milliseconds, to use for the request made via the Blob service.
* defaultMaximumExecutionTimeInMs                     The default maximum execution time across all potential retries, for requests made via the Blob service.
* defaultLocationMode                                 The default location mode for requests made via the Blob service.
* parallelOperationThreadCount                        The number of parallel operations that may be performed when uploading a blob that is greater than 
*                                                     the value specified by the singleBlobPutThresholdInBytes property in size.
* useNagleAlgorithm                                   Determines whether the Nagle algorithm is used for requests made via the Blob service; true to use the  
*                                                     Nagle algorithm; otherwise, false. The default value is false.
* @constructor
* @extends {StorageServiceClient}
*
* @param {string} [storageAccountOrConnectionString]  The storage account or the connection string.
* @param {string} [storageAccessKey]                  The storage access key.
* @param {string|object} [host]                       The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @param {string} [sasToken]                          The Shared Access Signature token.
* @param {string} [endpointSuffix]                    The endpoint suffix.
*/
function BlobService(storageAccountOrConnectionString, storageAccessKey, host, sasToken, endpointSuffix) {
  var storageServiceSettings = StorageServiceClient.getStorageSettings(storageAccountOrConnectionString, storageAccessKey, host, sasToken, endpointSuffix);

  BlobService['super_'].call(this,
    storageServiceSettings._name,
    storageServiceSettings._key,
    storageServiceSettings._blobEndpoint,
    storageServiceSettings._usePathStyleUri,
    storageServiceSettings._sasToken);
  
  this.defaultEnableReuseSocket = Constants.DEFAULT_ENABLE_REUSE_SOCKET;
  this.singleBlobPutThresholdInBytes = BlobConstants.DEFAULT_SINGLE_BLOB_PUT_THRESHOLD_IN_BYTES;
  this.parallelOperationThreadCount = Constants.DEFAULT_PARALLEL_OPERATION_THREAD_COUNT;
}

util.inherits(BlobService, StorageServiceClient);

// Non-class methods

/**
* Create resource name
* @ignore
*
* @param {string} containerName Container name
* @param {string} blobName      Blob name
* @return {string} The encoded resource name.
*/
function createResourceName(containerName, blobName, forSAS) {
  // Resource name
  if (blobName && !forSAS) {
    blobName = encodeURIComponent(blobName);
    blobName = blobName.replace(/%2F/g, '/');
    blobName = blobName.replace(/%5C/g, '/');
    blobName = blobName.replace(/\+/g, '%20');
  }

  // return URI encoded resource name
  if (blobName) {
    return containerName + '/' + blobName;
  }
  else {
    return containerName;
  }
}

// Blob service methods

/**
* Gets the service stats for a storage account’s Blob service.
*
* @this {BlobService}
* @param {object}       [options]                               The request options.
* @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to. 
*                                                               Please see StorageUtilities.LocationMode for the possible values.
* @param {int}          [options.timeoutIntervalInMs]           The timeout interval, in milliseconds, to use for the request.
* @param {int}          [options.clientRequestTimeoutInMs]      The timeout of client requests, in milliseconds, to use for the request.
* @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                               execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}       [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
* @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                               The default value is false.
* @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `[result]{@link ServiceStats}` will contain the stats and 
*                                                               `response` will contain information related to this operation.
*/
BlobService.prototype.getServiceStats = function (optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

  validate.validateArgs('getServiceStats', function (v) {
    v.callback(callback);
  });

  var webResource = WebResource.get()
    .withQueryOption(QueryStringConstants.COMP, 'stats')
    .withQueryOption(QueryStringConstants.RESTYPE, 'service');

  options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;

  var processResponseCallback = function (responseObject, next) {
    responseObject.serviceStatsResult = null;
    if (!responseObject.error) {
      responseObject.serviceStatsResult = ServiceStatsParser.parse(responseObject.response.body.StorageServiceStats);
    }

    // function to be called after all filters
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.serviceStatsResult, returnObject.response);
    };

    // call the first filter
    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Gets the properties of a storage account’s Blob service, including Azure Storage Analytics.
*
* @this {BlobService}
* @param {object}       [options]                               The request options.
* @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to. 
*                                                               Please see StorageUtilities.LocationMode for the possible values.
* @param {int}          [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
* @param {int}          [options.clientRequestTimeoutInMs]      The timeout of client requests, in milliseconds, to use for the request.
* @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                               execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}       [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
* @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                               The default value is false.
* @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `[result]{@link ServiceProperties}` will contain the properties 
*                                                               and `response` will contain information related to this operation.
*/
BlobService.prototype.getServiceProperties = function (optionsOrCallback, callback) {
  return this.getAccountServiceProperties(optionsOrCallback, callback);
};

/**
* Sets the properties of a storage account's Blob service, including Azure Storage Analytics.
* You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
* When you set blob service properties (such as enabling soft delete), it may take up to 30 seconds to take effect. 
*
* @this {BlobService}
* @param {object}             serviceProperties                        The service properties.
* @param {object}             [options]                                The request options.
* @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to. 
*                                                                      Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]       The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                      execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                      The default value is false.
* @param {errorOrResponse}    callback                                 `error` will contain information
*                                                                      if an error occurs; otherwise, `response`
*                                                                      will contain information related to this operation.
*/
BlobService.prototype.setServiceProperties = function (serviceProperties, optionsOrCallback, callback) {
  return this.setAccountServiceProperties(serviceProperties, optionsOrCallback, callback);
};

/**
* Sets the tier of a blockblob under a blob storage account, or the tier of a pageblob under a premium storage account.
*
* @this {BlobService}
* @param {string}             container                                The container name.
* @param {string}             blob                                     The blob name.
* @param {string}             blobTier                                 Please see BlobUtilities.BlobTier.StandardBlobTier or BlobUtilities.BlobTier.PremiumPageBlobTier for possible values.
* @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to. 
*                                                                      Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]       The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                      execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                      The default value is false.
* @param {errorOrResponse}    callback                                 `error` will contain information
*                                                                      if an error occurs; otherwise, `response`
*                                                                      will contain information related to this operation.
*/
BlobService.prototype.setBlobTier = function (container, blob, blobTier, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('setBlobTier', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.string(blobTier, 'blobTier');
    v.containerNameIsValid(container);
    v.blobNameIsValid(container, blob);
    v.blobTierNameIsValid(blobTier);
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'tier')
    .withHeader(HeaderConstants.ACCESS_TIER, blobTier);
  
  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };
    
    next(responseObject, finalCallback);
  };
  
  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Lists a segment containing a collection of container items under the specified account.
*
* @this {BlobService}
* @param {object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                                   The request options.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.maxResults]                        Specifies the maximum number of containers to return per call to Azure storage.
* @param {string}             [options.include]                           Include this parameter to specify that the container's metadata be returned as part of the response body. (allowed values: '', 'metadata')
*                                                                         **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
*                                                                         `entries`  gives a list of `[containers]{@link ContainerResult}` and the `continuationToken` is used for the next listing operation.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.listContainersSegmented = function (currentToken, optionsOrCallback, callback) {
  this.listContainersSegmentedWithPrefix(null /* prefix */, currentToken, optionsOrCallback, callback);
};

/**
* Lists a segment containing a collection of container items whose names begin with the specified prefix under the specified account.
*
* @this {BlobService}
* @param {string}             prefix                                      The prefix of the container name.
* @param {object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                                   The request options.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.maxResults]                        Specifies the maximum number of containers to return per call to Azure storage.
* @param {string}             [options.include]                           Include this parameter to specify that the container's metadata be returned as part of the response body. (allowed values: '', 'metadata')
*                                                                         **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
*                                                                         `entries`  gives a list of `[containers]{@link ContainerResult}` and the `continuationToken` is used for the next listing operation.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.listContainersSegmentedWithPrefix = function (prefix, currentToken, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('listContainers', function (v) {
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.get()
    .withQueryOption(QueryStringConstants.COMP, 'list')
    .withQueryOption(QueryStringConstants.MAX_RESULTS, options.maxResults)
    .withQueryOption(QueryStringConstants.INCLUDE, options.include);

  if (!azureutil.objectIsNull(currentToken)) {
    webResource.withQueryOption(QueryStringConstants.MARKER, currentToken.nextMarker);
  }

  webResource.withQueryOption(QueryStringConstants.PREFIX, prefix);

  options.requestLocationMode = azureutil.getNextListingLocationMode(currentToken);

  var processResponseCallback = function (responseObject, next) {
    responseObject.listContainersResult = null;

    if (!responseObject.error) {
      responseObject.listContainersResult = {
        entries: null,
        continuationToken: null
      };
      responseObject.listContainersResult.entries = [];

      var containers = [];

      if (responseObject.response.body.EnumerationResults.Containers && responseObject.response.body.EnumerationResults.Containers.Container) {
        containers = responseObject.response.body.EnumerationResults.Containers.Container;
        if (!_.isArray(containers)) {
          containers = [containers];
        }
      }

      containers.forEach(function (currentContainer) {
        var containerResult = ContainerResult.parse(currentContainer);
        responseObject.listContainersResult.entries.push(containerResult);
      });

      if (responseObject.response.body.EnumerationResults.NextMarker) {
        responseObject.listContainersResult.continuationToken = {
          nextMarker: null,
          targetLocation: null
        };

        responseObject.listContainersResult.continuationToken.nextMarker = responseObject.response.body.EnumerationResults.NextMarker;
        responseObject.listContainersResult.continuationToken.targetLocation = responseObject.targetLocation;
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.listContainersResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

// Container methods

/**
* Checks whether or not a container exists on the service.
*
* @this {BlobService}
* @param {string}             container                               The container name.
* @param {object}             [options]                               The request options.
* @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to. 
*                                                                     Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                     execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                     The default value is false.
* @param {errorOrResult}      callback                                `error` will contain information
*                                                                     if an error occurs; otherwise `[result]{@link ContainerResult}` will contain
*                                                                     the container information including `exists` boolean member. 
*                                                                     `response` will contain information related to this operation.
*/
BlobService.prototype.doesContainerExist = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('doesContainerExist', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  this._doesContainerExist(container, false, options, callback);
};

/**
* Creates a new container under the specified account.
* If a container with the same name already exists, the operation fails.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             [options]                           The request options.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {object}             [options.metadata]                  The metadata key/value pairs.
* @param {string}             [options.publicAccessLevel]         Specifies whether data in the container may be accessed publicly and the level of access.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `[result]{@link ContainerResult}` will contain
*                                                                 the container information.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.createContainer = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createContainer', function (v) {
    v.string(container, 'container');
    v.test(function () { return container !== '$logs'; },
      'Container name format is incorrect');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.put(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container');

  webResource.addOptionalMetadataHeaders(options.metadata);
  webResource.withHeader(HeaderConstants.BLOB_PUBLIC_ACCESS, options.publicAccessLevel);

  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);

      if (options.metadata) {
        responseObject.containerResult.metadata = options.metadata;
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Creates a new container under the specified account if the container does not exists.
*
* @this {BlobService}
* @param {string}             container                                 The container name.
* @param {object}             [options]                                 The request options.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {object}             [options.metadata]                        The metadata key/value pairs.
* @param {string}             [options.publicAccessLevel]               Specifies whether data in the container may be accessed publicly and the level of access.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResult}      callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise `[result]{@link ContainerResult}` will contain
*                                                                       the container information including `created` boolean member. 
*                                                                       `response` will contain information related to this operation.
*
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* blobService.createContainerIfNotExists('taskcontainer', {publicAccessLevel : 'blob'}, function(error) {
*   if(!error) {
*     // Container created or exists, and is public
*   }
* }); 
*/
BlobService.prototype.createContainerIfNotExists = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createContainerIfNotExists', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var self = this;
  self._doesContainerExist(container, true, options, function (error, result, response) {
    var exists = result.exists;
    result.created = false;
    delete result.exists;

    if (error) {
      callback(error, result, response);
    } else if (exists) {
      response.isSuccessful = true;
      callback(error, result, response);
    } else {
      self.createContainer(container, options, function (createError, containerResult, createResponse) {
        if (!createError) {
          containerResult.created = true;
        }
        else if (createError && createError.statusCode === Constants.HttpConstants.HttpResponseCodes.Conflict && createError.code === Constants.BlobErrorCodeStrings.CONTAINER_ALREADY_EXISTS) {
          // If it was created before, there was no actual error.
          createError = null;
          createResponse.isSuccessful = true;
        }

        callback(createError, containerResult, createResponse);
      });
    }
  });
};

/**
* Retrieves a container and its properties from a specified account.
* **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             [options]                           The request options.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {string}             [options.leaseId]                   The container lease identifier.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `[result]{@link ContainerResult}` will contain
*                                                                 information for the container.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.getContainerProperties = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getContainerProperties', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.head(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container);
      responseObject.containerResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Returns all user-defined metadata for the container.
* **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
*
* @this {BlobService}
* @param {string}             container                                 The container name.
* @param {object}             [options]                                 The request options.
* @param {string}             [options.leaseId]                         The container lease identifier.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResult}      callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise `[result]{@link ContainerResult}` will contain
*                                                                       information for the container.
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.getContainerMetadata = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getContainerMetadata', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.head(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withQueryOption(QueryStringConstants.COMP, 'metadata')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container);
      responseObject.containerResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Sets the container's metadata.
*
* Calling the Set Container Metadata operation overwrites all existing metadata that is associated with the container.
* It's not possible to modify an individual name/value pair.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             metadata                            The metadata key/value pairs.
* @param {object}             [options]                           The request options.
* @param {string}             [options.leaseId]                   The container lease identifier.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {AccessConditions}   [options.accessConditions]          The access conditions.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResponse}    callback                            `error` will contain information
*                                                                 if an error occurs; otherwise 
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.setContainerMetadata = function (container, metadata, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('setContainerMetadata', function (v) {
    v.string(container, 'container');
    v.object(metadata, 'metadata');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.put(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withQueryOption(QueryStringConstants.COMP, 'metadata')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  webResource.addOptionalMetadataHeaders(metadata);

  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Gets the container's ACL.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             [options]                           The request options.
* @param {string}             [options.leaseId]                   The container lease identifier.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `[result]{@link ContainerAclResult}` will contain
*                                                                 information for the container.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.getContainerAcl = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getContainerAcl', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.get(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withQueryOption(QueryStringConstants.COMP, 'acl')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
      responseObject.containerResult.signedIdentifiers = AclResult.parse(responseObject.response.body);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Updates the container's ACL.
*
* @this {BlobService}
* @param {string}                         container                           The container name.
* @param {Object.<string, AccessPolicy>}  signedIdentifiers                   The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
* @param {object}                         [options]                           The request options.
* @param {AccessConditions}               [options.accessConditions]          The access conditions.
* @param {string}                         [options.publicAccessLevel]         Specifies whether data in the container may be accessed publicly and the level of access.
* @param {string}                         [options.leaseId]                   The container lease identifier.
* @param {int}                            [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                            [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                            [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                             execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}                         [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}                           [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                             The default value is false.
* @param {errorOrResult}                  callback                            `error` will contain information
*                                                                             if an error occurs; otherwise `[result]{@link ContainerAclResult}` will contain
*                                                                             information for the container.
*                                                                             `response` will contain information related to this operation.
*/
BlobService.prototype.setContainerAcl = function (container, signedIdentifiers, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('setContainerAcl', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var policies = null;
  if (signedIdentifiers) {
    if (_.isArray(signedIdentifiers)) {
      throw new TypeError(SR.INVALID_SIGNED_IDENTIFIERS);
    }
    policies = AclResult.serialize(signedIdentifiers);
  }

  var webResource = WebResource.put(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withQueryOption(QueryStringConstants.COMP, 'acl')
    .withHeader(HeaderConstants.CONTENT_LENGTH, !azureutil.objectIsNull(policies) ? Buffer.byteLength(policies) : 0)
    .withHeader(HeaderConstants.BLOB_PUBLIC_ACCESS, options.publicAccessLevel)
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId)
    .withBody(policies);

  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = null;
    if (!responseObject.error) {
      responseObject.containerResult = new ContainerResult(container, options.publicAccessLevel);
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);
      if (signedIdentifiers) {
        responseObject.containerResult.signedIdentifiers = signedIdentifiers;
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, webResource.body, options, processResponseCallback);
};

/**
* Marks the specified container for deletion.
* The container and any blobs contained within it are later deleted during garbage collection.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             [options]                           The request options.
* @param {AccessConditions}   [options.accessConditions]          The access conditions.
* @param {string}             [options.leaseId]                   The container lease identifier.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResponse}    callback                            `error` will contain information
*                                                                 if an error occurs; otherwise
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.deleteContainer = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('deleteContainer', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.del(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Marks the specified container for deletion if it exists.
* The container and any blobs contained within it are later deleted during garbage collection.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             [options]                           The request options.
* @param {AccessConditions}   [options.accessConditions]          The access conditions.
* @param {string}             [options.leaseId]                   The container lease identifier.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will 
*                                                                 be true if the container exists and was deleted, or false if the container
*                                                                 did not exist.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.deleteContainerIfExists = function (container, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('deleteContainerIfExists', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var self = this;
  self._doesContainerExist(container, true, options, function (error, result, response) {
    if (error) {
      callback(error, result.exists, response);
    } else if (!result.exists) {
      response.isSuccessful = true;
      callback(error, false, response);
    } else {
      self.deleteContainer(container, options, function (deleteError, deleteResponse) {
        var deleted;
        if (!deleteError) {
          deleted = true;
        } else if (deleteError && deleteError.statuscode === Constants.HttpConstants.HttpResponseCodes.NotFound && deleteError.code === Constants.BlobErrorCodeStrings.CONTAINER_NOT_FOUND) {
          // If it was deleted already, there was no actual error.
          deleted = false;
          deleteError = null;
          deleteResponse.isSuccessful = true;
        }

        callback(deleteError, deleted, deleteResponse);
      });
    }
  });
};

/**
* Lists a segment containing a collection of blob directory items in the container.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             currentToken                        A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                           The request options.
* @param {int}                [options.maxResults]                Specifies the maximum number of directories to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
*                                                                 `entries`  gives a list of `[directories]{@link DirectoryResult}` and the `continuationToken` is used for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.listBlobDirectoriesSegmented = function (container, currentToken, optionsOrCallback, callback) {
  this.listBlobDirectoriesSegmentedWithPrefix(container, null /* prefix */, currentToken, optionsOrCallback, callback);
};

/**
* Lists a segment containing a collection of blob directory items in the container.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {string}             prefix                              The prefix of the blob directory.
* @param {object}             currentToken                        A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                           The request options.
* @param {int}                [options.maxResults]                Specifies the maximum number of directories to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
*                                                                 `entries`  gives a list of `[directories]{@link BlobResult}` and the `continuationToken` is used for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.listBlobDirectoriesSegmentedWithPrefix = function (container, prefix, currentToken, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  userOptions.delimiter = '/';

  this._listBlobsOrDircotriesSegmentedWithPrefix(container, prefix, currentToken, BlobConstants.ListBlobTypes.Directory, userOptions, callback);
};

/**
* Lists a segment containing a collection of blob items in the container.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {object}             currentToken                        A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                           The request options.
* @param {string}             [options.delimiter]                 Delimiter, i.e. '/', for specifying folder hierarchy.
* @param {int}                [options.maxResults]                Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
* @param {string}             [options.include]                   Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs', 'copy', 'deleted'). 
*                                                                 Please find these values in BlobUtilities.BlobListingDetails. Multiple values can be added separated with a comma (,).
*                                                                 **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
*                                                                 `entries`  gives a list of `[blobs]{@link BlobResult}` and the `continuationToken` is used for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.listBlobsSegmented = function (container, currentToken, optionsOrCallback, callback) {
  this.listBlobsSegmentedWithPrefix(container, null /* prefix */, currentToken, optionsOrCallback, callback);
};

/**
* Lists a segment containing a collection of blob items whose names begin with the specified prefix in the container.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {string}             prefix                              The prefix of the blob name.
* @param {object}             currentToken                        A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {object}             [options]                           The request options.
* @param {string}             [options.delimiter]                 Delimiter, i.e. '/', for specifying folder hierarchy.
* @param {int}                [options.maxResults]                Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
* @param {string}             [options.include]                   Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs', 'copy', 'deleted').
*                                                                 Please find these values in BlobUtilities.BlobListingDetails. Multiple values can be added separated with a comma (,).
*                                                                 **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain
*                                                                 the entries of `[blobs]{@link BlobResult}` and the continuation token for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.listBlobsSegmentedWithPrefix = function (container, prefix, currentToken, optionsOrCallback, callback) {
  this._listBlobsOrDircotriesSegmentedWithPrefix(container, prefix, currentToken, BlobConstants.ListBlobTypes.Blob, optionsOrCallback, callback);
};

// Lease methods

/**
* Acquires a new lease. If container and blob are specified, acquires a blob lease. Otherwise, if only container is specified and blob is null, acquires a container lease.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.leaseDuration]                     The lease duration in seconds. A non-infinite lease can be between 15 and 60 seconds. Default is never to expire. 
* @param {string}             [options.proposedLeaseId]                   The proposed lease identifier. Must be a GUID.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link LeaseResult}` will contain
*                                                                         the lease information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.acquireLease = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('acquireLease', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  if (!options.leaseDuration) {
    options.leaseDuration = -1;
  }

  this._leaseImpl(container, blob, null /* leaseId */, BlobConstants.LeaseOperation.ACQUIRE, options, callback);
};

/**
* Renews an existing lease. If container and blob are specified, renews the blob lease. Otherwise, if only container is specified and blob is null, renews the container lease.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             leaseId                                     The lease identifier. Must be a GUID.
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link LeaseResult}` will contain
*                                                                         the lease information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.renewLease = function (container, blob, leaseId, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('renewLease', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  this._leaseImpl(container, blob, leaseId, BlobConstants.LeaseOperation.RENEW, options, callback);
};

/**
* Changes the lease ID of an active lease. If container and blob are specified, changes the blob lease. Otherwise, if only container is specified and blob is null, changes the 
* container lease.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             leaseId                                     The current lease identifier.
* @param {string}             proposedLeaseId                             The proposed lease identifier. Must be a GUID. 
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information if an error occurs; 
*                                                                         otherwise `[result]{@link LeaseResult}` will contain  the lease information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.changeLease = function (container, blob, leaseId, proposedLeaseId, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('changeLease', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  options.proposedLeaseId = proposedLeaseId;
  this._leaseImpl(container, blob, leaseId, BlobConstants.LeaseOperation.CHANGE, options, callback);
};

/**
* Releases the lease. If container and blob are specified, releases the blob lease. Otherwise, if only container is specified and blob is null, releases the container lease.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             leaseId                                     The lease identifier.
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link LeaseResult}` will contain
*                                                                         the lease information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.releaseLease = function (container, blob, leaseId, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('releaseLease', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  this._leaseImpl(container, blob, leaseId, BlobConstants.LeaseOperation.RELEASE, options, callback);
};

/**
* Breaks the lease but ensures that another client cannot acquire a new lease until the current lease period has expired. If container and blob are specified, breaks the blob lease. 
* Otherwise, if only container is specified and blob is null, breaks the container lease.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {int}                [options.leaseBreakPeriod]                  The lease break period, between 0 and 60 seconds. If unspecified, a fixed-duration lease breaks after 
*                                                                         the remaining lease period elapses, and an infinite lease breaks immediately.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link LeaseResult}` will contain
*                                                                         the lease information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.breakLease = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('breakLease', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  this._leaseImpl(container, blob, null /*leaseId*/, BlobConstants.LeaseOperation.BREAK, options, callback);
};

// Blob methods

/**
* Returns all user-defined metadata, standard HTTP properties, and system properties for the blob.
* It does not return or modify the content of the blob.
* **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                         information about the blob.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.getBlobProperties = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getBlobProperties', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.head(resourceName);

  if (options.snapshotId) {
    webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);
  }

  BlobResult.setHeadersFromBlob(webResource, options);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Returns all user-defined metadata for the specified blob or snapshot.
* It does not modify or return the content of the blob.
* **Note** that all metadata names returned from the server will be converted to lower case by NodeJS itself as metadata is set via HTTP headers and HTTP header names are case insensitive.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                         information about the blob.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.getBlobMetadata = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getBlobMetadata', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.head(resourceName);

  webResource.withQueryOption(QueryStringConstants.COMP, 'metadata');
  webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  BlobResult.setHeadersFromBlob(webResource, options);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Sets user-defined properties for the specified blob or snapshot.
* It does not modify or return the content of the blob.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [properties]                                The blob properties to set.
* @param {string}             [properties.contentType]                    The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [properties.contentEncoding]                The content encodings that have been applied to the blob.
* @param {string}             [properties.contentLanguage]                The natural languages used by this resource.
* @param {string}             [properties.cacheControl]                   The blob's cache control.
* @param {string}             [properties.contentDisposition]             The blob's content disposition.
* @param {string}             [properties.contentMD5]                     The blob's MD5 hash.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                         information about the blob.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.setBlobProperties = function (container, blob, properties, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('setBlobProperties', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, { contentSettings: properties }, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'properties');

  BlobResult.setPropertiesFromBlob(webResource, options);

  this._setBlobPropertiesHelper({
    webResource: webResource,
    options: options,
    container: container,
    blob: blob,
    callback: callback
  });
};

/**
* Sets user-defined metadata for the specified blob or snapshot as one or more name-value pairs 
* It does not modify or return the content of the blob.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             metadata                                    The metadata key/value pairs.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                         information on the blob.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.setBlobMetadata = function (container, blob, metadata, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('setBlobMetadata', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.object(metadata, 'metadata');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'metadata');

  webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  options.metadata = metadata;
  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};


/**
* Provides a stream to read from a blob.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
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
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* var writable = fs.createWriteStream(destinationFileNameTarget);
*  blobService.createReadStream(containerName, blobName).pipe(writable);
*/
BlobService.prototype.createReadStream = function (container, blob, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

  validate.validateArgs('createReadStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
  });

  var readStream = new ChunkStream();
  this.getBlobToStream(container, blob, readStream, options, function (error, responseBlob, response) {
    if (error) {
      readStream.emit('error', error);
    }

    if (callback) {
      callback(error, responseBlob, response);
    }
  });

  return readStream;
};

/**
* Downloads a blob into a stream.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {Stream}             writeStream                                 The write stream.
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
* @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
* @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading blobs.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
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
* blobService.getBlobToStream('taskcontainer', 'task1', fs.createWriteStream('task1-download.txt'), function(error, serverBlob) {
*   if(!error) {
*     // Blob available in serverBlob.blob variable
*   }
* }); 
*/
BlobService.prototype.getBlobToStream = function (container, blob, writeStream, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  userOptions.speedSummary = userOptions.speedSummary || new SpeedSummary(blob);

  validate.validateArgs('getBlobToStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.object(writeStream, 'writeStream');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var propertiesRequestOptions = {
    timeoutIntervalInMs: options.timeoutIntervalInMs,
    clientRequestTimeoutInMs: options.clientRequestTimeoutInMs,
    snapshotId: options.snapshotId,
    accessConditions: options.accessConditions
  };

  if (options.skipSizeCheck) {
    this._getBlobToStream(container, blob, writeStream, options, callback);
  } else {
    var self = this;
    this.getBlobProperties(container, blob, propertiesRequestOptions, function (error, properties) {
      if (error) {
        callback(error);
      } else {
        var size;
        if (options.rangeStart) {
          var endOffset = properties.contentLength - 1;
          var end = options.rangeEnd ? Math.min(options.rangeEnd, endOffset) : endOffset;
          size = end - options.rangeStart + 1;
        } else {
          size = properties.contentLength;
        }
        options.speedSummary.totalSize = size;

        if (size > self.singleBlobPutThresholdInBytes) {
          azureutil.setObjectInnerPropertyValue(options, ['contentSettings', 'contentMD5'], azureutil.tryGetValueChain(properties, ['contentSettings', 'contentMD5'], null));
          self._getBlobToRangeStream(container, blob, properties.blobType, writeStream, options, callback);
        } else {
          self._getBlobToStream(container, blob, writeStream, options, callback);
        }
      }
    });
  }

  return options.speedSummary;
};

/**
* Downloads a blob into a text string.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier. 
* @param {string}             [options.rangeStart]                        Return only the bytes of the blob in the specified range.
* @param {string}             [options.rangeEnd]                          Return only the bytes of the blob in the specified range.
* @param {bool}               [options.useTransactionalMD5]               Calculate and send/validate content MD5 for transactions.
* @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading blobs.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {BlobService~blobToText}  callback                               `error` will contain information
*                                                                         if an error occurs; otherwise `text` will contain the blob contents,
*                                                                         and `[blockBlob]{@link BlobResult}` will contain
*                                                                         the blob information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.getBlobToText = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getBlobToText', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.get(resourceName)
    .withRawResponse();

  webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  BlobResult.setHeadersFromBlob(webResource, options);
  this._setRangeContentMD5Header(webResource, options);

  options.requestLocationMode = Constants.RequestLocationMode.PRIMARY_OR_SECONDARY;

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.text = null;
    responseObject.blobResult = null;

    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
      responseObject.text = responseObject.response.body;

      self._validateLengthAndMD5(options, responseObject);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.text, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Marks the specified blob or snapshot for deletion. The blob is later deleted during garbage collection.
* If a blob has snapshots, you must delete them when deleting the blob. Using the deleteSnapshots option, you can choose either to delete both the blob and its snapshots, 
* or to delete only the snapshots but not the blob itself. If the blob has snapshots, you must include the deleteSnapshots option or the blob service will return an error
* and nothing will be deleted. 
* If you are deleting a specific snapshot using the snapshotId option, the deleteSnapshots option must NOT be included.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.deleteSnapshots]                   The snapshot delete option. See azure.BlobUtilities.SnapshotDeleteOptions.*. 
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The lease identifier.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResponse}    callback                                    `error` will contain information
*                                                                         if an error occurs; `response` will contain information related to this operation.
*/
BlobService.prototype.deleteBlob = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('deleteBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.del(resourceName)
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  if (!azureutil.objectIsNull(options.snapshotId) && !azureutil.objectIsNull(options.deleteSnapshots)) {
    throw new ArgumentError('options', SR.INVALID_DELETE_SNAPSHOT_OPTION);
  }

  webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);
  webResource.withHeader(HeaderConstants.DELETE_SNAPSHOT, options.deleteSnapshots);

  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* The undelete Blob operation restores the contents and metadata of soft deleted blob or snapshot.
* Attempting to undelete a blob or snapshot that is not soft deleted will succeed without any changes.
* 
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResponse}    callback                                    `error` will contain information
*                                                                         if an error occurs; `response` will contain information related to this operation.
*/
BlobService.prototype.undeleteBlob = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('deleteBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'undelete');
    
  BlobResult.setHeadersFromBlob(webResource, options);  

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Checks whether or not a blob exists on the service.
*
* @this {BlobService}
* @param {string}             container                               The container name.
* @param {string}             blob                                    The blob name.
* @param {object}             [options]                               The request options.
* @param {string}             [options.snapshotId]                    The snapshot identifier.
* @param {string}             [options.leaseId]                       The lease identifier.
* @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to. 
*                                                                     Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]      The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                     execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                     The default value is false.
* @param {Function(error, result, response)}  callback                `error` will contain information
*                                                                     if an error occurs; otherwise `[result]{@link BlobResult}` will contain 
*                                                                     the blob information including the `exists` boolean member. 
*                                                                     `response` will contain information related to this operation.
*/
BlobService.prototype.doesBlobExist = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('doesBlobExist', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  this._doesBlobExist(container, blob, false, options, callback);
};

/**
* Marks the specified blob or snapshot for deletion if it exists. The blob is later deleted during garbage collection.
* If a blob has snapshots, you must delete them when deleting the blob. Using the deleteSnapshots option, you can choose either to delete both the blob and its snapshots, 
* or to delete only the snapshots but not the blob itself. If the blob has snapshots, you must include the deleteSnapshots option or the blob service will return an error
* and nothing will be deleted. 
* If you are deleting a specific snapshot using the snapshotId option, the deleteSnapshots option must NOT be included.
*
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {string}             blob                                The blob name.
* @param {object}             [options]                           The request options.
* @param {string}             [options.deleteSnapshots]           The snapshot delete option. See azure.BlobUtilities.SnapshotDeleteOptions.*. 
* @param {string}             [options.snapshotId]                The snapshot identifier.
* @param {string}             [options.leaseId]                   The lease identifier.
* @param {AccessConditions}   [options.accessConditions]          The access conditions.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will
*                                                                 be true if the blob was deleted, or false if the blob
*                                                                 does not exist.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype.deleteBlobIfExists = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('deleteBlobIfExists', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var self = this;
  self._doesBlobExist(container, blob, true, options, function (error, existsResult, response) {
    if (error) {
      callback(error, existsResult.exists, response);
    } else if (!existsResult.exists) {
      response.isSuccessful = true;
      callback(error, false, response);
    } else {
      self.deleteBlob(container, blob, options, function (deleteError, deleteResponse) {
        var deleted;
        if (!deleteError) {
          deleted = true;
        } else if (deleteError && deleteError.statusCode === Constants.HttpConstants.HttpResponseCodes.NotFound && deleteError.code === Constants.BlobErrorCodeStrings.BLOB_NOT_FOUND) {
          // If it was deleted already, there was no actual error.
          deleted = false;
          deleteError = null;
          deleteResponse.isSuccessful = true;
        }

        callback(deleteError, deleted, deleteResponse);
      });
    }
  });
};

/**
* Creates a read-only snapshot of a blob.
*
* @this {BlobService}
* @param {string}             container                             The container name.
* @param {string}             blob                                  The blob name.
* @param {object}             [options]                             The request options.
* @param {string}             [options.snapshotId]                  The snapshot identifier.
* @param {object}             [options.metadata]                    The metadata key/value pairs.
* @param {string}             [options.leaseId]                     The lease identifier.
* @param {AccessConditions}   [options.accessConditions]            The access conditions.
* @param {LocationMode}       [options.locationMode]                Specifies the location mode used to decide which location the request should be sent to. 
*                                                                   Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]         The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]    The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]    The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                   The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                   execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]             A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]           Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                   The default value is false.
* @param {errorOrResult}      callback                              `error` will contain information
*                                                                   if an error occurs; otherwise `result` will contain
*                                                                   the ID of the snapshot.
*                                                                   `response` will contain information related to this operation.
*/
BlobService.prototype.createBlobSnapshot = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createBlobSnapshot', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'snapshot');

  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    responseObject.snapshotId = null;
    if (!responseObject.error) {
      responseObject.snapshotId = responseObject.response.headers[HeaderConstants.SNAPSHOT];
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.snapshotId, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Starts to copy a blob to a destination within the storage account. The Copy Blob operation copies the entire committed blob.
*
* @this {BlobService}
* @param {string}             sourceUri                                 The source blob URI.
* @param {string}             targetContainer                           The target container name.
* @param {string}             targetBlob                                The target blob name.
* @param {object}             [options]                                 The request options.
* @param {string}             [options.blobTier]                        For page blobs on premium accounts only. Set the tier of target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
* @param {boolean}            [options.isIncrementalCopy]               If it's incremental copy or not. Refer to https://docs.microsoft.com/en-us/rest/api/storageservices/fileservices/incremental-copy-blob
* @param {string}             [options.snapshotId]                      The source blob snapshot identifier.
* @param {object}             [options.metadata]                        The target blob metadata key/value pairs.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.sourceLeaseId]                   The source blob lease identifier.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {AccessConditions}   [options.sourceAccessConditions]          The source access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResult}      callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                       the blob information.
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.startCopyBlob = function (sourceUri, targetContainer, targetBlob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('startCopyBlob', function (v) {
    v.string(sourceUri, 'sourceUri');
    v.string(targetContainer, 'targetContainer');
    v.string(targetBlob, 'targetBlob');
    v.containerNameIsValid(targetContainer);
    v.callback(callback);
  });

  var targetResourceName = createResourceName(targetContainer, targetBlob);

  var options = extend(true, {}, userOptions);

  if (options.snapshotId) {
    var uri = url.parse(sourceUri, true);
    if (uri.query['snapshot']) {
      throw new ArgumentError('options.snapshotId', 'Duplicate snapshot supplied in both the source uri and option.');
    }

    uri.search = undefined;
    uri.query['snapshot'] = options.snapshotId;

    sourceUri = url.format(uri);
  }

  var webResource = WebResource.put(targetResourceName)
    .withHeader(HeaderConstants.COPY_SOURCE, sourceUri);

  if (options.isIncrementalCopy) {
    webResource.withQueryOption(QueryStringConstants.COMP, 'incrementalcopy');
  }

  webResource.withHeader(HeaderConstants.ACCESS_TIER, options.blobTier);
  webResource.withHeader(HeaderConstants.LEASE_ID, options.leaseId);
  webResource.withHeader(HeaderConstants.SOURCE_LEASE_ID, options.sourceLeaseId);
  webResource.addOptionalMetadataHeaders(options.metadata);

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(targetContainer, targetBlob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);

      if (options.metadata) {
        responseObject.blobResult.metadata = options.metadata;
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Abort a blob copy operation.
*
* @this {BlobService}
* @param {string}             container                                 The destination container name.
* @param {string}             blob                                      The destination blob name.
* @param {string}             copyId                                    The copy operation identifier.
* @param {object}             [options]                                 The request options.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information  if an error occurs; 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.abortCopyBlob = function (container, blob, copyId, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('abortCopyBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var resourceName = createResourceName(container, blob);

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COPY_ID, copyId)
    .withQueryOption(QueryStringConstants.COMP, 'copy')
    .withHeader(HeaderConstants.COPY_ACTION, 'abort');

  webResource.withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Retrieves a shared access signature token.
*
* @this {BlobService}
* @param {string}                   container                                           The container name.
* @param {string}                   [blob]                                              The blob name.
* @param {object}                   sharedAccessPolicy                                  The shared access policy.
* @param {string}                   [sharedAccessPolicy.Id]                             The signed identifier.
* @param {object}                   [sharedAccessPolicy.AccessPolicy.Permissions]       The permission type.
* @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]             The time at which the Shared Access Signature becomes valid (The UTC value will be used).
* @param {date|string}              [sharedAccessPolicy.AccessPolicy.Expiry]            The time at which the Shared Access Signature becomes expired (The UTC value will be used).
* @param {string}                   [sharedAccessPolicy.AccessPolicy.IPAddressOrRange]  An IP address or a range of IP addresses from which to accept requests. When specifying a range, note that the range is inclusive.
* @param {string}                   [sharedAccessPolicy.AccessPolicy.Protocols]         The protocols permitted for a request made with the account SAS. 
*                                                                                       Possible values are both HTTPS and HTTP (https,http) or HTTPS only (https). The default value is https,http.
* @param {object}                   [headers]                                           The optional header values to set for a blob returned wth this SAS.
* @param {string}                   [headers.cacheControl]                              The optional value of the Cache-Control response header to be returned when this SAS is used.
* @param {string}                   [headers.contentType]                               The optional value of the Content-Type response header to be returned when this SAS is used.
* @param {string}                   [headers.contentEncoding]                           The optional value of the Content-Encoding response header to be returned when this SAS is used.
* @param {string}                   [headers.contentLanguage]                           The optional value of the Content-Language response header to be returned when this SAS is used.
* @param {string}                   [headers.contentDisposition]                        The optional value of the Content-Disposition response header to be returned when this SAS is used.
* @return {string}                                                                      The shared access signature query string. Note this string does not contain the leading "?".
*/
BlobService.prototype.generateSharedAccessSignature = function (container, blob, sharedAccessPolicy, headers) {
  // check if the BlobService is able to generate a shared access signature
  if (!this.storageCredentials) {
    throw new ArgumentNullError('storageCredentials');
  }

  if (!this.storageCredentials.generateSignedQueryString) {
    throw new ArgumentError('storageCredentials', SR.CANNOT_CREATE_SAS_WITHOUT_ACCOUNT_KEY);
  }

  // Validate container name. Blob name is optional.
  validate.validateArgs('generateSharedAccessSignature', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.object(sharedAccessPolicy, 'sharedAccessPolicy');
  });

  var resourceType = BlobConstants.ResourceTypes.CONTAINER;
  if (blob) {
    validate.validateArgs('generateSharedAccessSignature', function (v) {
      v.string(blob, 'blob');
    });
    resourceType = BlobConstants.ResourceTypes.BLOB;
  }

  if (sharedAccessPolicy.AccessPolicy) {
    if (!azureutil.objectIsNull(sharedAccessPolicy.AccessPolicy.Start)) {
      if (!_.isDate(sharedAccessPolicy.AccessPolicy.Start)) {
        sharedAccessPolicy.AccessPolicy.Start = new Date(sharedAccessPolicy.AccessPolicy.Start);
      }

      sharedAccessPolicy.AccessPolicy.Start = azureutil.truncatedISO8061Date(sharedAccessPolicy.AccessPolicy.Start);
    }

    if (!azureutil.objectIsNull(sharedAccessPolicy.AccessPolicy.Expiry)) {
      if (!_.isDate(sharedAccessPolicy.AccessPolicy.Expiry)) {
        sharedAccessPolicy.AccessPolicy.Expiry = new Date(sharedAccessPolicy.AccessPolicy.Expiry);
      }

      sharedAccessPolicy.AccessPolicy.Expiry = azureutil.truncatedISO8061Date(sharedAccessPolicy.AccessPolicy.Expiry);
    }
  }

  var resourceName = createResourceName(container, blob, true);
  return this.storageCredentials.generateSignedQueryString(Constants.ServiceType.Blob, resourceName, sharedAccessPolicy, null, { headers: headers, resourceType: resourceType });
};

/**
* Retrieves a blob or container URL.
*
* @param {string}                   container                The container name.
* @param {string}                   [blob]                   The blob name.
* @param {string}                   [sasToken]               The Shared Access Signature token.
* @param {boolean}                  [primary]                A boolean representing whether to use the primary or the secondary endpoint.
* @param {boolean}                  [snapshotId]             The snapshot identifier.
* @return {string}                                           The formatted URL string.
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* var sharedAccessPolicy = {
*   AccessPolicy: {
*     Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
*     Start: startDate,
*     Expiry: expiryDate
*   },
* };
* 
* var sasToken = blobService.generateSharedAccessSignature(containerName, blobName, sharedAccessPolicy);
* var sasUrl = blobService.getUrl(containerName, blobName, sasToken);
*/
BlobService.prototype.getUrl = function (container, blob, sasToken, primary, snapshotId) {
  validate.validateArgs('getUrl', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
  });

  var host;
  if (!azureutil.objectIsNull(primary) && primary === false) {
    host = this.host.secondaryHost;
  } else {
    host = this.host.primaryHost;
  }

  host = azureutil.trimPortFromUri(host);
  if (host && host.lastIndexOf('/') !== (host.length - 1)) {
    host = host + '/';
  }

  var query = qs.parse(sasToken);
  if (snapshotId) {
    query[QueryStringConstants.SNAPSHOT] = snapshotId;
  }

  var fullPath = url.format({ pathname: this._getPath(createResourceName(container, blob)), query: query });
  return url.resolve(host, fullPath);
};

// Page blob methods

/**
* Creates a page blob of the specified length. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {int}                length                                        The length of the page blob in bytes.
* @param {object}             [options]                                     The request options.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {string}             [options.leaseId]                             The target blob lease identifier.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
* @param {object}             [options.contentSettings]                     The content settings of the blob.
* @param {string}             [options.contentSettings.contentType]         The MIME content type of the blob. The default type is application/octet-stream.
* @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the blob.
* @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
* @param {string}             [options.contentSettings.cacheControl]        The Blob service stores this value but does not use or modify it.
* @param {string}             [options.contentSettings.contentDisposition]  The blob's content disposition.
* @param {string}             [options.contentSettings.contentMD5]          The MD5 hash of the blob content.
* @param {string}             [options.sequenceNumber]                      The blob's sequence number.
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
* @param {errorOrResponse}    callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise 
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype.createPageBlob = function (container, blob, length, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createPageBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.value(length, 'length');
    v.callback(callback);
  });

  if (length && length % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_BLOB_LENGTH);
  }

  var options = extend(true, {}, userOptions);

  var resourceName = createResourceName(container, blob);

  var webResource = WebResource.put(resourceName)
    .withHeader(HeaderConstants.BLOB_TYPE, BlobConstants.BlobTypes.PAGE)
    .withHeader(HeaderConstants.BLOB_CONTENT_LENGTH, length)
    .withHeader(HeaderConstants.CONTENT_LENGTH, 0)
    .withHeader(HeaderConstants.ACCESS_TIER, options.blobTier)
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Uploads a page blob from a stream. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
BlobService.prototype.createPageBlobFromStream = function (container, blob, stream, streamLength, optionsOrCallback, callback) {
  return this._createBlobFromStream(container, blob, BlobConstants.BlobTypes.PAGE, stream, streamLength, optionsOrCallback, callback);
};

/**
* Provides a stream to write to a page blob. Assumes that the blob exists. 
* If it does not, please create the blob using createPageBlob before calling this method or use createWriteStreamNewPageBlob.
* Please note the `Stream` returned by this API should be used with piping.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             [options]                                     The request options.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* blobService.createPageBlob(containerName, blobName, 1024, function (err) {
*   // Pipe file to a blob
*   var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToExistingPageBlob(containerName, blobName));
* });
*/
BlobService.prototype.createWriteStreamToExistingPageBlob = function (container, blob, optionsOrCallback, callback) {
  return this._createWriteStreamToBlob(container, blob, BlobConstants.BlobTypes.PAGE, 0, false, optionsOrCallback, callback);
};

/**
* Provides a stream to write to a page blob. Creates the blob before writing data. If the blob already exists on the service, it will be overwritten.
* Please note the `Stream` returned by this API should be used with piping.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             length                                        The blob length.
* @param {object}             [options]                                     The request options.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* blobService.createPageBlob(containerName, blobName, 1024, function (err) {
*   // Pipe file to a blob
*   var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToNewPageBlob(containerName, blobName));
* });
*/
BlobService.prototype.createWriteStreamToNewPageBlob = function (container, blob, length, optionsOrCallback, callback) {
  return this._createWriteStreamToBlob(container, blob, BlobConstants.BlobTypes.PAGE, length, true, optionsOrCallback, callback);
};

/**
* Updates a page blob from a stream.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {Stream}             readStream                                  The read stream.
* @param {int}                rangeStart                                  The range start.
* @param {int}                rangeEnd                                    The range end.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {bool}               [options.useTransactionalMD5]               Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.transactionalContentMD5]           An optional hash value used to ensure transactional integrity for the page. 
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                         the page information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.createPagesFromStream = function (container, blob, readStream, rangeStart, rangeEnd, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createPagesFromStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  if ((rangeEnd - rangeStart) + 1 > BlobConstants.MAX_UPDATE_PAGE_SIZE) {
    throw new RangeError(SR.INVALID_PAGE_RANGE_FOR_UPDATE);
  }

  var self = this;
  if (azureutil.objectIsNull(options.transactionalContentMD5) && options.useTransactionalMD5) {
    azureutil.calculateMD5(readStream, BlobConstants.MAX_UPDATE_PAGE_SIZE, options, function (internalBuff, contentMD5) {
      options.transactionalContentMD5 = contentMD5;
      self._createPages(container, blob, internalBuff, null /* stream */, rangeStart, rangeEnd, options, callback);
    });
  } else {
    self._createPages(container, blob, null /* text */, readStream, rangeStart, rangeEnd, options, callback);
  }
};

/**
* Lists page ranges. Lists all of the page ranges by default, or only the page ranges over a specific range of bytes if rangeStart and rangeEnd are specified.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {int}                [options.rangeStart]                        The range start.
* @param {int}                [options.rangeEnd]                          The range end.
* @param {string}             [options.snapshotId]                        The snapshot identifier.
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `result` will contain
*                                                                         the page ranges information, see `[Range]{@link Range}` for detailed information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.listPageRanges = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('listPageRanges', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.get(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'pagelist')
    .withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  if (options.rangeStart && options.rangeStart % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_START_OFFSET);
  }

  if (options.rangeEnd && (options.rangeEnd + 1) % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_END_OFFSET);
  }

  BlobResult.setHeadersFromBlob(webResource, options);

  options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;

  var processResponseCallback = function (responseObject, next) {
    responseObject.pageRanges = null;
    if (!responseObject.error) {
      responseObject.pageRanges = [];

      var pageRanges = [];
      if (responseObject.response.body.PageList.PageRange) {
        pageRanges = responseObject.response.body.PageList.PageRange;

        if (!_.isArray(pageRanges)) {
          pageRanges = [pageRanges];
        }
      }

      pageRanges.forEach(function (pageRange) {
        var range = {
          start: parseInt(pageRange.Start, 10),
          end: parseInt(pageRange.End, 10)
        };

        responseObject.pageRanges.push(range);
      });
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.pageRanges, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Gets page ranges that have been updated or cleared since the snapshot specified by `previousSnapshotTime` was taken. Gets all of the page ranges by default, or only the page ranges over a specific range of bytes if rangeStart and rangeEnd are specified.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             previousSnapshotTime                        The previous snapshot time for comparison. Must be prior to `options.snapshotId` if it's provided.
* @param {object}             [options]                                   The request options.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {int}                [options.rangeStart]                        The range start.
* @param {int}                [options.rangeEnd]                          The range end.
* @param {string}             [options.snapshotId]                        The snapshot identifier. 
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `result` will contain
*                                                                         the page ranges diff information, see `[RangeDiff]{@link RangeDiff}` for detailed information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.getPageRangesDiff = function (container, blob, previousSnapshotTime, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('getPageRangesDiff', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.get(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'pagelist')
    .withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId)
    .withQueryOption(QueryStringConstants.PREV_SNAPSHOT, previousSnapshotTime);

  if (options.rangeStart && options.rangeStart % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_START_OFFSET);
  }

  if (options.rangeEnd && (options.rangeEnd + 1) % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_END_OFFSET);
  }

  if (options.rangeEnd && (options.rangeEnd + 1) % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_END_OFFSET);
  }

  BlobResult.setHeadersFromBlob(webResource, options);

  options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;

  var processResponseCallback = function (responseObject, next) {
    responseObject.pageRangesDiff = null;
    if (!responseObject.error) {
      responseObject.pageRangesDiff = [];

      if (responseObject.response.body.PageList.PageRange) {
        var updatedPageRanges = responseObject.response.body.PageList.PageRange;

        if (!_.isArray(updatedPageRanges)) {
          updatedPageRanges = [updatedPageRanges];
        }

        updatedPageRanges.forEach(function (pageRange) {
          var range = {
            start: parseInt(pageRange.Start, 10),
            end: parseInt(pageRange.End, 10),
            isCleared: false
          };

          responseObject.pageRangesDiff.push(range);
        });
      }

      if (responseObject.response.body.PageList.ClearRange) {
        var clearedPageRanges = responseObject.response.body.PageList.ClearRange;

        if (!_.isArray(clearedPageRanges)) {
          clearedPageRanges = [clearedPageRanges];
        }

        clearedPageRanges.forEach(function (pageRange) {
          var range = {
            start: parseInt(pageRange.Start, 10),
            end: parseInt(pageRange.End, 10),
            isCleared: true
          };

          responseObject.pageRangesDiff.push(range);
        });
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.pageRangesDiff, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Clears a range of pages.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {int}                rangeStart                                  The range start.
* @param {int}                rangeEnd                                    The range end.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResponse}    callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise 
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.clearPageRange = function (container, blob, rangeStart, rangeEnd, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('clearPageRange', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var request = this._updatePageBlobPagesImpl(container, blob, rangeStart, rangeEnd, BlobConstants.PageWriteOptions.CLEAR, options);

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  self.performRequest(request, null, options, processResponseCallback);
};

/**
* Resizes a page blob.
*
* @this {BlobService}
* @param {string}               container                                   The container name.
* @param {string}               blob                                        The blob name.
* @param {String}               size                                        The size of the page blob, in bytes.
* @param {object}               [options]                                   The request options.
* @param {string}               [options.leaseId]                           The blob lease identifier.
* @param {AccessConditions}     [options.accessConditions]                  The access conditions.
* @param {LocationMode}         [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                           Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                  [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                  [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                  [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                           execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}               [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}                 [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                           The default value is false.
* @param {errorOrResult}      callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                           the page information.
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype.resizePageBlob = function (container, blob, size, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('resizePageBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'properties')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  if (size && size % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_BLOB_LENGTH);
  }

  webResource.withHeader(HeaderConstants.BLOB_CONTENT_LENGTH, size);

  this._setBlobPropertiesHelper({
    webResource: webResource,
    options: options,
    container: container,
    blob: blob,
    callback: callback
  });

};

/**
* Sets the page blob's sequence number.
*
* @this {BlobService}
* @param {string}               container                                   The container name.
* @param {string}               blob                                        The blob name.
* @param {SequenceNumberAction} sequenceNumberAction                        A value indicating the operation to perform on the sequence number. 
*                                                                           The allowed values are defined in azure.BlobUtilities.SequenceNumberAction.
* @param {string}               sequenceNumber                              The sequence number.  The value of the sequence number must be between 0 and 2^63 - 1.
*                                                                           Set this parameter to null if this operation is an increment action.
* @param {object}               [options]                                   The request options.
* @param {AccessConditions}     [options.accessConditions]                  The access conditions.
* @param {LocationMode}         [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                           Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                  [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                  [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                  [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                           execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}               [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}                 [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                           The default value is false.
* @param {errorOrResult}      callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                           the page information.
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype.setPageBlobSequenceNumber = function (container, blob, sequenceNumberAction, sequenceNumber, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('setPageBlobSequenceNumber', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  if (sequenceNumberAction === BlobUtilities.SequenceNumberAction.INCREMENT) {
    if (!azureutil.objectIsNull(sequenceNumber)) {
      throw new ArgumentError('sequenceNumber', SR.BLOB_INVALID_SEQUENCE_NUMBER);
    }
  } else {
    if (azureutil.objectIsNull(sequenceNumber)) {
      throw new ArgumentNullError('sequenceNumber', util.format(SR.ARGUMENT_NULL_OR_EMPTY, 'sequenceNumber'));
    }
  }

  var options = extend(true, {}, userOptions);
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'properties')
    .withHeader(HeaderConstants.SEQUENCE_NUMBER_ACTION, sequenceNumberAction);

  if (sequenceNumberAction !== BlobUtilities.SequenceNumberAction.INCREMENT) {
    webResource.withHeader(HeaderConstants.SEQUENCE_NUMBER, sequenceNumber);
  }

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

// Block blob methods

/**
* Uploads a block blob from a stream. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects.
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
BlobService.prototype.createBlockBlobFromStream = function (container, blob, stream, streamLength, optionsOrCallback, callback) {
  return this._createBlobFromStream(container, blob, BlobConstants.BlobTypes.BLOCK, stream, streamLength, optionsOrCallback, callback);
};

/**
* Uploads a block blob from a text string. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string|object}      text                                          The blob text, as a string or in a Buffer.
* @param {object}             [options]                                     The request options.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
*/
BlobService.prototype.createBlockBlobFromText = function (container, blob, text, optionsOrCallback, callback) {
  return this._createBlobFromText(container, blob, BlobConstants.BlobTypes.BLOCK, text, optionsOrCallback, callback);
};

/**
* Provides a stream to write to a block blob. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* Please note the `Stream` returned by this API should be used with piping.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             [options]                                     The request options.
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToBlockBlob(containerName, blobName, { blockIdPrefix: 'block' }));
*/
BlobService.prototype.createWriteStreamToBlockBlob = function (container, blob, optionsOrCallback, callback) {
  return this._createWriteStreamToBlob(container, blob, BlobConstants.BlobTypes.BLOCK, 0, false, optionsOrCallback, callback);
};

/**
* Creates a new block to be committed as part of a blob.
*
* @this {BlobService}
* @param {string}             blockId                                   The block identifier.
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {Stream}             readStream                                The read stream.
* @param {int}                streamLength                              The stream length.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.createBlockFromStream = function (blockId, container, blob, readStream, streamLength, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createBlockFromStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.exists(readStream, 'readStream');
    v.value(streamLength, 'streamLength');
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  if (streamLength > BlobConstants.MAX_BLOCK_BLOB_BLOCK_SIZE) {
    throw new RangeError(SR.INVALID_STREAM_LENGTH);
  } else {
    this._createBlock(blockId, container, blob, null, readStream, streamLength, options, callback);
  }
};

/**
* Creates a new block to be committed as part of a blob.
*
* @this {BlobService}
* @param {string}             blockId                                   The block identifier.
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {string|buffer}      content                                   The block content.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport. 
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.createBlockFromText = function (blockId, container, blob, content, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createBlockFromText', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var contentLength = (Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content));

  if (contentLength > BlobConstants.MAX_BLOCK_BLOB_BLOCK_SIZE) {
    throw new RangeError(SR.INVALID_TEXT_LENGTH);
  } else {
    this._createBlock(blockId, container, blob, content, null, contentLength, options, callback);
  }
};

/**
* Creates a new block to be committed as part of a block blob.
* @ignore
*
* @this {BlobService}
* @param {string}             blockId                                   The block identifier.
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {string|buffer}      content                                   The block content.
* @param (Stream)             stream                                    The stream to the data to store.
* @param {int}                length                                    The length of the stream or text to upload.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype._createBlock = function (blockId, container, blob, content, stream, length, options, callback) {
  var resourceName = createResourceName(container, blob);

  var self = this;
  var startCreateBlock = function () {
    var webResource = WebResource.put(resourceName)
      .withQueryOption(QueryStringConstants.COMP, 'block')
      .withQueryOption(QueryStringConstants.BLOCK_ID, new Buffer(blockId).toString('base64'))
      .withHeader(HeaderConstants.CONTENT_LENGTH, length);

    BlobResult.setHeadersFromBlob(webResource, options);

    var processResponseCallback = function (responseObject, next) {
      var finalCallback = function (returnObject) {
        callback(returnObject.error, returnObject.response);
      };

      next(responseObject, finalCallback);
    };

    if (!azureutil.objectIsNull(content)) {
      self.performRequest(webResource, content, options, processResponseCallback);
    } else {
      self.performRequestOutputStream(webResource, stream, options, processResponseCallback);
    }
  };

  if (azureutil.objectIsNull(options.transactionalContentMD5) && options.useTransactionalMD5) {
    if (!azureutil.objectIsNull(content)) {
      options.transactionalContentMD5 = azureutil.getContentMd5(content);
      startCreateBlock();
    } else {
      azureutil.calculateMD5(stream, length, options, function (internalBuff, contentMD5) {
        options.transactionalContentMD5 = contentMD5;
        content = internalBuff;
        length = internalBuff.length;
        startCreateBlock();
      });
    }
  } else {
    startCreateBlock();
  }
};

/**
* Writes a blob by specifying the list of block IDs that make up the blob.
* In order to be written as part of a blob, a block must have been successfully written to the server in a prior
* createBlock operation.
* Note: If no valid list is specified in the blockList parameter, blob would be updated with empty content,
* i.e. existing blocks in the blob will be removed, this behavior is kept for backward compatibility consideration.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             blockList                                     The wrapper for block ID list contains block IDs that make up the blob.
*                                                                           Three kinds of list are provided, please choose one to use according to requirement.
*                                                                           For more background knowledge, please refer to https://docs.microsoft.com/en-us/rest/api/storageservices/put-block-list
* @param {string[]}           [blockList.LatestBlocks]                      The list contains block IDs that make up the blob sequentially.
*                                                                           All the block IDs in this list will be specified within Latest element.
*                                                                           Choose this list to contain block IDs indicates that the Blob service should first search
*                                                                           the uncommitted block list, and then the committed block list for the named block.
* @param {string[]}           [blockList.CommittedBlocks]                   The list contains block IDs that make up the blob sequentially.
*                                                                           All the block IDs in this list will be specified within Committed element.
*                                                                           Choose this list to contain block IDs indicates that the Blob service should only search
*                                                                           the committed block list for the named block.
* @param {string[]}           [blockList.UncommittedBlocks]                 The list contains block IDs that make up the blob sequentially.
*                                                                           All the block IDs in this list will be specified within Uncommitted element.
*                                                                           Choose this list to contain block IDs indicates that the Blob service should only search
*                                                                           the uncommitted block list for the named block.
* @param {object}             [options]                                     The request options.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {string}             [options.leaseId]                             The target blob lease identifier.
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
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* blobService.createBlockFromText("sampleBlockName", containerName, blobName, "sampleBlockContent", function(error) {
*   assert.equal(error, null);
*   // In this example, LatestBlocks is used, we hope the Blob service first search
*   // the uncommitted block list, and then the committed block list for the named block "sampleBlockName",
*   // and thus make sure the block is with latest content.
*   blobService.commitBlocks(containerName, blobName, { LatestBlocks: ["sampleBlockName"] }, function(error) {
*     assert.equal(error, null);
*   });
* });
*
 */
BlobService.prototype.commitBlocks = function (container, blob, blockList, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('commitBlocks', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.object(blockList, 'blockList');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var blockListXml = BlockListResult.serialize(blockList);

  var resourceName = createResourceName(container, blob);
  var options = extend(true, {}, userOptions);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'blocklist')
    .withHeader(HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(blockListXml))
    .withBody(blockListXml);

  BlobResult.setPropertiesFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = new BlobResult(container, blob);
    responseObject.blobResult.list = null;
    if (!responseObject.error) {
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
      responseObject.blobResult.list = blockList;
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, webResource.body, options, processResponseCallback);
};

/**
* Retrieves the list of blocks that have been uploaded as part of a block blob.
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {BlockListFilter}    blocklisttype                               The type of block list to retrieve.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.snapshotId]                        The source blob snapshot identifier.
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {errorOrResult}      callback                                    `error` will contain information
*                                                                         if an error occurs; otherwise `result` will contain
*                                                                         the blocklist information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype.listBlocks = function (container, blob, blocklisttype, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('listBlocks', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var resourceName = createResourceName(container, blob);
  var options = extend(true, {}, userOptions);
  var webResource = WebResource.get(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'blocklist')
    .withQueryOption(QueryStringConstants.BLOCK_LIST_TYPE, blocklisttype)
    .withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;

  var processResponseCallback = function (responseObject, next) {
    responseObject.blockListResult = null;
    if (!responseObject.error) {
      responseObject.blockListResult = BlockListResult.parse(responseObject.response.body.BlockList);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blockListResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Generate a random block id prefix
*/
BlobService.prototype.generateBlockIdPrefix = function () {
  var prefix = Math.floor(Math.random() * 0x100000000).toString(16);
  return azureutil.zeroPaddingString(prefix, 8);
};

/**
* Get a block id according to prefix and block number
*/
BlobService.prototype.getBlockId = function (prefix, number) {
  return prefix + '-' + azureutil.zeroPaddingString(number, 6);
};

// Append blob methods

/**
* Creates an empty append blob. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             [options]                                     The request options.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {string}             [options.leaseId]                             The target blob lease identifier.
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
* @param {errorOrResponse}    callback                                      `error` will contain information
*                                                                           if an error occurs; otherwise 
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype.createOrReplaceAppendBlob = function (container, blob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('createOrReplaceAppendBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var resourceName = createResourceName(container, blob);

  var webResource = WebResource.put(resourceName)
    .withHeader(HeaderConstants.BLOB_TYPE, BlobConstants.BlobTypes.APPEND)
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId)
    .withHeader(HeaderConstants.CONTENT_LENGTH, 0);

  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Uploads an append blob from a stream. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* If you want to append data to an already existing blob, please look at appendFromStream.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects.
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
BlobService.prototype.createAppendBlobFromStream = function (container, blob, stream, streamLength, optionsOrCallback, callback) {
  return this._createBlobFromStream(container, blob, BlobConstants.BlobTypes.APPEND, stream, streamLength, optionsOrCallback, callback);
};

/**
* Uploads an append blob from a text string. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* If you want to append data to an already existing blob, please look at appendFromText.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string|object}      text                                          The blob text, as a string or in a Buffer.
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
*/
BlobService.prototype.createAppendBlobFromText = function (container, blob, text, optionsOrCallback, callback) {
  return this._createBlobFromText(container, blob, BlobConstants.BlobTypes.APPEND, text, optionsOrCallback, callback);
};

/**
* Provides a stream to write to a new append blob. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* Please note the `Stream` returned by this API should be used with piping.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @param {errorOrResponse}    callback                                      The callback function.
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToAppendBlob(containerName, blobName));
*/
BlobService.prototype.createWriteStreamToNewAppendBlob = function (container, blob, optionsOrCallback, callback) {
  return this._createWriteStreamToBlob(container, blob, BlobConstants.BlobTypes.APPEND, 0, true, optionsOrCallback, callback);
};

/**
* Provides a stream to write to an existing append blob. Assumes that the blob exists. 
* If it does not, please create the blob using createAppendBlob before calling this method or use createWriteStreamToNewAppendBlob.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
* Please note the `Stream` returned by this API should be used with piping.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @param {errorOrResponse}    callback                                      The callback function.
* @return {Stream}
* @example
* var azure = require('azure-storage');
* var blobService = azure.createBlobService();
* var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToAppendBlob(containerName, blobName));
*/
BlobService.prototype.createWriteStreamToExistingAppendBlob = function (container, blob, optionsOrCallback, callback) {
  return this._createWriteStreamToBlob(container, blob, BlobConstants.BlobTypes.APPEND, 0, false, optionsOrCallback, callback);
};

/**
* Appends to an append blob from a stream. Assumes the blob already exists on the service.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
BlobService.prototype.appendFromStream = function (container, blob, stream, streamLength, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

  validate.validateArgs('appendFromStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.exists(stream, 'stream');
    v.value(streamLength, 'streamLength');
    v.callback(callback);
  });

  return this._uploadBlobFromStream(false, container, blob, BlobConstants.BlobTypes.APPEND, stream, streamLength, options, callback);
};

/**
* Appends to an append blob from a text string. Assumes the blob already exists on the service.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string|object}      text                                          The blob text, as a string or in a Buffer.
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
*/
BlobService.prototype.appendFromText = function (container, blob, text, optionsOrCallback, callback) {
  return this._uploadBlobFromText(false, container, blob, BlobConstants.BlobTypes.APPEND, text, optionsOrCallback, callback);
};


/**
* Creates a new block from a read stream to be appended to an append blob.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
*
* @this {BlobService}
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {Stream}             readStream                                The read stream.
* @param {int}                streamLength                              The stream length.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]  Specifies whether to absorb the conditional error on retry.
* @param {int}                [options.maxBlobSize]                     The max length in bytes allowed for the append blob to grow to.
* @param {int}                [options.appendPosition]                  The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResult}      callback                                  `error` will contain information
*                                                                      if an error occurs; otherwise `[result]{@link BlobResult}` will contain
*                                                                      the blob information.
*                                                                      `response` will contain information related to this operation.
*/
BlobService.prototype.appendBlockFromStream = function (container, blob, readStream, streamLength, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('appendBlockFromStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.exists(readStream, 'readStream');
    v.value(streamLength, 'streamLength');
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  if (streamLength > BlobConstants.MAX_APPEND_BLOB_BLOCK_SIZE) {
    throw new RangeError(SR.INVALID_STREAM_LENGTH);
  } else {
    this._appendBlock(container, blob, null, readStream, streamLength, options, callback);
  }
};

/**
* Creates a new block from a text to be appended to an append blob.
* This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
* If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
*
* @this {BlobService}
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {string|object}      content                                   The block text, as a string or in a Buffer.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]  Specifies whether to absorb the conditional error on retry.
* @param {int}                [options.maxBlobSize]                     The max length in bytes allowed for the append blob to grow to.
* @param {int}                [options.appendPosition]                  The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype.appendBlockFromText = function (container, blob, content, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('appendBlockFromText', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var contentLength = (Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content));
  if (contentLength > BlobConstants.MAX_APPEND_BLOB_BLOCK_SIZE) {
    throw new RangeError(SR.INVALID_TEXT_LENGTH);
  } else {
    this._appendBlock(container, blob, content, null, contentLength, options, callback);
  }
};

// Private methods

/**
* Creates a new blob from a stream. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @ignore
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The upload tracker objects.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
* @param {errorOrResult}      callback                                      The callback function.
* @return {SpeedSummary}
*/
BlobService.prototype._createBlobFromStream = function (container, blob, blobType, stream, streamLength, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('_createBlobFromStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobTypeIsValid(blobType);
    v.exists(stream, 'stream');
    v.value(streamLength, 'streamLength');
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var self = this;
  var creationCallback = function (createError, createBlob, createResponse) {
    if (createError) {
      callback(createError, createBlob, createResponse);
    } else {
      self._uploadBlobFromStream(true, container, blob, blobType, stream, streamLength, options, callback);
    }
  };

  this._createBlob(container, blob, blobType, streamLength, options, creationCallback);

  return options.speedSummary;
};

/**
* Uploads a block blob or an append blob from a text string. If the blob already exists on the service, it will be overwritten.
* To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
*
* @ignore
* 
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param {string|buffer}      content                                       The blob text, as a string or in a Buffer.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
*                                                                           if an error occurs; otherwise `result` will contain
*                                                                           information about the blob.
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype._createBlobFromText = function (container, blob, blobType, content, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('_createBlobFromText', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobTypeIsValid(blobType);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);

  var self = this;
  var creationCallback = function (createError, createBlob, createResponse) {
    if (createError) {
      callback(createError, createBlob, createResponse);
    } else {
      self._uploadBlobFromText(true, container, blob, blobType, content, options, callback);
    }
  };

  var contentLength = azureutil.objectIsNull(content) ? 0 : ((Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content)));
  this._createBlob(container, blob, blobType, contentLength, options, creationCallback);

  return options.speedSummary;
};

/**
* Provides a stream to write to a block blob or an append blob.
*
* @ignore
* 
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param {int}                length                                        The blob length.
* @param {bool}               createNewBlob                                 Specifies whether create a new blob.
* @param {object}             [options]                                     The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {string}             [options.blockSize]                           The size of each block. Maximum is 100MB. (For block blob only)
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
*                                                                           The default value is false for page blobs and true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blobTier]                            For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
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
* @param {errorOrResponse}    callback                                      The callback function.
* @return {Stream}
*/
BlobService.prototype._createWriteStreamToBlob = function (container, blob, blobType, length, createNewBlob, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('_createWriteStreamToBlob', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobTypeIsValid(blobType);
  });

  var options = extend(true, {}, userOptions);

  var sizeLimitation;
  if (blobType === BlobConstants.BlobTypes.BLOCK) {
    // default to true, unless explicitly set to false
    options.storeBlobContentMD5 = options.storeBlobContentMD5 === false ? false : true;
    sizeLimitation = options.blockSize || BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;
  } else if (blobType == BlobConstants.BlobTypes.PAGE) {
    sizeLimitation = BlobConstants.DEFAULT_WRITE_PAGE_SIZE_IN_BYTES;
  } else if (blobType == BlobConstants.BlobTypes.APPEND) {
    sizeLimitation = BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;
  }

  var stream = new ChunkStream({ calcContentMd5: options.storeBlobContentMD5 });
  stream._highWaterMark = sizeLimitation;

  stream.pause(); //Immediately pause the stream in order to wait for the destination to getting ready

  var self = this;
  var createCallback = function (createError, createBlob, createResponse) {
    if (createError) {
      if (callback) {
        callback(createError, createBlob, createResponse);
      }
    } else {
      self._uploadBlobFromStream(createNewBlob, container, blob, blobType, stream, null, options, function (error, blob, response) {
        if (error) {
          stream.emit('error', error);
        }

        if (callback) {
          callback(error, blob, response);
        }
      });
    }
  };

  if (createNewBlob === true) {
    this._createBlob(container, blob, blobType, length, options, createCallback);
  } else {
    createCallback();
  }

  return stream;
};

/**
* Upload blob content from a stream. Assumes the blob already exists.
*
* @ignore
*
* @this {BlobService}
* @param {bool}               isNewBlob                                     Specifies whether the blob is newly created.
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The upload tracker objects.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @param {errorOrResult}      callback                                      The callback function.
* @return {SpeedSummary}
*/
BlobService.prototype._uploadBlobFromStream = function (isNewBlob, container, blob, blobType, stream, streamLength, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);

  if (blobType === BlobConstants.BlobTypes.BLOCK) {
    // default to true, unless explicitly set to false
    options.storeBlobContentMD5 = options.storeBlobContentMD5 === false ? false : true;
  }

  stream.pause();

  var self = this;
  var startUpload = function () {
    var putBlockBlobFromStream = function () {
      if (streamLength > 0 && azureutil.objectIsNull(azureutil.tryGetValueChain(options, ['contentSettings', 'contentMD5'], null)) && options.storeBlobContentMD5) {
        azureutil.calculateMD5(stream, Math.min(self.singleBlobPutThresholdInBytes, streamLength), options, function (internalBuff, contentMD5) {
          azureutil.setObjectInnerPropertyValue(options, ['contentSettings', 'contentMD5'], contentMD5);
          self._putBlockBlob(container, blob, internalBuff, null, internalBuff.length, options, callback);
        });
        stream.resume();
      } else {
        // Stream will resume when it has a pipe destination or a 'data' listener
        self._putBlockBlob(container, blob, null, stream, streamLength, options, callback);
      }
    };

    if (streamLength === null || streamLength >= self.singleBlobPutThresholdInBytes || blobType !== BlobConstants.BlobTypes.BLOCK) {
      var chunkStream = new ChunkStreamWithStream(stream, { calcContentMd5: options.storeBlobContentMD5 });
      self._uploadContentFromChunkStream(container, blob, blobType, chunkStream, streamLength, options, callback);
    } else {
      putBlockBlobFromStream();
    }
  };

  if (!isNewBlob) {
    if (options.storeBlobContentMD5 && blobType !== BlobConstants.BlobTypes.BLOCK) {
      throw new Error(SR.MD5_NOT_POSSIBLE);
    }

    if (blobType === BlobConstants.BlobTypes.APPEND || options.accessConditions) {
      // Do a getBlobProperties right at the beginning for existing blobs and use the user passed in access conditions. 
      // So any pre-condition failure on the first block (in a strictly single writer scenario) is caught.
      // This call also helps us get the append position to append to if the user hasn’t specified an access condition.
      this.getBlobProperties(container, blob, options, function (error, properties, response) {
        if (error && !(options.accessConditions && options.accessConditions.EtagNonMatch === '*' && response.statusCode === 400)) {
          callback(error);
        } else {
          if (blobType === BlobConstants.BlobTypes.APPEND) {
            options.appendPosition = properties.contentLength;
          }

          startUpload();
        }
      });
    } else {
      startUpload();
    }
  } else {
    startUpload();
  }

  return options.speedSummary;
};

/**
* Upload blob content from a text. Assumes the blob already exists.
*
* @ignore
*
* @this {BlobService}
* @param {bool}               isNewBlob                                     Specifies whether the blob is newly created.
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {BlobType}           blobType                                      The blob type.
* @param (string)             content                                       The blob text, as a string or in a Buffer.
* @param {object}             [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The upload tracker objects.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
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
* @param {errorOrResult}      callback                                      The callback function.
* @return {SpeedSummary}
*/
BlobService.prototype._uploadBlobFromText = function (isNewBlob, container, blob, blobType, content, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });
  options.speedSummary = options.speedSummary || new SpeedSummary(blob);
  options[HeaderConstants.CONTENT_TYPE] = (options.contentSettings && options.contentSettings.contentType) || 'text/plain;charset="utf-8"';

  var self = this;
  var startUpload = function () {
    var operationFunc;
    var length = azureutil.objectIsNull(content) ? 0 : (Buffer.isBuffer(content) ? content.length : Buffer.byteLength(content));

    if (blobType === BlobConstants.BlobTypes.BLOCK) {
      // default to true, unless explicitly set to false
      options.storeBlobContentMD5 = options.storeBlobContentMD5 === false ? false : true;
      operationFunc = self._putBlockBlob;

      if (length > BlobConstants.MAX_SINGLE_UPLOAD_BLOB_SIZE_IN_BYTES) {
        throw new RangeError(SR.INVALID_BLOB_LENGTH);
      }
    } else if (blobType === BlobConstants.BlobTypes.APPEND) {
      operationFunc = self._appendBlock;

      if (length > BlobConstants.MAX_APPEND_BLOB_BLOCK_SIZE) {
        throw new RangeError(SR.INVALID_TEXT_LENGTH);
      }
    }

    var finalCallback = function (error, blobResult, response) {
      if (blobType !== BlobConstants.BlobTypes.BLOCK) {
        self.setBlobProperties(container, blob, options.contentSettings, options, function (error, blob, response) {
          blob = extend(false, blob, blobResult);
          callback(error, blob, response);
        });
      } else {
        callback(error, blobResult, response);
      }
    };

    operationFunc.call(self, container, blob, content, null, length, options, finalCallback);
  };

  if (!isNewBlob) {
    if (options.storeBlobContentMD5 && blobType !== BlobConstants.BlobTypes.BLOCK) {
      throw new Error(SR.MD5_NOT_POSSIBLE);
    }

    if (blobType === BlobConstants.BlobTypes.APPEND || options.accessConditions) {
      // Do a getBlobProperties right at the beginning for existing blobs and use the user passed in access conditions. 
      // So any pre-condition failure on the first block (in a strictly single writer scenario) is caught.
      // This call also helps us get the append position to append to if the user hasn’t specified an access condition.
      this.getBlobProperties(container, blob, options, function (error, properties) {
        if (error) {
          callback(error);
        } else {
          if (blobType === BlobConstants.BlobTypes.APPEND) {
            options.appendPosition = properties.contentLength;
          }

          startUpload();
        }
      });
    }
  } else {
    if (!azureutil.objectIsNull(content) && azureutil.objectIsNull(azureutil.tryGetValueChain(options, ['contentSettings', 'contentMD5'], null)) && options.storeBlobContentMD5) {
      azureutil.setObjectInnerPropertyValue(options, ['contentSettings', 'contentMD5'], azureutil.getContentMd5(content));
    }
    startUpload();
  }
};

/**
* Uploads a block blob from a stream.
* @ignore
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             text                                          The blob text.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                length                                        The length of the stream or text to upload.
* @param {object}             [options]                                     The request options.
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
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
*                                                                           if an error occurs; otherwise `result` will contain
*                                                                           information about the blob.
*                                                                           `response` will contain information related to this operation.
*/
BlobService.prototype._putBlockBlob = function (container, blob, text, stream, length, options, callback) {
  if (!options.speedSummary) {
    options.speedSummary = new SpeedSummary(blob);
  }

  var speedSummary = options.speedSummary;
  speedSummary.totalSize = length;

  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withHeader(HeaderConstants.CONTENT_TYPE, 'application/octet-stream')
    .withHeader(HeaderConstants.BLOB_TYPE, BlobConstants.BlobTypes.BLOCK)
    .withHeader(HeaderConstants.CONTENT_LENGTH, length);

  if (!azureutil.objectIsNull(text) && azureutil.objectIsNull(options.transactionalContentMD5) && options.useTransactionalMD5) {
    options.transactionalContentMD5 = azureutil.getContentMd5(text);
  }

  BlobResult.setHeadersFromBlob(webResource, options);

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
      if (options.metadata) {
        responseObject.blobResult.metadata = options.metadata;
      }
    }

    var finalCallback = function (returnObject) {
      if (!returnObject || !returnObject.error) {
        speedSummary.increment(length);
      }
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  if (!azureutil.objectIsNull(text)) {
    this.performRequest(webResource, text, options, processResponseCallback);
  } else {
    this.performRequestOutputStream(webResource, stream, options, processResponseCallback);
  }

  return options.speedSummary;
};

/**
* Appends a new block to an append blob.
* 
* @ignore
*
* @this {BlobService}
* @param {string}             container                                 The container name.
* @param {string}             blob                                      The blob name.
* @param {string|buffer}      content                                   The block content.
* @param (Stream)             stream                                    The stream to the data to store.
* @param {int}                length                                    The length of the stream or content to upload.
* @param {object}             [options]                                 The request options.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]  Specifies whether to absorb the conditional error on retry.
* @param {int}                [options.maxBlobSize]                     The max length in bytes allowed for the append blob to grow to.
* @param {int}                [options.appendPosition]                  The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
* @param {string}             [options.leaseId]                         The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]         The blob’s MD5 hash. This hash is used to verify the integrity of the blob during transport.
* @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
* @param {AccessConditions}   [options.accessConditions]                The access conditions.
* @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
*                                                                       Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]        The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                       execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                       The default value is false.
* @param {errorOrResponse}    callback                                  `error` will contain information
*                                                                       if an error occurs; otherwise 
*                                                                       `response` will contain information related to this operation.
*/
BlobService.prototype._appendBlock = function (container, blob, content, stream, length, options, callback) {
  var speedSummary = options.speedSummary || new SpeedSummary(blob);
  speedSummary.totalSize = length;

  var self = this;
  var startAppendBlock = function () {
    var resourceName = createResourceName(container, blob);

    var webResource = WebResource.put(resourceName)
      .withQueryOption(QueryStringConstants.COMP, 'appendblock')
      .withHeader(HeaderConstants.CONTENT_LENGTH, length)
      .withHeader(HeaderConstants.BLOB_CONDITION_MAX_SIZE, options.maxBlobSize)
      .withHeader(HeaderConstants.BLOB_CONDITION_APPEND_POSITION, options.appendPosition);

    BlobResult.setHeadersFromBlob(webResource, options);

    var processResponseCallback = function (responseObject, next) {
      responseObject.blobResult = null;
      if (!responseObject.error) {
        responseObject.blobResult = new BlobResult(container, blob);
        responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
      }

      var finalCallback = function (returnObject) {
        if (!returnObject || !returnObject.error) {
          speedSummary.increment(length);
        }
        callback(returnObject.error, returnObject.blobResult, returnObject.response);
      };

      next(responseObject, finalCallback);
    };

    if (!azureutil.objectIsNull(content)) {
      self.performRequest(webResource, content, options, processResponseCallback);
    } else {
      self.performRequestOutputStream(webResource, stream, options, processResponseCallback);
    }
  };

  if (azureutil.objectIsNull(options.transactionalContentMD5) && options.useTransactionalMD5) {
    if (!azureutil.objectIsNull(content)) {
      options.transactionalContentMD5 = azureutil.getContentMd5(content);
      startAppendBlock();
    } else {
      azureutil.calculateMD5(stream, length, options, function (internalBuff, contentMD5) {
        options.transactionalContentMD5 = contentMD5;
        content = internalBuff;
        length = internalBuff.length;
        startAppendBlock();
      });
    }
  } else {
    startAppendBlock();
  }

  return options.speedSummary;
};

/**
* Creates and dispatches lease requests.
* @ignore
* 
* @this {BlobService}
* @param {object}             webResource                             The web resource.
* @param {string}             container                               The container name.
* @param {string}             blob                                    The blob name.
* @param {string}             leaseId                                 The lease identifier. Required to renew, change or release the lease.
* @param {string}             leaseAction                             The lease action (BlobConstants.LeaseOperation.*). Required.
* @param {object}             userOptions                             The request options.
* @param {int}                [userOptions.leaseBreakPeriod]          The lease break period.
* @param {string}             [userOptions.leaseDuration]             The lease duration. Default is never to expire.
* @param {string}             [userOptions.proposedLeaseId]           The proposed lease identifier. This is required for the CHANGE lease action.
* @param {LocationMode}       [userOptions.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                     Please see StorageUtilities.LocationMode for the possible values.
* @param {AccessConditions}   [options.accessConditions]              The access conditions.
* @param {int}                [userOptions.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]      The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [userOptions.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                     execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                     The default value is false.
* @param {Function(error, lease, response)}  callback                 `error` will contain information
*                                                                     if an error occurs; otherwise `lease` will contain
*                                                                     the lease information.
*                                                                     `response` will contain information related to this operation.
*/
BlobService.prototype._leaseImpl = function (container, blob, leaseId, leaseAction, options, callback) {
  var webResource;
  if (!azureutil.objectIsNull(blob)) {
    validate.validateArgs('_leaseImpl', function (v) {
      v.string(blob, 'blob');
    });
    var resourceName = createResourceName(container, blob);
    webResource = WebResource.put(resourceName);
  } else {
    webResource = WebResource.put(container)
      .withQueryOption(QueryStringConstants.RESTYPE, 'container');
  }

  webResource.withQueryOption(QueryStringConstants.COMP, 'lease')
    .withHeader(HeaderConstants.LEASE_ID, leaseId)
    .withHeader(HeaderConstants.LEASE_ACTION, leaseAction.toLowerCase())
    .withHeader(HeaderConstants.LEASE_BREAK_PERIOD, options.leaseBreakPeriod)
    .withHeader(HeaderConstants.PROPOSED_LEASE_ID, options.proposedLeaseId)
    .withHeader(HeaderConstants.LEASE_DURATION, options.leaseDuration);

  var processResponseCallback = function (responseObject, next) {
    responseObject.leaseResult = null;
    if (!responseObject.error) {
      responseObject.leaseResult = new LeaseResult(container, blob);
      responseObject.leaseResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.leaseResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Updates a page blob from text.
* @ignore
*
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             text                                        The text string.
* @param {Stream}             readStream                                  The read stream.
* @param {int}                rangeStart                                  The range start.
* @param {int}                rangeEnd                                    The range end.
* @param {object}             [options]                                   The request options.
* @param {string}             [options.leaseId]                           The target blob lease identifier.
* @param {string}             [options.transactionalContentMD5]           An MD5 hash of the page content. This hash is used to verify the integrity of the page during transport. 
* @param {AccessConditions}   [options.accessConditions]                  The access conditions.
* @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
*                                                                         Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]          The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                         execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                         The default value is false.
* @param {Function(error, pageBlob, response)}  callback                  `error` will contain information
*                                                                         if an error occurs; otherwise `pageBlob` will contain
*                                                                         the blob information.
*                                                                         `response` will contain information related to this operation.
*/
BlobService.prototype._createPages = function (container, blob, text, readStream, rangeStart, rangeEnd, options, callback) {
  var request = this._updatePageBlobPagesImpl(container, blob, rangeStart, rangeEnd, BlobConstants.PageWriteOptions.UPDATE, options);

  // At this point, we have already validated that the range is less than 4MB. Therefore, we just need to calculate the contentMD5 if required.
  // Even when this is called from the createPagesFromStream method, it is pre-buffered and called with text.
  if (!azureutil.objectIsNull(text) && azureutil.objectIsNull(options.transactionalContentMD5) && options.useTransactionalMD5) {
    request.withHeader(HeaderConstants.CONTENT_MD5, azureutil.getContentMd5(text));
  }

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  if (!azureutil.objectIsNull(text)) {
    this.performRequest(request, text, options, processResponseCallback);
  } else {
    this.performRequestOutputStream(request, readStream, options, processResponseCallback);
  }
};

/**
* @ignore
*/
BlobService.prototype._updatePageBlobPagesImpl = function (container, blob, rangeStart, rangeEnd, writeMethod, options) {
  if (rangeStart && rangeStart % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_START_OFFSET);
  }

  if (rangeEnd && (rangeEnd + 1) % BlobConstants.PAGE_SIZE !== 0) {
    throw new RangeError(SR.INVALID_PAGE_END_OFFSET);
  }

  // this is necessary if this is called from _uploadContentFromChunkStream->_createPages
  if (!options) {
    options = {};
  }

  options.rangeStart = rangeStart;
  options.rangeEnd = rangeEnd;

  options.contentLength = writeMethod === BlobConstants.PageWriteOptions.UPDATE ? (rangeEnd - rangeStart) + 1 : 0;

  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.put(resourceName)
    .withQueryOption(QueryStringConstants.COMP, 'page')
    .withHeader(HeaderConstants.CONTENT_TYPE, 'application/octet-stream')
    .withHeader(HeaderConstants.PAGE_WRITE, writeMethod);

  BlobResult.setHeadersFromBlob(webResource, options);

  return webResource;
};

/**
* Uploads blob content from a stream.
* For block blob, it creates a new block to be committed.
* For page blob, it writes a range of pages.
* For append blob, it appends a new block.
*
* @ignore
*
* @this {BlobService}
* @param {string}             container                                     The container name.
* @param {string}             blob                                          The blob name.
* @param {string}             blobType                                      The blob type.
* @param (Stream)             stream                                        Stream to the data to store.
* @param {int}                streamLength                                  The length of the stream to upload.
* @param {object|function}    [options]                                     The request options.
* @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
* @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
* @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry. (For append blob only)
* @param {int}                [options.maxBlobSize]                         The max length in bytes allowed for the append blob to grow to.
* @param {int}                [options.appendPosition]                      The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
* @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
* @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id. (For block blob only)
* @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB. (For block blob only)
* @param {string}             [options.leaseId]                             The lease identifier.
* @param {object}             [options.metadata]                            The metadata key/value pairs.
* @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads.
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
* @param {function(error, null)}  callback                                  The callback function.
* @return {SpeedSummary}
*/

BlobService.prototype._uploadContentFromChunkStream = function (container, blob, blobType, chunkStream, streamLength, options, callback) {
  this.logger.debug(util.format('_uploadContentFromChunkStream for blob %s', blob));

  var apiName;
  var isBlockBlobUpload;
  var isPageBlobUpload;
  var isAppendBlobUpload;
  var sizeLimitation;
  var originalContentMD5 = azureutil.tryGetValueChain(options, ['contentSettings', 'contentMD5'], null);
  var parallelOperationThreadCount = options.parallelOperationThreadCount || this.parallelOperationThreadCount;

  if (blobType == BlobConstants.BlobTypes.BLOCK) {
    apiName = 'createBlockFromText';
    isBlockBlobUpload = true;

    // BlockBlob can only have 50000 blocks in maximum
    var minBlockSize = Math.ceil(streamLength / 50000);
    if (options.blockSize) {
      if (options.blockSize < minBlockSize) {
        // options.blockSize is less than the minBlockSize, error callback        
        var error = new ArgumentError('options.blockSize', util.format('The minimum blockSize is %s and the provided blockSize %s is too small.', minBlockSize, options.blockSize));
        callback(error);
        return;
      } else {
        sizeLimitation = options.blockSize;
      }
    } else {
      // 4MB minimum for auto-calculated block size
      sizeLimitation = Math.max(minBlockSize, BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES);
    }
  } else if (blobType == BlobConstants.BlobTypes.PAGE) {
    apiName = '_createPages';
    isPageBlobUpload = true;
    sizeLimitation = BlobConstants.DEFAULT_WRITE_PAGE_SIZE_IN_BYTES;
  } else if (blobType == BlobConstants.BlobTypes.APPEND) {
    apiName = 'appendBlockFromText';
    isAppendBlobUpload = true;
    parallelOperationThreadCount = 1;
    sizeLimitation = BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES;
  } else {
    var error = new ArgumentError('blobType', util.format('Unknown blob type %s', blobType));
    callback(error);
    return;
  }

  chunkStream._highWaterMark = sizeLimitation;

  this._setOperationExpiryTime(options);

  // initialize the speed summary
  var speedSummary = options.speedSummary || new SpeedSummary(blob);
  speedSummary.totalSize = streamLength;

  // initialize chunk allocator
  var allocator = new ChunkAllocator(sizeLimitation, parallelOperationThreadCount, { logger: this.logger });
  chunkStream.setMemoryAllocator(allocator);
  chunkStream.setOutputLength(streamLength);

  // if this is a FileReadStream, set the allocator on that stream
  if (chunkStream._stream && chunkStream._stream.setMemoryAllocator) {
    var fileReadStreamAllocator = new ChunkAllocator(chunkStream._stream._highWaterMark, parallelOperationThreadCount, { logger: this.logger });      
    chunkStream._stream.setMemoryAllocator(fileReadStreamAllocator);
  }

  // initialize batch operations
  var batchOperations = new BatchOperation(apiName, {
    callInOrder: isAppendBlobUpload,
    callbackInOrder: isAppendBlobUpload,
    logger: this.logger,
    enableReuseSocket: this.defaultEnableReuseSocket,
    operationMemoryUsage: sizeLimitation
  });
  batchOperations.setConcurrency(parallelOperationThreadCount);

  // initialize options
  var rangeOptions = {
    leaseId: options.leaseId,
    timeoutIntervalInMs: options.timeoutIntervalInMs,
    clientRequestTimeoutInMs: options.clientRequestTimeoutInMs,
    operationExpiryTime: options.operationExpiryTime,
    maxBlobSize: options.maxBlobSize,
    appendPosition: options.appendPosition || 0,
    initialAppendPosition: options.appendPosition || 0,
    absorbConditionalErrorsOnRetry: options.absorbConditionalErrorsOnRetry
  };

  // initialize block blob variables
  var blockIdPrefix = options.blockIdPrefix || this.generateBlockIdPrefix();
  var blockCount = 0;
  var blockIds = [];
  var blobResult = {};

  var self = this;
  chunkStream.on('data', function (data, range) {
    var operation = null;
    var full = false;
    var autoIncrement = speedSummary.getAutoIncrementFunction(data.length);

    if (data.length > sizeLimitation) {
      throw new RangeError(util.format(SR.EXCEEDED_SIZE_LIMITATION, sizeLimitation, data.length));
    }

    if (options.useTransactionalMD5) {
      //calculate content md5 for the current uploading block data
      var contentMD5 = azureutil.getContentMd5(data);
      rangeOptions.transactionalContentMD5 = contentMD5;
    }

    var checkLengthLimit = function () {
      if (!streamLength) return true;
      if (range.start >= streamLength) {
        self.logger.debug(util.format('Stop uploading data from %s bytes to %s bytes to blob %s because of limit %s', range.start, range.end, blob, streamLength));
        chunkStream.stop();
        return false;
      } else if (range.end >= streamLength) {
        self.logger.debug(util.format('Clip uploading data from %s bytes to %s bytes to blob %s because of limit %s', range.start, range.end, blob, streamLength));
        range.end = streamLength - 1;
        data = data.slice(0, streamLength - range.start);
        if (options.useTransactionalMD5) {
          rangeOptions.transactionalContentMD5 = azureutil.getContentMd5(data);
        }
      }
      return true;
    };

    var uploadBlockBlobChunk = function () {
      if (!checkLengthLimit()) return;
      var blockId = self.getBlockId(blockIdPrefix, blockCount);
      blockIds.push(blockId);

      operation = new BatchOperation.RestOperation(self, apiName, blockId, container, blob, data, rangeOptions, function (error) {
        if (!error) {
          autoIncrement();
        } else {
          self.logger.debug(util.format('Stop uploading data as error happens. Error: %s', util.inspect(error)));
          chunkStream.stop();
        }
        allocator.releaseBuffer(data);
        data = null;
      });

      blockCount++;
    };

    var uploadPageBlobChunk = function () {
      if (!checkLengthLimit()) return;

      if (azureutil.isBufferAllZero(data)) {
        self.logger.debug(util.format('Skip upload data from %s bytes to %s bytes to blob %s', range.start, range.end, blob));
        speedSummary.increment(data.length);
      } else {
        self.logger.debug(util.format('Upload data from %s bytes to %s bytes to blob %s', range.start, range.end, blob));
        operation = new BatchOperation.RestOperation(self, apiName, container, blob, data, null, range.start, range.end, rangeOptions, function (error) {
          if (!error) {
            autoIncrement();
          } else {
            self.logger.debug(util.format('Stop uploading data as error happens. Error: %s', util.inspect(error)));
            chunkStream.stop();
          }
          allocator.releaseBuffer(data);
          data = null;
        });
      }
    };

    var uploadAppendBlobChunk = function () {
      if (!checkLengthLimit()) return;

      rangeOptions.appendPosition = Number(rangeOptions.initialAppendPosition) + Number(range.start);

      // We cannot differentiate between max size condition failing only in the retry versus failing in the first attempt and retry.  
      // So we will eliminate the latter and handle the former in the append operation callback.
      if (options.maxBlobSize && rangeOptions.appendPosition + data.length > options.maxBlobSize) {
        throw new Error(SR.MAX_BLOB_SIZE_CONDITION_NOT_MEET);
      }

      operation = new BatchOperation.RestOperation(self, apiName, container, blob, data, rangeOptions, function (error, currentBlob) {
        if (!error) {
          autoIncrement();
        } else {
          self.logger.debug(util.format('Stop uploading data as error happens. Error: %s', util.inspect(error)));
          chunkStream.stop();
        }
        blobResult = currentBlob;
        allocator.releaseBuffer(data);
        data = null;
      });
    };

    if (isBlockBlobUpload) {
      uploadBlockBlobChunk();
    } else if (isAppendBlobUpload) {
      uploadAppendBlobChunk();
    } else if (isPageBlobUpload) {
      uploadPageBlobChunk();
    }

    if (operation) {
      full = batchOperations.addOperation(operation);
      operation = null;

      if (full) {
        self.logger.debug('File stream paused');
        chunkStream.pause();
      }
    }
  });

  chunkStream.on('end', function () {
    self.logger.debug(util.format('File read stream ended for blob %s', blob));
    batchOperations.enableComplete();
  });

  batchOperations.on('drain', function () {
    self.logger.debug('file stream resume');
    chunkStream.resume();
  });

  batchOperations.on('end', function (error) {
    self.logger.debug('batch operations commited');

    speedSummary = null;
    if (error) {
      callback(error);
      return;
    }

    if (originalContentMD5) {
      options.contentSettings.contentMD5 = originalContentMD5;
    } else if (options.storeBlobContentMD5) {
      var contentMD5 = chunkStream.getContentMd5('base64');
      azureutil.setObjectInnerPropertyValue(options, ['contentSettings', 'contentMD5'], contentMD5);
    }

    if (isBlockBlobUpload) {
      //commit block list
      var blockList = { 'UncommittedBlocks': blockIds };
      self.commitBlocks(container, blob, blockList, options, function (error, blockList, response) {
        self.logger.debug(util.format('Blob %s committed', blob));

        if (error) {
          chunkStream.finish();

          callback(error);
        } else {
          blobResult['commmittedBlocks'] = blockIds;

          chunkStream.finish();
          callback(error, blobResult, response);
        }
      });
    } else {
      // upload page blob or append blob completely
      var blobProperties = options.contentSettings;
      self.setBlobProperties(container, blob, blobProperties, function (error, blob, response) {
        chunkStream.finish();
        blob = extend(false, blob, blobResult);
        callback(error, blob, response);
      });
    }
  });

  return speedSummary;
};

/**
* Checks whether or not a container exists on the service.
* @ignore
*
* @this {BlobService}
* @param {string}             container                                         The container name.
* @param {string}             primaryOnly                                       If true, the request will be executed against the primary storage location.
* @param {object}             [options]                                         The request options.
* @param {string}             [options.leaseId]                                 The lease identifier.
* @param {LocationMode}       [options.locationMode]                            Specifies the location mode used to decide which location the request should be sent to. 
*                                                                               Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]                     The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]                The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]                The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                               execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                         A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                               The default value is false.
* @param {Function(error, result, response)}  callback                          `error` will contain information
*                                                                               if an error occurs; otherwise `result` will contain
*                                                                               the container information including `exists` boolean member. 
*                                                                               `response` will contain information related to this operation.
*/
BlobService.prototype._doesContainerExist = function (container, primaryOnly, options, callback) {
  var webResource = WebResource.head(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  if (primaryOnly === false) {
    options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;
  }

  var processResponseCallback = function (responseObject, next) {
    responseObject.containerResult = new ContainerResult(container);
    if (!responseObject.error) {
      responseObject.containerResult.exists = true;
      responseObject.containerResult.getPropertiesFromHeaders(responseObject.response.headers);

    } else if (responseObject.error && responseObject.error.statusCode === Constants.HttpConstants.HttpResponseCodes.NotFound) {
      responseObject.error = null;
      responseObject.containerResult.exists = false;
      responseObject.response.isSuccessful = true;
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.containerResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Checks whether or not a blob exists on the service.
* @ignore
*
* @this {BlobService}
* @param {string}             container                                         The container name.
* @param {string}             blob                                              The blob name.
* @param {string}             primaryOnly                                       If true, the request will be executed against the primary storage location.
* @param {object}             [options]                                         The request options.
* @param {string}             [options.snapshotId]                              The snapshot identifier.
* @param {string}             [options.leaseId]                                 The lease identifier.
* @param {LocationMode}       [options.locationMode]                            Specifies the location mode used to decide which location the request should be sent to. 
*                                                                               Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]                     The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]                The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]                The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                               execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]                         A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]                       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                               The default value is false.
* @param {Function(error, result, response)}  callback                          `error` will contain information
*                                                                               if an error occurs; otherwise `result` will contain 
*                                                                               the blob information including `exists` boolean member. 
*                                                                               `response` will contain information related to this operation.
*/
BlobService.prototype._doesBlobExist = function (container, blob, primaryOnly, options, callback) {
  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.head(resourceName)
    .withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId)
    .withHeader(HeaderConstants.LEASE_ID, options.leaseId);

  if (primaryOnly === false) {
    options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;
  }

  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = new BlobResult(container, blob);
    if (!responseObject.error) {
      responseObject.blobResult.exists = true;
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);

    } else if (responseObject.error && responseObject.error.statusCode === Constants.HttpConstants.HttpResponseCodes.NotFound) {
      responseObject.error = null;
      responseObject.blobResult.exists = false;
      responseObject.response.isSuccessful = true;
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* @ignore
*/
BlobService.prototype._setBlobPropertiesHelper = function (settings) {
  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;
    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(settings.container, settings.blob);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);
    }

    var finalCallback = function (returnObject) {
      settings.callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(settings.webResource, null, settings.options, processResponseCallback);
};

/**
* @ignore
*/
BlobService.prototype._validateLengthAndMD5 = function (options, responseObject) {
  var storedMD5 = responseObject.response.headers[Constants.HeaderConstants.CONTENT_MD5];
  var contentLength;

  if (!azureutil.objectIsNull(responseObject.response.headers[Constants.HeaderConstants.CONTENT_LENGTH])) {
    contentLength = parseInt(responseObject.response.headers[Constants.HeaderConstants.CONTENT_LENGTH], 10);
  }

  // If the user has not specified this option, the default value should be false.
  if (azureutil.objectIsNull(options.disableContentMD5Validation)) {
    options.disableContentMD5Validation = false;
  }

  // None of the below cases should be retried. So set the error in every case so the retry policy filter handle knows that it shouldn't be retried.
  if (options.disableContentMD5Validation === false && options.useTransactionalMD5 === true && azureutil.objectIsNull(storedMD5)) {
    responseObject.error = new StorageError(SR.MD5_NOT_PRESENT_ERROR);
    responseObject.retryable = false;
  }

  // Validate length and if required, MD5.
  // If getBlobToText called this method, then the responseObject.length and responseObject.contentMD5 are not set. Calculate them first using responseObject.response.body and then validate.
  if (azureutil.objectIsNull(responseObject.length)) {
    if (typeof responseObject.response.body == 'string') {
      responseObject.length = Buffer.byteLength(responseObject.response.body);
    } else if (Buffer.isBuffer(responseObject.response.body)) {
      responseObject.length = responseObject.response.body.length;
    }
  }

  if (!azureutil.objectIsNull(contentLength) && responseObject.length !== contentLength) {
    responseObject.error = new Error(SR.CONTENT_LENGTH_MISMATCH);
    responseObject.retryable = false;
  }

  if (options.disableContentMD5Validation === false && azureutil.objectIsNull(responseObject.contentMD5)) {
    responseObject.contentMD5 = azureutil.getContentMd5(responseObject.response.body);
  }

  if (options.disableContentMD5Validation === false && !azureutil.objectIsNull(storedMD5) && storedMD5 !== responseObject.contentMD5) {
    responseObject.error = new Error(util.format(SR.HASH_MISMATCH, storedMD5, responseObject.contentMD5));
    responseObject.retryable = false;
  }
};

/**
* @ignore
*/
BlobService.prototype._setRangeContentMD5Header = function (webResource, options) {
  if (!azureutil.objectIsNull(options.rangeStart) && options.useTransactionalMD5) {
    if (azureutil.objectIsNull(options.rangeEnd)) {
      throw new ArgumentNullError('options.rangeEndHeader', util.format(SR.ARGUMENT_NULL_OR_EMPTY, options.rangeEndHeader));
    }

    var size = parseInt(options.rangeEnd, 10) - parseInt(options.rangeStart, 10) + 1;
    if (size > BlobConstants.MAX_RANGE_GET_SIZE_WITH_MD5) {
      throw new ArgumentError('options', SR.INVALID_RANGE_FOR_MD5);
    } else {
      webResource.withHeader(HeaderConstants.RANGE_GET_CONTENT_MD5, 'true');
    }
  }
};

/**
* Downloads a blockblob, pageblob or appendblob into a range stream.
* @ignore
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {string}             blobType                                    The type of blob to download: block blob, page blob or append blob.
* @param {Stream}             writeStream                                 The write stream.
* @param {object}             [options]                                   The request options.
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
*/
BlobService.prototype._getBlobToRangeStream = function (container, blob, blobType, writeStream, optionsOrCallback, callback) {
  var options;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

  validate.validateArgs('_getBlobToRangeStream', function (v) {
    v.string(container, 'container');
    v.string(blob, 'blob');
    v.containerNameIsValid(container);
    v.blobNameIsValid(container, blob);
    v.blobTypeIsValid(blobType);
    v.callback(callback);
  });

  var rangeStream = null;
  var isPageBlobDownload = true;

  if (blobType == BlobConstants.BlobTypes.PAGE) {
    rangeStream = new PageRangeStream(this, container, blob, options);
  } else if (blobType == BlobConstants.BlobTypes.APPEND) {
    rangeStream = new RangeStream(this, container, blob, options);
    isPageBlobDownload = false;
  } else if (blobType == BlobConstants.BlobTypes.BLOCK) {
    rangeStream = new BlockRangeStream(this, container, blob, options);
    isPageBlobDownload = false;
  }

  if (!options.speedSummary) {
    options.speedSummary = new SpeedSummary(blob);
  }

  var speedSummary = options.speedSummary;
  var parallelOperationThreadCount = options.parallelOperationThreadCount || this.parallelOperationThreadCount;
  var batchOperations = new BatchOperation('getBlobInRanges', { callbackInOrder: true, logger: this.logger, enableReuseSocket: this.defaultEnableReuseSocket });
  batchOperations.setConcurrency(parallelOperationThreadCount);

  var self = this;
  var checkMD5sum = !options.disableContentMD5Validation;
  var md5Hash = null;
  if (checkMD5sum) {
    md5Hash = new Md5Wrapper().createMd5Hash();
  }

  var savedBlobResult = null;
  var savedBlobResponse = null;

  rangeStream.on('range', function (range) {
    if (!speedSummary.totalSize) {
      speedSummary.totalSize = rangeStream.rangeSize;
    }

    var requestOptions = {
      rangeStart: range.start,
      rangeEnd: range.end,
      responseEncoding: null //Use Buffer to store the response data
    };

    var rangeSize = range.size;
    requestOptions.timeoutIntervalInMs = options.timeoutIntervalInMs;
    requestOptions.clientRequestTimeoutInMs = options.clientRequestTimeoutInMs;
    requestOptions.useTransactionalMD5 = options.useTransactionalMD5;
    requestOptions.snapshotId = options.snapshotId;

    if (range.dataSize === 0) {
      if (isPageBlobDownload) {
        var autoIncrement = speedSummary.getAutoIncrementFunction(rangeSize);
        //No operation to do and only wait for write zero to file in callback
        var writeZeroOperation = new BatchOperation.CommonOperation(BatchOperation.noOperation, function (error) {
          if (error) return;
          var bufferAvailable = azureutil.writeZerosToStream(writeStream, rangeSize, md5Hash, autoIncrement);
          //There is no need to pause the rangestream since we can perform http request and write disk at the same time
          self.logger.debug(util.format('Write %s bytes Zero from %s to %s', rangeSize, range.start, range.end));
          if (!bufferAvailable) {
            self.logger.debug('Write stream is full and pause batch operation');
            batchOperations.pause();
          }
        });
        batchOperations.addOperation(writeZeroOperation);
      } else {
        self.logger.debug(util.format('Can not read %s bytes to %s bytes of blob %s', range.start, range.end, blob));
      }
      return;
    }

    if (range.start > range.end) {
      return;
    }

    var operation = new BatchOperation.RestOperation(self, 'getBlobToText', container, blob, requestOptions, function (error, content, blobResult, response) {
      if (!error) {
        if (rangeSize !== content.length) {
          self.logger.warn(util.format('Request %s bytes, but server returns %s bytes', rangeSize, content.length));
        }
        //Save one of the succeeded callback parameters and use them at the final callback
        if (!savedBlobResult) {
          savedBlobResult = blobResult;
        }
        if (!savedBlobResponse) {
          savedBlobResponse = response;
        }
        var autoIncrement = speedSummary.getAutoIncrementFunction(content.length);
        var bufferAvailable = writeStream.write(content, autoIncrement);
        if (!bufferAvailable) {
          self.logger.debug('Write stream is full and pause batch operation');
          batchOperations.pause();
        }
        if (md5Hash) {
          md5Hash.update(content);
        }
        content = null;
      } else {
        self.logger.debug(util.format('Stop downloading data as error happens. Error: %s', util.inspect(error)));
        rangeStream.stop();
      }
    });

    var full = batchOperations.addOperation(operation);
    if (full) {
      self.logger.debug('Pause range stream');
      rangeStream.pause();
    }
  });

  rangeStream.on('end', function () {
    self.logger.debug('Range stream has ended.');
    batchOperations.enableComplete();
  });

  batchOperations.on('drain', function () {
    self.logger.debug('Resume range stream');
    rangeStream.resume();
  });

  writeStream.on('drain', function () {
    self.logger.debug('Resume batch operations');
    batchOperations.resume();
  });

  batchOperations.on('end', function (error) {
    self.logger.debug('Download completed!');
    if (error) {
      callback(error);
      return;
    } else {
      writeStream.end(function () {
        self.logger.debug('Write stream has ended');
        if (!savedBlobResult) {
          savedBlobResult = {};
        }

        azureutil.setObjectInnerPropertyValue(savedBlobResult, ['contentSettings', 'contentMD5'], azureutil.tryGetValueChain(options, ['contentSettings', 'contentMD5'], null));
        savedBlobResult.clientSideContentMD5 = null;
        if (md5Hash) {
          savedBlobResult.clientSideContentMD5 = md5Hash.digest('base64');
        }
        callback(error, savedBlobResult, savedBlobResponse);
      });
    }
  });

  var listOptions = {
    timeoutIntervalInMs: options.timeoutIntervalInMs,
    clientRequestTimeoutInMs: options.clientRequestTimeoutInMs,
    snapshotId: options.snapshotId,
    leaseId: options.leaseId,
    blockListFilter: BlobUtilities.BlockListFilter.COMMITTED
  };

  rangeStream.list(listOptions, function (error) {
    callback(error);
  });

  return speedSummary;
};

/**
* Downloads a blockblob or pageblob into a stream.
* @ignore
* @this {BlobService}
* @param {string}             container                                   The container name.
* @param {string}             blob                                        The blob name.
* @param {Stream}             writeStream                                 The write stream.
* @param {object}             [options]                                   The request options.
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
*/
BlobService.prototype._getBlobToStream = function (container, blob, writeStream, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  var resourceName = createResourceName(container, blob);
  var webResource = WebResource.get(resourceName).withRawResponse();

  var options = extend(true, {}, userOptions);
  webResource.withQueryOption(QueryStringConstants.SNAPSHOT, options.snapshotId);

  BlobResult.setHeadersFromBlob(webResource, options);

  this._setRangeContentMD5Header(webResource, options);

  var self = this;
  var processResponseCallback = function (responseObject, next) {
    responseObject.blobResult = null;

    if (!responseObject.error) {
      responseObject.blobResult = new BlobResult(container, blob);
      responseObject.blobResult.metadata = self.parseMetadataHeaders(responseObject.response.headers);
      responseObject.blobResult.getPropertiesFromHeaders(responseObject.response.headers);

      self._validateLengthAndMD5(options, responseObject);
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.blobResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequestInputStream(webResource, null, writeStream, options, processResponseCallback);
};

/**
* Lists a segment containing a collection of blob items whose names begin with the specified prefix in the container.
* @ignore
* @this {BlobService}
* @param {string}             container                           The container name.
* @param {string}             prefix                              The prefix of the blob name.
* @param {object}             currentToken                        A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
* @param {ListBlobTypes}      listBlobType                        Specifies the item type of the results.
* @param {object}             [options]                           The request options.
* @param {int}                [options.maxResults]                Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
* @param {string}             [options.include]                   Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs', 'copy', 'deleted').
*                                                                 Please find these values in BlobUtilities.BlobListingDetails. Multiple values can be added separated with a comma (,).
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
* @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                 The default value is false.
* @param {errorOrResult}      callback                            `error` will contain information
*                                                                 if an error occurs; otherwise `result` will contain
*                                                                 the entries of blobs and the continuation token for the next listing operation.
*                                                                 `response` will contain information related to this operation.
*/
BlobService.prototype._listBlobsOrDircotriesSegmentedWithPrefix = function (container, prefix, currentToken, listBlobType, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });

  validate.validateArgs('listBlobsSegmented', function (v) {
    v.string(container, 'container');
    v.containerNameIsValid(container);
    v.callback(callback);
  });

  var options = extend(true, {}, userOptions);
  var webResource = WebResource.get(container)
    .withQueryOption(QueryStringConstants.RESTYPE, 'container')
    .withQueryOption(QueryStringConstants.COMP, 'list')
    .withQueryOption(QueryStringConstants.MAX_RESULTS, options.maxResults)
    .withQueryOptions(options,
    QueryStringConstants.DELIMITER,
    QueryStringConstants.INCLUDE);

  if (!azureutil.objectIsNull(currentToken)) {
    webResource.withQueryOption(QueryStringConstants.MARKER, currentToken.nextMarker);
  }

  webResource.withQueryOption(QueryStringConstants.PREFIX, prefix);

  options.requestLocationMode = azureutil.getNextListingLocationMode(currentToken);

  var processResponseCallback = function (responseObject, next) {
    responseObject.listBlobsResult = null;
    if (!responseObject.error) {
      responseObject.listBlobsResult = {
        entries: null,
        continuationToken: null
      };

      responseObject.listBlobsResult.entries = [];
      var results = [];

      if (listBlobType == BlobConstants.ListBlobTypes.Directory && responseObject.response.body.EnumerationResults.Blobs.BlobPrefix) {
        results = responseObject.response.body.EnumerationResults.Blobs.BlobPrefix;
        if (!_.isArray(results)) {
          results = [results];
        }
      } else if (listBlobType == BlobConstants.ListBlobTypes.Blob && responseObject.response.body.EnumerationResults.Blobs.Blob) {
        results = responseObject.response.body.EnumerationResults.Blobs.Blob;
        if (!_.isArray(results)) {
          results = [results];
        }
      }

      results.forEach(function (currentBlob) {
        var blobResult = BlobResult.parse(currentBlob);
        responseObject.listBlobsResult.entries.push(blobResult);
      });

      if (responseObject.response.body.EnumerationResults.NextMarker) {
        responseObject.listBlobsResult.continuationToken = {
          nextMarker: null,
          targetLocation: null
        };

        responseObject.listBlobsResult.continuationToken.nextMarker = responseObject.response.body.EnumerationResults.NextMarker;
        responseObject.listBlobsResult.continuationToken.targetLocation = responseObject.targetLocation;
      }
    }

    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.listBlobsResult, returnObject.response);
    };

    next(responseObject, finalCallback);
  };

  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Create a new blob.
* @ignore
* 
* @this {BlobService}
* @param {string}             container                                The container name.
* @param {string}             blob                                     The blob name.
* @param {BlobType}           blobType                                 The blob type.
* @param {int}                size                                     The blob size. 
* @param {object}             [options]                                The request options.
* @param {string}             [options.blobTier]                       For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
* @param {errorOrResult}      callback                                 The callback which operates on the specific blob.
*/
BlobService.prototype._createBlob = function (container, blob, blobType, size, options, creationCallback) {
  if (blobType == BlobConstants.BlobTypes.APPEND) {
    this.createOrReplaceAppendBlob(container, blob, options, function (createError, createResponse) {
      creationCallback(createError, null, createResponse);
    });
  } else if (blobType == BlobConstants.BlobTypes.PAGE) {
    this.createPageBlob(container, blob, size, options, function (createError) {
      creationCallback(createError);
    });
  } else if (blobType == BlobConstants.BlobTypes.BLOCK) {
    creationCallback();
  }
};

/**
* The callback for {BlobService~getBlobToText}.
* @typedef {function} BlobService~blobToText
* @param {object} error      If an error occurs, the error information.
* @param {string} text       The text returned from the blob.
* @param {object} blockBlob  Information about the blob.
* @param {object} response   Information related to this operation.
*/

BlobService.SpeedSummary = SpeedSummary;

module.exports = BlobService;
