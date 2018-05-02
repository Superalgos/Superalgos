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
import * as events from 'events';
import * as url from 'url';
import * as stream from 'stream';

interface Map<T> {
  [index: string]: T;
}

interface SharedKeyGenerateSignatureArgs {
  /** The resource type, if the resource is a blob or container.  Null if the resource is a queue or table. */
  resourceType?: string;
  /** The table name, if the resource is a table.  Null if the resource is a blob orqueue. */
  tableName?: string;
  /** The optional header values to set for a blob returned wth this SAS. */
  headers?: {
    /** The value of the Cache-Control response header to be returned when this SAS is used. */
    CacheControl?: string;
    /** The value of the Content-Type response header to be returned when this SAS is used. */
    ContentType?: string;
    /** The value of the Content-Encoding response header to be returned when this SAS is used. */
    ContentEncoding?: string;
    /** The value of the Content-Language response header to be returned when this SAS is used. */
    ContentLanguage?: string;
    /** The value of the Content-Disposition response header to be returned when this SAS is used. */
    ContentDisposition: string;
  };
}

interface SharedKeyGenerateQueryStringArgs extends SharedKeyGenerateSignatureArgs {
  /** The query string, if additional parameters are desired. */
  queryString?: string;
}

declare module azurestorage {
  export interface StorageHost {
    primaryHost: string;
    secondaryHost?: string;
  }

  module services {
    module blob {
      // ###########################
      // ./services/blob/blobservice
      // ###########################
      module blobservice {
        export class BlobService extends StorageServiceClient {
          defaultEnableReuseSocket: boolean;
          singleBlobPutThresholdInBytes: number;
          parallelOperationThreadCount: number;

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
          constructor(storageAccountOrConnectionString: string, storageAccessKey?: string, host?: string|StorageHost, sasToken?: string, endpointSuffix?: string);

          /**
          * Associate a filtering operation with this BlobService. Filtering operations
          * can include logging, automatically retrying, etc. Filter operations are objects
          * that implement a method with the signature:
          *
          *     "function handle (requestOptions, next)".
          *
          * After doing its preprocessing on the request options, the method needs to call
          * "next" passing a callback with the following signature:
          * signature:
          *
          *     "function (returnObject, finalCallback, next)"
          *
          * In this callback, and after processing the returnObject (the response from the
          * request to the server), the callback needs to either invoke next if it exists to
          * continue processing other filters or simply invoke finalCallback otherwise to end
          * up the service invocation.
          *
          * @function BlobService#withFilter
          * @param {Object} filter The new filter object.
          * @return {BlobService} A new service client with the filter applied.
          */
          withFilter(newFilter: common.filters.IFilter): BlobService;

          /**
          * Gets the service stats for a storage account’s Blob service.
          *
          * @this {BlobService}
          * @param {Object}       [options]                               The request options.
          * @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
          *                                                               Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}          [options.timeoutIntervalInMs]           The timeout interval, in milliseconds, to use for the request.
          * @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                               execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}       [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
          * @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                               The default value is false.
          * @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `result` will contain the stats and
          *                                                               `response` will contain information related to this operation.
          */
          getServiceStats(options: common.RequestOptions, callback: ErrorOrResult<common.models.ServiceStats>): void;
          getServiceStats(callback: ErrorOrResult<common.models.ServiceStats>): void;
          
          /**
          * Gets the properties of a storage account’s Blob service, including Azure Storage Analytics.
          *
          * @this {BlobService}
          * @param {Object}       [options]                               The request options.
          * @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
          *                                                               Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}          [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
          * @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                               execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}       [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
          * @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                               The default value is false.
          * @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `result` will contain the properties
          *                                                               and `response` will contain information related to this operation.
          */
          getServiceProperties(options: common.RequestOptions, callback?: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;
          getServiceProperties(callback?: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;
          /**
          * Sets the properties of a storage account’s Blob service, including Azure Storage Analytics.
          * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
          * When you set blob service properties (such as enabling soft delete), it may take up to 30 seconds to take effect.
          *
          * @this {BlobService}
          * @param {Object}             serviceProperties                        The service properties.
          * @param {Object}             [options]                                The request options.
          * @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to.
          *                                                                      Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                      execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                      The default value is false.
          * @param {errorOrResponse}  callback                                   `error` will contain information
          *                                                                      if an error occurs; otherwise, `response`
          *                                                                      will contain information related to this operation.
          */
          setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, options: common.RequestOptions, callback: ErrorOrResponse): void;
          setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, callback: ErrorOrResponse): void;

          /**
          * Sets the tier of a blockblob under a blob storage LRS account, or the tier of a pageblob under a premium storage account.
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
          setBlobTier(container: string, blob: string, blobTier: string, options: common.RequestOptions, callback: ErrorOrResponse): void;
          setBlobTier(container: string, blob: string, blobTier: string, callback: ErrorOrResponse): void;

          /**
          * Lists a segment containing a collection of container items under the specified account.
          *
          * @this {BlobService}
          * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {Object}             [options]                                   The request options.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.maxResults]                        Specifies the maximum number of containers to return per call to Azure storage.
          * @param {string}             [options.include]                           Include this parameter to specify that the container's metadata be returned as part of the response body. (allowed values: '', 'metadata')
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
          *                                                                         `entries`  gives a list of containers and the `continuationToken` is used for the next listing operation.
          *                                                                         `response` will contain information related to this operation.
          */
          listContainersSegmented(currentToken: common.ContinuationToken, options: BlobService.ListContainerOptions, callback: ErrorOrResult<BlobService.ListContainerResult>): void;
          listContainersSegmented(currentToken: common.ContinuationToken, callback: ErrorOrResult<BlobService.ListContainerResult>): void;
          /**
          * Lists a segment containing a collection of container items whose names begin with the specified prefix under the specified account.
          *
          * @this {BlobService}
          * @param {string}             prefix                                      The prefix of the container name.
          * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {Object}             [options]                                   The request options.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.maxResults]                        Specifies the maximum number of containers to return per call to Azure storage.
          * @param {string}             [options.include]                           Include this parameter to specify that the container's metadata be returned as part of the response body. (allowed values: '', 'metadata')
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}      callback                                    `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
          *                                                                         `entries`  gives a list of containers and the `continuationToken` is used for the next listing operation.
          *                                                                         `response` will contain information related to this operation.
          */
          listContainersSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, options: BlobService.ListContainerOptions, callback: ErrorOrResult<BlobService.ListContainerResult>): void;
          listContainersSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<BlobService.ListContainerResult>): void;

