Note: This is an Azure Storage only package. The all up Azure node sdk still has the old storage bits in there. In a future release, those storage bits will be removed and an npm dependency to this storage node sdk will 
be taken. This is a GA release and the changes described below indicate the changes from the Azure node SDK 0.9.8 available here - https://github.com/Azure/azure-sdk-for-node.

2018.02 Version 2.8.0

ALL
* Updated storage service version to 2017-07-29.

BLOB
* Added support for Soft Delete feature.
* Fixed several blobuploader example issues.
* Fixed a compatibility issue for `getBlobToLocalFile` and `createReadStream` with Node.js v9.
* Fixed a bug that blob name will be wrongly trimmed to empty string when listing blobs.
* Fixed a bug when blob size > 32M, GetBlobStream returns root blob data instead of snapshot data.

FILE
* Fixed a compatibility issue for `getFileToLocalFile` and `createReadStream` with Node.js v9.

2017.12 Version 2.7.0

ALL
* Default HTTP connection will enable keep-alive to improve performance.

BLOB
* Added support for `getBlobProperties`, `listBlobsSegmented` and `listBlobsSegmentedWithPrefix` to return `AccessTierChangeTime` and `AccessTierInferred` properties.
* Fixed a blob lease support issue for `appendFromText` and `resizePageBlob`.

TABLE
* Fixed an apostrophe missing issue in `TableQuery.where()` example.

2017.10 Version 2.6.0

FILE

* Added support for file share snapshot.

2017.09 Version 2.5.0

ALL 
* Optimized samples and documentation for retry policies.
* Added additional samples for blob and file.

BLOB
* Optimized `commitBlocks` API implementation and documentation. 

FILE
* Added support for File metrics.

2017.08 Version 2.4.0

ALL
* Fixed a TypeScript issue that `browserFile` should be `Object` type in the TypeScript definition file.

BLOB
* Added support for getting and setting a tier for a block blob under a LRS Blob Storage Account from tiers hot, cool and archive.

2017.08 Version 2.3.0

