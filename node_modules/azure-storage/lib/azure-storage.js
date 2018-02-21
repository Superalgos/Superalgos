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

var exports = module.exports;

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
exports.generateDevelopmentStorageCredentials = function (proxyUri) {
  var devStore = 'UseDevelopmentStorage=true;';
  if(proxyUri){
    devStore += 'DevelopmentStorageProxyUri=' + proxyUri;
  }

  return devStore;
};

/**
 * Table client exports.
 * @ignore
 */
var TableService = require('./services/table/tableservice');

exports.TableService = TableService;
exports.TableQuery = require('./services/table/tablequery');
exports.TableBatch = require('./services/table/tablebatch');
exports.TableUtilities = require('./services/table/tableutilities');

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
exports.createTableService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new TableService(storageAccountOrConnectionString, storageAccessKey, host);
};

/**
* Creates a new {@link TableService} object using the host Uri and the SAS credentials provided.
* 
* @param {string|object} host                         The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @param {string} sasToken                            The Shared Access Signature token.
* @return {TableService}                              A new TableService object with the SAS credentials.
*/
exports.createTableServiceWithSas = function (hostUri, sasToken) {
  return new TableService(null, null, hostUri, sasToken);
};

/**
 * Blob client exports.
 * @ignore
 */
var BlobService = require('./services/blob/blobservice.node');

exports.BlobService = BlobService;
exports.BlobUtilities = require('./services/blob/blobutilities');

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
exports.createBlobService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new BlobService(storageAccountOrConnectionString, storageAccessKey, host, null);
};

/**
* Creates a new {@link BlobService} object using the host Uri and the SAS credentials provided.
* 
* @param {string|object} host                         The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @param {string} sasToken                            The Shared Access Signature token.
* @return {BlobService}                               A new BlobService object with the SAS credentials.
*/
exports.createBlobServiceWithSas = function (host, sasToken) {
  return new BlobService(null, null, host, sasToken);
};

/**
* Creates a new {@link BlobService} object using the host uri and anonymous access.
* 
* @param {string|object} host                         The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @return {BlobService}                               A new BlobService object with the anonymous credentials.
*/
exports.createBlobServiceAnonymous = function (host) {
  return new BlobService(null, null, host, null);
};

/**
 * File client exports.
 * @ignore
 */
var FileService = require('./services/file/fileservice.node');

exports.FileService = FileService;
exports.FileUtilities = require('./services/file/fileutilities');

/**
* Creates a new {@link FileService} object.
* If no storageaccount or storageaccesskey are provided, the AZURE_STORAGE_CONNECTION_STRING and then the AZURE_STORAGE_ACCOUNT and AZURE_STORAGE_ACCESS_KEY 
* environment variables will be used.
*
* @param {string} storageAccountOrConnectionString    The storage account or the connection string.
* @param {string} [storageAccessKey]                  The storage access key.
* @param {string|object} [host]                       The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @return {FileService}                               A new FileService object.
*/
exports.createFileService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new FileService(storageAccountOrConnectionString, storageAccessKey, host);
};

/**
* Creates a new {@link FileService} object using the host Uri and the SAS credentials provided.
* 
* @param {string|object} host                         The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @param {string} sasToken                            The Shared Access Signature token.
* @return {FileService}                               A new FileService object with the SAS credentials.
*/
exports.createFileServiceWithSas = function (hostUri, sasToken) {
  return new FileService(null, null, hostUri, sasToken);
};

/**
 * Queue client exports.
 * @ignore
 */
var QueueService = require('./services/queue/queueservice');

exports.QueueService = QueueService;
exports.QueueUtilities = require('./services/queue/queueutilities');
exports.QueueMessageEncoder = require('./services/queue/queuemessageencoder');

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
exports.createQueueService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new QueueService(storageAccountOrConnectionString, storageAccessKey, host);
};

/**
* Creates a new {@link QueueService} object using the host Uri and the SAS credentials provided.
* 
* @param {string|object} host                         The host address. To define primary only, pass a string. 
*                                                     Otherwise 'host.primaryHost' defines the primary host and 'host.secondaryHost' defines the secondary host.
* @param {string} sasToken                            The Shared Access Signature token.
* @return {QueueService}                              A new QueueService object with the SAS credentials.
*/
exports.createQueueServiceWithSas = function(hostUri, sasToken) {
  return new QueueService(null, null, hostUri, sasToken);
};

/**
* Account SAS
* @ignore
*/