          /**
          * Checks whether or not a container exists on the service.
          *
          * @this {BlobService}
          * @param {string}             container                               The container name.
          * @param {Object}             [options]                               The request options.
          * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
          *                                                                     Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                     The default value is false.
          * @param {errorOrResult}      callback                                `error` will contain information
          *                                                                     if an error occurs; otherwise `result` will
          *                                                                     be true if the container exists, or false if the container does not exist.
          *                                                                     `response` will contain information related to this operation.
          */
          doesContainerExist(container: string, options: common.RequestOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;
          

          /**
          * Checks whether or not a container exists on the service.
          *
          * @this {BlobService}
          * @param {string}             container                               The container name.
          * @param {errorOrResult}      callback                               `error` will contain information
          *                                                                     if an error occurs; otherwise `result` will
          *                                                                     be true if the container exists, or false if the container does not exist.
          *                                                                     `response` will contain information related to this operation.
          */
          doesContainerExist(container: string, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Creates a new container under the specified account.
          * If a container with the same name already exists, the operation fails.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 the container information.
          *                                                                 `response` will contain information related to this operation.
          */
          createContainer(container: string, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          
          /**
          * Creates a new container under the specified account.
          * If a container with the same name already exists, the operation fails.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             [options]                           The request options.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {Object}             [options.metadata]                  The metadata key/value pairs.
          * @param {string}             [options.publicAccessLevel]         Specifies whether data in the container may be accessed publicly and the level of access.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 the container information.
          *                                                                 `response` will contain information related to this operation.
          */
          createContainer(container: string, options: BlobService.CreateContainerOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Creates a new container under the specified account if the container does not exists.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {errorOrResult}      callback                                  `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will
          *                                                                       be true if the container was created, or false if the container
          *                                                                       already exists.
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
          createContainerIfNotExists(container: string, callback: ErrorOrResult<BlobService.ContainerResult>): void;
          
          /**
          * Creates a new container under the specified account if the container does not exists.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {Object}             [options]                                 The request options.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {Object}             [options.metadata]                        The metadata key/value pairs.
          * @param {string}             [options.publicAccessLevel]               Specifies whether data in the container may be accessed publicly and the level of access.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResult}      callback                                  `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will
          *                                                                       be true if the container was created, or false if the container
          *                                                                       already exists.
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
          createContainerIfNotExists(container: string, options: BlobService.CreateContainerOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Retrieves a container and its properties from a specified account.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 information for the container.
          *                                                                 `response` will contain information related to this operation.
          */
          getContainerProperties(container: string, callback: ErrorOrResult<BlobService.ContainerResult>): void;
          
          /**
          * Retrieves a container and its properties from a specified account.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             [options]                           The request options.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {string}             [options.leaseId]                   The container lease identifier.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 information for the container.
          *                                                                 `response` will contain information related to this operation.
          */
          getContainerProperties(container: string, options: BlobService.ContainerOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Returns all user-defined metadata for the container.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {errorOrResult}      callback                                  `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will contain
          *                                                                       information for the container.
          *                                                                       `response` will contain information related to this operation.
          */
          getContainerMetadata(container: string, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Returns all user-defined metadata for the container.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {Object}             [options]                                 The request options.
          * @param {string}             [options.leaseId]                         The container lease identifier.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResult}  callback                                      `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will contain
          *                                                                       information for the container.
          *                                                                       `response` will contain information related to this operation.
          */
          getContainerMetadata(container: string, options: BlobService.ContainerOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Sets the container's metadata.
          *
          * Calling the Set Container Metadata operation overwrites all existing metadata that is associated with the container.
          * It's not possible to modify an individual name/value pair.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             metadata                            The metadata key/value pairs.
          * @param {errorOrResponse}  callback                              `error` will contain information
          *                                                                 if an error occurs; otherwise
          *                                                                 `response` will contain information related to this operation.
          */
          setContainerMetadata(container: string, metadata: Map<string>, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Sets the container's metadata.
          *
          * Calling the Set Container Metadata operation overwrites all existing metadata that is associated with the container.
          * It's not possible to modify an individual name/value pair.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             metadata                            The metadata key/value pairs.
          * @param {Object}             [options]                           The request options.
          * @param {string}             [options.leaseId]                   The container lease identifier.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {AccessConditions}   [options.accessConditions]          The access conditions.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResponse}  callback                              `error` will contain information
          *                                                                 if an error occurs; otherwise
          *                                                                 `response` will contain information related to this operation.
          */
          setContainerMetadata(container: string, metadata: Map<string>, options: BlobService.ContainerOptions, callback: ErrorOrResult<BlobService.ContainerResult>): void;

          /**
          * Gets the container's ACL.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 information for the container.
          *                                                                 `response` will contain information related to this operation.
          */
          getContainerAcl(container: string, callback: ErrorOrResult<BlobService.ContainerAclResult>): void;

          /**
          * Gets the container's ACL.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             [options]                           The request options.
          * @param {string}             [options.leaseId]                   The container lease identifier.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResult}      callback                            `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will contain
          *                                                                 information for the container.
          *                                                                 `response` will contain information related to this operation.
          */
          getContainerAcl(container: string, options: BlobService.ContainerOptions, callback: ErrorOrResult<BlobService.ContainerAclResult>): void;

          /**
          * Updates the container's ACL.
          *
          * @this {BlobService}
          * @param {string}                         container                           The container name.
          * @param {[key:string]: AccessPolicy}     signedIdentifiers                   The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
          * @param {Object}                         [options]                           The request options.
          * @param {AccessConditions}               [options.accessConditions]          The access conditions.
          * @param {string}                         [options.publicAccessLevel]         Specifies whether data in the container may be accessed publicly and the level of access.
          * @param {string}                         [options.leaseId]                   The container lease identifier.
          * @param {int}                            [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                            [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}                         [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}                           [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}                  callback                            `error` will contain information
          *                                                                             if an error occurs; otherwise `result` will contain
          *                                                                             information for the container.
          *                                                                             `response` will contain information related to this operation.
          */
          setContainerAcl(container: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, options: BlobService.ContainerAclOptions, callback: ErrorOrResult<BlobService.ContainerAclResult>): void;
          setContainerAcl(container: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, callback: ErrorOrResult<BlobService.ContainerAclResult>): void;

          /**
          * Marks the specified container for deletion.
          * The container and any blobs contained within it are later deleted during garbage collection.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {errorOrResponse}  callback                              `error` will contain information
          *                                                                 if an error occurs; otherwise
          *                                                                 `response` will contain information related to this operation.
          */
          deleteContainer(container: string, callback: ErrorOrResponse): void;

          /**
          * Marks the specified container for deletion.
          * The container and any blobs contained within it are later deleted during garbage collection.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             [options]                           The request options.
          * @param {AccessConditions}   [options.accessConditions]          The access conditions.
          * @param {string}             [options.leaseId]                   The container lease identifier.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResponse}  callback                              `error` will contain information
          *                                                                 if an error occurs; otherwise
          *                                                                 `response` will contain information related to this operation.
          */
          deleteContainer(container: string, options: BlobService.ContainerOptions, callback: ErrorOrResponse): void;

          /**
          * Marks the specified container for deletion if it exists.
          * The container and any blobs contained within it are later deleted during garbage collection.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {errorOrResult} callback                                 `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will
          *                                                                 be true if the container exists and was deleted, or false if the container
          *                                                                 did not exist.
          *                                                                 `response` will contain information related to this operation.
          */
          deleteContainerIfExists(container: string, callback: ErrorOrResult<boolean>): void;

          /**
          * Marks the specified container for deletion if it exists.
          * The container and any blobs contained within it are later deleted during garbage collection.
          *
          * @this {BlobService}
          * @param {string}             container                           The container name.
          * @param {Object}             [options]                           The request options.
          * @param {AccessConditions}   [options.accessConditions]          The access conditions.
          * @param {string}             [options.leaseId]                   The container lease identifier.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResult} callback                                 `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will
          *                                                                 be true if the container exists and was deleted, or false if the container
          *                                                                 did not exist.
          *                                                                 `response` will contain information related to this operation.
          */
          deleteContainerIfExists(container: string, options: BlobService.ContainerOptions, callback: ErrorOrResult<boolean>): void;

          /**
          * Lists a segment containing a collection of blob items in the container.
          *
          * @this {BlobService}
          * @param {string}             container                         The container name.
          * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {errorOrResult}      callback                          `error` will contain information
          *                                                               if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
          *                                                               `entries`  gives a list of blobs and the `continuationToken` is used for the next listing operation.
          *                                                               `response` will contain information related to this operation.
          */
          listBlobsSegmented(container: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<BlobService.ListBlobsResult>): void;

          /**
          * Lists a segment containing a collection of blob items in the container.
          *
          * @this {BlobService}
          * @param {string}             container                         The container name.
          * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {Object}             [options]                         The request options.
          * @param {string}             [options.delimiter]               Delimiter, i.e. '/', for specifying folder hierarchy.
          * @param {int}                [options.maxResults]              Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
          * @param {string}             [options.include]                 Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs', 'copy', 'deleted'). Multiple values can be added separated with a comma (,)
          * @param {LocationMode}       [options.locationMode]            Specifies the location mode used to decide which location the request should be sent to.
          *                                                               Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]     The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                               execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]         A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                               The default value is false.
          * @param {errorOrResult}  callback                              `error` will contain information
          *                                                               if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
          *                                                               `entries`  gives a list of blobs and the `continuationToken` is used for the next listing operation.
          *                                                               `response` will contain information related to this operation.
          */
          listBlobsSegmented(container: string, currentToken: common.ContinuationToken, options: BlobService.ListBlobsSegmentedRequestOptions, callback: ErrorOrResult<BlobService.ListBlobsResult>): void;

          /**
          * Lists a segment containing a collection of blob items whose names begin with the specified prefix in the container.
          *
          * @this {BlobService}
          * @param {string}             container                         The container name.
          * @param {string}             prefix                            The prefix of the blob name.
          * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {errorOrResult}      callback                          `error` will contain information
          *                                                               if an error occurs; otherwise `result` will contain
          *                                                               the entries of blobs and the continuation token for the next listing operation.
          *                                                               `response` will contain information related to this operation.
          */
          listBlobsSegmentedWithPrefix(container: string, prefix: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<BlobService.ListBlobsResult>): void;

          /**
          * Lists a segment containing a collection of blob items whose names begin with the specified prefix in the container.
          *
          * @this {BlobService}
          * @param {string}             container                         The container name.
          * @param {string}             prefix                            The prefix of the blob name.
          * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
          * @param {Object}             [options]                         The request options.
          * @param {string}             [options.delimiter]               Delimiter, i.e. '/', for specifying folder hierarchy.
          * @param {int}                [options.maxResults]              Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
          * @param {string}             [options.include]                 Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs', 'copy', 'deleted'). Multiple values can be added separated with a comma (,)
          * @param {LocationMode}       [options.locationMode]            Specifies the location mode used to decide which location the request should be sent to.
          *                                                               Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]     The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                               execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]         A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                               The default value is false.
          * @param {errorOrResult}  callback                              `error` will contain information
          *                                                               if an error occurs; otherwise `result` will contain
          *                                                               the entries of blobs and the continuation token for the next listing operation.
          *                                                               `response` will contain information related to this operation.
          */
          listBlobsSegmentedWithPrefix(container: string, prefix: string, currentToken: common.ContinuationToken, options: BlobService.ListBlobsSegmentedRequestOptions, callback: ErrorOrResult<BlobService.ListBlobsResult>): void;

          /**
          * Acquires a new lease. If container and blob are specified, acquires a blob lease. Otherwise, if only container is specified and blob is null, acquires a container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          acquireLease(container: string, blob: string, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Acquires a new lease. If container and blob are specified, acquires a blob lease. Otherwise, if only container is specified and blob is null, acquires a container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.leaseDuration]                     The lease duration in seconds. A non-infinite lease can be between 15 and 60 seconds. Default is never to expire.
          * @param {string}             [options.proposedLeaseId]                   The proposed lease identifier. Must be a GUID.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          acquireLease(container: string, blob: string, options: BlobService.AcquireLeaseRequestOptions, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Renews an existing lease. If container and blob are specified, renews the blob lease. Otherwise, if only container is specified and blob is null, renews the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The lease identifier. Must be a GUID.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          renewLease(container: string, blob: string, leaseId: string, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Renews an existing lease. If container and blob are specified, renews the blob lease. Otherwise, if only container is specified and blob is null, renews the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The lease identifier. Must be a GUID.
          * @param {Object}             [options]                                   The request options.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          renewLease(container: string, blob: string, leaseId: string, options: BlobService.LeaseRequestOptions, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Changes the lease ID of an active lease. If container and blob are specified, changes the blob lease. Otherwise, if only container is specified and blob is null, changes the
          * container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The current lease identifier.
          * @param {string}             proposedLeaseId                             The proposed lease identifier. Must be a GUID.
          * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain  the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          changeLease(container: string, blob: string, leaseId: string, proposedLeaseId: string, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Changes the lease ID of an active lease. If container and blob are specified, changes the blob lease. Otherwise, if only container is specified and blob is null, changes the
          * container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The current lease identifier.
          * @param {string}             proposedLeaseId                             The proposed lease identifier. Must be a GUID.
          * @param {Object}             [options]                                   The request options.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain  the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          changeLease(container: string, blob: string, leaseId: string, proposedLeaseId: string, options: BlobService.LeaseRequestOptions, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Releases the lease. If container and blob are specified, releases the blob lease. Otherwise, if only container is specified and blob is null, releases the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The lease identifier.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          releaseLease(container: string, blob: string, leaseId: string, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Releases the lease. If container and blob are specified, releases the blob lease. Otherwise, if only container is specified and blob is null, releases the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             leaseId                                     The lease identifier.
          * @param {Object}             [options]                                   The request options.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          releaseLease(container: string, blob: string, leaseId: string, options: BlobService.LeaseRequestOptions, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Breaks the lease but ensures that another client cannot acquire a new lease until the current lease period has expired. If container and blob are specified, breaks the blob lease.
          * Otherwise, if only container is specified and blob is null, breaks the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          breakLease(container: string, blob: string, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Breaks the lease but ensures that another client cannot acquire a new lease until the current lease period has expired. If container and blob are specified, breaks the blob lease.
          * Otherwise, if only container is specified and blob is null, breaks the container lease.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {int}                [options.leaseBreakPeriod]                  The lease break period, between 0 and 60 seconds. If unspecified, a fixed-duration lease breaks after
          *                                                                         the remaining lease period elapses, and an infinite lease breaks immediately.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the lease information.
          *                                                                         `response` will contain information related to this operation.
          */
          breakLease(container: string, blob: string, options: BlobService.BreakLeaseRequestOptions, callback: ErrorOrResult<BlobService.LeaseResult>): void;

          /**
          * Returns all user-defined metadata, standard HTTP properties, and system properties for the blob.
          * It does not return or modify the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information about the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          getBlobProperties(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Returns all user-defined metadata, standard HTTP properties, and system properties for the blob.
          * It does not return or modify the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information about the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          getBlobProperties(container: string, blob: string, optionsOrCallback: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Returns all user-defined metadata for the specified blob or snapshot.
          * It does not modify or return the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information about the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          getBlobMetadata(container: string, blob: string, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          getBlobMetadata(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Clears user-defined properties for the specified blob or snapshot.
          * It does not modify or return the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information about the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          setBlobProperties(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Sets user-defined properties for the specified blob or snapshot.
          * It does not modify or return the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {string}             [options.contentType]                       The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentEncoding]                   The content encodings that have been applied to the blob.
          * @param {string}             [options.contentLanguage]                   The natural languages used by this resource.
          * @param {string}             [options.contentMD5]                        The blob's MD5 hash.
          * @param {string}             [options.cacheControl]                      The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentDisposition]                The blob's content disposition.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information about the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          setBlobProperties(container: string, blob: string, optionsOrCallback: BlobService.SetBlobPropertiesRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Sets user-defined metadata for the specified blob or snapshot as one or more name-value pairs
          * It does not modify or return the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             metadata                                    The metadata key/value pairs.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information on the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          setBlobMetadata(container: string, blob: string, metadata: Map<string>, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Sets user-defined metadata for the specified blob or snapshot as one or more name-value pairs
          * It does not modify or return the content of the blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             metadata                                    The metadata key/value pairs.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         information on the blob.
          *                                                                         `response` will contain information related to this operation.
          */
          setBlobMetadata(container: string, blob: string, metadata: Map<string>, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Downloads a blob into a file.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {string}             localFileName                               The local path to the file to be downloaded.
          * @param {Object}             [options]                                   The request options.
          * @param {SpeedSummary}       [options.speedSummary]                      The upload tracker objects.
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
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain the blob information.
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
          getBlobToLocalFile(container: string, blob: string, localFileName: string, options: BlobService.GetBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          getBlobToLocalFile(container: string, blob: string, localFileName: string, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          /**
          * Provides a stream to read from a blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
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
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain the blob information.
          *                                                                         `response` will contain information related to this operation.
          * @return {Readable}                                                      A Node.js Readable stream.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * var writable = fs.createWriteStream(destinationFileNameTarget);
          *  blobService.createReadStream(containerName, blobName).pipe(writable);
          */
          createReadStream(container: string, blob: string, options: BlobService.GetBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): stream.Readable;
          createReadStream(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): stream.Readable;

          /**
          * Downloads a blob into a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Writable}           writeStream                                 The Node.js Writable stream.
          * @param {errorOrResult}      callback                                    `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain the blob information.
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
          getBlobToStream(container: string, blob: string, writeStream: stream.Writable, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Downloads a blob into a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Writable}           writeStream                                 The Node.js Writable stream.
          * @param {Object}             [options]                                   The request options.
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
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
          *                                                                         otherwise `result` will contain the blob information.
          *                                                                         `response` will contain information related to this operation.
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
          getBlobToStream(container: string, blob: string, writeStream: stream.Writable, options: BlobService.GetBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Downloads a blob into a text string.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {string}             [options.rangeStart]                        Return only the bytes of the blob in the specified range.
          * @param {string}             [options.rangeEnd]                          Return only the bytes of the blob in the specified range.
          * @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading blobs.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {BlobService~blobToText}  callback                               `error` will contain information
          *                                                                         if an error occurs; otherwise `text` will contain the blob contents,
          *                                                                         and `blockBlob` will contain
          *                                                                         the blob information.
          *                                                                         `response` will contain information related to this operation.
          */
          getBlobToText(container: string, blob: string, options: BlobService.GetBlobRequestOptions, callback: BlobService.BlobToText): void;
          getBlobToText(container: string, blob: string, callback: BlobService.BlobToText): void;

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
          * @param {errorOrResponse}    callback                                    `error` will contain information
          *                                                                         if an error occurs; `response` will contain information related to this operation.
          */
          deleteBlob(container: string, blob: string, callback: ErrorOrResponse): void;

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
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.deleteSnapshots]                   The snapshot delete option. See azure.BlobUtilities.SnapshotDeleteOptions.*.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResponse}    callback                                      `error` will contain information
          *                                                                         if an error occurs; `response` will contain information related to this operation.
          */
          deleteBlob(container: string, blob: string, options: BlobService.DeleteBlobRequestOptions, callback: ErrorOrResponse): void;

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
          undeleteBlob(container: string, blob: string, callback: ErrorOrResponse): void;
          undeleteBlob(container: string, blob: string, options: BlobService.ConditionalRequestOption, callback: ErrorOrResponse): void;

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
          * @param {errorOrResult} callback                                 `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will
          *                                                                 be true if the blob was deleted, or false if the blob
          *                                                                 does not exist.
          *                                                                 `response` will contain information related to this operation.
          */
          deleteBlobIfExists(container: string, blob: string, callback: ErrorOrResult<boolean>): void;

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
          * @param {Object}             [options]                           The request options.
          * @param {string}             [options.deleteSnapshots]           The snapshot delete option. See azure.BlobUtilities.SnapshotDeleteOptions.*.
          * @param {string}             [options.snapshotId]                The snapshot identifier.
          * @param {string}             [options.leaseId]                   The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]          The access conditions.
          * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
          *                                                                 Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                 The default value is false.
          * @param {errorOrResult} callback                                 `error` will contain information
          *                                                                 if an error occurs; otherwise `result` will
          *                                                                 be true if the blob was deleted, or false if the blob
          *                                                                 does not exist.
          *                                                                 `response` will contain information related to this operation.
          */
          deleteBlobIfExists(container: string, blob: string, options: BlobService.DeleteBlobRequestOptions, callback: ErrorOrResult<boolean>): void;

          /**
          * Checks whether or not a blob exists on the service.
          *
          * @this {BlobService}
          * @param {string}             container                               The container name.
          * @param {string}             blob                                    The blob name.
          * @param {errorOrResult}  callback                                    `error` will contain information
          *                                                                     if an error occurs; otherwise `errorOrResult` will
          *                                                                     be true if the blob exists, or false if the blob does not exist.
          *                                                                     `response` will contain information related to this operation.
          */
          doesBlobExist(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Checks whether or not a blob exists on the service.
          *
          * @this {BlobService}
          * @param {string}             container                               The container name.
          * @param {string}             blob                                    The blob name.
          * @param {Object}             [options]                               The request options.
          * @param {string}             [options.snapshotId]                    The snapshot identifier.
          * @param {string}             [options.leaseId]                       The lease identifier.
          * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
          *                                                                     Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                     The default value is false.
          * @param {errorOrResult}  callback                                    `error` will contain information
          *                                                                     if an error occurs; otherwise `errorOrResult` will
          *                                                                     be true if the blob exists, or false if the blob does not exist.
          *                                                                     `response` will contain information related to this operation.
          */
          doesBlobExist(container: string, blob: string, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Creates a read-only snapshot of a blob.
          *
          * @this {BlobService}
          * @param {string}             container                             The container name.
          * @param {string}             blob                                  The blob name.
          * @param {Object}             [options]                             The request options.
          * @param {string}             [options.snapshotId]                  The snapshot identifier.
          * @param {Object}             [options.metadata]                    The metadata key/value pairs.
          * @param {string}             [options.leaseId]                     The lease identifier.
          * @param {AccessConditions}   [options.accessConditions]            The access conditions.
          * @param {LocationMode}       [options.locationMode]                Specifies the location mode used to decide which location the request should be sent to.
          *                                                                   Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]         The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]    The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                   The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                   execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]             A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]           Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                   The default value is false.
          * @param {errorOrResult}  callback                                  `error` will contain information
          *                                                                   if an error occurs; otherwise `result` will contain
          *                                                                   the ID of the snapshot.
          *                                                                   `response` will contain information related to this operation.
          */
          createBlobSnapshot(container: string, blob: string, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<string>): void;
          createBlobSnapshot(container: string, blob: string, callback: ErrorOrResult<string>): void;

          /**
          * Starts to copy a blob to a destination within the storage account. The Copy Blob operation copies the entire committed blob.
          *
          * @this {BlobService}
          * @param {string}             sourceUri                                 The source blob URI.
          * @param {string}             targetContainer                           The target container name.
          * @param {string}             targetBlob                                The target blob name.
          * @param {Object}             [options]                                 The request options.
          * @param {string}             [options.blobTier]                        For page blobs on premium accounts only. Set the tier of target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
          * @param {string}             [options.snapshotId]                      The source blob snapshot identifier.
          * @param {Object}             [options.metadata]                        The target blob metadata key/value pairs.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {string}             [options.sourceLeaseId]                   The source blob lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                The access conditions.
          * @param {AccessConditions}   [options.sourceAccessConditions]          The source access conditions.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResult}  callback                                      `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will contain
          *                                                                       the blob information.
          *                                                                       `response` will contain information related to this operation.
          */
          startCopyBlob(sourceUri: string, targetcontainer: string, targetblob: string, options: BlobService.CopyBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          startCopyBlob(sourceUri: string, targetcontainer: string, targetblob: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Abort a blob copy operation.
          *
          * @this {BlobService}
          * @param {string}             container                                 The destination container name.
          * @param {string}             blob                                      The destination blob name.
          * @param {string}             copyId                                    The copy operation identifier.
          * @param {Object}             [options]                                 The request options.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {ErrorOrResponse}  callback                                    `error` will contain information.
          *                                                                       `response` will contain information related to this operation.
          */
          abortCopyBlob(container: string, blob: string, copyId: string, options: BlobService.BlobRequestOptions, callback: ErrorOrResponse): void;
          abortCopyBlob(container: string, blob: string, copyId: string, callback: ErrorOrResponse): void;

          /**
          * Retrieves a shared access signature token.
          *
          * @this {BlobService}
          * @param {string}                   container                                     The container name.
          * @param {string}                   [blob]                                        The blob name.
          * @param {Object}                   sharedAccessPolicy                            The shared access policy.
          * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
          * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
          * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
          * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
          * @param {Object}                   [headers]                                     The optional header values to set for a blob returned wth this SAS.
          * @param {string}                   [headers.cacheControl]                        The optional value of the Cache-Control response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentType]                         The optional value of the Content-Type response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentEncoding]                     The optional value of the Content-Encoding response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentLanguage]                     The optional value of the Content-Language response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentDisposition]                  The optional value of the Content-Disposition response header to be returned when this SAS is used.
          * @return {string}                                                                The shared access signature. Note this does not contain the leading "?".
          */
          generateSharedAccessSignature(container: string, blob: string, sharedAccessPolicy: common.SharedAccessPolicy, headers?: common.ContentSettingsHeaders): string;

          /**
          * Retrieves a shared access signature token.
          *
          * @this {BlobService}
          * @param {string}                   container                                     The container name.
          * @param {string}                   [blob]                                        The blob name.
          * @param {Object}                   sharedAccessPolicy                            The shared access policy.
          * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
          * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
          * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
          * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
          * @param {string}                   [sasVersion]                                  An optional string indicating the desired SAS version to use. Value must be 2012-02-12 or later.
          * @param {Object}                   [headers]                                     The optional header values to set for a blob returned wth this SAS.
          * @param {string}                   [headers.cacheControl]                        The optional value of the Cache-Control response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentType]                         The optional value of the Content-Type response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentEncoding]                     The optional value of the Content-Encoding response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentLanguage]                     The optional value of the Content-Language response header to be returned when this SAS is used.
          * @param {string}                   [headers.contentDisposition]                  The optional value of the Content-Disposition response header to be returned when this SAS is used.
          * @return {string}                                                                The shared access signature query string. Note this string does not contain the leading "?".
          */
          generateSharedAccessSignatureWithVersion(container: string, blob: string, sharedAccessPolicy: common.SharedAccessPolicy, sasVersion: string, headers?: common.ContentSettingsHeaders): string;

          /**
          * Retrieves a blob or container URL.
          *
          * @param {string}                   container                The container name.
          * @param {string}                   [blob]                   The blob name.
          * @param {string}                   [sasToken]               The Shared Access Signature token.
          * @param {boolean}                  [primary]                A boolean representing whether to use the primary or the secondary endpoint.
          * @param {string}                   [snapshotId]             The snapshot identifier.
          * @return {string}                                           The formatted URL string.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * //create a SAS that expires in an hour
          * var sasToken = blobService.generateSharedAccessSignature(containerName, blobName, { AccessPolicy: { Expiry: azure.date.minutesFromNow(60); } });
          * var sasUrl = blobService.getUrl(containerName, blobName, sasToken, true);
          */
          getUrl(container: string, blob?: string, sasToken?: string, primary?: boolean, snapshotId?: string): string

          createPageBlob(container: string, blob: string, length: number, callback: ErrorOrResponse): void;

          createPageBlob(container: string, blob: string, length: number, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResponse): void;

          /**
          * Uploads a page blob from file.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param (string)             localFileName                                   The local path to the file to be uploaded.
          * @param {Object}             [options]                                       The request options.
          * @param {SpeedSummary}       [options.speedSummary]                          The upload tracker objects.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads.
          *                                                                             The default value is false for page blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.blobTier]                              For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}  callback                                            The callback function.
          * @return {SpeedSummary}
          */
          createPageBlobFromLocalFile(container: string, blob: string, localFileName: string, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createPageBlobFromLocalFile(container: string, blob: string, localFileName: string, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Uploads a page blob from an HTML file. If the blob already exists on the service, it will be overwritten.
          * To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
          * (Only available in the JavaScript Client Library for Browsers)
          *
          * @this {BlobService}
          * @param {string}             container                                           The container name.
          * @param {string}             blob                                                The blob name.
          * @param {Object}             browserFile                                         The File object to be uploaded created by HTML File API.
          * @param {Object}             [options]                                           The request options.
          * @param {SpeedSummary}       [options.speedSummary]                              The upload tracker objects.
          * @param {int}                [options.parallelOperationThreadCount]              The number of parallel operations that may be performed when uploading.
          * @param {string}             [options.leaseId]                                   The lease identifier.
          * @param {string}             [options.transactionalContentMD5]                   An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                                  The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                       Specifies whether the blob's ContentMD5 header should be set on uploads. 
          *                                                                                 The default value is false for page blobs.
          * @param {bool}               [options.useTransactionalMD5]                       Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                           The content settings of the blob.
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
          createPageBlobFromBrowserFile(container: string, blob: string, browserFile: Object, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createPageBlobFromBrowserFile(container: string, blob: string, browserFile: Object, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Uploads a page blob from a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param (Stream)             stream                                          Stream to the data to store.
          * @param {int}                streamLength                                    The length of the stream to upload.
          * @param {Object}             [options]                                       The request options.
          * @param {SpeedSummary}       [options.speedSummary]                          The download tracker objects;
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               An MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads.
          *                                                                             The default value is false for page blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.blobTier]                              For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}  callback                                            The callback function.
          * @return {SpeedSummary}
          */
          createPageBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createPageBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Provides a stream to write to a page blob. Assumes that the blob exists.
          * If it does not, please create the blob using createPageBlob before calling this method or use createWriteStreamNewPageBlob.
          * Please note the `Stream` returned by this API should be used with piping.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param {Object}             [options]                                       The request options.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads.
          *                                                                             The default value is false for page blobs and true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}      callback                                        `error` will contain information
          *                                                                             if an error occurs; otherwise `[result]{@link BlobResult}` will contain
          *                                                                             the blob information.
          *                                                                             `response` will contain information related to this operation.
          * @return {Writable}                                                          A Node.js Writable stream.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * blobService.createPageBlob(containerName, blobName, 1024, function (err) {
          *   // Pipe file to a blob
          *   var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToExistingPageBlob(containerName, blobName));
          * });
          */
          createWriteStreamToExistingPageBlob(container: string, blob: string, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;
          createWriteStreamToExistingPageBlob(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;

          /**
          * Provides a stream to write to a page blob. Creates the blob before writing data.
          * Please note the `Stream` returned by this API should be used with piping.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param {string}             length                                          The blob length.
          * @param {Object}             [options]                                       The request options.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads.
          *                                                                             The default value is false for page blobs and true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.blobTier]                              For page blobs on premium accounts only. Set the tier of the target blob. Refer to BlobUtilities.BlobTier.PremiumPageBlobTier.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}      callback                                        `error` will contain information
          *                                                                             if an error occurs; otherwise `[result]{@link BlobResult}` will contain
          *                                                                             the blob information.
          *                                                                             `response` will contain information related to this operation.
          * @return {Writable}                                                          A Node.js Writable stream.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * blobService.createPageBlob(containerName, blobName, 1024, function (err) {
          *   // Pipe file to a blob
          *   var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToNewPageBlob(containerName, blobName));
          * });
          */
          createWriteStreamToNewPageBlob(container: string, blob: string, length: number, options: BlobService.CreatePageBlobOptions, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;
          createWriteStreamToNewPageBlob(container: string, blob: string, length: number, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;

          /**
          * Updates a page blob from a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Readable}           readStream                                  The Node.js Readable stream.
          * @param {int}                rangeStart                                  The range start.
          * @param {int}                rangeEnd                                    The range end.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.leaseId]                           The target blob lease identifier.
          * @param {bool}               [options.useTransactionalMD5]               Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.transactionalContentMD5]           An optional hash value used to ensure transactional integrity for the page.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the blob information.
          *                                                                         `response` will contain information related to this operation.
          */
          createPagesFromStream(container: string, blob: string, readStream: stream.Readable, rangeStart: number, rangeEnd: number, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          createPagesFromStream(container: string, blob: string, readStream: stream.Readable, rangeStart: number, rangeEnd: number, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Lists page ranges. Lists all of the page ranges by default, or only the page ranges over a specific range of bytes if rangeStart and rangeEnd are specified.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {Object}             [options]                                   The request options.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {int}                [options.rangeStart]                        The range start.
          * @param {int}                [options.rangeEnd]                          The range end.
          * @param {string}             [options.snapshotId]                        The snapshot identifier.
          * @param {string}             [options.leaseId]                           The target blob lease identifier.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the page range information.
          *                                                                         `response` will contain information related to this operation.
          */
          listPageRanges(container: string, blob: string, options: BlobService.GetBlobRequestOptions, callback: ErrorOrResult<common.Range[]>): void;
          listPageRanges(container: string, blob: string, callback: ErrorOrResult<common.Range[]>): void;

          getPageRangesDiff(container: string, blob: string, previousSnapshotTime: string, options: BlobService.GetBlobRequestOptions, callback: ErrorOrResult<common.RangeDiff[]>): void;
          getPageRangesDiff(container: string, blob: string, previousSnapshotTime: string, callback: ErrorOrResult<common.RangeDiff[]>): void;

          /**
          * Clears a range of pages.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {int}                rangeStart                                  The range start.
          * @param {int}                rangeEnd                                    The range end.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.leaseId]                           The target blob lease identifier.
          * @param {AccessConditions}   [options.accessConditions]                  The access conditions.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResponse}  callback                                      `error` will contain information
          *                                                                         if an error occurs; otherwise
          *                                                                         `response` will contain information related to this operation.
          */
          clearPageRange(container: string, blob: string, rangeStart: number, rangeEnd: number, options: BlobService.BlobRequestOptions, callback: ErrorOrResponse): void;
          clearPageRange(container: string, blob: string, rangeStart: number, rangeEnd: number, callback: ErrorOrResponse): void;

          /**
          * Resizes a page blob.
          *
          * @this {BlobService}
          * @param {string}               container                                   The container name.
          * @param {string}               blob                                        The blob name.
          * @param {String}               size                                        The size of the page blob, in bytes.
          * @param {Object}               [options]                                   The request options.
          * @param {string}               [options.leaseId]                           The blob lease identifier.
          * @param {AccessConditions}     [options.accessConditions]                  The access conditions.
          * @param {LocationMode}         [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                           Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                  [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                  [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}               [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}                 [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}  callback                                          `error` will contain information
          *                                                                           if an error occurs; otherwise `result` will contain
          *                                                                           information about the blob.
          *                                                                           `response` will contain information related to this operation.
          */
          resizePageBlob(container: string, blob: string, size: number, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          resizePageBlob(container: string, blob: string, size: number, callback: ErrorOrResult<BlobService.BlobResult>): void;

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
          * @param {Object}               [options]                                   The request options.
          * @param {AccessConditions}     [options.accessConditions]                  The access conditions.
          * @param {LocationMode}         [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                           Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                  [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                  [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}               [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}                 [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}  callback                                          `error` will contain information
          *                                                                           if an error occurs; otherwise `result` will contain
          *                                                                           information about the blob.
          *                                                                           `response` will contain information related to this operation.
          */
          setPageBlobSequenceNumber(container: string, blob: string, sequenceNumberAction: string, sequenceNumber: number, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          setPageBlobSequenceNumber(container: string, blob: string, sequenceNumberAction: string, sequenceNumber: number, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Creates a new block blob or updates the content of an existing block blob.
          * Updating an existing block blob overwrites any existing metadata on the blob.
          * Partial updates are not supported with Put Blob; The content of the existing blob is overwritten with the content of the new blob.
          * To perform a partial update of the content of a block blob, use the Put Block List operation.
          * Calling Put Blob to create a page blob only initializes the blob. To add content to a page blob, call the Put Page operation.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param {string}             localFileName                                   The local path to the file to be uploaded.
          * @param {Object}             [options]                                       The request options.
          * @param {int}                [options.blockSize]                             The size of each block. Maximum is 100MB.
          * @param {string}             [options.blockIdPrefix]                         The prefix to be used to generate the block id.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}      callback                                        `error` will contain information
          *                                                                             if an error occurs; otherwise `[result]{@link BlobResult}` will contain
          *                                                                             the blob information.
          *                                                                             `response` will contain information related to this operation.
          * @return {SpeedSummary}
          */
          createBlockBlobFromLocalFile(container: string, blob: string, localFileName: string, options: BlobService.CreateBlockBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createBlockBlobFromLocalFile(container: string, blob: string, localFileName: string, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Creates a new block blob. If the blob already exists on the service, it will be overwritten.
          * To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
          * (Only available in the JavaScript Client Library for Browsers)
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {Object}             browserFile                                   The File object to be uploaded created by HTML File API.
          * @param {Object}             [options]                                     The request options.
          * @param {int}                [options.blockSize]                           The size of each block. Maximum is 100MB.
          * @param {string}             [options.blockIdPrefix]                       The prefix to be used to generate the block id.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {string}             [options.transactionalContentMD5]             The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]        The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          createBlockBlobFromBrowserFile(container: string, blob: string, browserFile: Object, options: BlobService.CreateBlockBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createBlockBlobFromBrowserFile(container: string, blob: string, browserFile: Object, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Uploads a block blob from a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param (Stream)             stream                                      Stream to the data to store.
          * @param {int}                streamLength                                The length of the stream to upload.
          * @param {errorOrResult}  callback                                        The callback function.
          * @return {SpeedSummary}
          */
          createBlockBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Uploads a block blob from a stream.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param (Stream)             stream                                          Stream to the data to store.
          * @param {int}                streamLength                                    The length of the stream to upload.
          * @param {Object}             [options]                                       The request options.
          * @param {SpeedSummary}       [options.speedSummary]                          The download tracker objects.
          * @param {int}                [options.blockSize]                             The size of each block. Maximum is 100MB.
          * @param {string}             [options.blockIdPrefix]                         The prefix to be used to generate the block id.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}  callback                                            The callback function.
          * @return {SpeedSummary}
          */
          createBlockBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, options: BlobService.CreateBlockBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Uploads a block blob from a text string.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param {string|object}      text                                            The blob text, as a string or in a Buffer.
          * @param {Object}             [options]                                       The request options.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}  callback                                            `error` will contain information
          *                                                                             if an error occurs; otherwise `result` will contain
          *                                                                             information about the blob.
          *                                                                             `response` will contain information related to this operation.
          */
          createBlockBlobFromText(container: string, blob: string, text: string | Buffer, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          createBlockBlobFromText(container: string, blob: string, text: string | Buffer, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Provides a stream to write to a block blob.
          * Please note the `Stream` returned by this API should be used with piping.
          *
          * @this {BlobService}
          * @param {string}             container                                       The container name.
          * @param {string}             blob                                            The blob name.
          * @param {Object}             [options]                                       The request options.
          * @param {int}                [options.blockSize]                             The size of each block. Maximum is 100MB.
          * @param {string}             [options.blockIdPrefix]                         The prefix to be used to generate the block id.
          * @param {string}             [options.leaseId]                               The lease identifier.
          * @param {string}             [options.transactionalContentMD5]               The MD5 hash of the blob content. This hash is used to verify the integrity of the blob during transport.
          * @param {Object}             [options.metadata]                              The metadata key/value pairs.
          * @param {int}                [options.parallelOperationThreadCount]          The number of parallel operations that may be performed when uploading.
          * @param {bool}               [options.storeBlobContentMD5]                   Specifies whether the blob's ContentMD5 header should be set on uploads.
          *                                                                             The default value is false for page blobs and true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                   Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.contentSettings.contentType]           The MIME content type of the blob. The default type is application/octet-stream.
          * @param {string}             [options.contentSettings.contentEncoding]       The content encodings that have been applied to the blob.
          * @param {string}             [options.contentSettings.contentLanguage]       The natural languages used by this resource.
          * @param {string}             [options.contentSettings.cacheControl]          The Blob service stores this value but does not use or modify it.
          * @param {string}             [options.contentSettings.contentDisposition]    The blob's content disposition.
          * @param {string}             [options.contentSettings.contentMD5]            The blob's MD5 hash.
          * @param {AccessConditions}   [options.accessConditions]                      The access conditions.
          * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
          *                                                                             Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                             The default value is false.
          * @param {errorOrResult}  callback                                            `error` will contain information
          *                                                                             if an error occurs; otherwise `result` will contain
          *                                                                             information about the blob.
          *                                                                             `response` will contain information related to this operation.
          * @return {Writable}                                                          A Node.js Writable stream. 
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToBlockBlob(containerName, blobName, { blockIdPrefix: 'block' }));
          */
          createWriteStreamToBlockBlob(container: string, blob: string, options: BlobService.CreateBlockBlobRequestOptions, callback?: ErrorOrResult<BlobService.BlobResult>): stream.Writable;
          createWriteStreamToBlockBlob(container: string, blob: string, callback?: ErrorOrResult<BlobService.BlobResult>): stream.Writable;

          /**
          * Creates a new block to be committed as part of a blob.
          *
          * @this {BlobService}
          * @param {string}             blockId                                   The block identifier.
          * @param {string}             container                                 The container name.
          * @param {string}             blob                                      The blob name.
          * @param {Readable}           readStream                                The Node.js Readable stream.
          * @param {int}                streamLength                              The stream length.
          * @param {Object}             [options]                                 The request options.
          * @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
          * @param {AccessConditions}   [options.accessConditions]                The access conditions.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResponse}  callback                                    `error` will contain information
          *                                                                       if an error occurs; otherwise
          *                                                                       `response` will contain information related to this operation.
          */
          createBlockFromStream(blockId: string, container: string, blob: string, readStream: stream.Readable, streamLength: number, options: BlobService.BlobRequestOptions, callback: ErrorOrResponse): void;
          createBlockFromStream(blockId: string, container: string, blob: string, readStream: stream.Readable, streamLength: number, callback: ErrorOrResponse): void;

          /**
          * Creates a new block to be committed as part of a blob.
          *
          * @this {BlobService}
          * @param {string}             blockId                                   The block identifier.
          * @param {string}             container                                 The container name.
          * @param {string}             blob                                      The blob name.
          * @param {string|buffer}      content                                   The block content.
          * @param {Object}             [options]                                 The request options.
          * @param {bool}               [options.useTransactionalMD5]             Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
          * @param {AccessConditions}   [options.accessConditions]                The access conditions.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResponse}  callback                                    `error` will contain information
          *                                                                       if an error occurs; otherwise
          *                                                                       `response` will contain information related to this operation.
          */
          createBlockFromText(blockId: string, container: string, blob: string, content: string | Buffer, options: BlobService.BlobRequestOptions, callback: ErrorOrResponse): void;
          createBlockFromText(blockId: string, container: string, blob: string, content: string | Buffer, callback: ErrorOrResponse): void;

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
          * @param {Object}             blockList                                     The wrapper for block ID list contains block IDs that make up the blob.
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
          * @param {Object}             [options]                                     The request options.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {string}             [options.leaseId]                             The target blob lease identifier.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}  callback                                          `error` will contain information
          *                                                                           if an error occurs; otherwise `result` will contain
          *                                                                           the blocklist information.
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
          */
          commitBlocks(container: string, blob: string, blockList: BlobService.PutBlockListRequest, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          commitBlocks(container: string, blob: string, blockList: BlobService.PutBlockListRequest, callback: ErrorOrResult<BlobService.BlobResult>): void;
          
          /**
          * Retrieves the list of blocks that have been uploaded as part of a block blob.
          *
          * @this {BlobService}
          * @param {string}             container                                   The container name.
          * @param {string}             blob                                        The blob name.
          * @param {BlockListFilter}    blocklisttype                               The type of block list to retrieve.
          * @param {Object}             [options]                                   The request options.
          * @param {string}             [options.snapshotId]                        The source blob snapshot identifier.
          * @param {string}             [options.leaseId]                           The target blob lease identifier.
          * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
          *                                                                         Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                         The default value is false.
          * @param {errorOrResult}  callback                                        `error` will contain information
          *                                                                         if an error occurs; otherwise `result` will contain
          *                                                                         the blocklist information.
          *                                                                         `response` will contain information related to this operation.
          */
          listBlocks(container: string, blob: string, blocklisttype: string, options: BlobService.BlobRequestOptions, callback: ErrorOrResult<BlobService.BlockListResult>): void;
          listBlocks(container: string, blob: string, blocklisttype: string, callback: ErrorOrResult<BlobService.BlockListResult>): void;

          /**
          * Generate a random block id prefix
          */
          generateBlockIdPrefix(): string;

          /**
          * Get a block id according to prefix and block number
          */
          getBlockId(prefix: string, number: number | string): string;

          /**
          * Creates an empty append blob. If the blob already exists on the service, it will be overwritten.
          * To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {Object}             [options]                                     The request options.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {string}             [options.leaseId]                             The target blob lease identifier.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          createOrReplaceAppendBlob(container: string, blob: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResponse): void;
          createOrReplaceAppendBlob(container: string, blob: string, callback: ErrorOrResponse): void;

          /**
          * Creates a new append blob from a local file. If the blob already exists on the service, it will be overwritten.
          * To avoid overwriting and instead throw an error if the blob exists, please pass in an accessConditions parameter in the options object.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          * If you want to append data to an already existing blob, please look at appendFromLocalFile.
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {string}             localFileName                                 The local path to the file to be uploaded.
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {string}             [options.leaseId]                             The target blob lease identifier.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}      callback                                      The callback function.
          * @return {SpeedSummary}
          */
          createAppendBlobFromLocalFile(container: string, blob: string, localFileName: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createAppendBlobFromLocalFile(container: string, blob: string, localFileName: string, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

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
          * @param {Object}             browserFile                                   The File object to be uploaded created by HTML File API.
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier. 
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          createAppendBlobFromBrowserFile(container: string, blob: string, browserFile: Object, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createAppendBlobFromBrowserFile(container: string, blob: string, browserFile: Object, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

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
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.leaseId]                             The target blob lease identifier.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}      callback                                      The callback function.
          * @return {SpeedSummary}
          */
          createAppendBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          createAppendBlobFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

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
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {string}             [options.leaseId]                             The target blob lease identifier.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          createAppendBlobFromText(container: string, blob: string, text: string | Buffer, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          createAppendBlobFromText(container: string, blob: string, text: string | Buffer, callback: ErrorOrResult<BlobService.BlobResult>): void;

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
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
          *                                                                           The default value is false for page blobs and true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @return {Writable}                                                        A Node.js Writable stream.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToAppendBlob(containerName, blobName));
          */
          createWriteStreamToNewAppendBlob(container: string, blob: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;
          createWriteStreamToNewAppendBlob(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;

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
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. 
          *                                                                           The default value is false for page blobs and true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @return {Writable}                                                        A Node.js Writable stream.
          * @example
          * var azure = require('azure-storage');
          * var blobService = azure.createBlobService();
          * var stream = fs.createReadStream(fileNameTarget).pipe(blobService.createWriteStreamToAppendBlob(containerName, blobName));
          */
          createWriteStreamToExistingAppendBlob(container: string, blob: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;
          createWriteStreamToExistingAppendBlob(container: string, blob: string, callback: ErrorOrResult<BlobService.BlobResult>): stream.Writable;

          /**
          * Appends to an append blob from a local file. Assumes the blob already exists on the service.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {string}             localFileName                                 The local path to the file to be uploaded.
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}      callback                                      The callback function.
          * @return {SpeedSummary}
          */
          appendFromLocalFile(container: string, blob: string, localFileName: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          appendFromLocalFile(container: string, blob: string, localFileName: string, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

          /**
          * Appends to an append blob from an HTML File object. Assumes the blob already exists on the service.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          * (Only available in the JavaScript Client Library for Browsers)
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {Object}             browserFile                                   The File object to be uploaded created by HTML File API.
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          appendFromBrowserFile(container: string, blob: string, browserFile: Object, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;
          appendFromBrowserFile(container: string, blob: string, browserFile: Object, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;

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
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                           The default value is false.
          * @param {errorOrResult}      callback                                      The callback function.
          * @return {SpeedSummary}
          */
          appendFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;;
          appendFromStream(container: string, blob: string, stream: stream.Readable, streamLength: number, callback: ErrorOrResult<BlobService.BlobResult>): common.streams.speedsummary.SpeedSummary;;

          /**
          * Appends to an append blob from a text string. Assumes the blob already exists on the service.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          *
          * @this {BlobService}
          * @param {string}             container                                     The container name.
          * @param {string}             blob                                          The blob name.
          * @param {string|object}      text                                          The blob text, as a string or in a Buffer.
          * @param {Object}             [options]                                     The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]      Specifies whether to absorb the conditional error on retry.
          * @param {string}             [options.leaseId]                             The lease identifier.
          * @param {Object}             [options.metadata]                            The metadata key/value pairs.
          * @param {bool}               [options.storeBlobContentMD5]                 Specifies whether the blob's ContentMD5 header should be set on uploads. The default value is true for block blobs.
          * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
          * @param {Object}             [options.contentSettings]                     The content settings of the blob.
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
          appendFromText(container: string, blob: string, text: string, options: BlobService.CreateBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          appendFromText(container: string, blob: string, text: string, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Creates a new block from a read stream to be appended to an append blob.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {string}             blob                                      The blob name.
          * @param {Readable}           readStream                                The Node.js Readable stream.
          * @param {int}                streamLength                              The stream length.
          * @param {Object}             [options]                                 The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]  Specifies whether to absorb the conditional error on retry.
          * @param {int}                [options.maxBlobSize]                     The max length in bytes allowed for the append blob to grow to.
          * @param {int}                [options.appendPosition]                  The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
          * @param {AccessConditions}   [options.accessConditions]                The access conditions.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResult}      callback                                  `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will contain
          *                                                                       information about the blob.
          *                                                                       `response` will contain information related to this operation.
          */
          appendBlockFromStream(container: string, blob: string, readStream: stream.Readable, streamLength: number, options: BlobService.AppendBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          appendBlockFromStream(container: string, blob: string, readStream: stream.Readable, streamLength: number, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * Creates a new block from a text to be appended to an append blob.
          * This API should be used strictly in a single writer scenario because the API internally uses the append-offset conditional header to avoid duplicate blocks.
          * If you are guaranteed to have a single writer scenario, please look at options.absorbConditionalErrorsOnRetry and see if setting this flag to true is acceptable for you.
          *
          * @this {BlobService}
          * @param {string}             container                                 The container name.
          * @param {string}             blob                                      The blob name.
          * @param {string|object}      content                                   The block text, as a string or in a Buffer.
          * @param {Object}             [options]                                 The request options.
          * @param {bool}               [options.absorbConditionalErrorsOnRetry]  Specifies whether to absorb the conditional error on retry.
          * @param {int}                [options.maxBlobSize]                     The max length in bytes allowed for the append blob to grow to.
          * @param {int}                [options.appendPosition]                  The number indicating the byte offset to check for. The append will succeed only if the end position of the blob is equal to this number.
          * @param {string}             [options.leaseId]                         The target blob lease identifier.
          * @param {string}             [options.transactionalContentMD5]         An MD5 hash of the block content. This hash is used to verify the integrity of the block during transport.
          * @param {AccessConditions}   [options.accessConditions]                The access conditions.
          * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
          *                                                                       Please see StorageUtilities.LocationMode for the possible values.
          * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
          * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
          *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
          *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
          * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
          * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
          *                                                                       The default value is false.
          * @param {errorOrResult}      callback                                  `error` will contain information
          *                                                                       if an error occurs; otherwise `result` will contain
          *                                                                       information about the blob.
          *                                                                       `response` will contain information related to this operation.
          */
          appendBlockFromText(container: string, blob: string, content: string | Buffer, options: BlobService.AppendBlobRequestOptions, callback: ErrorOrResult<BlobService.BlobResult>): void;
          appendBlockFromText(container: string, blob: string, content: string | Buffer, callback: ErrorOrResult<BlobService.BlobResult>): void;

          /**
          * The callback for {BlobService~getBlobToText}.
          * @typedef {function} BlobService~blobToText
          * @param {Object} error      If an error occurs, the error information.
          * @param {string} text       The text returned from the blob.
          * @param {Object} blockBlob  Information about the blob.
          * @param {Object} response   Information related to this operation.
          */
          static SpeedSummary: common.streams.speedsummary.SpeedSummary;
        }
        export module BlobService {
          export interface CreateContainerOptions extends common.RequestOptions {
            metadata?: Map<string>;
            publicAccessLevel?: string;
          }

          export interface ListContainerOptions extends common.RequestOptions {
            maxResults?: number;
            include?: string;
          }

          export interface ConditionalRequestOption extends common.RequestOptions {
            accessConditions?: AccessConditions;
          }

          export interface ContainerOptions extends ConditionalRequestOption {
            leaseId?: string;
          }

          export interface ContainerAclOptions extends ContainerOptions {
            publicAccessLevel?: string;
          }

          export interface LeaseRequestOptions extends ConditionalRequestOption {
          }

          export interface AcquireLeaseRequestOptions extends LeaseRequestOptions {
            leaseDuration?: number;
            proposedLeaseId?: string;
          }

          export interface BreakLeaseRequestOptions extends LeaseRequestOptions {
            leaseBreakPeriod?: number;
          }

          export interface ListBlobsSegmentedRequestOptions extends common.RequestOptions {
            /**
             * {string} Delimiter, i.e. '/', for specifying folder hierarchy.
             */
            delimiter?: string;
            /**
             * {int} Specifies the maximum number of blobs to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
             */
            maxResults?: number;

            /**
             * {string} Specifies that the response should include one or more of the following subsets: '', 'metadata', 'snapshots', 'uncommittedblobs'). Multiple values can be added separated with a comma (,)
             */
            include?: string;
          }

          export interface LeaseResult {
            container: string;
            blob: string;
            id: string;
            time: number;
            etag: string;
            lastModified: string;
          }

          export interface ListBlobsResult {
            entries: BlobResult[];
            continuationToken?: common.ContinuationToken;
          }

          export interface ContainerAclResult extends ContainerResult {
            signedIdentifiers: {[key:string]: common.AccessPolicy}
          }

          export interface ContainerResult {
            name: string;
            publicAccessLevel: string;
            etag: string;
            lastModified: string;
            metadata?: { [key: string]: string; };
            requestId?: string;
            lease?: {
              duration?: string;
              status: string;
              state: string;
            };
            exists?: boolean;
            created?: boolean;
          }

          export interface ListContainerResult {
            continuationToken: common.ContinuationToken;
            entries: ContainerResult[];
          }

          export interface BlobResult {
            name: string;
            snapshot?: string;
            deleted?: boolean;
            container: string;
            metadata?: { [key: string]: string; };
            etag: string;
            lastModified: string;
            contentLength: string;
            blobType: string;
            accessTier?: string;
            accessTierChangeTime?: string;
            accessTierInferred?: boolean;
            archiveStatus?: string;
            isIncrementalCopy?: boolean;
            requestId: string;
            sequenceNumber?: string;
            contentRange?: string;
            committedBlockCount?: string;
            serverEncrypted?: string;
            deletedTime?: string;
            remainingRetentionDays?: string;
            appendOffset? : string;
            contentSettings?: {
              contentType?: string;
              contentEncoding?: string;
              contentLanguage?: string;
              cacheControl?: string;
              contentDisposition?: string;
              contentMD5?: string;
            }
            lease?: {
              id?: string;
              status?: string;
              state?: string;
              duration?: string;
            }
            copy?: {
              id?: string;
              status?: string;
              completionTime?: string;
              statusDescription?: string;
              destinationSnapshot?: string;
              progress?: string;
              source?: string;
            },
            exists?: boolean;
            created?: boolean;
          }

          export interface CreatePageBlobOptions {
            metadata?: Object;
            leaseId?: string;
            transactionalContentMD5?: string;
            blobTier?: string;
            contentSettings?: {
              contentType?: string;
              contentEncoding?: string;
              contentLanguage?: string;
              cacheControl?: string;
              contentDisposition?: string;
              contentMD5?: string;
            }
            sequenceNumber?: string;
            accessConditions?: AccessConditions;
            locationMode?: StorageUtilities.LocationMode;
            timeoutIntervalInMs?: number;
            clientRequestTimeoutInMs?: number;
            maximumExecutionTimeInMs?: number;
            useNagleAlgorithm?: boolean;
          }

          export interface BlobRequestOptions extends ConditionalRequestOption {
            snapshotId?: string; // TODO: Not valid for most write requests...
            leaseId?: string;
          }

          export interface AppendBlobRequestOptions extends ConditionalRequestOption, BlobRequestOptions {
            absorbConditionalErrorsOnRetry?: boolean;
            maxBlobSize?: number;
            appendPosition?: number;
          }

          export interface SetBlobPropertiesRequestOptions extends BlobRequestOptions {
            contentType?: string;
            contentEncoding?: string;
            contentLanguage?: string;
            contentMD5?: string;
            cacheControl?: string;
            contentDisposition?: string;
          }

          export interface GetBlobRequestOptions extends BlobRequestOptions {
            speedSummary?: common.streams.speedsummary.SpeedSummary;
            parallelOperationThreadCount?: number;
            rangeStart?: number;
            rangeEnd?: number;
            useTransactionalMD5?: boolean;
            disableContentMD5Validation?: boolean;
          }

          export interface CopyBlobRequestOptions extends BlobRequestOptions {
            metadata?: { [k: string]: string; };
            sourceLeaseId?: string;
            accessConditions?: AccessConditions;
            sourceAccessConditions?: AccessConditions;
            isIncrementalCopy?: boolean;
          }

          export interface DeleteBlobRequestOptions extends BlobRequestOptions {
            deleteSnapshots?: string;
          }

          export interface CreateBlobRequestOptions extends BlobRequestOptions {
            speedSummary?: common.streams.speedsummary.SpeedSummary;
            parallelOperationThreadCount?: number;
            useTransactionalMD5?: boolean;
            blockIdPrefix?: string;
            metadata?: {[k: string]: string};
            storeBlobContentMD5?: boolean;
            transactionalContentMD5?: string;
            contentSettings?: {
              contentType?: string;
              contentEncoding?: string;
              contentLanguage?: string;
              cacheControl?: string;
              contentDisposition?: string;
              contentMD5?: string;
            }
          }

          export interface CreateBlockBlobRequestOptions extends CreateBlobRequestOptions {
            blockSize?: number;
          }

          export interface BlobToText {
            (error: Error, text: string, result: BlobResult, response: ServiceResponse): void
          }

          export interface ListPageRangesRequestOptions extends common.RequestOptions {
            rangeStart?: number;
            rangeEnd?: number;
          }

          export interface BlockListResult {
            CommittedBlocks?: Block[];
            UncommittedBlocks?: Block[];
          }

          export interface PutBlockListRequest {
            LatestBlocks?: string[];
            CommittedBlocks?: string[];
            UncommittedBlocks?: string[];
          }

          export interface Block {
            Name?: string;
            Size?: string;
          }
        }
      }
      
      // ###########################
      // ./services/blob/blobutilities
      // ###########################
      module blobutilities {
        export var BlobUtilities: {
          SharedAccessPermissions: {
            READ: string;
            WRITE: string;
            DELETE: string;
            LIST: string;
          };
          BlobListingDetails: {
            SNAPSHOTS: string;
            METADATA: string;
            UNCOMMITTED_BLOBS: string;
            COPY: string;
            DELETED: string;
          };
          SnapshotDeleteOptions: {
            SNAPSHOTS_ONLY: string;
            BLOB_AND_SNAPSHOTS: string;
          };
          BlockListFilter: {
            ALL: string;
            COMMITTED: string;
            UNCOMMITTED: string;
          };
          BlobContainerPublicAccessType: {
            OFF: string;
            CONTAINER: string;
            BLOB: string;
          };
          SequenceNumberAction: {
            MAX: string;
            UPDATE: string;
            INCREMENT: string;
          };
          BlobTier: {
            PremiumPageBlobTier: {
              P4: string;
              P6: string;
              P10: string;
              P20: string;
              P30: string;
              P40: string;
              P50: string;
              P60: string;
            };
            StandardBlobTier: {
              HOT: string;
              COOL: string;
              ARCHIVE: string;
            };
          }
        };
      }
    }

    module queue {
      export class QueueService extends StorageServiceClient {
        /**
         * @property {boolean} QueueService#queueMessagEncoder
         * @defaultvalue {boolean} true
         * A flag indicating whether the message should be base-64 encoded. Default is true.
         */
        messageEncoder: QueueMessageEncoder;

        /**
        * Creates a new QueueService object.
        * 
        * The QueueService class is used to perform operations on the Microsoft Azure Queue Service.
        * 
        * For more information on using the Queue Service, as well as task focused information on using it from a Node.js application, see
        * [How to Use the Queue Service from Node.js](http://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-queues/).
        * The following defaults can be set on the Queue service.
        * messageEncoder                                      The message encoder to specify how QueueService encodes and decodes the queue message. Default is `[TextXmlQueueMessageEncoder]{@link TextXmlQueueMessageEncoder}`.
        * defaultTimeoutIntervalInMs                          The default timeout interval, in milliseconds, to use for request made via the Queue service.
        * defaultClientRequestTimeoutInMs                     The default timeout of client requests, in milliseconds, to use for the request made via the Queue service.
        * defaultMaximumExecutionTimeInMs                     The default maximum execution time across all potential retries, for requests made via the Queue service.
        * defaultLocationMode                                 The default location mode for requests made via the Queue service.
        * useNagleAlgorithm                                   Determines whether the Nagle algorithm is used for requests made via the Queue service; true to use the  
        *                                                     Nagle algorithm; otherwise, false. The default value is false.
        * If no connection string or storageaccount and storageaccesskey are provided,
        * the AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY environment variables will be used.
        * @augments {StorageServiceClient}
        * @constructor QueueService
        * @param {string} [storageAccountOrConnectionString]  The storage account or the connection string.
        * @param {string} [storageAccessKey]                  The storage access key.
        * @param {string|object} [host]                       The host address. To define primary only, pass a string. 
        *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
        * @param {string} [sasToken]                          The Shared Access Signature token.
        * @param {string} [endpointSuffix]                    The endpoint suffix.
        */
        constructor(storageAccountOrConnectionString?: string, storageAccessKey?: string, host?: string|StorageHost, sasToken?: string, endpointSuffix?: string);

        /**
        * Associate a filtering operation with this QueueService. Filtering operations
        * can include logging, automatically retrying, etc. Filter operations are objects
        * that implement a method with the signature:
        *
        *     "function handle (requestOptions, next)".
        *
        * After doing its preprocessing on the request options, the method needs to call
        * "next" passing a callback with the following signature:
        * signature:
        *
        *     "function (returnObject, finalCallback, next)"
        *
        * In this callback, and after processing the returnObject (the response from the
        * request to the server), the callback needs to either invoke next if it exists to
        * continue processing other filters or simply invoke finalCallback otherwise to end
        * up the service invocation.
        *
        * @function QueueService#withFilter
        * @param {Object} filter The new filter object.
        * @return {QueueService} A new service client with the filter applied.
        */
        withFilter(newFilter: common.filters.IFilter): QueueService;
          
        /**
        * Gets the service stats for a storage account’s Queue service.
        *
        * @function QueueService#getServiceStats
        *
        * @this {QueueService}
        * @param {Object}       [options]                                         The request options.
        * @param {LocationMode} [options.locationMode]                            Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}          [options.timeoutIntervalInMs]                     The server timeout interval, in milliseconds, to use for the request.
        * @param {int}          [options.maximumExecutionTimeInMs]                The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}       [options.clientRequestId]                         A string that represents the client request ID with a 1KB character limit.
        * @param {bool}         [options.useNagleAlgorithm]                       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise, `result`
        *                                                                         will contain the stats and `response`
        *                                                                         will contain information related to this operation.
        */
        getServiceStats(options: common.RequestOptions, callback: ErrorOrResult<common.models.ServiceStats>): void;
        
        /**
        * Gets the service stats for a storage account’s Queue service.
        *
        * @function QueueService#getServiceStats
        *
        * @this {QueueService}
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise, `result`
        *                                                                         will contain the stats and `response`
        *                                                                         will contain information related to this operation.
        */
        getServiceStats(callback: ErrorOrResult<common.models.ServiceStats>): void;

        /**
        * Gets the properties of a storage account’s Queue service, including Microsoft Azure Storage Analytics.
        *
        * @this {QueueService}
        * @param {Object}             [options]                                 The request options.
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResult}  callback                                      `error` will contain information
        *                                                                       if an error occurs; otherwise, `errorOrResult`
        *                                                                       will contain the properties and `response`
        *                                                                       will contain information related to this operation.
        */
        getServiceProperties(options: common.RequestOptions, callback?: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;

        /**
        * Gets the properties of a storage account’s Queue service, including Microsoft Azure Storage Analytics.
        *
        * @this {QueueService}
        * @param {errorOrResult}  callback                                      `error` will contain information
        *                                                                       if an error occurs; otherwise, `errorOrResult`
        *                                                                       will contain the properties and `response`
        *                                                                       will contain information related to this operation.
        */
        getServiceProperties(callback?: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;

        /**
        * Sets the properties of a storage account’s Queue service, including Microsoft Azure Storage Analytics.
        * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
        *
        * @this {QueueService}
        * @param {Object}             serviceProperties                        The service properties.
        * @param {Object}             [options]                                The request options.
        * @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                      Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                      execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                      The default value is false.
        * @param {errorOrResponse}  callback                                   `error` will contain information
        *                                                                      if an error occurs; otherwise, `response`
        *                                                                      will contain information related to this operation.
        */
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, options: common.RequestOptions, callback?: ErrorOrResponse): void;

        /**
        * Sets the properties of a storage account’s Queue service, including Microsoft Azure Storage Analytics.
        * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
        *
        * @this {QueueService}
        * @param {Object}             serviceProperties                        The service properties.
        * @param {errorOrResponse}  callback                                   `error` will contain information
        *                                                                      if an error occurs; otherwise, `response`
        *                                                                      will contain information related to this operation.
        */
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, callback?: ErrorOrResponse): void;

        /**
        * Lists a segment containing a collection of queue items whose names begin with the specified prefix under the given account.
        *
        * @this {QueueService}
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.maxResults]                        Specifies the maximum number of queues to return per call to Azure storage. This does NOT affect list size returned by this function. (maximum: 5000)
        * @param {string}             [options.include]                           Include this parameter to specify that the queue's metadata be returned as part of the response body. (allowed values: '', 'metadata')
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
        *                                                                         `entries`  gives a list of queues and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listQueuesSegmented(currentToken: common.ContinuationToken, options: QueueService.ListQueuesRequestOptions, callback: ErrorOrResult<QueueService.ListQueueResult>): void;

        /**
        * Lists a segment containing a collection of queue items whose names begin with the specified prefix under the given account.
        *
        * @function QueueService#listQueuesSegmented
        *
        * @this {QueueService}
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
        *                                                                         `entries`  gives a list of queues and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listQueuesSegmented(currentToken: common.ContinuationToken, callback: ErrorOrResult<QueueService.ListQueueResult>): void;

        /**
        * Lists a segment containing a collection of queue items under the given account.
        *
        * @function QueueService#listQueuesSegmentedWithPrefix
        *
        * @this {QueueService}
        * @param {string}             prefix                                      The prefix of the queue name.
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.*
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.marker]                            String value that identifies the portion of the list to be returned with the next list operation.
        * @param {int}                [options.maxResults]                        Specifies the maximum number of queues to return per call to Azure storage. This does NOT affect list size returned by this function. (maximum: 5000)
        * @param {string}             [options.include]                           Include this parameter to specify that the queue's metadata be returned as part of the response body. (allowed values: '', 'metadata')
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
        *                                                                         `entries`  gives a list of queues and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listQueuesSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, options: QueueService.ListQueuesRequestOptions, callback: ErrorOrResult<QueueService.ListQueueResult>): void;

        /**
        * Lists a segment containing a collection of queue items under the given account.
        *
        * @function QueueService#listQueuesSegmentedWithPrefix
        *
        * @this {QueueService}
        * @param {string}             prefix                                      The prefix of the queue name.
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.*
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`. 
        *                                                                         `entries`  gives a list of queues and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listQueuesSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<QueueService.ListQueueResult>): void;

        /**
        * Checks to see if a queue exists.
        *
        * @function QueueService#doesQueueExist
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise, `result`
        *                                                                         will be true if the queue exists and false if not,
        *                                                                         and `response` will contain information related to this operation.
        */
        doesQueueExist(queue: string, options: common.RequestOptions, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Checks to see if a queue exists.
        *
        * @function QueueService#doesQueueExist
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise, `result`
        *                                                                         will be true if the queue exists and false if not,
        *                                                                         and `response` will contain information related to this operation.
        */
        doesQueueExist(queue: string, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Creates a new queue under the given account.
        *
        * @function QueueService#createQueue
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {Object}             [options.metadata]                          The metadata key/value pairs.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        createQueue(queue: string, optionsOrCallback: QueueService.CreateQueueRequestOptions, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Creates a new queue under the given account.
        *
        * @function QueueService#createQueue
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        createQueue(queue: string, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Creates a new queue under the given account if it doesn't exist.
        *
        * @function QueueService#createQueueIfNotExists
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {Object}             [options.metadata]                          The metadata key/value pairs.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                       `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will be true if the 
        *                                                                         queue was created by this operation and false if not, and 
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * queueService.createQueueIfNotExists('taskqueue', function(error) {
        *   if(!error) {
        *     // Queue created or exists
        *   }
        * }); 
        */
        createQueueIfNotExists(queue: string, optionsOrCallback: QueueService.CreateQueueRequestOptions, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Creates a new queue under the given account if it doesn't exist.
        *
        * @function QueueService#createQueueIfNotExists
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                       `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will be true if the 
        *                                                                         queue was created by this operation and false if not, and 
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * queueService.createQueueIfNotExists('taskqueue', function(error) {
        *   if(!error) {
        *     // Queue created or exists
        *   }
        * }); 
        */
        createQueueIfNotExists(queue: string, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Permanently deletes the specified queue.
        *
        * @function QueueService#deleteQueue
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResponse}  callback                                      `error` will contain information if an error occurs; 
        *                                                                         `response` will contain information related to this operation.
        */
        deleteQueue(queue: string, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Permanently deletes the specified queue.
        *
        * @function QueueService#deleteQueue
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResponse}  callback                                      `error` will contain information if an error occurs; 
        *                                                                         `response` will contain information related to this operation.
        */
        deleteQueue(queue: string, callback: ErrorOrResponse): void;

        /**
        * Permanently deletes the specified queue if it exists.
        *
        * @function QueueService#deleteQueueIfExists
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         'true' if the queue was deleted and 'false' if the queue did not exist.
        *                                                                         `response` will contain information related to this operation.
        */
        deleteQueueIfExists(queue: string, options: common.RequestOptions, callback: ErrorOrResult<boolean>): void;

        /**
        * Permanently deletes the specified queue if it exists.
        *
        * @function QueueService#deleteQueueIfExists
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         'true' if the queue was deleted and 'false' if the queue did not exist.
        *                                                                         `response` will contain information related to this operation.
        */
        deleteQueueIfExists(queue: string, callback: ErrorOrResult<boolean>): void;

        /**
        * Returns queue properties, including user-defined metadata.
        *
        * @function QueueService#getQueueMetadata
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        getQueueMetadata(queue: string, options: common.RequestOptions, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Returns queue properties, including user-defined metadata.
        *
        * @function QueueService#getQueueMetadata
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        getQueueMetadata(queue: string, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Sets user-defined metadata on the specified queue. Metadata is associated with the queue as name-value pairs.
        *
        * @function QueueService#setQueueMetadata
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             metadata                                    The metadata key/value pairs.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        setQueueMetadata(queue: string, metadata: { [key: string]: string; }, options: common.RequestOptions, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Sets user-defined metadata on the specified queue. Metadata is associated with the queue as name-value pairs.
        *
        * @function QueueService#setQueueMetadata
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             metadata                                    The metadata key/value pairs.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the queue information.
        *                                                                         `response` will contain information related to this operation.
        */
        setQueueMetadata(queue: string, metadata: { [key: string]: string; }, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Adds a new message to the back of the message queue. 
        * The encoded message can be up to 64KB in size for versions 2011-08-18 and newer, or 8KB in size for previous versions. 
        * Unencoded messages must be in a format that can be included in an XML request with UTF-8 encoding. 
        * Queue messages are encoded by default. See queueService.messageEncoder to set encoding defaults. 
        *
        * @function QueueService#createMessage
        * 
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string|Buffer}      messageText                                 The message text.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.messageTimeToLive]                 The time-to-live interval for the message, in seconds. The maximum time-to-live allowed is 7 days. If this parameter is omitted, the default time-to-live is 7 days
        * @param {int}                [options.visibilityTimeout]                 Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or equal to 0, and cannot be larger than 7 days. The visibility timeout of a message cannot be set to a value later than the expiry time. visibilitytimeout should be set to a value smaller than the time-to-live value.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `[result]{@link QueueMessageResult}` will contain
        *                                                                         the message.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * queueService.createMessage('taskqueue', 'Hello world!', function(error) {
        *   if(!error) {
        *     // Message inserted
        *   }
        * });
        */
        createMessage(queue: string, messageText: string|Buffer, options: QueueService.CreateMessageRequestOptions, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Adds a new message to the back of the message queue. 
        * The encoded message can be up to 64KB in size for versions 2011-08-18 and newer, or 8KB in size for previous versions. 
        * Unencoded messages must be in a format that can be included in an XML request with UTF-8 encoding. 
        * Queue messages are encoded by default. See queueService.messageEncoder to set encoding defaults. 
        *
        * @function QueueService#createMessage
        * 
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string|Buffer}      messageText                                 The message text.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * queueService.createMessage('taskqueue', 'Hello world!', function(error) {
        *   if(!error) {
        *     // Message inserted
        *   }
        * });
        */
        createMessage(queue: string, messageText: string|Buffer, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Retrieves messages from the queue and makes them invisible to other consumers.
        *
        * @function QueueService#getMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.numOfMessages]                     A nonzero integer value that specifies the number of messages to retrieve from the queue, up to a maximum of 32. By default, a single message is retrieved from the queue with this operation.
        * @param {int}                [options.visibilityTimeout]                 Required if not peek only. Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or equal to 0, and cannot be larger than 7 days. The visibility timeout of a message can be set to a value later than the expiry time.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the messages.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * var queueName = 'taskqueue';
        * queueService.getMessages(queueName, function(error, serverMessages) {
        *   if(!error) {
        *     // Process the message in less than 30 seconds, the message
        *     // text is available in serverMessages[0].messagetext
        *     queueService.deleteMessage(queueName, serverMessages[0].messageId, serverMessages[0].popReceipt, function(error) {
        *       if(!error){
        *           // Message deleted
        *       }
        *     });
        *   }
        * });
        */
        getMessages(queue: string, options: QueueService.GetMessagesRequestOptions, callback?: ErrorOrResult<QueueService.QueueMessageResult[]>): void;

        /**
        * Retrieves messages from the queue and makes them invisible to other consumers.
        *
        * @function QueueService#getMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the messages.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * var queueName = 'taskqueue';
        * queueService.getMessages(queueName, function(error, serverMessages) {
        *   if(!error) {
        *     // Process the message in less than 30 seconds, the message
        *     // text is available in serverMessages[0].messagetext
        *     queueService.deleteMessage(queueName, serverMessages[0].messageId, serverMessages[0].popReceipt, function(error) {
        *       if(!error){
        *           // Message deleted
        *       }
        *     });
        *   }
        * });
        */
        getMessages(queue: string, callback?: ErrorOrResult<QueueService.QueueMessageResult[]>): void;

        /**
        * Retrieves a message from the queue and makes it invisible to other consumers.
        *
        * @function QueueService#getMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.visibilityTimeout]                 Required if not peek only. Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or equal to 0, and cannot be larger than 7 days. The visibility timeout of a message can be set to a value later than the expiry time.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * var queueName = 'taskqueue';
        * queueService.getMessage(queueName, function(error, serverMessage) {
        *   if(!error) {
        *     // Process the message in less than 30 seconds, the message
        *     // text is available in serverMessage.messagetext
        *     queueService.deleteMessage(queueName, serverMessage.messageId, serverMessage.popReceipt, function(error) {
        *       if(!error){
        *           // Message deleted
        *       }
        *     });
        *   }
        * });
        */
        getMessage(queue: string, options: QueueService.GetMessageRequestOptions, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Retrieves a message from the queue and makes it invisible to other consumers.
        *
        * @function QueueService#getMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var queueService = azure.createQueueService();
        * var queueName = 'taskqueue';
        * queueService.getMessage(queueName, function(error, serverMessages) {
        *   if(!error) {
        *     // Process the message in less than 30 seconds, the message
        *     // text is available in serverMessages.messagetext
        *     queueService.deleteMessage(queueName, serverMessages.messageId, serverMessages.popReceipt, function(error) {
        *       if(!error){
        *           // Message deleted
        *       }
        *     });
        *   }
        * });
        */
        getMessage(queue: string, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Retrieves messages from the front of the queue, without changing the messages visibility.
        *
        * @function QueueService#peekMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.numOfMessages]                     A nonzero integer value that specifies the number of messages to retrieve from the queue, up to a maximum of 32. By default, a single message is retrieved from the queue with this operation.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the messages.
        *                                                                         `response` will contain information related to this operation.
        */
        peekMessages(queue: string, options: QueueService.PeekMessagesRequestOptions, callback?: ErrorOrResult<QueueService.QueueMessageResult[]>): void;

        /**
        * Retrieves messages from the front of the queue, without changing the messages visibility.
        *
        * @function QueueService#peekMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the messages.
        *                                                                         `response` will contain information related to this operation.
        */
        peekMessages(queue: string, callback?: ErrorOrResult<QueueService.QueueMessageResult[]>): void;

        /**
        * Retrieves a message from the front of the queue, without changing the message visibility.
        *
        * @function QueueService#peekMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message.
        *                                                                         `response` will contain information related to this operation.
        */
        peekMessage(queue: string, options: common.RequestOptions, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Retrieves a message from the front of the queue, without changing the message visibility.
        *
        * @function QueueService#peekMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message.
        *                                                                         `response` will contain information related to this operation.
        */
        peekMessage(queue: string, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Deletes a specified message from the queue.
        *
        * @function QueueService#deleteMessage
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string}             messageId                                   The message identifier of the message to delete.
        * @param {string}             popReceipt                                  A valid pop receipt value returned from an earlier call to the Get Messages or Update Message operation
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResponse}  callback                                      `error` will contain information if an error occurs; 
        *                                                                         `response` will contain information related to this operation.
        */
        deleteMessage(queue: string, messageId: string, popReceipt: string, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Deletes a specified message from the queue.
        *
        * @function QueueService#deleteMessage
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string}             messageId                                   The message identifier of the message to delete.
        * @param {string}             popReceipt                                  A valid pop receipt value returned from an earlier call to the Get Messages or Update Message operation
        * @param {errorOrResponse}  callback                                      `error` will contain information if an error occurs; 
        *                                                                         `response` will contain information related to this operation.
        */
        deleteMessage(queue: string, messageId: string, popReceipt: string, callback: ErrorOrResponse): void;

        /**
        * Clears all messages from the queue.
        *
        * @function QueueService#clearMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResponse}  callback                                      `error` will contain information
        *                                                                         if an error occurs; otherwise 
        *                                                                         `response` will contain information related to this operation.
        */
        clearMessages(queue: string, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Clears all messages from the queue.
        *
        * @function QueueService#clearMessages
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResponse}  callback                                      `error` will contain information
        *                                                                         if an error occurs; otherwise 
        *                                                                         `response` will contain information related to this operation.
        */
        clearMessages(queue: string, callback: ErrorOrResponse): void;

        /**
        * Updates the visibility timeout of a message. You can also use this operation to update the contents of a message.
        * A message must be in a format that can be included in an XML request with UTF-8 encoding, and the encoded message can be up to 64KB in size.
        *
        * @function QueueService#updateMessage
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string}             messageId                                   The message identifier of the message to update.
        * @param {string}             popReceipt                                  A valid pop receipt value returned from an earlier call to the Get Messages or Update Message operation
        * @param {int}                visibilityTimeout                           Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or equal to 0, and cannot be larger than 7 days. The visibility timeout of a message can be set to a value later than the expiry time.
        * @param {Object}             [options]                                   The request options.
        * @param {Object}             [options.messageText]                       The new message text.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message result information.
        *                                                                         `response` will contain information related to this operation.
        */
        updateMessage(queue: string, messageId: string, popReceipt: string, visibilityTimeout: number, options: QueueService.UpdateMessageRequestOptions, callback: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Updates the visibility timeout of a message. You can also use this operation to update the contents of a message.
        * A message must be in a format that can be included in an XML request with UTF-8 encoding, and the encoded message can be up to 64KB in size.
        *
        * @function QueueService#updateMessage
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {string}             messageId                                   The message identifier of the message to update.
        * @param {string}             popReceipt                                  A valid pop receipt value returned from an earlier call to the Get Messages or Update Message operation
        * @param {int}                visibilityTimeout                           Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or equal to 0, and cannot be larger than 7 days. The visibility timeout of a message can be set to a value later than the expiry time.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the message result information.
        *                                                                         `response` will contain information related to this operation.
        */
        updateMessage(queue: string, messageId: string, popReceipt: string, visibilityTimeout: number, callback?: ErrorOrResult<QueueService.QueueMessageResult>): void;

        /**
        * Gets the queue's ACL.
        *
        * @function QueueService#getQueueAcl
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information for the queue.
        *                                                                         `response` will contain information related to this operation.
        */
        getQueueAcl(queue: string, options: common.RequestOptions, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Gets the queue's ACL.
        *
        * @function QueueService#getQueueAcl
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information for the queue.
        *                                                                         `response` will contain information related to this operation.
        */
        getQueueAcl(queue: string, callback: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Updates the queue's ACL.
        *
        * @function QueueService#setQueueAcl
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             signedIdentifiers                           The signed identifiers. Signed identifiers must be in an array.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to. 
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information for the queue.
        *                                                                         `response` will contain information related to this operation.
        * @example
        * var azure = require('azure-storage');
        * var SharedAccessPermissions = azure.QueueUtilities.SharedAccessPermissions;
        * var queueService = azure.createQueueService();
        * var sharedAccessPolicy = [
        * {AccessPolicy: {
        *     Permissions: PROCESS,
        *     Start: startDate,
        *     Expiry: expiryDate
        *   },
        *   Id: processOnly,
        * },
        * {AccessPolicy: {
        *     Permissions: SharedAccessPermissions.PROCESS + SharedAccessPermissions.DELETE,
        *     Start: startDate,
        *     Expiry: expiryDate
        *   },
        *   Id: processAndDelete,
        * }];
        * 
        * queueService.setQueueAcl(queueName, sharedAccessPolicy, function(error, queueResult, response) {
        *     // do whatever
        * });
        */
        setQueueAcl(queue: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, options: common.RequestOptions, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Updates the queue's ACL.
        *
        * @function QueueService#setQueueAcl
        *
        * @this {QueueService}
        * @param {string}             queue                                       The queue name.
        * @param {Object}             signedIdentifiers                           The signed identifiers. Signed identifiers must be in an array.
        * @param {errorOrResult}  callback                                        `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information for the queue.
        *                                                                         `response` will contain information related to this operation.
        * @example
        * var azure = require('azure-storage');
        * var SharedAccessPermissions = azure.QueueUtilities.SharedAccessPermissions;
        * var queueService = azure.createQueueService();
        * var sharedAccessPolicy = [
        * {AccessPolicy: {
        *     Permissions: PROCESS,
        *     Start: startDate,
        *     Expiry: expiryDate
        *   },
        *   Id: processOnly,
        * },
        * {AccessPolicy: {
        *     Permissions: SharedAccessPermissions.PROCESS + SharedAccessPermissions.DELETE,
        *     Start: startDate,
        *     Expiry: expiryDate
        *   },
        *   Id: processAndDelete,
        * }];
        * 
        * queueService.setQueueAcl(queueName, sharedAccessPolicy, function(error, queueResult, response) {
        *     // do whatever
        * });
        */
        setQueueAcl(queue: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, callback?: ErrorOrResult<QueueService.QueueResult>): void;

        /**
        * Retrieves a shared access signature token.
        *
        * @function QueueService#generateSharedAccessSignature
        *
        * @this {QueueService}
        * @param {string}                   queue                                         The queue name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @return {string}                                                                The shared access signature query string. Note this string does not contain the leading "?".
        */
        generateSharedAccessSignature(queue: string, sharedAccessPolicy: common.SharedAccessPolicy): string;

        /**
        * Retrieves a shared access signature token.
        *
        * @function QueueService#generateSharedAccessSignatureWithVersion
        *
        * @this {QueueService}
        * @param {string}                   queue                                         The queue name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @param {string}                   [sasVersion]                                  An optional string indicating the desired SAS version to use. Value must be 2012-02-12 or later.
        * @return {string}                                                                The shared access signature query string. Note this string does not contain the leading "?".
        */
        generateSharedAccessSignatureWithVersion(queue: string, sharedAccessPolicy: common.SharedAccessPolicy, sasVersion: string): string;
          
        getUrl(queue: string, sasToken?: string, primary?: boolean): string;
      }

      module QueueService {

        export interface ListQueueResult {
          entries: QueueResult[];
          continuationToken?: common.ContinuationToken;
        }

        export interface QueueMessageResult {
          queue?: string;
          messageId?: string;
          popReceipt?: string;
          messageText?: string;
          timeNextVisible?: string;
          insertionTime?: string;
          expirationTime?: string;
          dequeueCount?: number;
        }

        export interface QueueResult {
          name: string;
          metadata?: { [key: string]: string; };
          approximateMessageCount?: number;
          signedIdentifiers: {[key:string]: common.AccessPolicy};
          exists?: boolean;
          created?: boolean;
        }

        export interface CreateQueueRequestOptions extends common.RequestOptions {
          /** {Object}   The metadata key/value pairs. */
          metadata?: { [key: string]: string; };
        }

        export interface ListQueuesRequestOptions extends common.RequestOptions {
          /** {string}  String value that identifies the portion of the list to be returned with the next list operation. */
          marker?: string;
          /** {int} Specifies the maximum number of queues to return per call to Azure storage. This does NOT affect list size returned by this function. (maximum: 5000) */
          maxResults?: number;
          /** {string}  Include this parameter to specify that the queue's metadata be returned as part of the response body. (allowed values: '', 'metadata') */
          include?: string;
        }

        export interface PeekMessagesRequestOptions extends common.RequestOptions {
          numOfMessages?: number;
        }

        export interface GetMessagesRequestOptions extends common.RequestOptions {
          numOfMessages?: number;
          visibilityTimeout?: number;
        }

        export interface GetMessageRequestOptions extends common.RequestOptions {
          visibilityTimeout?: number;
        }

        export interface UpdateMessageRequestOptions extends common.RequestOptions {
          messageText?: string|Buffer;
        }

        export interface CreateMessageRequestOptions extends common.RequestOptions {
          /**
          * {int}   The time-to-live interval for the message, in seconds. The maximum time-to-live allowed is 7 days. If this parameter
          *         is omitted, the default time-to-live is 7 days
          */
          messageTimeToLive?: number;
          /**
          * {int}   Specifies the new visibility timeout value, in seconds, relative to server time. The new value must be larger than or
          *         equal to 0, and cannot be larger than 7 days. The visibility timeout of a message cannot be set to a value later than
          *         the expiry time. visibilitytimeout should be set to a value smaller than the time-to-live value.
          */
          visibilityTimeout?: number;
        }
      }
      
      export interface QueueMessageEncoder {
        encode(input: any) : string;
        decode(textToBeDecoded: string) : any;
      }
      
      module QueueMessageEncoder{
        export class TextBase64QueueMessageEncoder implements QueueMessageEncoder {
          encode(input: string) : string;
          decode(textToBeDecoded: string) : string;
        }
        
        export class BinaryBase64QueueMessageEncoder implements QueueMessageEncoder {
          encode(input: Buffer) : string;
          decode(textToBeDecoded: string) : Buffer;
        }
        
        export class TextXmlQueueMessageEncoder implements QueueMessageEncoder {
          encode(input: string) : string;
          decode(textToBeDecoded: string) : string;
        }
      }

      /**
       * Defines enums for use with the Queue service.
       * @namespace QueueUtilities
       */
      var QueueUtilities: {
        /**
        * Permission types.
        *
        * @const
        * @enum {string}
        */
        SharedAccessPermissions: {
          READ: string;
          ADD: string;
          UPDATE: string;
          PROCESS: string;
        };
      };
    }

    module table {
      export interface TableService extends StorageServiceClient {
        defaultPayloadFormat: string;

        /**
        * Associate a filtering operation with this TableService. Filtering operations
        * can include logging, automatically retrying, etc. Filter operations are objects
        * that implement a method with the signature:
        *
        *     "function handle (requestOptions, next)".
        *
        * After doing its preprocessing on the request options, the method needs to call
        * "next" passing a callback with the following signature:
        * signature:
        *
        *     "function (returnObject, finalCallback, next)"
        *
        * In this callback, and after processing the returnObject (the response from the
        * request to the server), the callback needs to either invoke next if it exists to
        * continue processing other filters or simply invoke finalCallback otherwise to end
        * up the service invocation.
        *
        * @function TableService#withFilter
        * @param {Object} filter The new filter object.
        * @return {TableService} A new service client with the filter applied.
        */
        withFilter(newFilter: common.filters.IFilter): TableService;
        
        /**
        * Gets the service stats for a storage account’s Table service.
        *
        * @this {TableService}
        * @param {Object}         [options]                                       The request options.
        * @param {LocationMode}   [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}            [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {int}            [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}         [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}           [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
        *                                                                         otherwise `result` will contain the properties.
        *                                                                         `response` will contain information related to this operation.
        */
        getServiceStats(options: common.RequestOptions, callback: ErrorOrResult<common.models.ServiceStats>): void;

        /**
        * Gets the service stats for a storage account’s Table service.
        *
        * @this {TableService}
        * @param {errorOrResult}  callback                                        `error` will contain information if an error occurs;
        *                                                                         otherwise `result` will contain the properties.
        *                                                                         `response` will contain information related to this operation.
        */
        getServiceStats(callback: ErrorOrResult<common.models.ServiceStats>): void;

        /**
        * Gets the properties of a storage account’s Table service, including Azure Storage Analytics.
        *
        * @this {TableService}
        * @param {Object}             [options]                                    The request options.
        * @param {LocationMode}       [options.locationMode]                       Specifies the location mode used to decide which location the request should be sent to.
        *                                                                          Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]           The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                          The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                          execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                    A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                  Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                          The default value is false.
        * @param {errorOrResult}  callback                                         `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain the properties.
        *                                                                         `response` will contain information related to this operation.
        */
        getServiceProperties(options: common.RequestOptions, callback: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;

        /**
        * Gets the properties of a storage account’s Table service, including Azure Storage Analytics.
        *
        * @this {TableService}
        * @param {errorOrResult}  callback                                         `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain the properties.
        *                                                                         `response` will contain information related to this operation.
        */
        getServiceProperties(callback: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;

        /**
        * Sets the properties of a storage account’s Table service, including Azure Storage Analytics.
        * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
        *
        * @this {TableService}
        * @param {Object}             serviceProperties                            The service properties.
        * @param {Object}             [options]                                    The request options.
        * @param {LocationMode}       [options.locationMode]                       Specifies the location mode used to decide which location the request should be sent to.
        *                                                                          Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]           The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                          The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                          execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                    A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                  Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                          The default value is false.
        * @param {errorOrResponse}  callback                                       `error` will contain information if an error occurs;
        *                                                                          `response` will contain information related to this operation.
        */
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Sets the properties of a storage account’s Table service, including Azure Storage Analytics.
        * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
        *
        * @this {TableService}
        * @param {Object}             serviceProperties                            The service properties.
        * @param {errorOrResponse}  callback                                       `error` will contain information if an error occurs;
        *                                                                          `response` will contain information related to this operation.
        */
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, callback: ErrorOrResponse): void;

        /**
        * Lists a segment containing a collection of table items under the specified account.
        *
        * @this {TableService}
        * @param {Object}             currentToken                                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                         The create options or callback function.
        * @param {int}                [options.maxResults]                              Specifies the maximum number of tables to return per call to Azure ServiceClient.
        * @param {LocationMode}       [options.locationMode]                            Specifies the location mode used to decide which location the request should be sent to.
        *                                                                               Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                     The server timeout interval, in milliseconds, to use for the request.
        * @param {string}             [options.payloadFormat]                           The payload format to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]                The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                               execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                         A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                               The default value is false.
        * @param {errorOrResult}  callback                                              `error` will contain information if an error occurs;
        *                                                                               otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                               `entries`  gives a list of tables and the `continuationToken` is used for the next listing operation.
        *                                                                               `response` will contain information related to this operation.
        */
        listTablesSegmented(currentToken: TableService.ListTablesContinuationToken, options: TableService.ListTablesRequestOptions, callback: ErrorOrResult<TableService.ListTablesResponse>): void;

        /**
        * Lists a segment containing a collection of table items under the specified account.
        *
        * @this {TableService}
        * @param {Object}             currentToken                                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {errorOrResult}  callback                                              `error` will contain information if an error occurs;
        *                                                                               otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                               `entries`  gives a list of tables and the `continuationToken` is used for the next listing operation.
        *                                                                               `response` will contain information related to this operation.
        */
        listTablesSegmented(currentToken: TableService.ListTablesContinuationToken, callback: ErrorOrResult<TableService.ListTablesResponse>): void;

        /**
        * Lists a segment containing a collection of table items under the specified account.
        *
        * @this {TableService}
        * @param {string}             prefix                                            The prefix of the table name.
        * @param {Object}             currentToken                                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                         The create options or callback function.
        * @param {int}                [options.maxResults]                              Specifies the maximum number of tables to return per call to Azure ServiceClient.
        * @param {LocationMode}       [options.locationMode]                            Specifies the location mode used to decide which location the request should be sent to.
        *                                                                               Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                     The server timeout interval, in milliseconds, to use for the request.
        * @param {string}             [options.payloadFormat]                           The payload format to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]                The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                               execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                         A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                               The default value is false.
        * @param {errorOrResult}      callback                                          `error` will contain information if an error occurs;
        *                                                                               otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                               `entries`  gives a list of tables and the `continuationToken` is used for the next listing operation.
        *                                                                               `response` will contain information related to this operation.
        */
        listTablesSegmentedWithPrefix(prefix: string, currentToken: TableService.ListTablesContinuationToken, options: TableService.ListTablesRequestOptions, callback: ErrorOrResult<TableService.ListTablesResponse>): void;

        /**
        * Lists a segment containing a collection of table items under the specified account.
        *
        * @this {TableService}
        * @param {string}             prefix                                            The prefix of the table name.
        * @param {Object}             currentToken                                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {errorOrResult}      callback                                          `error` will contain information if an error occurs;
        *                                                                               otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                               `entries`  gives a list of tables and the `continuationToken` is used for the next listing operation.
        *                                                                               `response` will contain information related to this operation.
        */
        listTablesSegmentedWithPrefix(prefix: string, currentToken: TableService.ListTablesContinuationToken, callback: ErrorOrResult<TableService.ListTablesResponse>): void;

        /**
        * Gets the table's ACL.
        *
        * @this {TableService}
        * @param {string}             table                                        The table name.
        * @param {Object}             [options]                                    The request options.
        * @param {LocationMode}       [options.locationMode]                       Specifies the location mode used to decide which location the request should be sent to.
        *                                                                          Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]           The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                          The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                          execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                    A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                  Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                          The default value is false.
        * @param {errorOrResult}      callback                                     `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain the ACL information for the table.
        *                                                                          `response` will contain information related to this operation.
        */
        getTableAcl(table: string, options: common.RequestOptions, callback: ErrorOrResult<TableService.GetTableAclResult>): void;

        /**
        * Gets the table's ACL.
        *
        * @this {TableService}
        * @param {string}         table                                            The table name.
        * @param {errorOrResult}  callback                                         `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain the ACL information for the table.
        *                                                                          `response` will contain information related to this operation.
        */
        getTableAcl(table: string, callback: ErrorOrResult<TableService.GetTableAclResult>): void;

        /**
        * Updates the table's ACL.
        *
        * @this {TableService}
        * @param {string}             table                                        The table name.
        * @param {Object}             signedIdentifiers                            The signed identifiers. Signed identifiers must be in an array.
        * @param {Object}             [options]                                    The request options.
        * @param {LocationMode}       [options.locationMode]                       Specifies the location mode used to decide which location the request should be sent to.
        *                                                                          Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]           The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                          The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                          execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                    A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                  Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                          The default value is false.
        * @param {errorOrResult}      callback                                     `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain information for the table.
        *                                                                          `response` will contain information related to this operation.
        */
        setTableAcl(table: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, options: common.RequestOptions, callback: ErrorOrResult<{
          TableName: string;
          signedIdentifiers: {[key:string]: common.AccessPolicy};
        }>): void;

        /**
        * Updates the table's ACL.
        *
        * @this {TableService}
        * @param {string}             table                                        The table name.
        * @param {Object}             signedIdentifiers                            The signed identifiers. Signed identifiers must be in an array.
        * @param {errorOrResult}      callback                                     `error` will contain information if an error occurs;
        *                                                                          otherwise `result` will contain information for the table.
        *                                                                          `response` will contain information related to this operation.
        */
        setTableAcl(table: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, callback: ErrorOrResult<{
          TableName: string;
          signedIdentifiers: {[key:string]: common.AccessPolicy};
        }>): void;

        /**
        * Retrieves a shared access signature token.
        *
        * @this {TableService}
        * @param {string}                   table                                         The table name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.StartPk]     The starting Partition Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.EndPk]       The ending Partition Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.StartRk]     The starting Row Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.EndRk]       The ending Row Key for which the SAS will be valid.
        * @return {Object}                                                                An object with the shared access signature.
        */
        generateSharedAccessSignature(table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy): string;

        /**
        * Retrieves a shared access signature token.
        *
        * @this {TableService}
        * @param {string}                   table                                         The table name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.StartPk]     The starting Partition Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.EndPk]       The ending Partition Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.StartRk]     The starting Row Key for which the SAS will be valid.
        * @param {string}                   [sharedAccessPolicy.AccessPolicy.EndRk]       The ending Row Key for which the SAS will be valid.
        * @param {string}                   [sasVersion]                                  An optional string indicating the desired SAS version to use. Value must be 2012-02-12 or later.
        * @return {Object}                                                                An object with the shared access signature.
        */
        generateSharedAccessSignatureWithVersion(table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy, sasVersion: string): string;

        /**
        * Checks whether or not a table exists on the service.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain be true if the table exists, or false if the table does not exist.
        *                                                                     `response` will contain information related to this operation.
        */
        doesTableExist(table: string, options: common.RequestOptions, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Checks whether or not a table exists on the service.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain be true if the table exists, or false if the table does not exist.
        *                                                                     `response` will contain information related to this operation.
        */
        doesTableExist(table: string, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Creates a new table within a storage account.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}      callback                                `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the new table information.
        *                                                                     `response` will contain information related to this operation.
        */
        createTable(table: string, options: common.RequestOptions, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Creates a new table within a storage account.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {errorOrResult}      callback                                `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the new table information.
        *                                                                     `response` will contain information related to this operation.
        */
        createTable(table: string, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Creates a new table within a storage account if it does not exists.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     `result` will be `true` if table was created, false otherwise
        *                                                                     `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var tableService = azure.createTableService();
        * tableService.createTableIfNotExists('tasktable', function(error) {
        *   if(!error) {
        *     // Table created or exists
        *   }
        * });
        */
        createTableIfNotExists(table: string, options: common.RequestOptions, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Creates a new table within a storage account if it does not exists.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     `result` will be `true` if table was created, false otherwise
        *                                                                     `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var tableService = azure.createTableService();
        * tableService.createTableIfNotExists('tasktable', function(error) {
        *   if(!error) {
        *     // Table created or exists
        *   }
        * });
        */
        createTableIfNotExists(table: string, callback: ErrorOrResult<TableService.TableResult>): void;

        /**
        * Deletes a table from a storage account.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResponse}  callback                                  `error` will contain information if an error occurs;
        *                                                                     `response` will contain information related to this operation.
        */
        deleteTable(table: string, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Deletes a table from a storage account.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {errorOrResponse}  callback                                  `error` will contain information if an error occurs;
        *                                                                     `response` will contain information related to this operation.
        */
        deleteTable(table: string, callback: ErrorOrResponse): void;

        /**
        * Deletes a table from a storage account, if it exists.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     `result` will be `true` if table was deleted, false otherwise
        *                                                                     `response` will contain information related to this operation.
        */
        deleteTableIfExists(table: string, options: common.RequestOptions, callback: ErrorOrResult<boolean>): void;

        /**
        * Deletes a table from a storage account, if it exists.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     `result` will be `true` if table was deleted, false otherwise
        *                                                                     `response` will contain information related to this operation.
        */
        deleteTableIfExists(table: string, callback: ErrorOrResult<boolean>): void;

        /**
        * Queries data in a table. To retrieve a single entity by partition key and row key, use retrieve entity.
        *
        * @this {TableService}
        * @param {string}             table                                                The table name.
        * @param {TableQuery}         tableQuery                                           The query to perform. Use null, undefined, or new TableQuery() to get all of the entities in the table.
        * @param {Object}             currentToken                                         A continuation token returned by a previous listing operation.
        *                                                                                  Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                            The request options.
        * @param {LocationMode}       [options.locationMode]                               Specifies the location mode used to decide which location the request should be sent to.
        *                                                                                  Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                        The server timeout interval, in milliseconds, to use for the request.
        * @param {string}             [options.payloadFormat]                              The payload format to use for the request.
        * @param {bool}               [options.autoResolveProperties]                      If true, guess at all property types.
        * @param {int}                [options.maximumExecutionTimeInMs]                   The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                                  The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                                  execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                            A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                          Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                                  The default value is false.
        * @param {Function(entity)} [options.entityResolver]                               The entity resolver. Given a single entity returned by the query, returns a modified object which is added to
        *                                                                                  the entities array.
        * @param {TableService~propertyResolver}  [options.propertyResolver]               The property resolver. Given the partition key, row key, property name, property value,
        *                                                                                  and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {TableService~queryResponse} callback                                     `error` will contain information if an error occurs;
        *                                                                                  otherwise `entities` will contain the entities returned by the query.
        *                                                                                  If more matching entities exist, and could not be returned,
        *                                                                                  `queryResultContinuation` will contain a continuation token that can be used
        *                                                                                  to retrieve the next set of results.
        *                                                                                  `response` will contain information related to this operation.
        *
        * The logic for returning entity types can get complicated.  Here is the algorithm used:
        * ```
        * var propertyType;
        *
        * if (propertyResovler) {                      // If the caller provides a propertyResolver in the options, use it
        *   propertyType = propertyResolver(partitionKey, rowKey, propertyName, propertyValue, propertyTypeFromService);
        * } else if (propertyTypeFromService) {        // If the service provides us a property type, use it.  See below for an explanation of when this will and won't occur.
        *   propertyType = propertyTypeFromService;
        * } else if (autoResolveProperties) {          // If options.autoResolveProperties is set to true
        *   if (javascript type is string) {           // See below for an explanation of how and why autoResolveProperties works as it does.
        *     propertyType = 'Edm.String';
        *   } else if (javascript type is boolean) {
        *     propertyType = 'Edm.Boolean';
        *   }
        * }
        *
        * if (propertyType) {
        *   // Set the property type on the property.
        * } else {
        *   // Property gets no EdmType.
        * }
        * ```
        * Notes:
        *
        * * The service only provides a type if JsonFullMetadata or JsonMinimalMetadata is used, and if the type is Int64, Guid, Binary, or DateTime.
        * * Explanation of autoResolveProperties:
        *     * String gets correctly resolved to 'Edm.String'.
        *     * Int64, Guid, Binary, and DateTime all get resolved to 'Edm.String.'  This only happens if JsonNoMetadata is used (otherwise the service will provide the propertyType in a prior step).
        *     * Boolean gets correctly resolved to 'Edm.Boolean'.
        *     * For both Int32 and Double, no type information is returned, even in the case of autoResolveProperties = true.  This is due to an
        *          inability to distinguish between the two in certain cases.
        *
        * @example
        * var azure = require('azure-storage');
        * var tableService = azure.createTableService();
        * // tasktable should already exist and have entities
        *
        * // returns all entities in tasktable, and a continuation token for the next page of results if necessary
        * tableService.queryEntities('tasktable', null, null \/*currentToken*\/, function(error, result) {
        *   if(!error) {
        *     var entities = result.entities;
        *     // do stuff with the returned entities if there are any
        *   }
        * });
        *
        * // returns field1 and field2 of the entities in tasktable, and a continuation token for the next page of results if necessary
        * var tableQuery = new TableQuery().select('field1', 'field2');
        * tableService.queryEntities('tasktable', tableQuery, null \/*currentToken*\/, function(error, result) {
        *   if(!error) {
        *     var entities = result.entities;
        *     // do stuff with the returned entities if there are any
        *   }
        * });
        */
        queryEntities<T>(table: string, tableQuery: TableQuery, currentToken: TableService.TableContinuationToken, options: TableService.TableEntityRequestOptions, callback: ErrorOrResult<TableService.QueryEntitiesResult<T>>): void;

        /**
        * Queries data in a table. To retrieve a single entity by partition key and row key, use retrieve entity.
        *
        * @this {TableService}
        * @param {string}             table                                                The table name.
        * @param {TableQuery}         tableQuery                                           The query to perform. Use null, undefined, or new TableQuery() to get all of the entities in the table.
        * @param {Object}             currentToken                                         A continuation token returned by a previous listing operation.
        *                                                                                  Please use 'null' or 'undefined' if this is the first operation.
        * @param {TableService~queryResponse} callback                                     `error` will contain information if an error occurs;
        *                                                                                  otherwise `entities` will contain the entities returned by the query.
        *                                                                                  If more matching entities exist, and could not be returned,
        *                                                                                  `queryResultContinuation` will contain a continuation token that can be used
        *                                                                                  to retrieve the next set of results.
        *                                                                                  `response` will contain information related to this operation.
        */
        queryEntities<T>(table: string, tableQuery: TableQuery, currentToken: TableService.TableContinuationToken, callback: ErrorOrResult<TableService.QueryEntitiesResult<T>>): void;

        /**
        * Retrieves an entity from a table.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {string}             partitionKey                                    The partition key.
        * @param {string}             rowKey                                          The row key.
        * @param {Object}             [options]                                       The request options.
        * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                             Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {string}             [options.payloadFormat]                         The payload format to use for the request.
        * @param {bool}               [options.autoResolveProperties]                 If true, guess at all property types.
        * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                             The default value is false.
        * @param {TableService~propertyResolver}  [options.propertyResolver]          The property resolver. Given the partition key, row key, property name, property value,
        *                                                                             and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {Function(entity)} [options.entityResolver]                          The entity resolver. Given the single entity returned by the query, returns a modified object.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will be the matching entity.
        *                                                                             `response` will contain information related to this operation.
        *
        * The logic for returning entity types can get complicated.  Here is the algorithm used:
        * ```
        * var propertyType;
        *
        * if (propertyResovler) {                      // If the caller provides a propertyResolver in the options, use it
        *   propertyType = propertyResolver(partitionKey, rowKey, propertyName, propertyValue, propertyTypeFromService);
        * } else if (propertyTypeFromService) {        // If the service provides us a property type, use it.  See below for an explanation of when this will and won't occur.
        *   propertyType = propertyTypeFromService;
        * } else if (autoResolveProperties) {          // If options.autoResolveProperties is set to true
        *   if (javascript type is string) {           // See below for an explanation of how and why autoResolveProperties works as it does.
        *     propertyType = 'Edm.String';
        *   } else if (javascript type is boolean) {
        *     propertyType = 'Edm.Boolean';
        *   }
        * }
        *
        * if (propertyType) {
        *   // Set the property type on the property.
        * } else {
        *   // Property gets no EdmType.
        * }
        * ```
        * Notes:
        *
        * * The service only provides a type if JsonFullMetadata or JsonMinimalMetadata is used, and if the type is Int64, Guid, Binary, or DateTime.
        * * Explanation of autoResolveProperties:
        *     * String gets correctly resolved to 'Edm.String'.
        *     * Int64, Guid, Binary, and DateTime all get resolved to 'Edm.String.'  This only happens if JsonNoMetadata is used (otherwise the service will provide the propertyType in a prior step).
        *     * Boolean gets correctly resolved to 'Edm.Boolean'.
        *     * For both Int32 and Double, no type information is returned, even in the case of autoResolveProperties = true.  This is due to an
        *          inability to distinguish between the two in certain cases.
        *
        * @example
        * var azure = require('azure-storage');
        * var tableService = azure.createTableService();
        * tableService.retrieveEntity('tasktable', 'tasksSeattle', '1', function(error, serverEntity) {
        *   if(!error) {
        *     // Entity available in serverEntity variable
        *   }
        * });
        */
        retrieveEntity<T>(table: string, partitionKey: string, rowKey: string, options: TableService.TableEntityRequestOptions, callback: ErrorOrResult<T>): void;

        /**
        * Retrieves an entity from a table.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {string}             partitionKey                                    The partition key.
        * @param {string}             rowKey                                          The row key.
        * @param {Object}             [options]                                       The request options.
        * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                             Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {string}             [options.payloadFormat]                         The payload format to use for the request.
        * @param {bool}               [options.autoResolveProperties]                 If true, guess at all property types.
        * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                             The default value is false.
        * @param {TableService~propertyResolver}  [options.propertyResolver]          The property resolver. Given the partition key, row key, property name, property value,
        *                                                                             and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {Function(entity)} [options.entityResolver]                          The entity resolver. Given the single entity returned by the query, returns a modified object.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will be the matching entity.
        *                                                                             `response` will contain information related to this operation.
        */
        retrieveEntity<T>(table: string, partitionKey: string, rowKey: string, callback: ErrorOrResult<T>): void;

        /**
        * Inserts a new entity into a table.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {Object}             entityDescriptor                                The entity descriptor.
        * @param {Object}             [options]                                       The request options.
        * @param {bool}               [options.echoContent]                           Whether or not to return the entity upon a successful insert. Default to false.
        * @param {string}             [options.payloadFormat]                         The payload format to use in the response, if options.echoContent is true.
        * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                             Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                             The default value is false.
        * @param {TableService~propertyResolver}  [options.propertyResolver]          The property resolver. Only applied if echoContent is true. Given the partition key, row key, property name,
        *                                                                             property value, and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {Function(entity)} [options.entityResolver]                          The entity resolver. Only applied if echoContent is true. Given the single entity returned by the insert, returns
        *                                                                             a modified object.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will contain the entity information.
        *                                                                             `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var tableService = azure.createTableService();
        * var task1 = {
        *   PartitionKey : {'_': 'tasksSeattle', '$':'Edm.String'},
        *   RowKey: {'_': '1', '$':'Edm.String'},
        *   Description: {'_': 'Take out the trash', '$':'Edm.String'},
        *   DueDate: {'_': new Date(2011, 12, 14, 12), '$':'Edm.DateTime'}
        * };
        * tableService.insertEntity('tasktable', task1, function(error) {
        *   if(!error) {
        *     // Entity inserted
        *   }
        * });
        */
        insertEntity<T>(table: string, entityDescriptor: T, options: TableService.InsertEntityRequestOptions, callback: ErrorOrResult<T | TableService.EntityMetadata>): void;

        /**
        * Inserts a new entity into a table.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {Object}             entityDescriptor                                The entity descriptor.
        * @param {Object}             [options]                                       The request options.
        * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                             Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                             The default value is false.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will contain the entity information.
        *                                                                             `response` will contain information related to this operation.
        */
        insertEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Inserts a new entity into a table.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {Object}             entityDescriptor                                The entity descriptor.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will contain the entity information.
        *                                                                             `response` will contain information related to this operation.
        */
        insertEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Inserts or updates a new entity into a table.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        insertOrReplaceEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Inserts or updates a new entity into a table.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        insertOrReplaceEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Replaces an existing entity within a table. To replace conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        replaceEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Replaces an existing entity within a table. To replace conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        replaceEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Updates an existing entity within a table by merging new property values into the entity. To merge conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     response` will contain information related to this operation.
        */
        mergeEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Updates an existing entity within a table by merging new property values into the entity. To merge conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     response` will contain information related to this operation.
        */
        mergeEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Inserts or updates an existing entity within a table by merging new property values into the entity.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        insertOrMergeEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Inserts or updates an existing entity within a table by merging new property values into the entity.
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {errorOrResult}  callback                                    `error` will contain information if an error occurs;
        *                                                                     otherwise `result` will contain the entity information.
        *                                                                     `response` will contain information related to this operation.
        */
        insertOrMergeEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResult<TableService.EntityMetadata>): void;

        /**
        * Deletes an entity within a table. To delete conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {Object}             [options]                               The request options.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResponse}  callback                                  `error` will contain information if an error occurs;
        *                                                                     `response` will contain information related to this operation.
        */
        deleteEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions, callback: ErrorOrResponse): void;

        /**
        * Deletes an entity within a table. To delete conditionally based on etag, set entity['.metadata']['etag'].
        *
        * @this {TableService}
        * @param {string}             table                                   The table name.
        * @param {Object}             entityDescriptor                        The entity descriptor.
        * @param {errorOrResponse}  callback                                  `error` will contain information if an error occurs;
        *                                                                     `response` will contain information related to this operation.
        */
        deleteEntity<T>(table: string, entityDescriptor: T, callback: ErrorOrResponse): void;

        /**
        * Executes the operations in the batch.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {TableBatch}         batch                                           The table batch to execute.
        * @param {Object}             [options]                                       The create options or callback function.
        * @param {LocationMode}       [options.locationMode]                          Specifies the location mode used to decide which location the request should be sent to.
        *                                                                             Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                   The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]              The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                             The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                             execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                       A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                     Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                             The default value is false.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will contain responses for each operation executed in the batch;
        *                                                                             `result.entity` will contain the entity information for each operation executed.
        *                                                                             `result.response` will contain the response for each operations executed.
        *                                                                             `response` will contain information related to this operation.
        */
        executeBatch(table: string, batch: TableBatch, options: TableService.TableEntityRequestOptions, callback: ErrorOrResult<TableService.BatchResult[]>): void;

        /**
        * Executes the operations in the batch.
        *
        * @this {TableService}
        * @param {string}             table                                           The table name.
        * @param {TableBatch}         batch                                           The table batch to execute.
        * @param {errorOrResult}  callback                                            `error` will contain information if an error occurs;
        *                                                                             otherwise `result` will contain responses for each operation executed in the batch;
        *                                                                             `result.entity` will contain the entity information for each operation executed.
        *                                                                             `result.response` will contain the response for each operations executed.
        *                                                                             `response` will contain information related to this operation.
        */
        executeBatch(table: string, batch: TableBatch, callback: ErrorOrResult<TableService.BatchResult[]>): void;

        getUrl(table: string, sasToken?: string, primary?: boolean): string;
      }

      export module TableService {
        
        export interface TableResult {
          isSuccessful?: boolean;
          statusCode?: string | number;
          TableName?: string;
          exists?: boolean;
          created?: boolean;
        }

        export interface TableAccessPolicy extends common.AccessPolicy {
          StartPk?: string;
          EndPk?: string;
          StartRk?: string;
          EndRk?: string;
        }
        
        export interface TableSharedAccessPolicy {
          /** The signed identifier. */
          Id?: string;
          /** The Table Access Policy information */
          AccessPolicy: TableAccessPolicy;
        }
        
        export interface ListTablesRequestOptions extends common.RequestOptions {
          maxResults?: number;
          payloadFormat?: string;
        }

        export interface ListTablesContinuationToken {
          nextTableName: string;
          targetLocation?: Constants.StorageLocation;
        }

        export interface ListTablesResponse {
          continuationToken: ListTablesContinuationToken;
          entries: string[];
        }

        export interface TableContinuationToken {
          nextPartitionKey: string;
          nextRowKey: string;
          targetLocation: Constants.StorageLocation;
        }

        export interface GetTableAclResult {
          signedIdentifiers: {[key:string]: common.AccessPolicy};
        }

        export interface QueryEntitiesResult<T> {
          entries: T[];
          continuationToken?: TableContinuationToken;
        }

        export interface EntityMetadata {
          '.metadata': { etag: string; }
        }

        export interface PropertyResolver {
          (partitionKey: string, rowKey: string, propertyName: string, propertyValue: Object, entityPropertyType: string): string;
        }

        export interface TableEntityRequestOptions extends common.RequestOptions {
          payloadFormat?: string;
          autoResolveProperties?: boolean;
          propertyResolver?: PropertyResolver;
          entityResolver?: (entityResult: Object) => Object;
          echoContent?: boolean;
        }

        export interface InsertEntityRequestOptions extends TableEntityRequestOptions {
          echoContent: boolean;
        }

        export interface BatchResponse {
          statusCode?: number;
          headers?: Object;
          body?: Object;
          isSuccessful?: boolean;
        }

        export interface BatchResult {
          entity?: Object;
          error?: Error;
          response: BatchResponse;
        }

        export interface EntityProperty<T> {
          _: T;
          $: string;
        }
      }

      export var TableService: {
        /**
        * Creates a new TableService object.
        * If no connection string or storageaccount and storageaccesskey are provided,
        * the AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY environment variables will be used.
        * @class
        * The TableService object allows you to peform management operations with the Microsoft Azure Table Service.
        * The Table Service stores data in rows of key-value pairs. A table is composed of multiple rows, and each row
        * contains key-value pairs. There is no schema, so each row in a table may store a different set of keys.
        *
        * For more information on the Table Service, as well as task focused information on using it from a Node.js application, see
        * [How to Use the Table Service from Node.js](http://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-table-storage/).
        * The following defaults can be set on the Table service.
        * defaultTimeoutIntervalInMs                          The default timeout interval, in milliseconds, to use for request made via the Table service.
        * defaultClientRequestTimeoutInMs                     The default timeout of client requests, in milliseconds, to use for the request made via the Table service.
        * defaultMaximumExecutionTimeInMs                     The default maximum execution time across all potential retries, for requests made via the Table service.
        * defaultLocationMode                                 The default location mode for requests made via the Table service.
        * defaultPayloadFormat                                The default payload format for requests made via the Table service.
        * useNagleAlgorithm                                   Determines whether the Nagle algorithm is used for requests made via the Table service.; true to use the
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
        new (storageAccountOrConnectionString?: string, storageAccessKey?: string, host?: string|StorageHost, sasToken?: string, endpointSuffix?: string): TableService;
      }

      export module TableUtilities {
        /**
        * Permission types.
        *
        * @const
        * @enum {string}
        */
        var SharedAccessPermissions: {
          QUERY: string;
          ADD: string;
          UPDATE: string;
          DELETE: string;
        };

        /**
        * Payload Format.
        *
        * @const
        * @enum {string}
        */
        var PayloadFormat: {
          FULL_METADATA: string;
          MINIMAL_METADATA: string;
          NO_METADATA: string;
        };

        /**
        * Defines the set of Boolean operators for constructing queries.
        *
        * @const
        * @enum {string}
        */
        var TableOperators: {
          AND: string;
          NOT: string;
          OR: string;
        };

        /**
        * Filter property comparison operators.
        *
        * @const
        * @enum {string}
        */
        var QueryComparisons: {
          EQUAL: string;
          NOT_EQUAL: string;
          GREATER_THAN: string;
          GREATER_THAN_OR_EQUAL: string;
          LESS_THAN: string;
          LESS_THAN_OR_EQUAL: string;
        };

        /**
        * Edm types.
        *
        * @const
        * @enum {string}
        */
        var EdmType: {
          STRING: string;
          BINARY: string;
          INT64: string;
          INT32: string;
          DOUBLE: string;
          DATETIME: string;
          GUID: string;
          BOOLEAN: string;
        };

        /**
        * A helper to create table entities.
        *
        * @example
        * var entGen = TableUtilities.entityGenerator;
        * var entity = {  PartitionKey: entGen.String('part2'),
        *        RowKey: entGen.String('row1'),
        *        boolValue: entGen.Boolean(true),
        *        intValue: entGen.Int32(42),
        *        dateValue: entGen.DateTime(new Date(Date.UTC(2011, 10, 25))),
        *       };
        */
        module entityGenerator {
          class EntityProperty<T> {
            _: T;
            $: string;
            constructor(value: T, type?: string);
          }
          function Int32(value: number|string): EntityProperty<number>;
          function Int64(value: number|string): EntityProperty<number>;
          function Binary(value: Buffer|string): EntityProperty<Buffer>;
          function Boolean(value: boolean|string): EntityProperty<boolean>;
          function String(value: string): EntityProperty<string>;
          function Guid(value: string|Buffer|any): EntityProperty<any>;
          function Double(value: number|string): EntityProperty<number>;
          function DateTime(value: Date|string): EntityProperty<Date>;
        }
      }

      export interface TableQuery {
        /**
        * Specifies the select clause. If no arguments are given, all fields will be selected.
        *
        * @param {array} fields The fields to be selected.
        * @return {TableQuery} A table query object with the select clause.
        * @example
        * var tableQuery = new TableQuery().select('field1', 'field2');
        */
        select(...args: string[]): TableQuery;
        select(args: string[]): TableQuery;

        /**
         * Specifies the top clause.
         *
         * @param {int} top The number of items to fetch.
         * @return {TableQuery} A table query object with the top clause.
         * @example
         * var tableQuery = new TableQuery().top(10);
         *
         * // tasktable should already exist and have entities
         * tableService.queryEntities('tasktable', tableQuery, null \/*currentToken*\/, function(error, result) {
         *   if(!error) {
         *     var entities = result.entities; // there will be 10 or less entities
         *     // do stuff with the returned entities if there are any
         *     // if result.continuationToken exists, to get the next 10 (or less) entities
         *     // call queryEntities as above, but with the returned token instead of null
         *   }
         * });
         */
        top(top: number): TableQuery;

        /**
         * Specifies the where clause.
         *
         * Valid type specifier strings include: ?string?, ?bool?, ?int32?, ?double?, ?date?, ?guid?, ?int64?, ?binary?
         * A type must be specified for guid, int64, and binaries or the filter produced will be incorrect.
         *
         * @param {string}       condition   The condition string.
         * @param {string|array} value       Value(s) to insert in question mark (?) parameters.
         * @return {TableQuery}  A table query object with the where clause.
         * @example
         * var tableQuery = new TableQuery().where(TableQuery.guidFilter('GuidField', QueryComparisons.EQUAL, guidVal));
         * OR
         * var tableQuery = new TableQuery().where('Name == ? or Name <= ?', name1, name2);
         * OR
         * var tableQuery = new TableQuery().where('Name == ?string? && Value == ?int64?, name1, int64Val);
         *
         * // tasktable should already exist and have entities
         * tableService.queryEntities('tasktable', tableQuery, null \/*currentToken*\/, function(error, result, response) {
         *   if(!error) {
         *     var entities = result.entities;
         *     // do stuff with the returned entities if there are any
         *   }
         * });
         */
        where(condition: string, ...args: any[]): TableQuery;
  
        /**
         * Specifies an AND where condition.
         *
         * @param {string}       condition   The condition string.
         * @param {array}        arguments   Any number of arguments to be replaced in the condition by the question mark (?).
         * @return {TableQuery} A table query object with the and clause.
         * @example
         * var tableQuery = new TableQuery()
         *                      .where('Name == ? or Name <= ?', 'Person1', 'Person2');
         *                      .and('Age >= ?', 18);
         */
        and(condition: string, ...args: any[]): TableQuery;

        /**
         * Specifies an OR where condition.
         *
         * @param {string}       condition   The condition.
         * @param {array}        arguments   Any number of arguments to be replaced in the condition by the question mark (?).
         * @return {TableQuery} A table query object with the or clause.
         * @example
         * var tableQuery = new TableQuery()
         *                      .where('Name == ? or Name <= ?', 'Person1', 'Person2');
         *                      .or('Age >= ?', 18);
         */
        or(condition: string, ...args: any[]): TableQuery;

        /**
         * Returns the query string object for the query.
         *
         * @return {Object} JSON object representing the query string arguments for the query.
         */
        toQueryObject(): Object;
      }

      export var TableQuery: {
        new(): TableQuery;

        /**
         * Generates a property filter condition string for an 'int' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|int}   value          An 'int' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.int32Filter('IntField', QueryComparisons.EQUAL, 5);
         */
        int32Filter(propertyName: string, operation: string, value: string | number): string;

        /**
         * Generates a property filter condition string for a 'int64' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|int64} value          An 'int64' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.int64Filter('Int64Field', QueryComparisons.EQUAL, 123);
         */
        int64Filter(propertyName: string, operation: string, value: string | number): string;

        /**
         * Generates a property filter condition string for a 'double' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|double}value          A 'double' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.doubleFilter('DoubleField', QueryComparisons.EQUAL, 123.45);
         */
        doubleFilter(propertyName: string, operation: string, value: string | number): string;

        /**
         * Generates a property filter condition string for a 'boolean' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|boolean}       value          A 'boolean' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.booleanFilter('BooleanField', QueryComparisons.EQUAL, false);
         */
        booleanFilter(propertyName: string, operation: string, value: boolean | string): string;

        /**
         * Generates a property filter condition string for a 'datetime' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|date}     value              A 'datetime' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.dateFilter('DateTimeField', QueryComparisons.EQUAL, new Date(Date.UTC(2001, 1, 3, 4, 5, 6)));
         */
        dateFilter(propertyName: string, operation: string, value: Date | string): string;

        /**
         * Generates a property filter condition string for a 'guid' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|guid}  value          A 'guid' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.guidFilter('GuidField', QueryComparisons.EQUAL, guid.v1());
         */
        guidFilter(propertyName: string, operation: string, value: string | any): string;

        /**
         * Generates a property filter condition string for a 'binary' value.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string|buffer}value          A 'buffer' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.binaryFilter('BinaryField', QueryComparisons.EQUAL, new Buffer('hello'));
         */
        binaryFilter(propertyName: string, operation: string, value: Buffer | string): string;

        /**
         * Generates a property filter condition string.
         *
         * @param {string}       propertyName   A string containing the name of the property to compare.
         * @param {string}       operation      A string containing the comparison operator to use.
         *                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
         * @param {string}       value          A 'string' containing the value to compare with the property.
         * @return {string} A string containing the formatted filter condition.
         * @example
         * var query = TableQuery.stringFilter('StringField', QueryComparisons.EQUAL, 'name');
         */
        stringFilter(propertyName: string, operation: string, value: string): string;

        /**
         * Creates a filter condition using the specified logical operator on two filter conditions.
         *
         * @param {string}       filterA          A string containing the first formatted filter condition.
         * @param {string}       operatorString   A string containing the operator to use (AND, OR).
         * @param {string}       filterB          A string containing the second formatted filter condition.
         * @return {string} A string containing the combined filter expression.
         * @example
         * var filter1 = TableQuery.stringFilter('Name', QueryComparisons.EQUAL, 'Person');
         * var filter2 = TableQuery.booleanFilter('Visible', QueryComparisons.EQUAL, true);
         * var combinedFilter = TableQuery.combineFilters(filter1, TablUtilities.TableOperators.AND, filter2);
         */
        combineFilters(filterA: string, operatorString: string, filterB: string): string;
      };

      export interface TableOperation{
        type: string;
        entity: Object;
        options: common.RequestOptions;
      }

      export interface TableBatch {
        operations: TableOperation[];
        pk: string;
        retrieve: boolean;

        /**
        * Removes all of the operations from the batch.
        *
        */
        clear(): void;

        /**
        * Returns a boolean value indicating weather there are operations in the batch.
        *
        * @return {Boolean} True if there are operations queued up; false otherwise.
        */
        hasOperations(): boolean;

        /**
        * Returns the number of operations in the batch.
        *
        * @return {number} The number of operations in the batch.
        */
        size(): number;

        /**
        * Adds a retrieve operation to the batch. Note that this must be the only operation in the batch.
        *
        * @param {string}             partitionKey                                    The partition key.
        * @param {string}             rowKey                                          The row key.
        * @param {Object}             [options]                                       The request options.
        * @param {string}             [options.payloadFormat]                         The payload format to use for the request.
        * @param {TableService~propertyResolver}  [options.propertyResolver]  The property resolver. Given the partition key, row key, property name, property value,
        *                                                                             and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {Function(entity)} [options.entityResolver]                          The entity resolver. Given the single entity returned by the query, returns a modified object.
        */
        retrieveEntity(partitionKey: string, rowKey: string, options?: TableService.TableEntityRequestOptions): void;

        /**
        * Adds an insert operation to the batch.
        *
        * @param {Object}             entity                                          The entity.
        * @param {Object}             [options]                                       The request options.
        * @param {string}             [options.echoContent]                           Whether or not to return the entity upon a successful insert. Inserts only, default to false.
        * @param {string}             [options.payloadFormat]                         The payload format to use for the request.
        * @param {TableService~propertyResolver}  [options.propertyResolver]  The property resolver. Only applied if echoContent is true. Given the partition key, row key, property name,
        *                                                                             property value, and the property Edm type if given by the service, returns the Edm type of the property.
        * @param {Function(entity)} [options.entityResolver]                          The entity resolver. Only applied if echoContent is true. Given the single entity returned by the insert, returns
        *                                                                             a modified object.
        */
        insertEntity(entity: Object, options: TableService.TableEntityRequestOptions): void;

        /**
        * Adds a delete operation to the batch.
        *
        * @param {Object}             entity              The entity.
        */
        deleteEntity(entity: Object): void;

        /**
        * Adds a merge operation to the batch.
        *
        * @param {Object}             entity              The entity.
        */
        mergeEntity(entity: Object): void;

        /**
        * Adds an replace operation to the batch.
        *
        * @param {Object}             entity              The entity.
        */
        replaceEntity(entity: Object): void;

        /**
        * Adds an insert or replace operation to the batch.
        *
        * @param {Object}             entity              The entity.
        */
        insertOrReplaceEntity(entity: Object): void;

        /**
        * Adds an insert or merge operation to the batch.
        *
        * @param {Object}             entity              The entity.
        */
        insertOrMergeEntity(entity: Object): void;

        /**
        * Adds an operation to the batch after performing checks.
        *
        * @param {string}             operationType       The type of operation to perform. See Constants.TableConstants.Operations
        * @param {Object}             entity              The entity.
        * @param {Object}             [options]                                       The request options.
        */
        addOperation(operationType: string, entity: Object, options?: TableService.TableEntityRequestOptions): void;

        /**
        * Gets an operation from the batch. Returns null if the index does not exist.
        *
        * @param {number}             index           The index in the operations array at which to remove an element.
        * @return {Object}                            The removed operation.
        */
        getOperation(index: number): TableOperation;

        /**
        * Removes an operation from the batch. Returns null if the index does not exist.
        *
        * @param {number}             index           The index in the operations array at which to remove an element.
        * @return {Object}                            The removed operation.
        */
        removeOperation(index: number): Object;
      }

      export var TableBatch: {
        new (): TableBatch;
      };
    }

    module file {
      export interface FileService extends StorageServiceClient {
        defaultEnableReuseSocket: boolean;
        singleFileThresholdInBytes: number;
        parallelOperationThreadCount: number;

        /**
        * Associate a filtering operation with this FileService. Filtering operations
        * can include logging, automatically retrying, etc. Filter operations are objects
        * that implement a method with the signature:
        *
        *     "function handle (requestOptions, next)".
        *
        * After doing its preprocessing on the request options, the method needs to call
        * "next" passing a callback with the following signature:
        * signature:
        *
        *     "function (returnObject, finalCallback, next)"
        *
        * In this callback, and after processing the returnObject (the response from the
        * request to the server), the callback needs to either invoke next if it exists to
        * continue processing other filters or simply invoke finalCallback otherwise to end
        * up the service invocation.
        *
        * @function FileService#withFilter
        * @param {Object} filter The new filter object.
        * @return {FileService} A new service client with the filter applied.
        */
        withFilter(newFilter: common.filters.IFilter): FileService;

        /**
        * Gets the properties of a storage account's File service, including Azure Storage Analytics.
        *
        * @this {FileService}
        * @param {Object}       [options]                               The request options.
        * @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                               Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}          [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                               execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}       [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                               The default value is false.
        * @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `result` will contain the properties
        *                                                               and `response` will contain information related to this operation.
        */
        getServiceProperties(options: common.RequestOptions, callback: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;
        getServiceProperties(callback: ErrorOrResult<common.models.ServicePropertiesResult.ServiceProperties>): void;

        /**
        * Sets the properties of a storage account's File service, including Azure Storage Analytics.
        * You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
        *
        * @this {FileService}
        * @param {Object}             serviceProperties                        The service properties.
        * @param {Object}             [options]                                The request options.
        * @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to.
        *                                                                      Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
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
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, options: common.RequestOptions, callback: ErrorOrResponse): void;
        setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, callback: ErrorOrResponse): void;

        /**
        * Lists a segment containing a collection of share items under the specified account.
        *
        * @this {FileService}
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.maxResults]                        Specifies the maximum number of shares to return per call to Azure storage.
        * @param {string}             [options.include]                           Include this parameter to specify that the share's metadata be returned as part of the response body. (allowed values: '', 'metadata', 'snapshots' or any combination of them)
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                         `entries`  gives a list of shares and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listSharesSegmented(currentToken: common.ContinuationToken, options: FileService.ListShareRequestOptions, callback: ErrorOrResult<FileService.ListSharesResult>): void;
        listSharesSegmented(currentToken: common.ContinuationToken, callback: ErrorOrResult<FileService.ListSharesResult>): void;

        /**
        * Lists a segment containing a collection of share items whose names begin with the specified prefix under the specified account.
        *
        * @this {FileService}
        * @param {string}             prefix                                      The prefix of the share name.
        * @param {Object}             currentToken                                A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {string}             [options.prefix]                            Filters the results to return only shares whose name begins with the specified prefix.
        * @param {int}                [options.maxResults]                        Specifies the maximum number of shares to return per call to Azure storage.
        * @param {string}             [options.include]                           Include this parameter to specify that the share's metadata be returned as part of the response body. (allowed values: '', 'metadata', 'snapshots' or any combination of them)
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain `entries` and `continuationToken`.
        *                                                                         `entries`  gives a list of shares and the `continuationToken` is used for the next listing operation.
        *                                                                         `response` will contain information related to this operation.
        */
        listSharesSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, options: FileService.ListShareRequestOptions, callback: ErrorOrResult<FileService.ListSharesResult>): void;
        listSharesSegmentedWithPrefix(prefix: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<FileService.ListSharesResult>): void;

        /**
        * Checks whether or not a share exists on the service.
        *
        * @this {FileService}
        * @param {string}             share                                   The share name.
        * @param {Object}             [options]                               The request options.
        * @param {string}             [options.shareSnapshotId]               The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}      callback                                `error` will contain information
        *                                                                     if an error occurs; otherwise `result` will
        *                                                                     be true if the share exists, or false if the share does not exist.
        *                                                                     `response` will contain information related to this operation.
        */
        doesShareExist(share: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        doesShareExist(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Creates a new share under the specified account.
        * If a share with the same name already exists, the operation fails.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             [options]                           The request options.
        * @param {int}                [options.quota]                     Specifies the maximum size of the share, in gigabytes. Must be greater than 0, and less than or equal to 5TB (5120).
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {Object}             [options.metadata]                  The metadata key/value pairs.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 the share information.
        *                                                                 `response` will contain information related to this operation.
        */
        createShare(share: string, options: FileService.CreateShareRequestOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        createShare(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        createShareSnapshot(share: string, options: common.RequestOptions, callback: ErrorOrResult<string>): void;        
        createShareSnapshot(share: string, callback: ErrorOrResult<string>): void;

        /**
        * Creates a new share under the specified account if the share does not exists.
        *
        * @this {FileService}
        * @param {string}             share                                     The share name.
        * @param {Object}             [options]                                 The request options.
        * @param {int}                [options.quota]                     Specifies the maximum size of the share, in gigabytes. Must be greater than 0, and less than or equal to 5TB (5120).
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {Object}             [options.metadata]                        The metadata key/value pairs.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResult}      callback                                  `error` will contain information
        *                                                                       if an error occurs; otherwise `result` will
        *                                                                       be true if the share was created, or false if the share
        *                                                                       already exists.
        *                                                                       `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * FileService.createShareIfNotExists('taskshare', function(error) {
        *   if(!error) {
        *     // Share created or already existed
        *   }
        * });
        */
        createShareIfNotExists(share: string, options: FileService.CreateShareRequestOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        createShareIfNotExists(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Retrieves a share and its properties from a specified account.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             [options]                           The request options.
        * @param {string}             [options.shareSnapshotId]           The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 information for the share.
        *                                                                 `response` will contain information related to this operation.
        */
        getShareProperties(share: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        getShareProperties(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Sets the properties for the specified share.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.     
        * @param {Object}             [properties]                                The share properties to set.
        * @param {string|int}         [properties.quota]                          Specifies the maximum size of the share, in gigabytes.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information about the share.
        *                                                                         `response` will contain information related to this operation.
        */
        setShareProperties(share: string, properties: FileService.ShareProperties, options: common.RequestOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        setShareProperties(share: string, properties: FileService.ShareProperties, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Gets the share statistics for a share.
        *
        * @this {FileService}
        * @param {string}           share                                   The share name.
        * @param {Object}           [options]                               The request options.
        * @param {LocationMode}     [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                   Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}              [options.timeoutIntervalInMs]           The timeout interval, in milliseconds, to use for the request.
        * @param {int}              [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                   The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                   execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}           [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}             [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                   The default value is false.
        * @param {errorOrResult}    callback                                `error` will contain information if an error occurs; otherwise, `result` will contain the stats and
        *                                                                   `response` will contain information related to this operation.
        */
        getShareStats(share: string, options: common.RequestOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        getShareStats(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Returns all user-defined metadata for the share.
        *
        * @this {FileService}
        * @param {string}             share                                     The share name.
        * @param {Object}             [options]                                 The request options.
        * @param {string}             [options.shareSnapshotId]                 The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResult}      callback                                  `error` will contain information
        *                                                                       if an error occurs; otherwise `result` will contain
        *                                                                       information for the share.
        *                                                                       `response` will contain information related to this operation.
        */
        getShareMetadata(share: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        getShareMetadata(share: string, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Sets the share's metadata.
        *
        * Calling the Set Share Metadata operation overwrites all existing metadata that is associated with the share.
        * It's not possible to modify an individual name/value pair.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             metadata                            The metadata key/value pairs.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResponse}  callback                              `error` will contain information
        *                                                                 if an error occurs; otherwise
        *                                                                 `response` will contain information related to this operation.
        */
        setShareMetadata(share: string, metadata: Map<string>, options: common.RequestOptions, callback: ErrorOrResult<FileService.ShareResult>): void;
        setShareMetadata(share: string, metadata: Map<string>, callback: ErrorOrResult<FileService.ShareResult>): void;

        /**
        * Gets the share's ACL.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             [options]                           The request options.
        * @param {string}             [options.deleteSnapshots]           The snapshot delete option. See azure.FileUtilities.ShareSnapshotDeleteOptions.*. 
        * @param {string}             [options.shareSnapshotId]           The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 information for the share.
        *                                                                 `response` will contain information related to this operation.
        */
        getShareAcl(share: string, options: common.RequestOptions, callback: ErrorOrResult<FileService.ShareAclResult>): void;
        getShareAcl(share: string, callback: ErrorOrResult<FileService.ShareAclResult>): void;

        /**
        * Updates the share's ACL.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             signedIdentifiers                   The signed identifiers. Signed identifiers must be in an array.
        * @param {Object}             [options]                           The request options.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 information for the share.
        *                                                                 `response` will contain information related to this operation.
        */
        setShareAcl(share: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, options: common.RequestOptions, callback: ErrorOrResult<FileService.ShareAclResult>): void;
        setShareAcl(share: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, callback: ErrorOrResult<FileService.ShareAclResult>): void;

        /**
        * Marks the specified share for deletion.
        * The share and any files contained within it are later deleted during garbage collection.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             [options]                           The request options.
        * @param {string}             [options.deleteSnapshots]           The snapshot delete option. See azure.FileUtilities.ShareSnapshotDeleteOptions.*. 
        * @param {string}             [options.shareSnapshotId]           The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResponse}  callback                              `error` will contain information
        *                                                                 if an error occurs; otherwise
        *                                                                 `response` will contain information related to this operation.
        */
        deleteShare(share: string, options: FileService.DeleteShareOptions, callback: ErrorOrResponse): void;
        deleteShare(share: string, callback: ErrorOrResponse): void;

        /**
        * Marks the specified share for deletion if it exists.
        * The share and any files contained within it are later deleted during garbage collection.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will
        *                                                                 be true if the share exists and was deleted, or false if the share
        *                                                                 did not exist.
        *                                                                 `response` will contain information related to this operation.
        */
        deleteShareIfExists(share: string, options: FileService.DeleteShareOptions, callback: ErrorOrResult<boolean>): void;
        deleteShareIfExists(share: string, callback: ErrorOrResult<boolean>): void;

        /**
        * Checks whether or not a directory exists on the service.
        *
        * @this {FileService}
        * @param {string}             share                                   The share name.
        * @param {string}             directory                               The directory name. Use '' to refer to the base directory.
        * @param {Object}             [options]                               The request options.
        * @param {string}             [options.shareSnapshotId]               The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}      callback                                `error` will contain information
        *                                                                     if an error occurs; otherwise `result` will
        *                                                                     be true if the directory exists, or false if the directory does not exist.
        *                                                                     `response` will contain information related to this operation.
        */
        doesDirectoryExist(share: string, directory: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        doesDirectoryExist(share: string, directory: string, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Creates a new directory under the specified account.
        * If a directory with the same name already exists, the operation fails.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {string}             directory                           The directory name.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 the directory information.
        *                                                                 `response` will contain information related to this operation.
        */
        createDirectory(share: string, directory: string, options: FileService.CreateDirectoryRequestOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        createDirectory(share: string, directory: string, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Creates a new directory under the specified account if the directory does not exists.
        *
        * @this {FileService}
        * @param {string}             share                                     The share name.
        * @param {string}             directory                                 The directory name.
        * @param {Object}             [options]                                 The request options.
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResult}      callback                                  `error` will contain information
        *                                                                       if an error occurs; otherwise `result` will
        *                                                                       be true if the directory was created, or false if the directory
        *                                                                       already exists.
        *                                                                       `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * FileService.createDirectoryIfNotExists('taskshare', taskdirectory', function(error) {
        *   if(!error) {
        *     // Directory created or already existed
        *   }
        * });
        */
        createDirectoryIfNotExists(share: string, directory: string, options: FileService.CreateDirectoryRequestOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        createDirectoryIfNotExists(share: string, directory: string, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Retrieves a directory and its properties from a specified account.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {string}             directory                           The directory name. Use '' to refer to the base directory.
        * @param {Object}             [options]                           The request options.
        * @param {string}             [options.shareSnapshotId]           The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will contain
        *                                                                 information for the directory.
        *                                                                 `response` will contain information related to this operation.
        */
        getDirectoryProperties(share: string, directory: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        getDirectoryProperties(share: string, directory: string, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Marks the specified directory for deletion. The directory must be empty before it can be deleted.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {string}             directory                           The directory name.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResponse}  callback                              `error` will contain information
        *                                                                 if an error occurs; otherwise
        *                                                                 `response` will contain information related to this operation.
        */
        deleteDirectory(share: string, directory: string, options: common.RequestOptions, callback: ErrorOrResponse): void;
        deleteDirectory(share: string, directory: string, callback: ErrorOrResponse): void;

        /**
        * Marks the specified directory for deletion if it exists. The directory must be empty before it can be deleted.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {string}             directory                           The directory name.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will
        *                                                                 be true if the directory exists and was deleted, or false if the directory
        *                                                                 did not exist.
        *                                                                 `response` will contain information related to this operation.
        */
        deleteDirectoryIfExists(share: string, directory: string, options: common.RequestOptions, callback: ErrorOrResult<boolean>): void;
        deleteDirectoryIfExists(share: string, directory: string, callback: ErrorOrResult<boolean>): void;

        /**
        * Lists a segment containing a collection of file items in the directory.
        *
        * @this {FileService}
        * @param {string}             share                             The share name.
        * @param {string}             directory                         The directory name. Use '' to refer to the base directory.
        * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                         The request options.
        * @param {string}             [options.shareSnapshotId]         The snapshot identifier of the share.
        * @param {int}                [options.maxResults]              Specifies the maximum number of files to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
        * @param {LocationMode}       [options.locationMode]            Specifies the location mode used to decide which location the request should be sent to.
        *                                                               Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]     The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                               execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]         A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                               The default value is false.
        * @param {errorOrResult}      callback                          `error` will contain information
        *                                                               if an error occurs; otherwise `result` will contain
        *                                                               entries.files, entries.directories and the continuationToken for the next listing operation.
        *                                                               `response` will contain information related to this operation.
        */
        listFilesAndDirectoriesSegmented(share: string, directory: string, currentToken: common.ContinuationToken, options: FileService.ListRequestOptions, callback: ErrorOrResult<FileService.ListFilesAndDirectoriesResult>): void;
        listFilesAndDirectoriesSegmented(share: string, directory: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<FileService.ListFilesAndDirectoriesResult>): void;


        /**
        * Lists a segment containing a collection of file items in the directory.
        *
        * @this {FileService}
        * @param {string}             share                             The share name.
        * @param {string}             directory                         The directory name. Use '' to refer to the base directory.
        * @param {string}             prefix                            The prefix of the directory/files name.
        * @param {Object}             currentToken                      A continuation token returned by a previous listing operation. Please use 'null' or 'undefined' if this is the first operation.
        * @param {Object}             [options]                         The request options.
        * @param {string}             [options.shareSnapshotId]         The snapshot identifier of the share.
        * @param {int}                [options.maxResults]              Specifies the maximum number of files to return per call to Azure ServiceClient. This does NOT affect list size returned by this function. (maximum: 5000)
        * @param {LocationMode}       [options.locationMode]            Specifies the location mode used to decide which location the request should be sent to.
        *                                                               Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]     The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                               execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]         A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]       Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                               The default value is false.
        * @param {errorOrResult}      callback                          `error` will contain information
        *                                                               if an error occurs; otherwise `result` will contain
        *                                                               entries.files, entries.directories and the continuationToken for the next listing operation.
        *                                                               `response` will contain information related to this operation.
        */
        listFilesAndDirectoriesSegmentedWithPrefix(share: string, directory: string, prefix: string, currentToken: common.ContinuationToken, options: FileService.ListRequestOptions, callback: ErrorOrResult<FileService.ListFilesAndDirectoriesResult>): void;
        listFilesAndDirectoriesSegmentedWithPrefix(share: string, directory: string,prefix: string, currentToken: common.ContinuationToken, callback: ErrorOrResult<FileService.ListFilesAndDirectoriesResult>): void;

        /**
        * Returns all user-defined metadata for the specified directory.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information about the file.
        *                                                                         `response` will contain information related to this operation.
        */
        getDirectoryMetadata(share: string, directory: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        getDirectoryMetadata(share: string, directory: string, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Sets user-defined metadata for the specified directory as one or more name-value pairs
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {Object}             metadata                                    The metadata key/value pairs.
        * @param {Object}             [options]                                   The request options.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information on the file.
        *                                                                         `response` will contain information related to this operation.
        */
        setDirectoryMetadata(share: string, directory: string, metadata: Map<string>, options: common.RequestOptions, callback: ErrorOrResult<FileService.DirectoryResult>): void;
        setDirectoryMetadata(share: string, directory: string, metadata: Map<string>, callback: ErrorOrResult<FileService.DirectoryResult>): void;

        /**
        * Retrieves a shared access signature token.
        *
        * @this {FileService}
        * @param {string}                   share                                         The share name.
        * @param {string}                   [directory]                                   The directory name. Use '' to refer to the base directory.
        * @param {string}                   [file]                                        The file name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @param {Object}                   [headers]                                     The optional header values to set for a file returned wth this SAS.
        * @param {string}                   [headers.cacheControl]                        The optional value of the Cache-Control response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentType]                         The optional value of the Content-Type response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentEncoding]                     The optional value of the Content-Encoding response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentLanguage]                     The optional value of the Content-Language response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentDisposition]                  The optional value of the Content-Disposition response header to be returned when this SAS is used.
        * @return {string}                                                                The shared access signature. Note this does not contain the leading "?".
        */
        generateSharedAccessSignature(share: string, directory: string, file: string, sharedAccessPolicy: common.SharedAccessPolicy, headers?: common.ContentSettingsHeaders): string;

        /**
        * Retrieves a shared access signature token.
        *
        * @this {FileService}
        * @param {string}                   share                                         The share name.
        * @param {string}                   [directory]                                   The directory name. Use '' to refer to the base directory.
        * @param {string}                   [file]                                        The file name.
        * @param {Object}                   sharedAccessPolicy                            The shared access policy.
        * @param {string}                   [sharedAccessPolicy.Id]                       The signed identifier.
        * @param {Object}                   [sharedAccessPolicy.AccessPolicy.Permissions] The permission type.
        * @param {date|string}              [sharedAccessPolicy.AccessPolicy.Start]       The time at which the Shared Access Signature becomes valid (The UTC value will be used).
        * @param {date|string}              sharedAccessPolicy.AccessPolicy.Expiry        The time at which the Shared Access Signature becomes expired (The UTC value will be used).
        * @param {string}                   [sasVersion]                                  An optional string indicating the desired SAS version to use. Value must be 2012-02-12 or later.
        * @param {Object}                   [headers]                                     The optional header values to set for a file returned wth this SAS.
        * @param {string}                   [headers.cacheControl]                        The optional value of the Cache-Control response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentType]                         The optional value of the Content-Type response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentEncoding]                     The optional value of the Content-Encoding response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentLanguage]                     The optional value of the Content-Language response header to be returned when this SAS is used.
        * @param {string}                   [headers.contentDisposition]                  The optional value of the Content-Disposition response header to be returned when this SAS is used.
        * @return {string}                                                                The shared access signature query string. Note this string does not contain the leading "?".
        */
        generateSharedAccessSignatureWithVersion(share: string, directory: string, file: string, sharedAccessPolicy: common.SharedAccessPolicy, sasVersion: string, headers?: common.ContentSettingsHeaders): string;

        /**
        * Retrieves a file or directory URL.
        *
        * @param {string}                   share                    The share name.
        * @param {string}                   directory                The directory name. Use '' to refer to the base directory.
        * @param {string}                   [file]                   The file name. File names may not start or end with the delimiter '/'.
        * @param {string}                   [sasToken]               The Shared Access Signature token.
        * @param {boolean}                  [primary]                A boolean representing whether to use the primary or the secondary endpoint.
        * @param {string}                   [shareSnapshotId]        The snapshot identifier of the share.
        * @return {string}                                           The formatted URL string.
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * var url = FileService.getUrl(shareName, directoryName, fileName, sasToken, true);
        */
        getUrl(share: string, directory: string, file?: string, sasToken?: string, primary?: boolean, shareSnapshotId?: string): string;

        /**
        * Returns all user-defined metadata, standard HTTP properties, and system properties for the file.
        * It does not return or modify the content of the file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information about the file.
        *                                                                         `response` will contain information related to this operation.
        */
        getFileProperties(share: string, directory: string, file: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        getFileProperties(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Returns all user-defined metadata for the specified file.
        * It does not modify or return the content of the file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information about the file.
        *                                                                         `response` will contain information related to this operation.
        */
        getFileMetadata(share: string, directory: string, file: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        getFileMetadata(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Sets user-defined properties for the specified file.
        * It does not modify or return the content of the file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.contentType]                       The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentEncoding]                   The content encodings that have been applied to the file.
        * @param {string}             [options.contentLanguage]                   The natural languages used by this resource.
        * @param {string}             [options.contentMD5]                        The file's MD5 hash.
        * @param {string}             [options.cacheControl]                      The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentDisposition]                The file's content disposition.
        * @param {string}             [options.contentLength]                     Resizes a file to the specified size. If the specified byte value is less than the current size of the file,
        *                                                                         then all ranges above the specified byte value are cleared.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information about the file.
        *                                                                         `response` will contain information related to this operation.
        */
        setFileProperties(share: string, directory: string, file: string, options: FileService.SetFilePropertiesRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        setFileProperties(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Sets user-defined metadata for the specified file as one or more name-value pairs
        * It does not modify or return the content of the file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             metadata                                    The metadata key/value pairs.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         information on the file.
        *                                                                         `response` will contain information related to this operation.
        */
        setFileMetadata(share: string, directory: string, file: string, metadata: Map<string>, options: common.RequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        setFileMetadata(share: string, directory: string, file: string, metadata: Map<string>, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Resizes a file.
        *
        * @this {FileService}
        * @param {string}               share                                       The share name.
        * @param {string}               directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}               file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {String}               size                                        The size of the file, in bytes.
        * @param {Object}               [options]                                   The request options.
        * @param {int}                  [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                  [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}               [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}                 [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}        callback                                    `error` will contain information
        *                                                                           if an error occurs; otherwise `result` will contain
        *                                                                           information about the file.
        *                                                                           `response` will contain information related to this operation.
        */
        resizeFile(share: string, directory: string, file: string, size: number, options: common.RequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        resizeFile(share: string, directory: string, file: string, size: number, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Checks whether or not a file exists on the service.
        *
        * @this {FileService}
        * @param {string}             share                                   The share name.
        * @param {string}             directory                               The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                    The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                               The request options.
        * @param {string}             [options.shareSnapshotId]               The snapshot identifier of the share.
        * @param {LocationMode}       [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to.
        *                                                                     Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                     The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                     execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]               A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                     The default value is false.
        * @param {errorOrResult}      callback                                `error` will contain information
        *                                                                     if an error occurs; otherwise `errorOrResult` will
        *                                                                     be true if the file exists, or false if the file does not exist.
        *                                                                     `response` will contain information related to this operation.
        */
        doesFileExist(share: string, directory: string, file: string, options: FileService.FileServiceOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        doesFileExist(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Creates a file of the specified length.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param {int}                length                                        The length of the file in bytes.
        * @param {Object}             [options]                                     The request options.
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}      callback                                      `error` will contain information
        *                                                                           if an error occurs; otherwise `result` will contain
        *                                                                           the directory information.
        *                                                                           `response` will contain information related to this operation.
        */
        createFile(share: string, directory: string, file: string, length: number, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        createFile(share: string, directory: string, file: string, length: number, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Marks the specified file for deletion. The file is later deleted during garbage collection.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResponse}  callback                                      `error` will contain information
        *                                                                         if an error occurs; `response` will contain information related to this operation.
        */
        deleteFile(share: string, directory: string, file: string, options: common.RequestOptions, callback: ErrorOrResponse): void;
        deleteFile(share: string, directory: string, file: string, callback: ErrorOrResponse): void;

        /**
        * Marks the specified file for deletion if it exists. The file is later deleted during garbage collection.
        *
        * @this {FileService}
        * @param {string}             share                               The share name.
        * @param {string}             directory                           The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                           The request options.
        * @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to.
        *                                                                 Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                 execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]           A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]         Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                 The default value is false.
        * @param {errorOrResult}      callback                            `error` will contain information
        *                                                                 if an error occurs; otherwise `result` will
        *                                                                 be true if the file was deleted, or false if the file
        *                                                                 does not exist.
        *                                                                 `response` will contain information related to this operation.
        */
        deleteFileIfExists(share: string, directory: string, file: string, options: common.RequestOptions, callback: ErrorOrResult<boolean>): void;
        deleteFileIfExists(share: string, directory: string, file: string, callback: ErrorOrResult<boolean>): void;

        /**
        * Downloads a file into a text string.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {int}                [options.rangeStart]                        The range start.
        * @param {int}                [options.rangeEnd]                          The range end.
        * @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading files.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {FileService~FileToText}  callback                               `error` will contain information
        *                                                                         if an error occurs; otherwise `text` will contain the file contents,
        *                                                                         and `file` will contain the file information.
        *                                                                         `response` will contain information related to this operation.
        */
        getFileToText(share: string, directory: string, file: string, options: FileService.GetFileRequestOptions, callback: FileService.FileToText): void;
        getFileToText(share: string, directory: string, file: string, callback: FileService.FileToText): void;

        /**
        * Downloads an Azure file into a file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {string}             localFileName                               The local path to the file to be downloaded.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {string}             [options.rangeStart]                        Return only the bytes of the file in the specified range.
        * @param {string}             [options.rangeEnd]                          Return only the bytes of the file in the specified range.
        * @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
        * @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading files.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information if an error occurs;
        *                                                                         otherwise `result` will contain the file information.
        *                                                                         `response` will contain information related to this operation.
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * FileService.getFileToLocalFile('taskshare', taskdirectory', 'task1', 'task1-download.txt', function(error, serverFile) {
        *   if(!error) {
        *     // file available in serverFile.file variable
        *   }
        */
        getFileToLocalFile(share: string, directory: string, file: string, localFileName: string, options: FileService.GetFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        getFileToLocalFile(share: string, directory: string, file: string, localFileName: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Provides a stream to read from a file.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {string}             [options.rangeStart]                        Return only the bytes of the file in the specified range.
        * @param {string}             [options.rangeEnd]                          Return only the bytes of the file in the specified range.
        * @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
        * @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading files.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information if an error occurs;
        *                                                                         otherwise `result` will contain the file information.
        *                                                                         `response` will contain information related to this operation.
        * @return {Readable}                                                      A Node.js Readable stream.
        * @example
        * var azure = require('azure-storage');
        * var fileService = azure.createFileService();
        * var writable = fs.createWriteStream(destinationFileNameTarget);
        * fileService.createReadStream(shareName, directoryName, fileName).pipe(writable);
        */
        createReadStream(share: string, directory: string, file: string, options: FileService.GetFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): stream.Readable;
        createReadStream(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): stream.Readable;

        /**
        * Downloads a file into a stream.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Writable}           writeStream                                 The Node.js Writable stream.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {string}             [options.rangeStart]                        Return only the bytes of the file in the specified range.
        * @param {string}             [options.rangeEnd]                          Return only the bytes of the file in the specified range.
        * @param {boolean}            [options.useTransactionalMD5]               When set to true, Calculate and send/validate content MD5 for transactions.
        * @param {boolean}            [options.disableContentMD5Validation]       When set to true, MD5 validation will be disabled when downloading files.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information if an error occurs;
        *                                                                         otherwise `result` will contain the file information.
        *                                                                         `response` will contain information related to this operation.
        *
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * FileService.getFileToStream('taskshare', taskdirectory', 'task1', fs.createWriteStream('task1-download.txt'), function(error, serverFile) {
        *   if(!error) {
        *     // file available in serverFile.file variable
        *   }
        * });
        */
        getFileToStream(share: string, directory: string, file: string, writeStream: stream.Writable, options: FileService.GetFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;
        getFileToStream(share: string, directory: string, file: string, writeStream: stream.Writable, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;

        /**
        * Lists file ranges. Lists all of the ranges by default, or only the ranges over a specific range of bytes if rangeStart and rangeEnd are specified.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                   The request options.
        * @param {string}             [options.shareSnapshotId]                   The snapshot identifier of the share.
        * @param {int}                [options.rangeStart]                        The range start.
        * @param {int}                [options.rangeEnd]                          The range end.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the range information.
        *                                                                         `response` will contain information related to this operation.
        */
        listRanges(share: string, directory: string, file: string, options: FileService.ListRangeRequestOptions, callback: ErrorOrResult<common.Range[]>): void;
        listRanges(share: string, directory: string, file: string, callback: ErrorOrResult<common.Range[]>): void;

        /**
        * Clears a range. Clears all of the ranges by default, or only the ranges over a specific range of bytes if rangeStart and rangeEnd are specified.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {int}                rangeStart                                  The range start.
        * @param {int}                rangeEnd                                    The range end.
        * @param {Object}             [options]                                   The request options.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the directory information.
        *                                                                        `response` will contain information related to this operation.
        */
        clearRange(share: string, directory: string, file: string, rangeStart: number, rangeEnd: number, options: common.RequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        clearRange(share: string, directory: string, file: string, rangeStart: number, rangeEnd: number, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Updates a range from a stream.
        *
        * @this {FileService}
        * @param {string}             share                                       The share name.
        * @param {string}             directory                                   The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                        The file name. File names may not start or end with the delimiter '/'.
        * @param {Readable}           readStream                                  The Node.js Readable stream.
        * @param {int}                rangeStart                                  The range start.
        * @param {int}                rangeEnd                                    The range end.
        * @param {Object}             [options]                                   The request options.
        * @param {bool}               [options.useTransactionalMD5]               Calculate and send/validate content MD5 for transactions.
        * @param {string}             [options.transactionalContentMD5]           An optional hash value used to ensure transactional integrity for the page.
        * @param {LocationMode}       [options.locationMode]                      Specifies the location mode used to decide which location the request should be sent to.
        *                                                                         Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]               The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]          The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                         The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                         execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                   A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                 Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                         The default value is false.
        * @param {errorOrResult}      callback                                    `error` will contain information
        *                                                                         if an error occurs; otherwise `result` will contain
        *                                                                         the file information.
        *                                                                         `response` will contain information related to this operation.
        */
        createRangesFromStream(share: string, directory: string, file: string, readStream: stream.Readable, rangeStart: number, rangeEnd: number, options: FileService.CreateRangeRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        createRangesFromStream(share: string, directory: string, file: string, readStream: stream.Readable, rangeStart: number, rangeEnd: number, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Uploads a file from a text string.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param {string|object}      text                                          The file text, as a string or in a Buffer.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads.
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {ErrorOrResult}  callback                                          `error` will contain information
        *                                                                           if an error occurs; `result` will contain the file information.
        *                                                                           `response` will contain information related to this operation.
        */
        createFileFromText(share: string, directory: string, file: string, text: string | Buffer, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        createFileFromText(share: string, directory: string, file: string, text: string | Buffer, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Uploads a file to storage from a local file.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param (string)             localFileName                                 The local path to the file to be uploaded.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads.
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}      callback                                      The callback function.
        * @return {SpeedSummary}
        */
        createFileFromLocalFile(share: string, directory: string, file: string, localFileName: string, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;
        createFileFromLocalFile(share: string, directory: string, file: string, localFileName: string, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;

        /**
        * Uploads a file to storage from an HTML File object. If the file already exists on the service, it will be overwritten.
        * (Only available in the JavaScript Client Library for Browsers)
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             browserFile                                   The File object to be uploaded created by HTML File API.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads. 
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
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
        createFileFromBrowserFile(share: string, directory: string, file: string, browserFile: Object, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;
        createFileFromBrowserFile(share: string, directory: string, file: string, browserFile: Object, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary; 

        /**
        * Uploads a file from a stream.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param (Stream)             stream                                        Stream to the data to store.
        * @param {int}                streamLength                                  The length of the stream to upload.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads.
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}      callback                                      The callback function.
        * @return {SpeedSummary}
        */
        createFileFromStream(share: string, directory: string, file: string, stream: stream.Readable, streamLength: number, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;
        createFileFromStream(share: string, directory: string, file: string, stream: stream.Readable, streamLength: number, callback: ErrorOrResult<FileService.FileResult>): common.streams.speedsummary.SpeedSummary;

        /**
        * Provides a stream to write to a file. Assumes that the file exists.
        * If it does not, please create the file using createFile before calling this method or use createWriteStreamNewFile.
        * Please note the `Stream` returned by this API should be used with piping.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads.
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}      callback                                      The callback function.
        * @return {Writable}                                                        A Node.js Writable stream.
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * FileService.createFile(shareName, directoryName, fileName, 1024, function (err) {
        *   // Pipe file to a file
        *   var stream = fs.createReadStream(fileNameTarget).pipe(FileService.createWriteStreamToExistingFile(shareName, directoryName, fileName));
        * });
        */
        createWriteStreamToExistingFile(share: string, directory: string, file: string, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): stream.Writable;
        createWriteStreamToExistingFile(share: string, directory: string, file: string, callback: ErrorOrResult<FileService.FileResult>): stream.Writable;

        /**
        * Provides a stream to write to a file. Creates the file before writing data.
        * Please note the `Stream` returned by this API should be used with piping.
        *
        * @this {FileService}
        * @param {string}             share                                         The share name.
        * @param {string}             directory                                     The directory name. Use '' to refer to the base directory.
        * @param {string}             file                                          The file name. File names may not start or end with the delimiter '/'.
        * @param {string}             length                                        The file length.
        * @param {Object}             [options]                                     The request options.
        * @param {SpeedSummary}       [options.speedSummary]                        The download tracker objects;
        * @param {Object}             [options.metadata]                            The metadata key/value pairs.
        * @param {bool}               [options.storeFileContentMD5]                 Specifies whether the file's ContentMD5 header should be set on uploads.
        *                                                                           The default value is false for files.
        * @param {bool}               [options.useTransactionalMD5]                 Calculate and send/validate content MD5 for transactions.
        * @param {Object}             [options.contentSettings]                     The file's content settings.
        * @param {string}             [options.contentSettings.contentType]         The MIME content type of the file. The default type is application/octet-stream.
        * @param {string}             [options.contentSettings.contentEncoding]     The content encodings that have been applied to the file.
        * @param {string}             [options.contentSettings.contentLanguage]     The natural languages used by this resource.
        * @param {string}             [options.contentSettings.cacheControl]        The file service stores this value but does not use or modify it.
        * @param {string}             [options.contentSettings.contentDisposition]  The file's content disposition.
        * @param {string}             [options.contentSettings.contentMD5]          The file's MD5 hash.
        * @param {LocationMode}       [options.locationMode]                        Specifies the location mode used to decide which location the request should be sent to.
        *                                                                           Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]                 The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]            The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                           The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                           execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                     A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]                   Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                           The default value is false.
        * @param {errorOrResult}      callback                                      The callback function.
        * @return {Writable}                                                        A Node.js Writable stream.
        * @example
        * var azure = require('azure-storage');
        * var FileService = azure.createFileService();
        * var stream = fs.createReadStream(fileNameTarget).pipe(FileService.createWriteStreamToNewFile(shareName, directoryName, fileName));
        */
        createWriteStreamToNewFile(share: string, directory: string, file: string, length: number, options: FileService.CreateFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): stream.Writable;
        createWriteStreamToNewFile(share: string, directory: string, file: string, length: number, callback: ErrorOrResult<FileService.FileResult>): stream.Writable;

        /**
        * Starts to copy a file to a destination within the storage account.
        *
        * @this {FileService}
        * @param {string}             sourceUri                                 The source file or blob URI.
        * @param {string}             targetShare                               The target share name.
        * @param {string}             targetDirectory                           The target directory name.
        * @param {string}             targetFile                                The target file name.
        * @param {Object}             [options]                                 The request options.
        * @param {Object}             [options.metadata]                        The target file metadata key/value pairs.
        * @param {AccessConditions}   [options.accessConditions]                The access conditions.
        * @param {AccessConditions}   [options.sourceAccessConditions]          The source access conditions.
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResult}      callback                                  `error` will contain information
        *                                                                       if an error occurs; otherwise `result` will contain
        *                                                                       the file information.
        *                                                                       `response` will contain information related to this operation.
        */
        startCopyFile(sourceUri: string, targetshare: string, targetdirectory: string, targetfile: string, options: FileService.CopyFileRequestOptions, callback: ErrorOrResult<FileService.FileResult>): void;
        startCopyFile(sourceUri: string, targetshare: string, targetdirectory: string, targetfile: string, callback: ErrorOrResult<FileService.FileResult>): void;

        /**
        * Abort a file copy operation.
        *
        * @this {FileService}
        * @param {string}             share                                     The destination share name.
        * @param {string}             directory                                 The destination directory name.
        * @param {string}             file                                      The destination file name.
        * @param {string}             copyId                                    The copy operation identifier.
        * @param {Object}             [options]                                 The request options.
        * @param {LocationMode}       [options.locationMode]                    Specifies the location mode used to decide which location the request should be sent to.
        *                                                                       Please see StorageUtilities.LocationMode for the possible values.
        * @param {int}                [options.timeoutIntervalInMs]             The server timeout interval, in milliseconds, to use for the request.
        * @param {int}                [options.maximumExecutionTimeInMs]        The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
        *                                                                       The maximum execution time interval begins at the time that the client begins building the request. The maximum
        *                                                                       execution time is checked intermittently while performing requests, and before executing retries.
        * @param {string}             [options.clientRequestId]                 A string that represents the client request ID with a 1KB character limit.
        * @param {bool}               [options.useNagleAlgorithm]               Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
        *                                                                       The default value is false.
        * @param {errorOrResponse}    callback                                  `error` will contain information if an error occurs.
        *                                                                       `response` will contain information related to this operation.
        */
        abortCopyFile(share: string, directory: string, file: string, copyId: string, options: common.RequestOptions, callback: ErrorOrResponse): void;
        abortCopyFile(share: string, directory: string, file: string, copyId: string, callback: ErrorOrResponse): void;
      }

      export module FileService {
        export interface ListSharesResult {
          entries: ShareResult[];
          continuationToken?: common.ContinuationToken
        }

        export interface ListFilesAndDirectoriesResult {
          entries: {
            directories: DirectoryResult[];
            files: FileResult[];
          }
          continuationToken?: common.ContinuationToken;
        }

        export interface ShareResult {
          name: string;
          snapshot?: string;
          etag: string;
          lastModified: string;
          metadata?: { [key: string]: string; };
          requestId?: string;
          quota?: string;
          shareStats? : {
            shareUsage?: string;
          }
          exists?: boolean;
          created?: boolean;
        }
        
        export interface ShareAclResult extends ShareResult {
          signedIdentifiers?: Map<common.AccessPolicy>
        }

        export interface DirectoryResult {
          name: string;
          etag: string;
          lastModified: string;
          requestId?: string;
          metadata?: { [key: string]: string; };
          serverEncrypted?: string;
          exists?: boolean;
          created?: boolean;
        }

        export interface FileResult {
          share: string;
          directory: string;
          name: string;
          etag: string;
          lastModified: string;
          requestId?: string;
          acceptRanges: string;
          contentRange: string;
          contentLength: string;
          metadata?: { [key: string]: string; };
          serverEncrypted?: string;
          contentSettings?:{
            contentEncoding: string;
            contentLanguage: string;
            contentType: string;
            cacheControl: string;
            contentDisposition: string;
            contentMD5: string;
          }
          copy?: {
            id?: string;
            source?: string;
            status?: string;
            completionTime?: string;
            statusDescription?: string;
            progress?: string;
          };
          exists?: boolean;
          created?: boolean;
        }

        export interface ShareProperties {
          quota: number
        }

        export interface FileServiceOptions extends common.RequestOptions {
          shareSnapshotId?: string;
        }

        export interface DeleteShareOptions extends FileServiceOptions {
          deleteSnapshots?: string;
        }

        export interface ListRangeRequestOptions extends FileServiceOptions {
          rangeStart?: number;
          rangeEnd?: number;
        }

        export interface GetFileRequestOptions extends FileServiceOptions {
          parallelOperationThreadCount?: number;
          rangeStart?: number;
          rangeEnd?: number;
          useTransactionalMD5?: boolean;
          disableContentMD5Validation?: boolean;
        }

        export interface ListRequestOptions extends FileServiceOptions {
          maxResults?: number;
          include?: string;
        }

        export interface ListShareRequestOptions extends common.RequestOptions {
          maxResults?: number;
          include?: string;
        }
        
        export interface CreateShareRequestOptions extends common.RequestOptions {
          quota?: string | number;
        }
        
        export interface CreateFileRequestOptions extends common.RequestOptions {
          speedsummary?: common.streams.speedsummary.SpeedSummary;
          metadata?: { [key: string]: string; };
          contentSettings?: {
            contentType?: string;
            contentEncoding?: string;
            contentLanguage?: string;
            contentMD5?: string;
            cacheControl?: string;
            contentDisposition?: string;
          };
          useTransactionalMD5?: boolean;
          storeFileContentMD5?: boolean;
        }
        
        export interface CopyFileRequestOptions extends common.RequestOptions {
          metadata?: { [key: string]: string; };
          accessConditions?: AccessConditions;
          sourceAccessConditions?: AccessConditions;
        }
        
        export interface CreateRangeRequestOptions extends common.RequestOptions {
          useTransactionalMD5?: boolean;
          transactionalContentMD5?: string;
        }
        
        export interface CreateDirectoryRequestOptions extends common.RequestOptions {
          metadata?: { [key: string]: string; };
        }
        
        export interface SetFilePropertiesRequestOptions extends common.RequestOptions {
          contentType?: string;
          contentEncoding?: string;
          contentLanguage?: string;
          contentMD5?: string;
          cacheControl?: string;
          contentDisposition?: string;
        }
          
        export interface FileToText {
          (error: Error, text: string, result: FileResult, response: ServiceResponse): void
        }
      }

      export var FileService: {
        /**
        * Creates a new FileService object.
        * If no connection string or storageaccount and storageaccesskey are provided,
        * the AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY environment variables will be used.
        * @class
        * The FileService class is used to perform operations on the Microsoft Azure File Service.
        * The File Service provides storage for binary large objects, and provides functions for working with data stored in files.
        * 
        * For more information on the File Service, as well as task focused information on using it in a Node.js application, see
        * [How to Use the File Service from Node.js](http://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-file-storage/).
        * The following defaults can be set on the file service.
        * defaultTimeoutIntervalInMs                          The default timeout interval, in milliseconds, to use for request made via the file service.
        * defaultEnableReuseSocket                            The default boolean value to enable socket reuse when uploading local files or streams.
        *                                                     If the Node.js version is lower than 0.10.x, socket reuse will always be turned off.
        * defaultClientRequestTimeoutInMs                     The default timeout of client requests, in milliseconds, to use for the request made via the file service.
        * defaultMaximumExecutionTimeInMs                     The default maximum execution time across all potential retries, for requests made via the file service.
        * defaultLocationMode                                 The default location mode for requests made via the file service.
        * parallelOperationThreadCount                        The number of parallel operations that may be performed when uploading a file.
        * useNagleAlgorithm                                   Determines whether the Nagle algorithm is used for requests made via the file service; true to use the  
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
        new (storageAccountOrConnectionString?: string, storageAccessKey?: string, host?: string|StorageHost, sasToken?: string, endpointSuffix?: string): FileService;
      }

      // ###########################
      // ./services/file/fileutilities
      // ###########################
      export module FileUtilities {
        var SharedAccessPermissions: {
          READ: string;
          CREATE: string;
          WRITE: string;
          DELETE: string;
          LIST: string;
        };

        var ListingDetails: {
          METADATA: string;
        };

        var SharePublicAccessType: {
          OFF: string;
          SHARE: string;
          FILE: string;
        };

        var ShareSnapshotDeleteOptions: {
          SHARE_AND_SNAPSHOTS: string
        };
      }
    }
  }

  module common {
    module filters {
      
      export interface IFilter {
        handle(requestOptions: common.RequestOptions, next: Next) : void
      }
      
      export interface Next {
        (returnedObject: any, finalCallback: Post, nextPostCallback: Post) : void;
      }
      
      export interface Post {
        (returnedObject: any) : void;
      }
      
      // ###########################
      // ./common/filters/retrypolicyfilter
      // ###########################
      module retrypolicyfilter {
        export interface RetryPolicyFilter extends RetryPolicyFilter.IRetryPolicy {
          retryCount: number;
          retryInterval: number;
          /**
          * Creates a new RetryPolicyFilter instance.
          * @class
          * The RetryPolicyFilter allows you to retry operations,
          * using a custom retry policy. Users are responsible to
          * define the shouldRetry method.
          * To apply a filter to service operations, use `withFilter`
          * and specify the filter to be used when creating a service.
          * @constructor
          * @param {number} [retryCount=30000]        The client retry count.
          * @param {number} [retryInterval=3]     The client retry interval, in milliseconds.
          *
          * @example
          * var azure = require('azure-storage');
          * var retryPolicy = new azure.RetryPolicyFilter();
          * retryPolicy.retryCount = 3;
          * retryPolicy.retryInterval = 3000;
          * retryPolicy.shouldRetry = function(statusCode, retryRequestOption) {
          *
          * };
          * var blobService = azure.createBlobService().withFilter(retryPolicy);
          */
          constructor(retryCount?: number, retryInterval?: number): RetryPolicyFilter;
          
          shouldRetry(statusCode: number, retryData: RetryPolicyFilter.IRetryRequestOptions): {
            retryInterval: number;
            retryable: boolean;
          };
        }
        export module RetryPolicyFilter {
          /**
          * Represents the default client retry interval, in milliseconds.
          */
          export var DEFAULT_CLIENT_RETRY_INTERVAL: number;
          /**
          * Represents the default client retry count.
          */
          export var DEFAULT_CLIENT_RETRY_COUNT: number;

          export interface IRetryRequestOptions {
            retryInterval: number;
            locationMode: StorageUtilities.LocationMode;
            currentLocation: Constants.StorageLocation;
            retryContext: IRetryContext;
          }
          export interface IRetryContext {
            retryCount: number;
            error: Error;
            retryInterval: number;
            locationMode: StorageUtilities.LocationMode;
            currentLocation: Constants.StorageLocation;
          }
          export interface IRetryPolicy extends IFilter {
            retryInterval: number;
            shouldRetry(statusCode: number, retryData: IRetryRequestOptions): {
              retryInterval: number;
              retryable: boolean;
            };
          }
        }
      }

      // ###########################
      // ./common/filters/linearretrypolicyfilter
      // ###########################
      module linearretrypolicyfilter {
        export class LinearRetryPolicyFilter implements RetryPolicyFilter.IRetryPolicy {
          retryCount: number;
          retryInterval: number;
          /**
          * Creates a new LinearRetryPolicyFilter instance.
          * @class
          * The LinearRetryPolicyFilter allows you to retry operations,
          * using an linear back-off interval between retries.
          * To apply a filter to service operations, use `withFilter`
          * and specify the filter to be used when creating a service.
          * @constructor
          * @param {number} [retryCount=30000]        The client retry count.
          * @param {number} [retryInterval=3]     The client retry interval, in milliseconds.
          *
          * @example
          * var azure = require('azure-storage');
          * var retryOperations = new azure.LinearRetryPolicyFilter();
          * var blobService = azure.createBlobService().withFilter(retryOperations)
          */
          constructor(retryCount?: number, retryInterval?: number);
          /**
          * Represents the default client retry interval, in milliseconds.
          */
          static DEFAULT_CLIENT_RETRY_INTERVAL: number;
          /**
          * Represents the default client retry count.
          */
          static DEFAULT_CLIENT_RETRY_COUNT: number;
          /**
          * Determines if the operation should be retried and how long to wait until the next retry.
          *
            * @param {number} statusCode The HTTP status code.
            * @param {Object} retryData  The retry data.
            * @return {retryInfo} Information about whether the operation qualifies for a retry and the retryInterval.
          */
          shouldRetry(statusCode: number, retryData: RetryPolicyFilter.IRetryRequestOptions): {
            retryInterval: number;
            retryable: boolean;
          };
          handle(requestOptions: common.RequestOptions, next: Next) : void
        }
      }

      // ###########################
      // ./common/filters/exponentialretrypolicyfilter
      // ###########################
      module exponentialretrypolicyfilter {
        export class ExponentialRetryPolicyFilter implements RetryPolicyFilter.IRetryPolicy {
          retryCount: number;
          retryInterval: number;
          minRetryInterval: number;
          maxRetryInterval: number;
          /**
          * Creates a new 'ExponentialRetryPolicyFilter' instance.
          * @class
          * The ExponentialRetryPolicyFilter allows you to retry operations,
          * using an exponential back-off interval between retries.
          * To apply a filter to service operations, use `withFilter`
          * and specify the filter to be used when creating a service.
          * @constructor
          * @param {number} [retryCount=3]        The client retry count.
          * @param {number} [retryInterval=30000]     The client retry interval, in milliseconds.
          * @param {number} [minRetryInterval=3000]  The minimum retry interval, in milliseconds.
          * @param {number} [maxRetryInterval=90000]  The maximum retry interval, in milliseconds.
          *
          * @example
          * var azure = require('azure-storage');
          * var retryOperations = new azure.ExponentialRetryPolicyFilter();
          * var blobService = azure.createBlobService().withFilter(retryOperations)
          */
          constructor(retryCount?: number, retryInterval?: number, minRetryInterval?: number, maxRetryInterval?: number);
          /**
          * Represents the default client retry interval, in milliseconds.
          */
          static DEFAULT_CLIENT_RETRY_INTERVAL: number;
          /**
          * Represents the default client retry count.
          */
          static DEFAULT_CLIENT_RETRY_COUNT: number;
          /**
          * Represents the default maximum retry interval, in milliseconds.
          */
          static DEFAULT_CLIENT_MAX_RETRY_INTERVAL: number;
          /**
          * Represents the default minimum retry interval, in milliseconds.
          */
          static DEFAULT_CLIENT_MIN_RETRY_INTERVAL: number;
          /**
           * Determines if the operation should be retried and how long to wait until the next retry.
           *
           * @param {number} statusCode The HTTP status code.
           * @param {Object} retryData  The retry data.
           * @return {retryInfo} Information about whether the operation qualifies for a retry and the retryInterval.
           */
          shouldRetry(statusCode: number, retryData: RetryPolicyFilter.IRetryRequestOptions): {
            retryInterval: number;
            retryable: boolean;
          };
          handle(requestOptions: common.RequestOptions, next: Next) : void
        }
      }
    }

    module util {

      // ###########################
      // ./common/util/constants
      // ###########################
      module constants {
        export var USER_AGENT_PRODUCT_NAME: string;
        export var USER_AGENT_PRODUCT_VERSION: string;
        /**
        * The number of default concurrent requests for parallel operation.
        *
        * @const
        * @type {string}
        */
        export var DEFAULT_PARALLEL_OPERATION_THREAD_COUNT: number;
        /**
        * The boolean of default value for enabling reuseSocket.
        *
        * @const
        * @type {bool}
        */
        export var DEFAULT_ENABLE_REUSE_SOCKET: boolean;        
        /**
        * Constant representing a kilobyte (Non-SI version).
        *
        * @const
        * @type {string}
        */
        export var KB: number;
        /**
        * Constant representing a megabyte (Non-SI version).
        *
        * @const
        * @type {string}
        */
        export var MB: number;
        /**
        * Constant representing a gigabyte (Non-SI version).
        *
        * @const
        * @type {string}
        */
        export var GB: number;
        /**
        * Specifies HTTP.
        *
        * @const
        * @type {string}
        */
        export var HTTP: string;
        /**
        * Specifies HTTPS.
        *
        * @const
        * @type {string}
        */
        export var HTTPS: string;
        /**
        * Marker for atom metadata.
        *
        * @const
        * @type {string}
        */
        export var XML_METADATA_MARKER: string;
        /**
        * Marker for atom value.
        *
        * @const
        * @type {string}
        */
        export var XML_VALUE_MARKER: string;
        /**
        * Specifies the location used to indicate which location the operation can be performed against.
        *
        * @const
        * @enum
        */
        export enum RequestLocationMode {
          PRIMARY_ONLY = 0,
          SECONDARY_ONLY = 1,
          PRIMARY_OR_SECONDARY = 2,
        }
        /**
        * Represents a storage service location.
        *
        * @const
        * @enum
        */
        export enum StorageLocation {
          PRIMARY = 0,
          SECONDARY = 1,
        }
        
        export var AccountSasConstants: {
          /**
          * Permission types
          *
          * @const
          * @enum {string}
          */
          Permissions: {
            READ: string,
            ADD: string,
            CREATE: string,
            UPDATE: string,
            PROCESS: string,
            WRITE: string,
            DELETE: string,
            LIST: string
          },
          
          /**
          * Services types
          *
          * @const
          * @enum {string}
          */
          Services: {
            BLOB: string,
            FILE: string,
            QUEUE: string,
            TABLE: string,
          },
          
          /**
          * Resources types
          *
          * @const
          * @enum {string}
          */
          Resources: {
            SERVICE: string,
            CONTAINER: string,
            OBJECT: string
          },
          
          Protocols: {
            HTTPSONLY: string,
            HTTPSORHTTP: string
          },
        };
        
        /**
        * Defines constants for use with shared access policies.
        */
        export var AclConstants: {
          ACCESS_POLICY: string;
          EXPIRY: string;
          ID: string;
          PERMISSION: string;
          SIGNED_IDENTIFIER_ELEMENT: string;
          SIGNED_IDENTIFIERS_ELEMENT: string;
          START: string;
        };
        /**
        * Defines constants for use with service properties.
        */
        export var ServicePropertiesConstants: {
          STORAGE_SERVICE_PROPERTIES_ELEMENT: string;
          DEFAULT_ANALYTICS_VERSION: string;
          LOGGING_ELEMENT: string;
          VERSION_ELEMENT: string;
          DELETE_ELEMENT: string;
          READ_ELEMENT: string;
          WRITE_ELEMENT: string;
          RETENTION_POLICY_ELEMENT: string;
          ENABLED_ELEMENT: string;
          DAYS_ELEMENT: string;
          HOUR_METRICS_ELEMENT: string;
          MINUTE_METRICS_ELEMENT: string;
          CORS_ELEMENT: string;
          CORS_RULE_ELEMENT: string;
          ALLOWED_ORIGINS_ELEMENT: string;
          ALLOWED_METHODS_ELEMENT: string;
          MAX_AGE_IN_SECONDS_ELEMENT: string;
          EXPOSED_HEADERS_ELEMENT: string;
          ALLOWED_HEADERS_ELEMENT: string;
          INCLUDE_APIS_ELEMENT: string;
          DEFAULT_SERVICE_VERSION_ELEMENT: string;
          DEFAULT_DELETE_RETENTION_POLICY_ELEMENT: string;
        };
        /**
        * Defines constants for use with blob operations.
        */
        export var BlobConstants: {
          LATEST_ELEMENT: string;
          UNCOMMITTED_ELEMENT: string;
          BLOCK_LIST_ELEMENT: string;
          COMMITTED_ELEMENT: string;
          DEFAULT_WRITE_PAGE_SIZE_IN_BYTES: number;
          MIN_WRITE_PAGE_SIZE_IN_BYTES: number;
          DEFAULT_SINGLE_BLOB_PUT_THRESHOLD_IN_BYTES: number;
          DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES: number;
          MAX_BLOCK_SIZE: number;
          MAX_SINGLE_UPLOAD_BLOB_SIZE_IN_BYTES: number;
          MAX_RANGE_GET_SIZE_WITH_MD5: number;
          MAX_UPDATE_PAGE_SIZE: number;
          MAX_QUEUED_WRITE_DISK_BUFFER_SIZE: number;
          MAX_SINGLE_GET_PAGE_RANGE_SIZE: number;
          PAGE_SIZE: number;
          ResourceTypes: {
            CONTAINER: string;
            BLOB: string;
          };
          PageWriteOptions: {
            UPDATE: string;
            CLEAR: string;
          };
          BlobTypes: {
            BLOCK: string;
            PAGE: string;
          };
          LeaseOperation: {
            ACQUIRE: string;
            RENEW: string;
            CHANGE: string;
            RELEASE: string;
            BREAK: string;
          };
        };
        /**
        * Defines constants for use with file operations.
        */
        export var FileConstants: {
          DEFAULT_WRITE_SIZE_IN_BYTES: number;
          MAX_RANGE_GET_SIZE_WITH_MD5: number;
          MAX_UPDATE_FILE_SIZE: number;
          DEFAULT_SINGLE_FILE_GET_THRESHOLD_IN_BYTES: number;
          MIN_WRITE_FILE_SIZE_IN_BYTES: number;
          RangeWriteOptions: {
            UPDATE: string;
            CLEAR: string;
          };
        };
        /**
        * Defines constants for use with queue storage.
        *
        * @const
        * @type {string}
        */
        export var QueueConstants: {
          QUEUE_MESSAGE_ELEMENT: string;
          MESSAGE_TEXT_ELEMENT: string;
        };
        /**
        * Defines constants for use with table storage.
        *
        * @const
        * @type {string}
        */
        export var TableConstants: {
          CHANGESET_DELIMITER: string;
          BATCH_DELIMITER: string;
          CONTINUATION_NEXT_ROW_KEY: string;
          CONTINUATION_NEXT_PARTITION_KEY: string;
          CONTINUATION_NEXT_TABLE_NAME: string;
          NEXT_ROW_KEY: string;
          NEXT_PARTITION_KEY: string;
          NEXT_TABLE_NAME: string;
          ODATA_PREFIX: string;
          ODATA_TYPE_SUFFIX: string;
          ODATA_METADATA_MARKER: string;
          ODATA_VALUE_MARKER: string;
          ODATA_TYPE_MARKER: string;
          DEFAULT_DATA_SERVICE_VERSION: string;
          TABLE_NAME: string;
          TABLE_SERVICE_TABLE_NAME: string;
          Operations: {
            RETRIEVE: string;
            INSERT: string;
            UPDATE: string;
            MERGE: string;
            DELETE: string;
            INSERT_OR_REPLACE: string;
            INSERT_OR_MERGE: string;
          };
        };
        /**
        * Defines constants for use with HTTP headers.
        */
        export var HeaderConstants: {
          ACCEPT_RANGES: string;
          CONTENT_TRANSFER_ENCODING_HEADER: string;
          TRANSFER_ENCODING_HEADER: string;
          SERVER_HEADER: string;
          LOCATION_HEADER: string;
          LAST_MODIFIED: string;
          DATA_SERVICE_VERSION: string;
          MAX_DATA_SERVICE_VERSION: string;
          PREFIX_FOR_STORAGE_HEADER: string;
          CLIENT_REQUEST_ID_HEADER: string;
          APPROXIMATE_MESSAGES_COUNT: string;
          AUTHORIZATION: string;
          BLOB_PUBLIC_ACCESS_HEADER: string;
          BLOB_TYPE_HEADER: string;
          TYPE_HEADER: string;
          BLOCK_BLOB: string;
          CACHE_CONTROL: string;
          BLOB_CACHE_CONTROL_HEADER: string;
          CACHE_CONTROL_HEADER: string;
          COPY_STATUS: string;
          COPY_COMPLETION_TIME: string;
          COPY_STATUS_DESCRIPTION: string;
          COPY_ID: string;
          COPY_PROGRESS: string;
          COPY_ACTION: string;
          CONTENT_ID: string;
          CONTENT_ENCODING: string;
          BLOB_CONTENT_ENCODING_HEADER: string;
          CONTENT_ENCODING_HEADER: string;
          CONTENT_LANGUAGE: string;
          BLOB_CONTENT_LANGUAGE_HEADER: string;
          CONTENT_LANGUAGE_HEADER: string;
          CONTENT_LENGTH: string;
          BLOB_CONTENT_LENGTH_HEADER: string;
          CONTENT_LENGTH_HEADER: string;
          CONTENT_DISPOSITION: string;
          BLOB_CONTENT_DISPOSITION_HEADER: string;
          CONTENT_DISPOSITION_HEADER: string;
          CONTENT_MD5: string;
          BLOB_CONTENT_MD5_HEADER: string;
          CONTENT_MD5_HEADER: string;
          CONTENT_RANGE: string;
          CONTENT_TYPE: string;
          BLOB_CONTENT_TYPE_HEADER: string;
          CONTENT_TYPE_HEADER: string;
          COPY_SOURCE_HEADER: string;
          DATE: string;
          DATE_HEADER: string;
          DELETE_SNAPSHOT_HEADER: string;
          ETAG: string;
          IF_MATCH: string;
          IF_MODIFIED_SINCE: string;
          IF_NONE_MATCH: string;
          IF_UNMODIFIED_SINCE: string;
          INCLUDE_SNAPSHOTS_VALUE: string;
          JSON_CONTENT_TYPE_VALUE: string;
          LEASE_ID_HEADER: string;
          LEASE_BREAK_PERIOD: string;
          PROPOSED_LEASE_ID: string;
          LEASE_DURATION: string;
          SOURCE_LEASE_ID_HEADER: string;
          LEASE_TIME_HEADER: string;
          LEASE_STATUS: string;
          LEASE_STATE: string;
          PAGE_BLOB: string;
          PAGE_WRITE: string;
          FILE_WRITE: string;
          PREFER: string;
          PREFER_CONTENT: string;
          PREFER_NO_CONTENT: string;
          PREFIX_FOR_STORAGE_METADATA: string;
          PREFIX_FOR_STORAGE_PROPERTIES: string;
          RANGE: string;
          RANGE_GET_CONTENT_MD5: string;
          RANGE_HEADER_FORMAT: string;
          REQUEST_ID_HEADER: string;
          SEQUENCE_NUMBER: string;
          SEQUENCE_NUMBER_EQUAL: string;
          SEQUENCE_NUMBER_LESS_THAN: string;
          SEQUENCE_NUMBER_LESS_THAN_OR_EQUAL: string;
          SEQUENCE_NUMBER_ACTION: string;
          SIZE: string;
          SNAPSHOT_HEADER: string;
          SNAPSHOTS_ONLY_VALUE: string;
          SOURCE_IF_MATCH_HEADER: string;
          SOURCE_IF_MODIFIED_SINCE_HEADER: string;
          SOURCE_IF_NONE_MATCH_HEADER: string;
          SOURCE_IF_UNMODIFIED_SINCE_HEADER: string;
          STORAGE_RANGE_HEADER: string;
          STORAGE_VERSION_HEADER: string;
          TARGET_STORAGE_VERSION: string;
          USER_AGENT: string;
          POP_RECEIPT_HEADER: string;
          TIME_NEXT_VISIBLE_HEADER: string;
          APPROXIMATE_MESSAGE_COUNT_HEADER: string;
          LEASE_ACTION_HEADER: string;
          ACCEPT_HEADER: string;
          ACCEPT_CHARSET_HEADER: string;
          HOST_HEADER: string;
          CORRELATION_ID_HEADER: string;
          GROUP_ID_HEADER: string;
        };
        export var QueryStringConstants: {
          API_VERSION: string;
          COMP: string;
          RESTYPE: string;
          COPY_ID: string;
          SNAPSHOT: string;
          TIMEOUT: string;
          SIGNED_START: string;
          SIGNED_EXPIRY: string;
          SIGNED_RESOURCE: string;
          SIGNED_PERMISSIONS: string;
          SIGNED_IDENTIFIER: string;
          SIGNATURE: string;
          SIGNED_VERSION: string;
          CACHE_CONTROL: string;
          CONTENT_TYPE: string;
          CONTENT_ENCODING: string;
          CONTENT_LANGUAGE: string;
          CONTENT_DISPOSITION: string;
          BLOCK_ID: string;
          BLOCK_LIST_TYPE: string;
          PREFIX: string;
          MARKER: string;
          MAX_RESULTS: string;
          DELIMITER: string;
          INCLUDE: string;
          PEEK_ONLY: string;
          NUM_OF_MESSAGES: string;
          POP_RECEIPT: string;
          VISIBILITY_TIMEOUT: string;
          MESSAGE_TTL: string;
          SELECT: string;
          FILTER: string;
          TOP: string;
          SKIP: string;
          NEXT_PARTITION_KEY: string;
          NEXT_ROW_KEY: string;
          LOCK_ID: string;
          TABLENAME: string;
          STARTPK: string;
          STARTRK: string;
          ENDPK: string;
          ENDRK: string;
        };
        export var StorageServiceClientConstants: {
          DEFAULT_PROTOCOL: string;
          EnvironmentVariables: {
            AZURE_STORAGE_ACCOUNT: string;
            AZURE_STORAGE_ACCESS_KEY: string;
            AZURE_STORAGE_DNS_SUFFIX: string;
            AZURE_STORAGE_CONNECTION_STRING: string;
            HTTP_PROXY: string;
            HTTPS_PROXY: string;
            EMULATED: string;
          };
          DEVSTORE_STORAGE_ACCOUNT: string;
          DEVSTORE_STORAGE_ACCESS_KEY: string;
          DEV_STORE_URI: string;
          DEVSTORE_DEFAULT_PROTOCOL: string;
          DEVSTORE_BLOB_HOST: string;
          DEVSTORE_QUEUE_HOST: string;
          DEVSTORE_TABLE_HOST: string;
          CLOUD_BLOB_HOST: string;
          CLOUD_QUEUE_HOST: string;
          CLOUD_TABLE_HOST: string;
          CLOUD_FILE_HOST: string;
        };
        export module HttpConstants {
          /**
          * Http Verbs
          *
          * @const
          * @enum {string}
          */
          var HttpVerbs: {
            PUT: string;
            GET: string;
            DELETE: string;
            POST: string;
            MERGE: string;
            HEAD: string;
          };
          /**
          * Response codes.
          *
          * @const
          * @enum {int}
          */
          enum HttpResponseCodes {
            Ok = 200,
            Created = 201,
            Accepted = 202,
            NoContent = 204,
            PartialContent = 206,
            BadRequest = 400,
            Unauthorized = 401,
            Forbidden = 403,
            NotFound = 404,
            Conflict = 409,
            LengthRequired = 411,
            PreconditionFailed = 412,
          }
        }
        export var VersionConstants: {
          AUGUST_2013: string;
          FEBRUARY_2012: string;
        };
        export var BlobErrorCodeStrings: {
          INVALID_BLOCK_ID: string;
          BLOB_NOT_FOUND: string;
          BLOB_ALREADY_EXISTS: string;
          CONTAINER_ALREADY_EXISTS: string;
          CONTAINER_NOT_FOUND: string;
          INVALID_BLOB_OR_BLOCK: string;
          INVALID_BLOCK_LIST: string;
        };
        export var FileErrorCodeStrings: {
          SHARE_ALREADY_EXISTS: string;
          SHARE_NOT_FOUND: string;
          FILE_NOT_FOUND: string;
        };
        export var QueueErrorCodeStrings: {
          QUEUE_NOT_FOUND: string;
          QUEUE_DISABLED: string;
          QUEUE_ALREADY_EXISTS: string;
          QUEUE_NOT_EMPTY: string;
          QUEUE_BEING_DELETED: string;
          POP_RECEIPT_MISMATCH: string;
          INVALID_PARAMETER: string;
          MESSAGE_NOT_FOUND: string;
          MESSAGE_TOO_LARGE: string;
          INVALID_MARKER: string;
        };
        export var StorageErrorCodeStrings: {
          UNSUPPORTED_HTTP_VERB: string;
          MISSING_CONTENT_LENGTH_HEADER: string;
          MISSING_REQUIRED_HEADER: string;
          MISSING_REQUIRED_XML_NODE: string;
          UNSUPPORTED_HEADER: string;
          UNSUPPORTED_XML_NODE: string;
          INVALID_HEADER_VALUE: string;
          INVALID_XML_NODE_VALUE: string;
          MISSING_REQUIRED_QUERY_PARAMETER: string;
          UNSUPPORTED_QUERY_PARAMETER: string;
          INVALID_QUERY_PARAMETER_VALUE: string;
          OUT_OF_RANGE_QUERY_PARAMETER_VALUE: string;
          INVALID_URI: string;
          INVALID_HTTP_VERB: string;
          EMPTY_METADATA_KEY: string;
          REQUEST_BODY_TOO_LARGE: string;
          INVALID_XML_DOCUMENT: string;
          INTERNAL_ERROR: string;
          AUTHENTICATION_FAILED: string;
          MD5_MISMATCH: string;
          INVALID_MD5: string;
          OUT_OF_RANGE_INPUT: string;
          INVALID_INPUT: string;
          OPERATION_TIMED_OUT: string;
          RESOURCE_NOT_FOUND: string;
          RESOURCE_ALREADY_EXISTS: string;
          INVALID_METADATA: string;
          METADATA_TOO_LARGE: string;
          CONDITION_NOT_MET: string;
          UPDATE_CONDITION_NOT_SATISFIED: string;
          INVALID_RANGE: string;
          CONTAINER_NOT_FOUND: string;
          CONTAINER_ALREADY_EXISTS: string;
          CONTAINER_DISABLED: string;
          CONTAINER_BEING_DELETED: string;
          SERVER_BUSY: string;
        };
        export var TableErrorCodeStrings: {
          XMETHOD_NOT_USING_POST: string;
          XMETHOD_INCORRECT_VALUE: string;
          XMETHOD_INCORRECT_COUNT: string;
          TABLE_HAS_NO_PROPERTIES: string;
          DUPLICATE_PROPERTIES_SPECIFIED: string;
          TABLE_HAS_NO_SUCH_PROPERTY: string;
          DUPLICATE_KEY_PROPERTY_SPECIFIED: string;
          TABLE_ALREADY_EXISTS: string;
          TABLE_NOT_FOUND: string;
          ENTITY_NOT_FOUND: string;
          ENTITY_ALREADY_EXISTS: string;
          PARTITION_KEY_NOT_SPECIFIED: string;
          OPERATOR_INVALID: string;
          UPDATE_CONDITION_NOT_SATISFIED: string;
          PROPERTIES_NEED_VALUE: string;
          PARTITION_KEY_PROPERTY_CANNOT_BE_UPDATED: string;
          TOO_MANY_PROPERTIES: string;
          ENTITY_TOO_LARGE: string;
          PROPERTY_VALUE_TOO_LARGE: string;
          INVALID_VALUE_TYPE: string;
          TABLE_BEING_DELETED: string;
          TABLE_SERVER_OUT_OF_MEMORY: string;
          PRIMARY_KEY_PROPERTY_IS_INVALID_TYPE: string;
          PROPERTY_NAME_TOO_LONG: string;
          PROPERTY_NAME_INVALID: string;
          BATCH_OPERATION_NOT_SUPPORTED: string;
          JSON_FORMAT_NOT_SUPPORTED: string;
          METHOD_NOT_ALLOWED: string;
          NOT_IMPLEMENTED: string;
        };
        export var ConnectionStringKeys: {
          USE_DEVELOPMENT_STORAGE_NAME: string;
          DEVELOPMENT_STORAGE_PROXY_URI_NAME: string;
          DEFAULT_ENDPOINTS_PROTOCOL_NAME: string;
          ACCOUNT_NAME_NAME: string;
          ACCOUNT_KEY_NAME: string;
          BLOB_ENDPOINT_NAME: string;
          FILE_ENDPOINT_NAME: string;
          QUEUE_ENDPOINT_NAME: string;
          TABLE_ENDPOINT_NAME: string;
          SHARED_ACCESS_SIGNATURE_NAME: string;
          BLOB_BASE_DNS_NAME: string;
          FILE_BASE_DNS_NAME: string;
          QUEUE_BASE_DNS_NAME: string;
          TABLE_BASE_DNS_NAME: string;
        };

      }
      
      // ###########################
      // ./common/util/storageutilities
      // ###########################
      module storageutilities {
        /**
        * Defines constants, enums, and utility functions for use with storage.
        * @namespace StorageUtilities
        */
        /**
        * Specifies the location mode used to decide which location the request should be sent to.
        *
        * @const
        * @enum {number}
        * @alias StorageUtilities.LocationMode
        */
        export enum LocationMode {
          /**
          * The primary location only
          * @property LocationMode.PRIMARY_ONLY
          */
          PRIMARY_ONLY = 0,
          /**
          * The primary location first, then the secondary
          * @property LocationMode.PRIMARY_THEN_SECONDARY
          */
          PRIMARY_THEN_SECONDARY = 1,
          /**
          * The secondary location only
          * @property LocationMode.SECONDARY_ONLY
          */
          SECONDARY_ONLY = 2,
          /**
          * The secondary location first, then the primary
          * @property LocationMode.SECONDARY_THEN_PRIMARY
          */
          SECONDARY_THEN_PRIMARY = 3,
        }
      }

      // ###########################
      // ./common/util/accesscondition
      // ###########################
      module accesscondition {
        /**
        * Constructs an empty access condition.
        *
        * @return {AccessConditions} An empty AccessConditions object
        */
        export function generateEmptyCondition() : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource does not exist on the service
        *
        * Setting this access condition modifies the request to include the HTTP If-None-Match conditional header

        * @return {AccessConditions} An AccessConditions object that represents a condition that checks for nonexistence
        */
        export function generateIfNotExistsCondition(): AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource exists on the service
        *
        * Setting this access condition modifies the request to include the HTTP If-Match conditional header

        * @return {AccessConditions} An AccessConditions object that represents a condition that checks for existence
        */
        export function generateIfExistsCondition(): AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource's ETag value 
        * does not match the specified ETag value
        *
        * Setting this access condition modifies the request to include the HTTP If-None-Match conditional header
        *
        * @param  {string} etag                    The ETag value to check against the resource's ETag
        * @return {AccessConditions}               An AccessConditions object that represents the If-None-Match condition
        */
        export function generateIfNoneMatchCondition(etag: string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource's ETag value
        * matches the specified ETag value
        *
        * Setting this access condition modifies the request to include the HTTP If-Match conditional header
        *
        * @param  {string} etag                    The ETag value to check against the resource's ETag
        * @return {AccessConditions}               An AccessConditions object that represents the If-Match condition
        */
        export function generateIfMatchCondition(etag: string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource has been
        * modified since the specified time
        *
        * Setting this access condition modifies the request to include the HTTP If-Modified-Since conditional header
        *
        * @param  {Date|string}  time              A date object specifying the time since which the resource must have been modified
        * @return {AccessConditions}               An AccessConditions object that represents the If-Modified-Since condition
        */
        export function generateIfModifiedSinceCondition(time: Date|string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource has not been
        * modified since the specified time
        *
        * Setting this access condition modifies the request to include the HTTP If-Unmodified-Since conditional header
        *
        * @param  {Date|string}    time            A date object specifying the time since which the resource must have not been modified
        * @return {AccessConditions}               An AccessConditions object that represents the If-Unmodified-Since condition
        */
        export function generateIfNotModifiedSinceCondition(time: Date|string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource's sequence number
        * is equal to the specified value
        *
        * Setting this access condition modifies the request to include the HTTP x-ms-if-sequence-number-eq conditional header
        *
        * @param  {Number|string}    sequenceNumber    A date object specifying the time since which the resource must have not been modified
        * @return {AccessConditions}                   An AccessConditions object that represents the If-Unmodified-Since condition
        */
        export function generateSequenceNumberEqualCondition(sequenceNumber: Number|string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource's sequence number
        * is less than the specified value
        *
        * Setting this access condition modifies the request to include the HTTP x-ms-if-sequence-number-lt conditional header
        *
        * @param  {Number|string}    sequenceNumber    A date object specifying the time since which the resource must have not been modified
        * @return {AccessConditions}                   An AccessConditions object that represents the If-Unmodified-Since condition
        */
        export function generateSequenceNumberLessThanCondition(sequenceNumber: Number|string) : AccessConditions;

        /**
        * Constructs an access condition such that an operation will be performed only if the resource's sequence number
        * is less than or equal to the specified value
        *
        * Setting this access condition modifies the request to include the HTTP x-ms-if-sequence-number-le conditional header
        *
        * @param  {Number|string}    sequenceNumber    A date object specifying the time since which the resource must have not been modified
        * @return {AccessConditions}                   An AccessConditions object that represents the If-Unmodified-Since condition
        */
        export function generateSequenceNumberLessThanOrEqualCondition(sequenceNumber: Number|string) : AccessConditions;
      }

      // ###########################
      // ./common/util/sr
      // ###########################
      module sr {
        export var SR: {
          ANONYMOUS_ACCESS_BLOBSERVICE_ONLY: string;
          ARGUMENT_NULL_OR_EMPTY: string;
          ARGUMENT_NULL_OR_UNDEFINED: string;
          ARGUMENT_OUT_OF_RANGE_ERROR: string;
          BATCH_ONE_PARTITION_KEY: string;
          BATCH_ONE_RETRIEVE: string;
          BATCH_TOO_LARGE: string;
          HASH_MISMATCH: string;
          BLOB_INVALID_SEQUENCE_NUMBER: string;
          BLOB_TYPE_MISMATCH: string;
          CONTENT_LENGTH_MISMATCH: string;
          INVALID_DELETE_SNAPSHOT_OPTION: string;
          CANNOT_CREATE_SAS_WITHOUT_ACCOUNT_KEY: string;
          CONTENT_TYPE_MISSING: string;
          EMPTY_BATCH: string;
          EXCEEDED_SIZE_LIMITATION: string;
          INCORRECT_ENTITY_KEYS: string;
          INVALID_BLOB_LENGTH: string;
          INVALID_FILE_LENGTH: string;
          INVALID_CONNECTION_STRING: string;
          INVALID_CONNECTION_STRING_BAD_KEY: string;
          INVALID_CONNECTION_STRING_DUPLICATE_KEY: string;
          INVALID_CONNECTION_STRING_EMPTY_KEY: string;
          INVALID_EDM_TYPE: string;
          INVALID_HEADERS: string;
          INVALID_MESSAGE_ID: string;
          INVALID_PAGE_BLOB_LENGTH: string;
          INVALID_PAGE_END_OFFSET: string;
          INVALID_PAGE_START_OFFSET: string;
          INVALID_FILE_RANGE_FOR_UPDATE: string;
          INVALID_PAGE_RANGE_FOR_UPDATE: string;
          INVALID_POP_RECEIPT: string;
          INVALID_PROPERTY_RESOLVER: string;
          INVALID_RANGE_FOR_MD5: string;
          INVALID_SAS_VERSION: string;
          INVALID_SIGNED_IDENTIFIERS: string;
          INVALID_STREAM_LENGTH: string;
          INVALID_STRING_ERROR: string;
          INVALID_TEXT_LENGTH: string;
          QUERY_OPERATOR_REQUIRES_WHERE: string;
          MAXIMUM_EXECUTION_TIMEOUT_EXCEPTION: string;
          MD5_NOT_PRESENT_ERROR: string;
          METADATA_KEY_INVALID: string;
          METADATA_VALUE_INVALID: string;
          NO_CREDENTIALS_PROVIDED: string;
          INVALID_TABLE_OPERATION: string;
          PRIMARY_ONLY_COMMAND: string;
          SECONDARY_ONLY_COMMAND: string;
          STORAGE_HOST_LOCATION_REQUIRED: string;
          STORAGE_HOST_MISSING_LOCATION: string;
          TYPE_NOT_SUPPORTED: string;
          NO_LIST_FUNC_PROVIDED: string;
        };
      }

      // ###########################
      // ./common/util/validate
      // ###########################
      module validate {
        /**
        * Checks if the given value is a valid enumeration or not.
        *
        * @param {Object} value     The value to validate.
        * @param {Object} list      The enumeration values.
        * @return {boolean}
        */
        export function isValidEnumValue<T>(value: string, list: string[], callback: Function): boolean;
        /**
        * Creates a anonymous function that check if the given uri is valid or not.
        *
        * @param {string} uri     The uri to validate.
        * @return {boolean}
        */
        export function isValidUri(uri: string): boolean;
        /**
        * Checks if the given host is valid or not.
        *
        * @param {string|object} host     The host to validate.
        * @return {boolean}
        */
        export function isValidHost(host: string): boolean;
        export function isValidHost(host: StorageHost): boolean;
        /**
        * Checks if the given value is a valid UUID or not.
        *
        * @param {string|object} uuid     The uuid to validate.
        * @return {boolean}
        */
        export function isValidUuid(uuid: string, callback?: Function): boolean;
        /**
        * Creates a anonymous function that check if a given key is base 64 encoded.
        *
        * @param {string} key The key to validate.
        * @return {boolean}
        */
        export function isBase64Encoded(key: string): boolean;
        /**
        * Validates a function.
        *
        * @param {Object} function The function to validate.
        * @return {boolean}
        */
        export function isValidFunction(functionObject: any, functionName: string): boolean;
        /**
        * Validates a container name.
        *
        * @param {string} containerName The container name.
        */
        export function containerNameIsValid(containerName: string, callback?: Function): boolean;
        /**
        * Validates a blob name.
        *
        * @param {string} containerName The container name.
        * @param {string} blobname      The blob name.
        */
        export function blobNameIsValid(containerName: string, blobName: string, callback?: Function): boolean;
        /**
        * Validates a share name.
        *
        * @param {string} shareName The share name.
        */
        export function shareNameIsValid(shareName: string, callback?: Function): boolean;
        /**
        * Validates a queue name.
        *
        * @param {string} queueName The queue name.
        */
        export function queueNameIsValid(queueName: string, callback?: Function): boolean;
        /**
        * Validates a table name.
        *
        * @param {string} table  The table name.
        */
        export function tableNameIsValid(table: string, callback?: Function): boolean;
        /**
        * Validates page ranges.
        *
        * @param {int} rangeStart             The range starting position.
        * @param {int} rangeEnd               The range ending position.
        * @param {int} writeBlockSizeInBytes  The block size.
        */
        export function pageRangesAreValid(rangeStart: number, rangeEnd: number, writeBlockSizeInBytes: number, callback?: Function): boolean;
        /**
        * Validates a blob type.
        *
        * @param {string} type  The type name.
        */
        export function blobTypeIsValid(type: string, callback?: Function): boolean;
        export class ArgumentValidator {
          func: string;
          tableNameIsValid: (tableName: string, callback?: Function) => boolean;
          containerNameIsValid: (containerName: string, callback?: Function) => boolean;
          shareNameIsValid: (shareName: string, callback?: Function) => boolean;
          blobNameIsValid: (containerName: string, blobName: string, callback?: Function) => boolean;
          pageRangesAreValid: (rangeStart: number, rangeEnd: number, writeBlockSizeInBytes: number, callback?: Function) => boolean;
          queueNameIsValid: (queueName: string, callback?: Function) => boolean;
          blobTypeIsValid: (shareName: string, callback?: Function) => boolean;
          isValidEnumValue: (value: string, list: string[], callback?: Function) => boolean;
          constructor(functionName: string);
          string(val: any, name: string): void;
          stringAllowEmpty(val: any, name: string): void;
          object(val: any, name: string): void;
          exists(val: any, name: string): void;
          function(val: any, name: string): void;
          value(val: any, name: string): void;
          nonEmptyArray<T>(val: T[], name: string): void;
          callback(val: any): void;
          test(predicate: () => boolean, message: string): void;
        }
        export function validateArgs(functionName: string, validationRules: (validator: ArgumentValidator) => void): void;
      }

      // ###########################
      // ./common/util/date
      // ###########################
      module date {
        /**
        * Date/time related helper functions
        * @module date
        *
        */
        /**
        * Generates a Date object which is in the given days from now.
        *
        * @param {int} days The days timespan.
        * @return {Date}
        */
        export function daysFromNow(days: number): Date;
        /**
        * Generates a Date object which is in the given hours from now.
        *
        * @param {int} hours The hours timespan.
        * @return {Date}
        */
        export function hoursFromNow(hours: number): Date;
        /**
        * Generates a Date object which is in the given minutes from now.
        *
        * @param {int} minutes The minutes timespan.
        * @return {Date}
        */
        export function minutesFromNow(minutes: number): Date;
        /**
        * Generates a Date object which is in the given seconds from now.
        *
        * @param {int} seconds The seconds timespan.
        * @return {Date}
        */
        export function secondsFromNow(seconds: number): Date;

      }
    }

    module http {
      // ###########################
      // ./common/http/webresource
      // ###########################
      module webresource {
        export class WebResource {
          rawResponse: boolean;
          queryString: any;
          path: string;
          method: string;
          properties: Map<string>;
          body: any;
          headersOnly: boolean;
          uri: string;
          headers: Map<any>;
          /**
          * Creates a new WebResource object.
          */
          constructor();
          /**
          * Creates a new put request web resource.
          *
          * @function WebResource#put
          * @static
          * @param {string} path The path for the put operation.
          * @return {WebResource} A new webresource with a put operation for the given path.
          */
          static put(path?: string): WebResource;
          /**
          * Creates a new get request web resource.
          *
          * @function WebResource#get
          * @static
          * @param {string} path The path for the get operation.
          * @return {WebResource} A new webresource with a get operation for the given path.
          */
          static get(path?: string): WebResource;
          /**
          * Creates a new head request web resource.
          *
          * @function WebResource#head
          * @static
          * @param {string} path The path for the head operation.
          * @return {WebResource} A new webresource with a head operation for the given path.
          */
          static head(path: string): WebResource;
          /**
          * Creates a new delete request web resource.
          *
          * @function WebResource#del
          * @static
          * @param {string} path The path for the delete operation.
          * @return {WebResource} A new webresource with a delete operation for the given path.
          */
          static del(path: string): WebResource;
          /**
          * Creates a new post request web resource.
          *
          * @function WebResource#post
          * @static
          * @param {string} path The path for the post operation.
          * @return {WebResource} A new webresource with a post operation for the given path.
          */
          static post(path: string): WebResource;
          /**
          * Creates a new merge request web resource.
          *
          * @function WebResource#merge
          * @static
          * @param {string} path The path for the merge operation.
          * @return {WebResource} A new webresource with a merge operation for the given path.
          */
          static merge(path: string): WebResource;
          /**
          * Specifies a custom property in the web resource.
          *
          * @function WebResource#withProperty
          * @param {string} name  The property name.
          * @param {string} value The property value.
          * @return {WebResource} The webresource.
          */
          withProperty(name: string, value: string): WebResource;
          /**
          * Specifies if the response should be parsed or not.
          *
          * @function WebResource#withRawResponse
          * @param {bool} [rawResponse=true] true if the response should not be parsed; false otherwise.
          * @return {WebResource} The webresource.
          */
          withRawResponse(rawResponse?: boolean): WebResource;
          /**
          * Specifies if the request only has headers.
          *
          * @function WebResource#withHeadersOnly
          * @param {bool} [headersOnly=true] true if the request only has headers; false otherwise.
          * @return {WebResource} The webresource.
          */
          withHeadersOnly(headersOnly?: boolean): WebResource;
          /**
          * Adds an optional query string parameter.
          *
          * @function WebResource#withQueryOption
          * @param {Object} name          The name of the query string parameter.
          * @param {Object} value         The value of the query string parameter.
          * @param {Object} defaultValue  The default value for the query string parameter to be used if no value is passed.
          * @return {Object} The web resource.
          */
          withQueryOption<T>(name: any, value: T, defaultValue?: T): WebResource;
          /**
          * Adds optional query string parameters.
          *
          * Additional arguments will be the needles to search in the haystack.
          *
          * @function WebResource#withQueryOptions
          * @param {Object} object  The haystack of query string parameters.
          * @return {Object} The web resource.
          */
          withQueryOptions(object: any, ...queryArgs: any[]): WebResource;
          /**
          * Adds an optional header parameter.
          *
          * @function WebResource#withHeader
          * @param {Object} name  The name of the header parameter.
          * @param {Object} value The value of the header parameter.
          * @return {Object} The web resource.
          */
          withHeader<T>(name: string, value: T): WebResource;
          /**
          * Adds an optional body.
          *
          * @function WebResource#withBody
          * @param {Object} body  The request body.
          * @return {Object} The web resource.
          */
          withBody(body: any): WebResource;
          /**
          * Adds optional query string parameters.
          *
          * Additional arguments will be the needles to search in the haystack.
          *
          * @function WebResource#withHeaders
          * @param {Object} object  The haystack of headers.
          * @return {Object} The web resource.
          withHeaders(object: {
            [x: string]: any;
          }, ...args: string[]): WebResource;
          addOptionalMetadataHeaders(metadata: any): WebResource;
          /**
          * Determines if a status code corresponds to a valid response according to the WebResource's expected status codes.
          *
          * @function WebResource#validResponse
          * @static
          * @param {int} statusCode The response status code.
          * @return true if the response is valid; false otherwise.
          */
          static validResponse(statusCode: number): boolean;
          /**
          * Hook up the given input stream to a destination output stream if the WebResource method
          * requires a request body and a body is not already set.
          *
          * @function WebResource#pipeInput
          * @param {Stream} inputStream the stream to pipe from
          * @param {Stream} outputStream the stream to pipe to
          *
          * @return destStream
          */
          pipeInput(inputStream: NodeJS.ReadableStream, destStream: NodeJS.WritableStream): NodeJS.WritableStream;
        }
      }
    }

    module diagnostics {
      // ###########################
      // ./common/loggerdiagnostics/logger
      // ###########################
      module logger {
        export class Logger {
          level: string;
          loggerFunction: (level: string, message: string) => void;
          constructor(level: any, loggerFunction?: (level: string, message: string) => void);
          static LogLevels: {
            EMERGENCY: string;
            ALERT: string;
            CRITICAL: string;
            ERROR: string;
            WARNING: string;
            NOTICE: string;
            INFO: string;
            DEBUG: string;
          };
          log(level: any, msg: any): void;
          emergency(msg: any): void;
          critical(msg: any): void;
          alert(msg: any): void;
          error(msg: any): void;
          warn(msg: any): void;
          notice(msg: any): void;
          info(msg: any): void;
          debug(msg: any): void;
          defaultLoggerFunction(logLevel: string, msg: string): void;
        }
      }
    }

    module streams {
      // ###########################
      // ./common/util/speedsummary
      // ###########################
      module speedsummary {
        export interface SpeedSummary {
          name: string;
          totalSize: number;
          completeSize: number;
          /**
          * Get running seconds
          */
          getElapsedSeconds(humanReadable: boolean): number;
          /**
          * Get complete percentage
          * @param {int} len The number of digits after the decimal point.
          */
          getCompletePercent(len: number): number;
          /**
          * Get average upload/download speed
          */
          getAverageSpeed(humanReadable: boolean): string;
          /**
          * Get instant speed
          */
          getSpeed(humanReadable: boolean): string | number;
          /**
          * Increment the complete data size
          */
          increment(len: number): number;
          /**
          * Get auto increment function
          */
          getAutoIncrementFunction(size: number): (error: any, retValue: number) => void;
          /**
          * Get total size
          */
          getTotalSize(humanReadable: boolean): string | number;
          /**
          * Get completed data size
          */
          getCompleteSize(humanReadable: boolean): string | number;
        }
      }
    }

    module models {
      export interface ServiceStats {
        GeoReplication?: {
          Status?: string;
          LastSyncTime?: Date;
        };
      }

      module ServicePropertiesResult {
        export interface RetentionPolicy {
          Enabled: boolean;
          Days: number;
        }
        export interface MetricsProperties {
          Version: string;
          Enabled: boolean;
          IncludeAPIs: boolean;
          RetentionPolicy: RetentionPolicy;
        }
        export interface CorsRule {
          AllowedMethods: string[];
          AllowedOrigins: string[];
          AllowedHeaders: string[];
          ExposedHeaders: string[];
          MaxAgeInSeconds: number;
        }
        export interface LoggingProperties {
          Version: string;
          Delete: boolean;
          Read: boolean;
          Write: boolean;
          RetentionPolicy: RetentionPolicy;
        }
        export interface DeleteRetentionPolicyProperties {
          Enabled: boolean;
          Days?: number;
        }
        export interface ServiceProperties {
          DefaultServiceVersion?: string;
          Logging?: LoggingProperties;
          DeleteRetentionPolicy?: DeleteRetentionPolicyProperties;
          HourMetrics?: MetricsProperties;
          MinuteMetrics?: MetricsProperties;
          Cors?: {
            CorsRule: CorsRule[];
          };
        }
        export function serialize(servicePropertiesJs: ServiceProperties): string;
        export function parse(servicePropertiesXml: any): ServiceProperties;
      }
    }

    module services {
      // ###########################
      // ./common/services/storageserviceclient
      // ###########################
      module storageserviceclient {
        export interface Proxy {
          host: string;
          port: number;
          proxyAuth: string;
          headers: Map<any>;
          key: string;
          ca: string;
          cert: string;
        }

        export class StorageServiceClient extends events.EventEmitter {
          /**
          * The default location mode for requests made via the service.
          * @member {StorageUtilities.LocationMode} StorageServiceClient#defaultLocationMode
          */
          defaultLocationMode: common.util.storageutilities.LocationMode;
          /**
          * The default maximum execution time across all potential retries, for requests made via the service.
          * @member {int} StorageServiceClient#defaultMaximumExecutionTimeInMs
          */
          defaultMaximumExecutionTimeInMs: number;
          /**
          * The default timeout interval, in milliseconds, to use for request made via the service.
          * @member {int} StorageServiceClient#defaultTimeoutIntervalInMs
          */
          defaultTimeoutIntervalInMs: number;
          /**
          * The default timeout of client requests, in milliseconds, to use for the request.
          * @member {int} StorageServiceClient#defaultClientRequestTimeoutInMs
          */
          defaultClientRequestTimeoutInMs: number;
          /**
          * Determines whether the Nagle algorithm is used for requests made via the Queue service; true to use the
          *  Nagle algorithm; otherwise, false. The default value is false.
          * @member {bool} StorageServiceClient#useNagleAlgorithm
          */
          useNagleAlgorithm: boolean;
          /** The proxy object specified by caller.
          * @member {Proxy}   StorageServiceClient#proxy
          */
          proxy: Proxy;
            /** The logging settings object.
          * @member {diagnostics.logger.Logger}   StorageServiceClient#logger
          */
          logger: diagnostics.logger.Logger;

          /**
          * Creates a new StorageServiceClient object.
          *
          * @constructor StorageServiceClient
          * @param {string} storageAccount           The storage account.
          * @param {string} storageAccessKey         The storage access key.
          * @param {Object} host                     The host for the service.
          * @param {bool}   usePathStyleUri          Boolean value indicating wether to use path style uris.
          * @param {string} sasToken                 The Shared Access Signature token.
          */
          constructor(storageAccount?: string, storageAccessKey?: string, host?: StorageHost, usePathStyleUri?: boolean, sasToken?: string);
          /**
          * Associate a filtering operation with this StorageServiceClient. Filtering operations
          * can include logging, automatically retrying, etc. Filter operations are objects
          * that implement a method with the signature:
          *
          *     "function handle (requestOptions, next)".
          *
          * After doing its preprocessing on the request options, the method needs to call
          * "next" passing a callback with the following signature:
          * signature:
          *
          *     "function (returnObject, finalCallback, next)"
          *
          * In this callback, and after processing the returnObject (the response from the
          * request to the server), the callback needs to either invoke next if it exists to
          * continue processing other filters or simply invoke finalCallback otherwise to end
          * up the service invocation.
          *
          * @function StorageServiceClient#withFilter
          * @param {Object} filter The new filter object.
          * @return {StorageServiceClient} A new service client with the filter applied.
          */
          withFilter(newFilter: common.filters.IFilter): StorageServiceClient;
          /**
          * Sets proxy object specified by caller.
          *
          * @function StorageServiceClient#setProxy
          * @param {(object|string)}   proxy       proxy to use for tunneling
          *                                        {
          *                                         host: hostname
          *                                         port: port number
          *                                         proxyAuth: 'user:password' for basic auth
          *                                         headers: {...} headers for proxy server
          *                                         key: key for proxy server
          *                                         ca: ca for proxy server
          *                                         cert: cert for proxy server
          *                                        }
          *                                        if null or undefined, clears proxy
          */
          setProxy(proxy: Proxy): void;
        }
      }
    }

    export interface AccessPolicy {
      /** The permission type. */
      Permissions: string;
      /** The time at which the Shared Access Signature becomes valid. */
      Start?: Date | string;
      /** The time at which the Shared Access Signature becomes expired. */
      Expiry?: Date | string;
      /** An IP address or a range of IP addresses from which to accept requests. When specifying a range, note that the range is inclusive. */
      IPAddressOrRange?: string;
      /** The protocol permitted for a request made with the SAS. */
      Protocols?: string;
      /** The services (blob, file, queue, table) for a shared access signature associated with this shared access policy. */
      Services?: string;
      /** The resource type for a shared access signature associated with this shared access policy. */
      ResourceTypes?: string;
    }
    
    export interface SharedAccessPolicy {
      /** The signed identifier. */
      Id?: string;
      /** The Access Policy information */
      AccessPolicy: AccessPolicy;
    }
    
    export interface ContentSettingsHeaders {
      cacheControl?: string;
      contentType?: string;
      contentEncoding?: string;
      contentLanguage?: string;
      contentDisposition?: string;
    }

    /**
    * Common request options for azure storage services
    */
    export interface RequestOptions {
      /**
      * {LocationMode}  Specifies the location mode used to decide which location the request should be sent to.
      */
      locationMode?: StorageUtilities.LocationMode;
      /**
      * {int} The server timeout interval, in milliseconds, to use for the request.
      */
      timeoutIntervalInMs?: number;
      /**
      * {int} The timeout of client requests, in milliseconds, to use for the request.
      */
      clientRequestTimeoutInMs?: number;

      /**
      * {int} The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
      */
      maximumExecutionTimeInMs?: number;
      /**
      * {bool} Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
      */
      useNagleAlgorithm?: boolean;
      /**
      * {string} A string that represents the client request ID with a 1KB character limit.
      */
      clientRequestId?: string;
    }

    export interface ContinuationToken {
      nextMarker: string;
      targetLocation?: Constants.StorageLocation;
    }

    export interface Range {
      start?: number;
      end?: number;
    }

    export interface RangeDiff {
      start?: number;
      end?: number;
      isCleared?: boolean
    }
  }

  /**
  * Creates a connection string that can be used to create a service which runs on the storage emulator. The emulator must be downloaded separately.
  *
  * @param {string}   [proxyUri]                  The proxyUri. By default, http://127.0.0.1
  * @return {string}                              A connection string representing the development storage credentials.
  * @example
  * var azure = require('azure-storage');
  * var devStoreCreds = azure.generateDevelopmentStorageCredentials();
  * var blobService = azure.createBlobService(devStoreCreds);
  */
  export function generateDevelopmentStorageCredentials(proxyUri?: string): string;

  /**
   * Table client exports
   * @ignore
   */
  export import TableService = services.table.TableService;
  export import TableQuery = services.table.TableQuery;
  export import TableBatch = services.table.TableBatch;
  export import TableUtilities = services.table.TableUtilities;

  /**
  * Creates a new {@link TableService} object.
  * If no storageaccount or storageaccesskey are provided, the AZURE_STORAGE_CONNECTION_STRING and then the AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  * environment variables will be used.
  *
  * @param {string} [storageAccountOrConnectionString]  The storage account or the connection string.
  * @param {string} [storageAccessKey]                  The storage access key.
  * @param {string|object} [host]                       The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @return {TableService}                              A new TableService object.
  *
  */
  export function createTableService(): TableService;
  export function createTableService(connectionString: string): TableService;
  export function createTableService(storageAccountOrConnectionString: string, storageAccessKey: string, host?: StorageHost): TableService;

  /**
  * Creates a new {@link TableService} object using the host Uri and the SAS credentials provided.
  *
  * @param {string|object} host                         The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @param {string} sasToken                            The Shared Access Signature token.
  * @return {TableService}                              A new TableService object with the SAS credentials.
  */
  export function createTableServiceWithSas(hostUri: string | StorageHost, sasToken: string): TableService;

  /**
   * Blob client exports
   * @ignore
   */
  export import BlobService = services.blob.blobservice.BlobService;
  export import BlobUtilities = services.blob.blobutilities.BlobUtilities;

  /**
  * Creates a new {@link BlobService} object.
  * If no storageaccount or storageaccesskey are provided, the AZURE_STORAGE_CONNECTION_STRING and then the AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  * environment variables will be used.
  *
  * @param {string} storageAccountOrConnectionString    The storage account or the connection string.
  * @param {string} [storageAccessKey]                  The storage access key.
  * @param {string|object} [host]                       The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @return {BlobService}                               A new BlobService object.
  */
  export function createBlobService(storageAccount: string, storageAccessKey: string, host?: string|StorageHost): BlobService;
  export function createBlobService(connectionString: string): BlobService;
  export function createBlobService(): BlobService;
  /**
  * Creates a new {@link BlobService} object using the host Uri and the SAS credentials provided.
  *
  * @param {string|object} host                         The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @param {string} sasToken                            The Shared Access Signature token.
  * @return {BlobService}                               A new BlobService object with the SAS credentials.
  */
  export function createBlobServiceWithSas(host: string|StorageHost, sasToken: string): BlobService;

  /**
  * Creates a new {@link BlobService} object using the host uri and anonymous access.
  *
  * @param {string|object} host                         The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @return {BlobService}                               A new BlobService object with the anonymous credentials.
  */
  export function createBlobServiceAnonymous(host?: string|StorageHost): BlobService;

  ///**
  // * File client exports
  // * @ignore
  // */
  export import FileService = services.file.FileService;
  export import FileUtilities = services.file.FileUtilities;

  ///**
  //* Creates a new {@link FileService} object.
  //* If no storageaccount or storageaccesskey are provided, the AZURE_STORAGE_CONNECTION_STRING and then the AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  //* environment variables will be used.
  //*
  //* @param {string} storageAccountOrConnectionString    The storage account or the connection string.
  //* @param {string} [storageAccessKey]                  The storage access key.
  //* @param {string|object} [host]                       The host address. To define primary only, pass a string.
  //*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  //* @return {FileService}                               A new FileService object.
  //*/
  export function createFileService(storageAccount: string, storageAccessKey: string, host?: string | StorageHost): FileService;
  export function createFileService(connectionString: string): FileService;
  export function createFileService(): FileService;

  /**
  * Creates a new {@link FileService} object using the host Uri and the SAS credentials provided.
  *
  * @param {string|object} host                         The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @param {string} sasToken                            The Shared Access Signature token.
  * @return {FileService}                               A new FileService object with the SAS credentials.
  */
  export function createFileServiceWithSas(hostUri: string | StorageHost, sasToken: string): FileService;

  /**
   * Queue client exports
   * @ignore
   */
  export import QueueService = services.queue.QueueService;
  export import QueueMessageEncoder = services.queue.QueueMessageEncoder;
  export import QueueUtilities = services.queue.QueueUtilities;

  /**
  * Creates a new {@link QueueService} object.
  * If no storageaccount or storageaccesskey are provided, the AZURE_STORAGE_CONNECTION_STRING and then the AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY
  * environment variables will be used.
  *
  * @param {string} [storageAccountOrConnectionString]  The storage account or the connection string.
  * @param {string} [storageAccessKey]                  The storage access key.
  * @param {string|object} [host]                       The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @return {QueueService}                              A new QueueService object.
  */
  export function createQueueService(storageAccount: string, storageAccessKey: string, host?: string | StorageHost): QueueService;
  export function createQueueService(connectionString: string): QueueService;
  export function createQueueService(): QueueService;

  /**
  * Creates a new {@link QueueService} object using the host Uri and the SAS credentials provided.
  *
  * @param {string|object} host                         The host address. To define primary only, pass a string.
  *                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
  * @param {string} sasToken                            The Shared Access Signature token.
  * @return {QueueService}                              A new QueueService object with the SAS credentials.
  */
  export function createQueueServiceWithSas(hostUri: string | StorageHost, sasToken: string): QueueService;
  
  export function generateAccountSharedAccessSignature(storageAccountOrConnectionString: string, storageAccessKey: string, sharedAccessAccountPolicy: common.SharedAccessPolicy): string;

  interface StorageError extends Error {
    statusCode?: number;
    requestId?: string;
    code?: string;
  }

  interface ServiceResponse {
    isSuccessful: boolean;
    statusCode: number;
    body?: string | Buffer;
    headers?: Map<string>;
    md5: string;
    error?: StorageError | Error;
    requestServerEncrypted?: boolean;
  }

  interface ServiceResult {
    error: StorageError | Error;
    response: ServiceResponse;
    contentMD5: string;
    length?: number;
    operationEndTime: Date;
    targetLocation: Constants.StorageLocation;
  }

  /**
  * A callback that returns a response object.
  * @callback errorOrResponse
  * @param {Object} error         If an error occurs, will contain information about the error.
  * @param {Object} response      Contains information about the response returned for the operation.
  *                               For example, HTTP status codes and headers.
  */
  interface ErrorOrResponse {
    (error: Error, response: ServiceResponse): void
  }
  /**
  * A callback that returns result and response objects.
  * @callback errorOrResult
  * @param {Object} error         If an error occurs, will contain information about the error.
  * @param {Object} result        The result of the operation.
  * @param {Object} response      Contains information about the response returned for the operation.
  *                               For example, HTTP status codes and headers.
  */
  interface ErrorOrResult<TResult> {
    (error: Error, result: TResult, response: ServiceResponse): void
  }
  /**
  * Specifying conditional headers for blob service operations. See http://msdn.microsoft.com/en-us/library/dd179371.aspx for more information.
  * @typedef    {Object}          AccessConditions
  * @property   {string}          EtagMatch                       If the ETag for the blob matches the specified ETag.
  *                                                               Specify the wildcard character (*) to perform the operation only if the resource does exist, and fail the operation if it does not exist.
  * @property   {string}          EtagNonMatch                    If the ETag for the blob does not match the specified ETag.
  *                                                               Specify the wildcard character (*) to perform the operation only if the resource does not exist, and fail the operation if it does exist.
  * @property   {Date|string}     DateModifedSince                If the blob has been modified since the specified date.
  * @property   {Date|string}     DateUnModifiedSince             If the blob has not been modified since the specified date.
  * @property   {Number|string}   SequenceNumberLessThanOrEqual   If the blob’s sequence number is less than or equal to the specified value.
  *                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
  * @property   {Number|string}   SequenceNumberLessThan          If the blob’s sequence number is less than the specified value.
  *                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
  * @property   {Number|string}   SequenceNumberEqual             If the blob’s sequence number is equal to the specified value.
  *                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
  * @property   {Number|string}   MaxBlobSize                     If the Append Block operation would cause the blob to exceed that limit or if the blob size is already greater than the specified value. 
  *                                                               For Append Block operation only. See https://msdn.microsoft.com/en-us/library/mt427365.aspx for more information.
  * @property   {Number|string}   MaxAppendPosition               If the append position is equal to the specified value.
  *                                                               For Append Block operation only. See https://msdn.microsoft.com/en-us/library/mt427365.aspx for more information.
  */
  export interface AccessConditions {
    EtagMatch?: string;
    EtagNonMatch?: string;
    DateModifedSince?: Date | string;
    DateUnModifiedSince?: Date | string;
    SequenceNumberLessThanOrEqual?: Number | string;
    SequenceNumberLessThan?: Number | string;
    SequenceNumberEqual?: Number | string;
    MaxBlobSize?: Number | string;
    MaxAppendPosition?: Number | string;
  }

  export import Constants = common.util.constants;
  export import StorageUtilities = common.util.storageutilities;
  export import AccessCondition = common.util.accesscondition;
  export import SR = common.util.sr.SR;
  export import StorageServiceClient = common.services.storageserviceclient.StorageServiceClient;
  export import Logger = common.diagnostics.logger.Logger;
  export import WebResource = common.http.webresource.WebResource;
  export import Validate = common.util.validate;
  export import date = common.util.date;
  export import LinearRetryPolicyFilter = common.filters.linearretrypolicyfilter.LinearRetryPolicyFilter;
  export import ExponentialRetryPolicyFilter = common.filters.exponentialretrypolicyfilter.ExponentialRetryPolicyFilter;
  export import RetryPolicyFilter = common.filters.retrypolicyfilter.RetryPolicyFilter;
}

export = azurestorage;