ALL
* Updated storage service version to 2017-04-17. For more information, please see - https://docs.microsoft.com/en-us/rest/api/storageservices/versioning-for-the-azure-storage-services
* Updated the dependency of the 'request' module to avoid security vulnerability: (https://snyk.io/test/npm/azure-storage). 
* Added `requestServerEncrypted` property to `ServiceResponse` which indicates if the contents of the request have been successfully encrypted.
* Improved API documentation.

BLOB
* PageBlobs: For Premium Accounts only, added support for getting and setting the tier on a page blob. The tier can also be set when creating or copying from an existing page blob.

FILE
* Added `serverEncryped` property to `FileResult` and `DirectoryResult` which indicates if the file data and application metadata are completely encrypted using the specified algorithm on the server.
* Fixed a TypeScript issue that SharedAccessPermissions for FileUtilities is missing in type definition file.

TABLE
* Fixed a typo in table query example for combineFilters function.

2017.08 Version 2.2.2

ALL

* Fixed a retry timeout issue during uploading.

2017.07 Version 2.2.1

BLOB

* Optimized memory usage especially for uploading blobs with large block size.

2017.06 Version 2.2.0

ALL
* Fixed a TypeScript issue that callback of `createWriteStreamToBlockBlob` should be optional in the TypeScript definition file.
* Fixed a bug in TypeScript definition file about `AccessConditions` mismatches with `AccessCondition` which is exported in JavaScript.
* Fixed an undefined property issue in `BlobResult` object of the sample code.
* Updated node-uuid to uuid.
* Updated underscore version to 1.8.3.
* Updated validator version to 3.35.0.

BLOB
* Added a `defaultEnableReuseSocket` option for `BlobService` to control reuseSocket settings.
* Fixed a hanging or silent failing issue for blob uploading under some situations.
* Fixed a bug that `doesBlobExist` does not support `snapshotId` parameter.
* Fixed a bug in `getBlobToLocalFile` that `fs` will throw exceptions instead of returning errors in callback.

FILE
* Added a `defaultEnableReuseSocket` option for `FileService` to control reuseSocket settings.
* Fixed a hanging or silent failing issue for file uploading under some situations.
* Fixed a bug in `getFileToLocalFile` that `fs` will throw exceptions instead of returning errors in callback.

2017.03 Version 2.1.0

ALL
* Fixed the type script issue that AccessConditions is missing in the type definition file.

BLOB
* Added support for page blob incremental copy. Refer to https://docs.microsoft.com/en-us/rest/api/storageservices/fileservices/incremental-copy-blob

QUEUE
* Fixed the issue that `responseObject` may not have response body in `createMessage` function.

BROWSER
* Generated browser compatible JavaScript files based on Microsoft Azure Storage SDK for Node.js 2.1.0

2017.01 Version 2.0.0

ALL
* Updated storage service version to 2016-05-31. Fore more information, please see - https://msdn.microsoft.com/en-us/library/azure/dd894041.aspx
* Fixed the issue that `BatchOperation` doesn't support socket reuse for some node versions.
* Fixed the issue that `BatchOperation` request pool size is too big when the socket reuse is supported.
* Added empty headers to string-to-sign.
* For response has body and no `content-type` header, try to parse the body using xml format.
* Fixed the issue that retry filter will continuously retry for client error like `ETIMEDOUT`.
* Added support for client side timeout. In order to set the timeout per API, please use `options.clientRequestTimeoutInMs`. To set the default value for all requests made via a particular service, please use `{blob|queue|table|file}Service.defaultClientRequestTimeoutInMs`.

BLOB
* Added support for large block blob. 
* Added `publicAccessLevel` to `ContainerResult` for the APIs `listContainersSegmented` and `listContainersSegmentedWithPrefix`.
* When specifying access condition `If-None-Match: *` for reading, it will always fail.
* Returned content MD5 for range gets Blobs.
* Fixed the issue that `useTransactionalMD5` didn't take effect for downloading a big blob.

QUEUE
* `createMessage` callback has been changed from `errorOrResponse` to `errorOrResult<QueueMessageResult>` which contains `messageId`, `popReceipt`, `timeNextVisible`, `insertionTime` and `expirationTime`. It can be passed to updateMessage and deleteMessage APIs.

FILE
* Returned content MD5 for range gets Files.
* Fixed the issue that `useTransactionalMD5` didn't take effect for downloading a big file.
* Added support for listing files and directories with prefix, refer to `FileService.listFilesAndDirectoriesSegmentedWithPrefix`.

TABLE
* Fixed the issue that response in incorrect for table batch operation when the error response item is not the first item in the responses. 

2016.11 Version 1.4.0

ALL
* Added `ENOTFOUND` for secondary endpoint and `ECONNREFUSED` to `RetryPolicyFilter`.
* Added support for `text/html` error response body.

BLOB
* Fixed the issue that the ChunkAllocator maxCount is aligned with parallelOperationThreadCount.
* Changed `/S` of SpeedSummary to `/s`.
* Fixed the issue that `BlobService.createBlockBlobFromText` will hang when passed `null` or `undefined` `text` argument. 
* Fixed the issue that `BlobService.createBlockBlobFromText` will always set `content-type` to `text/plain`.

QUEUE
* Allowed `QueueService.peekMessages` against secondary endpoint.

FILE
* Fixed the issue that the ChunkAllocator maxCount is aligned with parallelOperationThreadCount.
* Changed `/S` of SpeedSummary to `/s`.

2016.10 Version 1.3.2

BLOB
* Prevent a blockId from being generated with a decimal point.

2016.09 Version 1.3.1

ALL
* Improved the type script support.

2016.08 Version 1.3.0

ALL

* Fixed the issue that retry filter will fail against storage emulator.
* Fixed a hang issue of `StorageServiceClient` with retry policy filter set when retrying sending the request, the stream is not readable anymore.
* Updated the default value of `CorsRule.ExposedHeaders`, `CorsRule.AllowedHeaders` to empty and `CorsRule.MaxAgeInSeconds` to `0` for `setServiceProperties` APIs of all services.
* Fixed the issue that service SAS doesn't work if specifying the `AccessPolicy.Protocols`.

BLOB
* Added the API `BlobService.getPageRangesDiff` for getting the page ranges difference. Refer to https://msdn.microsoft.com/en-us/library/azure/mt736912.aspx for more detailed information.

QUEUE
* Updated the `QueueMessageResult.dequeueCount` from `string` to `number`.
* Added the API `QueueService.getUrl` for getting the queue url.

TABLE
* Added the API `TableService.getUrl` for getting the table url.

2016.07 Version 1.2.0

ALL
* Fixed the issue that metadata name will be converted to lower-case after retrieving back from the server. **Note** that this fix is only applicable for Node 0.12 or higher version.
* Added support for EndpointSuffix for all service constructors.
* Updated storage service version to 2015-12-11. Fore more information, please see - https://msdn.microsoft.com/en-us/library/azure/dd894041.aspx
* Updated the `request` package to version 2.74.0 to address the security vulnerability - https://nodesecurity.io/advisories/130

BLOB
* Fixed the issue that the service error message will be written to the destination stream if getting error when downloading the blob to a stream/file.
* Added `serverEncryped` property to `BlobResult` class which indicates if the blob data and application metadata are completely encrypted using the specified algorithm on the server.

FILE
* Fixed the issue that the service error message will be written to the destination stream if getting error when downloading the file to a stream/file.

TABLE
* The atom feed payload format is not supported anymore for table service APIs.

2016.06 Version 1.1.0

ALL
* Fixed the issue that using SAS doesn't work against storage emulator.
* Fixed the issue that the service SAS signature is incorrect when protocol parameter is specified.
* Fixed the issue that the timeout query string should be in seconds instead of milliseconds.

BLOB
* Added parameter snapshotId to BlobService.getUrl function to support getting url of a specified snapshot.
* Fixed the issue that the getUrl doesn't work against storage emulator.
* Fixed the race issue that the _rangeList may be deleted before using it in the BlockRangeStream._getTypeList function.
* Fixed the issue that downloading block blob with size bigger than 32MB will fail when using anonymous credential.
* Added `CREATE` to `BlobUtilities.SharedAccessPermissions`.

TABLE
* Supported string type value for entity PartionKey and RowKey.
* Supported implicit Edm type value for entity properties. The supported implicit Edm types including Int32, Double, Bool, DateTime and String.

FILE
* Fixed the issue that the getUrl doesn't work against storage emulator.
* Added `CREATE` to `FileUtilities.SharedAccessPermissions`.

2016.05 Version 1.0.1

ALL
* Fixed the issue that StorageServiceClient._normalizeError will throw exception on Node below v4 because string.startsWith is not available on Node below v4.

2016.05 Version 1.0.0

BLOB
* The `blob` property of BlobResult has been renamed to `name` to keep consistent with other services API and the `listBlob` API.
* Decoded the block name of LockListResult from base64 string to utf-8 string.

QUEUE
* The `encodeMessage` flag of QueueService has been replaced by `messageEncoder` which support `TextBase64QueueMessageEncoder`, `BinaryBase64QueueMessageEncoder`, `TextXmlQueueMessageEncoder` and custom implementation of QueueMessageEncoder.

TABLE
* Fixed the issue that loses the data type for Edm.Double value like: 1.0.
* Fixed the issue that loses the data precision for Edm.Int64 value when it is outisde of the range (2^53 - 1) to -(2^53 - 1).

2016.03 Version 0.10.0

ALL
* The `signedIdentifiers` parameter and result properties have been changed from array to hash map to avoid non unique signed identifier id.

BLOB
* Added 'COPY' to the BlobUtilities.BlobListingDetails to include copy information in the results.
* Added 'bytesCopied' and 'totalBytes' to the blob result.
* Added the blob result to the callback of BlobService.commitBlocks.
* Moved the properties in the properties object of BlobResult and ContainerResult when listing blobs or containers to the result object.
* Renamed the property names returned from listing blobs or containers to camelCase.
* The `contentType`, `contentEncoding`, `contentLanguage`, `contentDisposition`, 'contentMD5' and `cacheControl` parameters and return values about the blob's content settings are grouped into a `contentSettings` sub property. 
* The `contentMD5` parameter to verify the integrity of the data during the transport is changed to `transactionalContentMD5`
* The `copy*` return values are grouped into a `copy` sub property.
* The `lease*` return values are grouped into a `lease` sub property.
* The options.accessConditions parameter is changed to AccessConditions type.

QUEUE
* Renamed QueueResult.approximatemessagecount to camelCase and change its type to 'number.
* Renamed the property names of QueueMessageResult to camelCase.
* Renamed the parameter options.messagettl of the createMessage API to options.messageTimeToLive.
* Updated the callback of the createMessage API from errorOrResult to errorOrResponse.
* Removed peekOnly option from the options parameter of the getMessages API. To peek messages, use peekMessages instead.
* Added getMessage and peekMessage API.

FILE
* Moved the properties in the properties object of FileResult and ShareResult when listing files or shares to the result object.
* Renamed the property names returned from listing files or shares to camelCase.
* Renamed the property names returned from getting share stats to camelCase.
* The `contentType`, `contentEncoding`, `contentLanguage`, `contentDisposition`, 'contentMD5' and `cacheControl` parameters and return values about the blob's content settings are grouped into a `contentSettings` sub property. 
* The `contentMD5` parameter to verify the integrity of the data during the transport is changed to `transactionalContentMD5`
* The `copy*` return values are grouped into a `copy` sub property.
* Fixed the issue that SAS tokens created from table names with upper-case letters do not work.
* The options.accessConditions parameter is changed to AccessConditions type.

TABLE
* Fixed the issue that getTableAcl returns empty array with signedIdentifier property.
* Renamed the function updateEntity to replaceEntity.
* Renamed TableUtilities.entityGenerator.Entity to EntityProperty.

2016.03 Version 0.9.0

ALL
* Updated storage service version to 2015-04-05. Fore more information, please see - https://msdn.microsoft.com/en-us/library/azure/dd894041.aspx
* Added support for Account SAS.
* Added support for IPACL and Protocols options for service SAS.
* Fixed the issue where the authentication may fail when a metadata key is in upper case.
* Added 'nsp check' task for security vulnerability check.
* Updated the dependency of the 'request' module to avoid the security vulnerability reported by the 'nsp' tool.

BLOB
* Added new permission 'ADD' for service SAS.

FILE
* Added support for metrics setting for service properties.

2016.01 Version 0.8.0

ALL
* Preview release of the TypeScript definition file at "lib/azure-storage.d.ts". 

BLOB
* Added the blob result to the callback of BlobService.commitBlocks.
* Added the speed summary to the downloading APIs.

2015.12 Version 0.7.0

ALL
* Fixed the typo in the function generateDevelopmentStorageCredentials.
* Fixed the issue that the HTTP global agent setting is changed during parallel uploading and downloading and impacts on other Node.js applications.
* Fixed the issue that the chunked stream writing methods do not accept string.
* Fixed the issue that the request fails when the content-length is set to string '0' in the 'sendingRequestEvent' event handler. 
* Supported retry on XML parsing errors when the XML in the response body is corrupted.
* Replaced the dependency "mime" to "browserify-mime" to work with Browserify.

BLOB
* Added an option to skip the blob or file size checking prior to the actual downloading.
* Fixed the issue that it doesn't callback when loses the internet connection during uploading/uploading.
* Fixed the issue that the local file cannot be removed in the callback when uploading a blob from a local file.
* Fixed the issue that the stream length doesn't work when it is larger than 32MB in the createBlockBlobFromStream, createPageBlobFromStream, createAppendBlobFromStream and appendFromStream functions.
* Fixed the issue that it doesn't return error in the page range validation when the size exceeds the limit.
* Renamed the function AppendFromLocalFile to appendFromLocalFile.
* Renamed the function AppendFromStream to appendFromStream.
* Renamed the function AppendFromText to appendFromText.

TABLE
* Fixed the issue that listTablesSegmentedWithPrefix with maxResult option throws exception.

2015.09 Version 0.6.0

ALL
* Fixed the MD5 mismatch issue in uploading a blob when running with Node.js v4.0 or io.js.

BLOB
* Fixed the issue that it doesn't prompt appropriate error message when the source URI is missing in BlobService.startCopyBlob().

2015.08 Version 0.5.0

ALL
* Updated storage service version to 2015-02-21. For more information, please see - https://msdn.microsoft.com/en-us/library/azure/dd894041.aspx
* Unified the function parameters for setting ACL of container, table, queue and share.
* Renamed 'AccessPolicy.Permission' to 'AccessPolicy.Permissions' on the result object from get*Acl to match the property name on the signedIdentifier property passed to set*Acl calls.
* Unified the name pattern of the http header constants.
* Split the property parameters from the options parameter for setting properties of blob, share and file.
* Updated the error message when an argument is in a wrong type while it requires a string.
* Exported AccessCondition to generate an object that represents a condition.
* Fixed an issue that the SAS in the SharedAccessSignature part of the connection string cannot start with '?'.
* Deprecated the generateSharedAccessSignatureWithVersion() method in each service.

BLOB
* Supported operating against append blobs.
* Fixed an issue that the file descriptor in the FileReadStream is not closed.

QUEUE
* Fixed an issue that options.messageText doesn't work in QueueService.updateMessage.

2015.06 Version 0.4.5

* Updated the dependency of the 'request' module to avoid the security vulnerability reported by the 'nsp' tool: (https://nodesecurity.io/advisories/qs_dos_extended_event_loop_blocking) and (https://nodesecurity.io/advisories/qs_dos_memory_exhaustion).
* Included package validation in grunt tasks.

2015.05 Version 0.4.4

ALL
* Updated the dependency of the 'validator' module to avoid the security vulnerability reported by the 'nsp' tool. (https://nodesecurity.io/advisories/validator-isurl-denial-of-service)
* Updated the error message when an argument is in a wrong type while it requires a string.
* Updated the grunt file to run test with mocha and generate jsDoc.

BLOB
* Fixed an issue that the metadata is duplicated when creating a page blob.
* Fixed an issue that the metadata is duplicated when setting blob's metadata with metadata in the options.
* Fixed an issue that cannot create an empty block blob with useTransactionalMD5 option.

FILE
* Fixed an issue that the result of file downloading contains wrong values for share, directory or file names.

TABLE
* Fixed an issue that it prompts "Cannot set property 'isSuccessful' of null" when TableService.createTableIfNotExists is called.

2015.03 Version 0.4.3

ALL
* Fixed an issue that setting metadata keys are converted into lowercase. The metadata keys retrieved from the service will however still be converted into lowercase by the http component of Node.js.(https://github.com/joyent/node/issues/1954)
* Included all storage error code strings in the error constants definition.
* Documented the client request ID option in all APIs.

BLOB
* Supported listing blob virtual directories.
* Fixed an issue that exception is thrown when downloading a blob larger than 32MB to a stream.
* Fixed an issue that the process exits when the free memory is low.

2014.12 Version 0.4.2

ALL
* Fixed an issue that batch operation could probably wait without callback.
* Added the readable-stream module to adapt stream operations in both node 0.8 and node 0.10.
* Supported nock in tests.

BLOB
* Supported trimming the default port of http or https when getting URL for the blob service.
* Fixed an issue that the metadata is not populated when getting the blob to text.

FILE
* Supported trimming the default port of http or https when getting URL for the file service.

2014.11.28 Version 0.4.1

ALL
* Fixed an issue where the request does not invoke the callback when the input stream ends with an 'end' event instead of a 'finish' event.
* Fixed an issue where the request does not invoke the callback when the input stream ends with a 'close' event on Node 0.8.X.
* Fixed an issue that the temporary files generated by unit tests are not cleaned up.
* Fixed an issue that the unit tests may fail when the file generated by previous tests is not accessible temporarily.

FILE
* Added support to download a single file in parallel similar to upload. You can set ‘parallelOperationThreadCount’ option for api’s that download a file to indicate number of parallel operations to use for download.

TABLE
* Fixed an issue which caused invalid input errors when the partition key or the row key contains an apostrophe.

2014.10.28 Version 0.4.0

ALL
* Provide an option to enable/disable nagling. Nagling is disabled by default. It can be enabled by setting options.useNagleAlgorithm to true.
* Added batch operation callback in sequence mode.

BLOB
* Added support to download a single blob in parallel similar to upload. You can set ‘parallelOperationThreadCount’ option for api’s that download a blob to indicate number of parallel operations to use for download.
* Added speed summary in blob downloading.

FILE
* Fixed an issue which caused an invalid resource name error when the directory name starts or ends with a '/'

2014.08.20 Version 0.3.3

BLOB
* Fixed an issue where SAS tokens were being incorrectly generated for the root container and when the blob name required encoding.
* Documented the 'parallelOperationThreadCount' option as input to various uploadBlob APIs.

FILE
* Fixed an issue where signing was incorrect when the URI contained '.' or '..'.
* Fixed an issue where "getURI" was requiring a file parameter, although the parameter should be optional.

2014.07.25 Version 0.3.2

ALL
* Fixed an issue which prevented transient server errors like ECONNRESET, ESOCKETTIMEDOUT and ETIMEDOUT from being retried.

BLOB
* Fixed an issue which caused a reference error in blobs due to 'err' not being defined.

2014.07.22 Version 0.3.1

ALL
* Fixed an issue which failed to validate special names for containers and tables.
* Exposed the Validation utility methods so users can use it to validate resource names.

BLOB
* Fixed an issue which caused failures when an error was encountered while uploading big blobs.

2014.07.07 Version 0.3.0

BLOB
* Fixed an issue which failed to return single item blocklists while doing listBlocks.

FILE
* Added File Service support. The File Service and the associated APIs are in preview.

2014.07.01 Version 0.2.1

ALL
* Fixed an issue with casing which caused the module to fail on linux machines.

BLOB
* Fixed an issue which failed to upload an empty blob for empty block blob files uploaded using createBlockBlobFromFile when retry policies were used.

2014.06.16 Version 0.2.0

ALL
* Updated storage service version to 2014-02-14. The SAS tokens generated will therefore contain a signed version of 2014-02-14 and all the requests using SAS credentials have the api-version query parameter appended to the URI.

2014.06.12 Version 0.1.0

ALL
* The package has been renamed to azure-storage.
* There is no separate azure-common sub-package. Everything is condensed into a single package called azure-storage.
* azure.create*Service supports the following configurations:
	* create*Service(connection string)
	* create*Service(account name, account key)
	* create*Service(storage host, sasToken)
* Added the ability to choose which SAS Version to use when generating Shared Access Signatures (either the 2012-02-12 or 2013-08-15 versions).
* Host can be given as either an object with primaryHost and secondaryHost or as a string representing the primary.
* The order credentials are assessed is consistent: If parameters are passed in, they and they alone are honored. There is no mixing (ex, if users pass in host, they won't get the access key from your env var). If no parameters are passed in, the env vars are used. Within both those strategies, the order of evaluation is emulator (in the case of EMULATED env var only), connection string, account/key or SAS, anonymous. If account/key and SAS are passed in, an error is thrown indicating the credentials are invalid.
* Removed the ability to create a storage service from a config file.
* azure.create*Service supports secondaryHost only, but either primaryHost or secondaryHost must be provided.
* Storage service client constructors take the sasToken rather than a credentials object, meaning that the SharedAccessSignature class no longer needs to be used by consumers.
* Ensure request is always built/signed for every retry attempt.
* Custom retry policies should implement the shouldRetry method and return an object with the retryInterval and retryable information in it. Optionally, they can also set the locationMode and targetLocation to which the request should be sent.
* Implemented RA-GRS support. For more information on this, please see - http://blogs.msdn.com/b/windowsazurestorage/archive/2013/12/04/introducing-read-access-geo-replicated-storage-ra-grs-for-windows-azure-storage.aspx
* Service properties updated: replaced metrics with hour metrics and minute metrics, added cors support, added defaults if properties are unspecified to reduce invalid xml exceptions.
* Added maximum execution time, settable for all requests via {blob|queue|table}service.defaultMaximumExecutionTime or for an individual request via options.maximumExecutionTime. This applies to all requests except blob downloads.
* The blob, queue and table services no longer set/modify any values within the options object optionally passed in by the user for every API. 
* Fixed an issue where null, empty and white-space only metadata header values were allowed.
* "timeout" query parameter will not be sent to the server if not set by the user. In order to set the timeout per API, please use options.timeoutIntervalInMs. To set it for all requests made via a particular service, please use {blob|queue|table}Service.defaultTimeoutIntervalInMs.
* ECONNRESET is handled in the retry policy filter.
* DevStore with secondary access is supported.
* Set*Acl takes signed identifiers as a parameter - before it was in options.
* GenerateSharedAccessSignature() produces a query string rather than an object.
* The SharedKey class has the methods to create shared access signatures. These should not be in the SharedAccessSignature class because one can only create a SAS if they have the account/key. 
* The service client no longer evaluates the port and protocol set on it. Before, if storageserviceclient.host was called and port and protocol had been changed after host was set, host would be incorrect. 
* Removed SharedKeyLite and SharedKeyLiteTable in favor of SharedKey and SharedKeyTable which were already the defaults.
* Added separate utility files for Blob, Queue, Table, and Storage. These contain useful enums that were previously found in a single Constants file as well as new utility functions. The old Constants file will mostly include internal-use constants.

BLOB
* createBlobServiceWithSas has been provided to create a blobService to use with a Shared Access Signature. Users can create a blobService using azure.createBlobServiceWithSas(host, sasToken).
* Anonymous access for the blob service is supported.
* Added support for 2013-08-15 Blob SAS changes.
* Renamed listBlobs to listBlobsSegmented and added listBlobsSegmentedWithPrefix. listBlobsSegmented takes in currentToken and listBlobsSegmentedWithPrefix takes in prefix and currentToken along with other parameters. Please look at the documentation of these APIs for a list of parameters that users can set on the options object. These APIs return only error, result and response. The result contains entries which is a list of blobs and a continuation token for successive listing operations.
* Renamed copyBlob to startCopyBlob.
* Renamed putBlockBlobFromStream to _putBlockBlobFromStream and putBlockBlobFromFile to _putBlockBlobFromFile. These are internal methods and should not be called by users directly. Please use createBlockBlobFromStream and createBlockBlobFromFile.
* Renamed page methods: listBlobRegions to listPageRanges, createBlobPagesFromText to createPagesFromText, clearBlobPages to clearPageRanges.
* Renamed block methods: createBlobBlockFromStream to createBlockFromStream, createBlobBlockFromText to createBlockFromText, commitBlobBlocks to commitBlocks, listBlobBlocks to listBlocks.
* BlobService lease methods also work with container leases, simply specify null for the blob parameter.
* Added changeLease method to modify the lease ID of an active lease.
* Fixed lease issues, break lease allows a leaseBreakPeriod of 0, lease time header is returned as an int rather than a string.
* Added snapshot delete options: when deleting a blob with snapshots, users can decide to delete blob and snapshots or just snapshots. The options are provided in BlobUtilities.SnapshotDeleteOptions.*.
* deleteBlob callback does not return isSuccessful.
* Added does{Container|Blob}Exist methods in blobservice that can be used to determine if a particular container or blob exists.
* Added delete{Container|Blob}IfExists methods in blobservice that can be used to delete a container or a blob only when they exist.
* Added ContentMD5 validation for blob downloads. This is turned on by default for all block blob downloads and all page blob range downloads as long as the range is less than 4MB. In order to turn this off, set options.disableContentMD5Validation to true explicitly.
* x-ms-range-get-content-md5 is set internally by the library and users do not have to specify it in the options.
* Removed the option of doing range downloads while downloading a blob to text.
* Added sequence number support for page blobs. Users can set the sequence number of a page blob using blobService.setPageBlobSequenceNumber and manage concurrency issues using x-ms-if-sequence-number-le, x-ms-if-sequence-number-lt and x-ms-if-sequence-number-eq. Please see http://msdn.microsoft.com/en-us/library/azure/ee691975.aspx for more details about using sequence numbers.
* Removed createBlob API. Please use createPageBlob and createBlockBlob* APIs to create the respective blobs.
* Renamed createPagesFromText to _createPagesFromText. This is an internal method and should not be called by users directly.
* Added resizePageBlob that can be used to resize a page blob. 
* createPageBlob takes in the blob's sequence number using options.sequenceNumber.
* All the BlobService APIs that took cacheControl/cacheControlHeader, contentType/contentTypeHeader, contentEncoding/contentEncodingHeader, contentLanguage/contentLanguageHeader, contentMD5/contentMD5Header in options only take cacheControl, contentType, contentEncoding, contentLanguage and contentMD5. These are the values that will be set on the blob at the server.
* createPagesFromStream takes in the following 2 options - useTransactionalMD5 to calculate and send/validate content MD5 for each transaction and contentMD5 which is an optional hash value. When contentMD5 is provided, the client library uses that instead of trying to calculate it based on the data being uploaded.
* createBlockBlobFromText, createBlockFromStream and createBlockFromText allows users to set useTransactionalMD5 on options to calculate and send/validate content MD5 for each transaction.
* Added createWriteStreamToBlockBlob, createWriteStreamToNewPageBlob and createWriteStreamToExistingPageBlob that provide a stream for writing to the blob.
* Added createReadStream that provides a stream for reading from the blob.
* blobService can have a default parallelOperationThreadCount which specifies the number of parallel upload operations that may be performed when uploading a blob that is greater than the value specified by singleBlobPutUploadThresholdInBytes. This value can be set using blobService.parallelOperationThreadCount. The default value set on blobService is 1.
* createBlockBlobFromText supports text Buffers in addition to strings.
* createBlockBlobFromText will throw an error if the uploaded content exceeds 64MB.
* BlobService getBlobUrl has been renamed to getUrl as it can also produce container urls. It can no longer create a SAS token (it used to take sharedAccessPolicy) but can take a sasToken produced by the generateSharedAccessSignature method and produce a url with that.

QUEUE
* Added Shared Access Signatures for queues. createQueueServiceWithSas has been provided to create a queueService to use with a Shared Access Signature. Users can create a queueService using azure.createQueueServiceWithSas(host, sasToken).
* Renamed listQueues to listQueuesSegmented and added listQueuesSegmentedWithPrefix. listQueuesSegmented takes in currentToken and listQueuesSegmentedWithPrefix takes in prefix and currentToken along with other parameters. Please look at the documentation of these APIs for a list of parameters that users can set on the options object. These APIs return only error, result and response. The result contains entries which is a list of queues and a continuation token for successive listing operations.
* deleteQueue and deleteMessage callbacks do not return isSuccessful.
* Added an option in the queue service to turn base 64 encoding off.

TABLE
* Added Shared Access Signatures for tables. createTableServiceWithSas has been provided to create a tableService to use with a Shared Access Signature. Users can create a tableService using azure.createTableServiceWithSas(host, sasToken).
* Added JSON support for tables and removed AtomPub. For the different flavours of JSON supported, please see - http://blogs.msdn.com/b/windowsazurestorage/archive/2013/12/05/windows-azure-tables-introducing-json.aspx.
* Renamed queryTables to listTablesSegmented and added listTablesSegmentedWithPrefix. listTablesSegmented takes in currentToken and listTablesSegmentedWithPrefix takes in prefix and currentToken along with options and callback. Please look at the documentation of these APIs for a list of parameters that users can set on the options object. These APIs return only error, result and response. The result contains entries which is a list of tables and a continuation token for successive listing operations.
* deleteTable and deleteEntity callbacks do not return isSuccessful.
* queryEntities in TableService returns 3 parameters instead of 4: the entities and queryResultContinuation parameters are returned within a queryResult object.
* Added support for disabling echo content in inserts. By default, inserts do not echo content.
* Changed table error parsing so that the code string and message string are directly accessible from the error object.
* Removed the getTable method; doesTableExist works similarly.
* createTable does not request content back from the service, but still returns an object containing the TableName.
* Renamed queryEntity in TableService to retrieveEntity.
* Modified how batches work. Instead of turning the service batch mode on/off, a batch is a separate entity like query. Batches are constructed and then executed.
* queryEntities in TableService requires a continuation token.
* TableService updateEntity, mergeEntity and deleteEntity do not take a checkEtag option. The entity's etag is sent if it exists, otherwise * is sent.
* retrieveEntity and queryEntities accept empty partition and row keys.
* Added entity-property-creation helper methods. Users can use the entityGenerator provided in TableUtilities and create entity properties as follows:
	var entGen = TableUtilities.entityGenerator;
	var entity = { 	PartitionKey: entGen.String('part2'),
					RowKey: entGen.String('row1'),
					boolValueTrue: entGen.Boolean(true),
					boolValueFalse: entGen.Boolean(false),
					intValue: entGen.Int32(42),
					dateValue: entGen.DateTime(new Date(Date.UTC(2011, 10, 25))),
					complexDateValue: entGen.DateTime(new Date(Date.UTC(2013, 02, 16, 01, 46, 20)))
				 };
* Removed TableQuery whereKeys method. Instead of tableQuery.whereKeys, tableService.retrieveEntity should be used. 
* Removed TableQuery whereNextKeys method. Instead of tableQuery.whereNextKeys, tableService.queryEntities takes currentToken which can be retrieved from a previous queryEntities call in results.
* Removed TableQuery from method. Instead of tableQuery.from, tableService.queryEntities takes table and tableQuery may be null to represent retrieving all entities in the table.
* TableQuery select is an instance method for consistency with top and where. Instead of TableQuery.select('foo'), use new TableQuery().select('foo').
* TableQuery provides helper methods to create filter strings to use with the where clause for a query. Query strings may also include type specifiers where necessary.
  For example, to query on a long value, users could do the following:
 	var tableQuery = new TableQuery().where(TableQuery.int64Filter('Int64Field', TableUtilities.QueryComparisons.EQUAL, '4294967296'));
	OR
	var tableQuery = new TableQuery().where('Int64Field == ?int64?', '4294967296');

2013.01.15 Version 0.8.0
* Added the Preview Service Management libraries as separate modules
* Added ability to consume PEM files directly from the Service Management libraries
* Added support for createOrUpdate and createRegistrationId in the Notification Hubs libraries

2013.01.10 Version 0.7.19
* Lock validator version

2013.11.27 Version 0.7.18
* Lock xmlbuilder version

2013.11.5 Version 0.7.17
* Added getBlob and createBlob operations that support stream piping
* Added compute, management, network, serviceBus, sql, storage management, store and subscription preview wrappers
* Multiple bugfixes

2013.10.16 Version 0.7.16
* Improved API documentation
* Updated Virtual Machines API to 2013-06-01
* Added website management preview wrappers
* Multiple bugfixes

2013.08.19 Version 0.7.15
* Multiple storage fixes
* Fix issue with Notification Hubs template message sending

2013.08.12 Version 0.7.14
* Multiple storage fixes
* Documentation improvements
* Added support for large blobs upload / download

2013.08.08 Version 0.7.13
* Lock request version

2013.07.29 Version 0.7.12
* Added MPNS support
* Added Service management vnet operations support

2013.07.10 Version 0.7.11
* Hooked up new configuration system to storage APIs
* Support for AZURE_STORAGE_CONNECTION_STRING environment variable
* Included API for websites management
* Fixed UTF-8 support in table batch submit

2013.06.26 Version 0.7.10
* Various fixes in storage APIs

2013.06.19 Version 0.7.9
* First part of new SDK configuration system
* Support for AZURE_SERVICEBUS_CONNECTION_STRING environment variable
* Updated SAS generation logic to include version number
* Infrastructure support for creating passwordless VMs

2013.06.13 Version 0.7.8
* Updates to HDInsight operations

2013.06.06 Version 0.7.7
* Added support for Android notification through Service Bus Notification Hubs
* Support prefixes when listing tables
* Support '$logs' as a valid blob container name to support reading diagnostic information
* Fix for network configuration serialization for subnets

2013.05.30 Version 0.7.6
* Added list, delete and create cluster operations for HD Insight.

2013.05.15 Version 0.7.5
* Fixed registration hubs issue with requiring access key when shared key was provided.
* Fixed registration hubs issue with listByTag, Channel and device token

2013.05.09 Version 0.7.4
* Fixed encoding issue with partition and row keys in table storage query

2013.05.01 Version 0.7.3
* Fixed issue #680: BlobService.getBlobUrl puts permissions in SAS url even if not given
* Changes to test suite & sdk to run in other environments
* Notification hubs registrations
* Support in ServiceManagementClient for role reboot and reimage

2013.04.05 Version 0.7.2
* Removing workaround for SSL issue and forcing node version to be outside the > 0.8 && < 0.10.3 range where the issue occurs

2013.04.03 Version 0.7.1
* Adding (limited) support for node 0.10
* Fixing issue regarding registering providers when using websites or mobiles services

2013.03.25 Version 0.7.0
* Breaking change: Primitive types will be stored for table storage.
* Adding support for creating and deleting affinity groups
* Replacing http-mock by nock and making all tests use it by default
* Adding notification hubs messages for WNS and APNS
* Add Strict SSL validation for server certificates
* Add support for creating subscriptions that expire

2013.03.12 Version 0.6.11
* Added constraint to package.json to restrict to node versions < 0.9.

2013.02.11 Version 0.6.10
* Added helper date.* functions for generating SAS expirations (secondsFromNow, minutesFromNow, hoursFromNow, daysFromNow)
* Added SQL classes for managing SQL Servers, Databases and Firewall rules
* Updating to use latest xml2js

2012.12.12 Version 0.6.9
* Exporting WebResource, Client classes from package to support CLI.
* Install message updated to remind users the CLI is now a separate package.

2012.11.20 Version 0.6.8
 * CLI functionality has been pulled out into a new "azure-cli" module. See https://github.com/WindowsAzure/azure-sdk-tools-xplat for details.
 * Add support for sb: in ServiceBus connection strings.
 * Add functions to ServiceManagement for managing storage accounts.
 * Merged #314 from @smarx for allowing empty partition keys on the client.
 * Merged #447 from @anodejs for array enumeration and exception on batch response.
 * Various other fixes

2012.10.15 Version 0.6.7
 * Adding connection strings support for storage and service bus
 * Fixing issue with EMULATED and explicit variables making the later more relevant
 * Adding Github support
 * Adding website application settings support

2012.10.12 Version 0.6.6
 * Using fixed version of commander.js to avoid bug in commander.js 1.0.5

2012.10.01 Version 0.6.5
 * Bugfixing

2012.09.18 Version 0.6.4
 * Multiple Bugfixes around blob streaming

2012.09.09 Version 0.6.3
 * Fixing issue with xml2js

2012.08.15 Version 0.6.2
 * Multiple Bugfixes

2012.07.02 Version 0.6.1
 * Multiple Bugfixes
 * Adding subscription setting and listing functionality.

2012.06.06 Version 0.6.0
 * Adding CLI tool
 * Multiple Bugfixes

2012.04.19 Version 0.5.3
 * Service Runtime Wrappers
 * Multiple Bugfixes
 * Unit tests converted to mocha and code coverage made easy through JSCoverage

2012.02.10 Version 0.5.2
 * Service Bus Wrappers
 * Storage Services UT run against a mock server.
 * Node.exe version requirement lowered to raise compatibility.
 * Multiple Bugfixes

2011.12.14 Version 0.5.1
 * Multiple bug fixes

2011.12.09 Version 0.5.0
 * Initial Release