var azureCommon = require('./common/common.node');
var StorageServiceClient = azureCommon.StorageServiceClient;
var SharedKey = azureCommon.SharedKey;
/**
* Generates an account shared access signature token
* 
* @param {string}                     [storageAccountOrConnectionString]                The storage account or the connection string.
* @param {string}                     [storageAccessKey]                                The storage access key.
* @param {object}                     sharedAccessPolicy                                The shared access policy.
* @param {SharedAccessServices}       sharedAccessPolicy.AccessPolicy.Services          The services (blob, file, queue, table) for a shared access signature associated with this shared access policy.
*                                                                                       Refer to `Constants.AccountSasConstants.Services`.
* @param {SharedAccessResourceTypes}  sharedAccessPolicy.AccessPolicy.ResourceTypes     The resource type for a shared access signature associated with this shared access policy.
*                                                                                       Refer to `Constants.AccountSasConstants.ResourceTypes`.
* @param {SharedAccessPermissions}    sharedAccessPolicy.AccessPolicy.Permissions       The permissions for a shared access signature. 
*                                                                                       Refer to `Constants.AccountSasConstants.Permissions`.
* @param {date}                       sharedAccessPolicy.AccessPolicy.Start             The time at which the Shared Access Signature becomes valid.
* @param {date}                       sharedAccessPolicy.AccessPolicy.Expiry            The time at which the Shared Access Signature becomes expired.
* @param {string}                     sharedAccessPolicy.AccessPolicy.IPAddressOrRange  The permission type. Refer to `Constants.AccountSasConstants.ResourceTypes`.
* @param {string}                     sharedAccessPolicy.AccessPolicy.Protocols          The possible protocols. Refer to `Constants.AccountSasConstants.ResourceTypes`.
*/
exports.generateAccountSharedAccessSignature = function(storageAccountOrConnectionString, storageAccessKey, sharedAccessAccountPolicy)
{
  var storageSettings = StorageServiceClient.getStorageSettings(storageAccountOrConnectionString, storageAccessKey);
  var sharedKey = new SharedKey(storageSettings._name, storageSettings._key);
  
  return sharedKey.generateAccountSignedQueryString(sharedAccessAccountPolicy);
};


/**
* A callback that returns a response object.
* @callback errorOrResponse
* @param {object} error         If an error occurs, will contain information about the error.
* @param {object} response      Contains information about the response returned for the operation.
*                               For example, HTTP status codes and headers.
*/

/**
* A callback that returns result and response objects.
* @callback errorOrResult
* @param {object} error         If an error occurs, will contain information about the error.
* @param {object} result        The result of the operation.
* @param {object} response      Contains information about the response returned for the operation.
*                               For example, HTTP status codes and headers.
*/


/**
* Specifying conditional headers for blob service operations. See http://msdn.microsoft.com/en-us/library/dd179371.aspx for more information.
* @typedef    {object}          AccessConditions
* @property   {string}          EtagMatch                       If the ETag for the blob matches the specified ETag.
*                                                               Specify the wildcard character (*) to perform the operation only if the resource does exist, and fail the operation if it does not exist.
* @property   {string}          EtagNonMatch                    If the ETag for the blob does not match the specified ETag.
*                                                               Specify the wildcard character (*) to perform the operation only if the resource does not exist, and fail the operation if it does exist.
* @property   {Date|string}     DateModifedSince                If the blob has been modified since the specified date.
* @property   {Date|string}     DateUnModifiedSince             If the blob has not been modified since the specified date.
* @property   {Number|string}   SequenceNumberLessThanOrEqual   If the blob's sequence number is less than or equal to the specified value.
*                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
* @property   {Number|string}   SequenceNumberLessThan          If the blob's sequence number is less than the specified value.
*                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
* @property   {Number|string}   SequenceNumberEqual             If the blob's sequence number is equal to the specified value.
*                                                               For Put Page operation only. See https://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more information.
* @property   {Number|string}   MaxBlobSize                     If the Append Block operation would cause the blob to exceed that limit or if the blob size is already greater than the specified value. 
*                                                               For Append Block operation only. See https://msdn.microsoft.com/en-us/library/mt427365.aspx for more information.
* @property   {Number|string}   MaxAppendPosition               If the append position is equal to the specified value.
*                                                               For Append Block operation only. See https://msdn.microsoft.com/en-us/library/mt427365.aspx for more information.
*/

/**
* The properties of a storage service, including properties of Storage Analytics and CORS (Cross-Origin Resource Sharing) rules.
* @typedef    {object}              ServiceProperties
* @property   {string}              DefaultServiceVersion  The default version of Storage Analytics currently in use.
* @property   {LoggingProperties}   Logging                The Logging settings.
* @property   {MetricsProperties}   HourMetrics            The HourMetrics settings provide a summary of request statistics grouped by API in hourly aggregates.
* @property   {MetricsProperties}   MinuteMetrics          The HourMetrics settings provide request statistics grouped by API for each minute.
* @property   {object}              Cors                   Groups all CORS rules.
* @property   {CorsRule[]}          Cors.CorsRules         Groups settings for a `[CORS rule]{@link CorsRule}`.
*/

