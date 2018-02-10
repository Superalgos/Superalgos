Tracking Breaking Changes in 2.0.0

ALL
* Fixed the issue that retry filter will continuously retry for client error like `ETIMEDOUT`.

BLOB
* When specifiying access condition `If-None-Match: *` for read, it will always fail.

QUEUE
* `createMessage` callback has been changed from `errorOrResponse` to `errorOrResult<QueueMessageResult>` which contains `messageId`, `popReceipt`, `timeNextVisible`, `insertionTime` and `expirationTime`. It can be passed to `updateMessage` and `deleteMessage` APIs.

Tracking Breaking Changes in 1.4.0

BLOB
* Changed `/S` of SpeedSummary to `/s`.

FILE
* Changed `/S` of SpeedSummary to `/s`.

Tracking Breaking Changes in 1.3.0

QUEUE
* Updated the `QueueMessageResult.dequeueCount` from `string` to `number`.

Tracking Breaking Changes in 1.2.0

TABLE
* Beginning with version 2015-12-11, the Atom feed is no longer supported as a payload format for Table service operations. Version 2015-12-11 and later versions support only JSON for the payload format.

Tracking Breaking Changes in 1.0.0

BLOB
* The `blob` property of BlobResult has been renamed to `name` to keep consistent with other services API and the `listBlob` API.
* Decoded the block name of LockListResult from base64 string to utf-8 string.

QUEUE
* The `encodeMessage` flag of QueueService has been replaced by `messageEncoder` which support `TextBase64QueueMessageEncoder`, `BinaryBase64QueueMessageEncoder`, `TextXmlQueueMessageEncoder` and custom implementation of QueueMessageEncoder.

Tracking Breaking Changes in 0.10.0

ALL
* The `signedIdentifiers` parameter and result properties have been changed from array to hash map to avoid non unique signed identifier id.

BLOB
* The `contentType`, `contentEncoding`, `contentLanguage`, `contentDisposition`, 'contentMD5' and `cacheControl` parameters and return values about the blob's content settings are grouped into a `contentSettings` sub property. 
* The `contentMD5` parameter to verify the integrity of the data during the transport is changed to `transactionalContentMD5`
* The `copy*` return values are grouped into a `copy` sub property.
* The `lease*` return values are grouped into a `lease` sub property.
* The options.accessConditions parameter is changed to AccessConditions type.

QUEUE
* Renamed QueueResult.approximatemessagecount to camelCase and change its type to 'number'.
* Renamed the property names of QueueMessageResult to camelCase
* Renamed the parameter options.messagettl of the createMessage API to options.messageTimeToLive.
* Updated the callback of the createMessage API from errorOrResult to errorOrResponse.
* Removed peekOnly option from the options parameter of the getMessages API. To peek messages, use peekMessages instead.

FILE
* The `contentType`, `contentEncoding`, `contentLanguage`, `contentDisposition`, 'contentMD5' and `cacheControl` parameters and return values about the blob's content settings are grouped into a `contentSettings` sub property. 
* The `contentMD5` parameter to verify the integrity of the data during the transport is changed to `transactionalContentMD5`
* The `copy*` return values are grouped into a `copy` sub property.
* The options.accessConditions parameter is changed to AccessConditions type.

TABLE
* Renamed the function updateEntity to replaceEntity.
* Renamed TableUtilities.entityGenerator.Entity to EntityProperty.

Tracking Breaking Changes in 0.7.0

ALL
* The generateDevelopmentStorageCredendentials function in the azure-storage.js is renamed to generateDevelopmentStorageCredentials.

BLOB
* The AppendFromLocalFile function in the blobservice.js is renamed to appendFromLocalFile.
* The AppendFromStream function in the blobservice.js is renamed to appendFromStream.
* The AppendFromText function in the blobservice.js is renamed to appendFromText.
* The properties in the properties object of BlobResult and ContainerResult when listing blobs or containers are moved to the result object.
* The property names returned from listing blobs or containers are changed to camelCase.
* The blob result is added to the result of BlobService.commitBlocks and the blob list information is embedded in it.

FILE
* The properties in the properties object of FileResult and ShareResult when listing files or shares are moved to the result object.
* The property names returned from listing files or shares are changed to camelCase.
* The property names returned from getting share stats are changed to camelCase.

Tracking Breaking Changes in 0.5.0

ALL
* The suffix "_HEADER" is removed from all the http header constants.
* The generateSharedAccessSignatureWithVersion function in each service is deprecated.
* The shouldRetry function in the retry policy filters takes a "requestOption" object instead of a "retryData" object.

BLOB
* The "publicAccessLevel" parameter in the BlobService.setContainerACL function is moved into the "options" parameter.
* The properties in the BlobService.setBlobProperties function are moved from the "options" to the "properties" parameter.
* The "AccessPolicy.Permission" is renamed to "AccessPolicy.Permissions" on the result object of the BlobService.getContainerAcl function.

TABLE
* The "signedIdentifiers" parameter in the TableService.SetTableACL function is moved out from the "options" parameter.
* The "AccessPolicy.Permission" is renamed to "AccessPolicy.Permissions" on the result object of the TableService.getTableAcl function.

QUEUE
* The option "options.messagetext" is renamed to "options.messageText" in the QueueService.UpdateMessage function.
* The "AccessPolicy.Permission" is renamed to "AccessPolicy.Permissions" on the result object of the QueueService.getQueueAcl function.