/**
* The Azure Analytics logging settings.
* @typedef    {object}          LoggingProperties
* @property   {string}          Version                    The version of Storage Analytics currently in use for logging.
* @property   {boolean}         Delete                     Indicates whether delete requests are being logged.
* @property   {boolean}         Read                       Indicates whether read requests are being logged.
* @property   {boolean}         Write                      Indicates whether write requests are being logged.
* @property   {RetentionPolicy} RetentionPolicy            The retention policy of the log data.
*/

/**
* The setting of Azure Analytics summary of request stastics.
* @typedef    {object}          MetricsProperties
* @property   {string}          Version                    The version of Storage Analytics currently in use for hour metrics.
* @property   {string}          Enabled                    Indicates whether metrics are enabled
* @property   {boolean}         IncludeAPIs                Indicates whether metrics generate summary statistics for called API operations.
* @property   {RetentionPolicy} RetentionPolicy            The retention policy of the metrics data.
*/

/**
* The CORS rule of a storage service.
* @typedef    {object}          CorsRule
* @property   {string[]}        AllowedMethods             A list of HTTP methods that are allowed to be executed by the origin. For Azure Storage, permitted methods are DELETE, GET, HEAD, MERGE, POST, OPTIONS or PUT.
* @property   {string[]}        AllowedOrigins             A list of origin domains that are allowed via CORS, or "*" if all domains are allowed.
* @property   {string[]}        AllowedHeaders             A list of headers allowed to be part of the cross-origin request.
* @property   {string[]}        ExposedHeaders             A list of response headers to expose to CORS clients.
* @property   {number}          MaxAgeInSeconds            The number of seconds that the client/browser should cache a preflight response.
*/

/**
* The Azure Analytics logging or metrics retention policy.
* @typedef    {object}          RetentionPolicy
* @property   {boolean}         Enabled                    Indicates whether a retention policy is enabled for the storage service.
* @property   {number}          Days                       Indicates the number of days that logging data is retained. All data older than this value will be deleted.
*/

/**
* The access policy.
* @typedef    {object}          AccessPolicy
* @property   {string}          Permissions                The permission type.
* @property   {Date}            Start                      The time at which the access policy becomes valid.
* @property   {Date}            Expiry                     The time at which the access policy becomes expired.
* @property   {string}          IPAddressOrRange           An IP address or a range of IP addresses from which to accept requests. When specifying a range, note that the range is inclusive.
* @property   {string}          Protocols                  The protocols permitted for a request made with the SAS.
* @property   {string}          Services                   The services (blob, file, queue, table) for a shared access signature associated with this shared access policy.
* @property   {string}          ResourceTypes              The resource type for a shared access signature associated with this shared access policy.
*/

/**
* The service statistics.
* @typedef    {object}          ServiceStats
* @property   {object}          GeoReplication                  The geo replication stastics.
* @property   {string}          GeoReplication.Status           The status of the secondary location.
* @property   {Date}            GeoReplication.LastSyncTime     A GMT date/time value, to the second. 
*                                                               All primary writes preceding this value are guaranteed to be available for read operations at the secondary.
*                                                               Primary writes after this point in time may or may not be available for reads. 
*/

/**
* The range.
* @typedef    {object}          Range
* @property   {number}          start                     The start of the range.
* @property   {number}          end                       The end of the range.
*/

/**
* The range diff. Refer to https://msdn.microsoft.com/en-us/library/azure/mt736912.aspx
* @typedef    {object}          RangeDiff
* @property   {number}          start                     The start of the range.
* @property   {number}          end                       The end of the range.
* @property   {boolean}         isCleared                 If the range is cleared or not.

*/

exports.Constants = azureCommon.Constants;
exports.StorageUtilities = azureCommon.StorageUtilities;
exports.AccessCondition = azureCommon.AccessCondition;

exports.SR = azureCommon.SR;
exports.StorageServiceClient = StorageServiceClient;
exports.Logger = azureCommon.Logger;
exports.WebResource = azureCommon.WebResource;
exports.Validate = azureCommon.validate;
exports.date = azureCommon.date;

// Other filters
exports.LinearRetryPolicyFilter = azureCommon.LinearRetryPolicyFilter;
exports.ExponentialRetryPolicyFilter = azureCommon.ExponentialRetryPolicyFilter;
exports.RetryPolicyFilter = azureCommon.RetryPolicyFilter;