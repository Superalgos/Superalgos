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
var _ = require('underscore');

var azureCommon = require('./../../../common/common.core');
var azureutil = azureCommon.util;
var Constants = azureCommon.Constants;
var HeaderConstants = Constants.HeaderConstants;

/**
* Creates a new FileResult object.
* @class
* The FileResult class is used to store the file information.
* 
 * @property  {string}                      share                                 The share name.
 * @property  {string}                      directory                             The directory name.
 * @property  {string}                      name                                  The file name.
 * @property  {object}                      metadata                              The metadata key/value pair.
 * @property  {string}                      etag                                  The etag.
 * @property  {string}                      lastModified                          The date/time that the file was last modified.
 * @property  {string}                      requestId                             The request id.
 * @property  {string}                      acceptRanges                          The accept ranges.
 * @property  {string}                      serverEncrypted                       If the file data and application metadata are completely encrypted using the specified algorithm. true/false.
 * @property  {string}                      contentRange                          The content range
 * @property  {string}                      contentLength                         The size of the file in bytes.
 * @property  {object}                      contentSettings                       The content settings.
 * @property  {string}                      contentSettings.contentType           The content type.
 * @property  {string}                      contentSettings.contentEncoding       The content encoding.
 * @property  {string}                      contentSettings.contentLanguage       The content language.
 * @property  {string}                      contentSettings.cacheControl          The cache control.
 * @property  {string}                      contentSettings.contentDisposition    The content disposition.
 * @property  {string}                      contentSettings.contentMD5            The content MD5 hash.
 * @property  {object}                      copy                                  The copy information.
 * @property  {string}                      copy.id                               The copy id.
 * @property  {string}                      copy.status                           The copy status.
 * @property  {string}                      copy.completionTime                   The copy completion time. 
 * @property  {string}                      copy.statusDescription                The copy status description.
 * @property  {string}                      copy.progress                         The copy progress.
 * @property  {string}                      copy.source                           The copy source.
 * 
* @constructor
* @param {string} [share]      The share name.
* @param {string} [directory]  The directory name.
* @param {string} [name]       The file name.
*/
function FileResult(share, directory, name) {
  this.share = share;
  this.directory = directory;
  this.name = name;
}

FileResult.parse = function (entryXml) {
  var listResult = new FileResult();
  for (var propertyName in entryXml) {
    if (propertyName === 'Properties') {
      //  Lift out the properties onto the main object to keep consistent across all APIs like: getFileProperties
        azureutil.setPropertyValueFromXML(listResult, entryXml[propertyName], true);
    } else {
      listResult[propertyName.toLowerCase()] = entryXml[propertyName];
    }
  }

  return listResult;
};

var responseHeaders = {
  'acceptRanges': 'ACCEPT_RANGES',
  'contentLength': 'CONTENT_LENGTH',
  'contentRange': 'CONTENT_RANGE',

  'contentSettings.contentType': 'CONTENT_TYPE',
  'contentSettings.contentEncoding': 'CONTENT_ENCODING',
  'contentSettings.contentLanguage': 'CONTENT_LANGUAGE',
  'contentSettings.cacheControl': 'CACHE_CONTROL',
  'contentSettings.contentDisposition': 'CONTENT_DISPOSITION',
  'contentSettings.contentMD5': 'CONTENT_MD5',
  'contentSettings.fileContentMD5': 'FILE_CONTENT_MD5',
  
  'copy.id': 'COPY_ID',
  'copy.status': 'COPY_STATUS',
  'copy.source': 'COPY_SOURCE',
  'copy.progress': 'COPY_PROGRESS',
  'copy.completionTime': 'COPY_COMPLETION_TIME',
  'copy.statusDescription': 'COPY_STATUS_DESCRIPTION'
};

FileResult.prototype.getPropertiesFromHeaders = function (headers, content) {
  var self = this;
  
  var setFilePropertyFromHeaders = function (fileProperty, headerProperty) {
    if (!azureutil.tryGetValueChain(self, fileProperty.split('.'), null) && headers[headerProperty.toLowerCase()]) {
      azureutil.setObjectInnerPropertyValue(self, fileProperty.split('.'), headers[headerProperty.toLowerCase()]);
      
      if (fileProperty === 'copy.progress') {
        var info = azureutil.parseCopyProgress(self.copy.progress);
        self.copy.bytesCopied = parseInt(info.bytesCopied);
        self.copy.totalBytes = parseInt(info.totalBytes);
      }
    }
  };
   
  // For range get, 'x-ms-content-md5' indicate the overall MD5 of the file. Try to set the contentMD5 using this header if it presents
  setFilePropertyFromHeaders('contentSettings.contentMD5', HeaderConstants.FILE_CONTENT_MD5);

  setFilePropertyFromHeaders('etag', HeaderConstants.ETAG);
  setFilePropertyFromHeaders('lastModified', HeaderConstants.LAST_MODIFIED);
  setFilePropertyFromHeaders('requestId', HeaderConstants.REQUEST_ID);
  setFilePropertyFromHeaders('serverEncrypted', HeaderConstants.SERVER_ENCRYPTED);

  if (content) {
     _.chain(responseHeaders).pairs().each(function (pair) {
      var property = pair[0];
      var header = HeaderConstants[pair[1]];
      setFilePropertyFromHeaders(property, header);
    });

   }
};

/**
* This method sets the HTTP headers and is used by all methods except setFileProperties and createFile. 
* Those methods will set the x-ms-* headers using setProperties.
*/
FileResult.setHeaders = function (webResource, options) {
  var setHeaderProperty = function (headerProperty, fileProperty) {
    var propertyValue = azureutil.tryGetValueChain(options, fileProperty.split('.'), null);
    if (propertyValue) {
      webResource.withHeader(headerProperty, propertyValue);
    }
  };

  if (options) {
    // Content-MD5
    setHeaderProperty(HeaderConstants.CONTENT_MD5, 'transactionalContentMD5');

    // Content-Length
    setHeaderProperty(HeaderConstants.CONTENT_LENGTH, 'contentLength');

    // Range
    if (!azureutil.objectIsNull(options.rangeStart)) {
      var range = 'bytes=' + options.rangeStart + '-';

      if (!azureutil.objectIsNull(options.rangeEnd)) {
        range += options.rangeEnd;
      }

      webResource.withHeader(HeaderConstants.STORAGE_RANGE, range);
    }   
  }
};

/**
* This method sets the x-ms-* headers and is used by setFileProperties and createFile. 
* All other methods will set the regular HTTP headers using setHeaders.
*/
FileResult.setProperties = function (webResource, options) {
  var setHeaderProperty = function (headerProperty, fileProperty) {
    var propertyValue = azureutil.tryGetValueChain(options, fileProperty.split('.'), null);
    if (propertyValue) {
      webResource.withHeader(headerProperty, propertyValue);
    }
  };

  if (options) {
    // Content-Length
    setHeaderProperty(HeaderConstants.FILE_CONTENT_LENGTH, 'contentLength');
    
    // Content-Type
    setHeaderProperty(HeaderConstants.FILE_CONTENT_TYPE, 'contentSettings.contentType');

    // Content-Encoding
    setHeaderProperty(HeaderConstants.FILE_CONTENT_ENCODING, 'contentSettings.contentEncoding');

    // Content-Language
    setHeaderProperty(HeaderConstants.FILE_CONTENT_LANGUAGE, 'contentSettings.contentLanguage');

    // Content-Disposition
    setHeaderProperty(HeaderConstants.FILE_CONTENT_DISPOSITION, 'contentSettings.contentDisposition');

    // Cache-Control
    setHeaderProperty(HeaderConstants.FILE_CACHE_CONTROL, 'contentSettings.cacheControl');

    // Content-MD5
    setHeaderProperty(HeaderConstants.FILE_CONTENT_MD5, 'contentSettings.contentMD5');

    if (options.metadata) {
      webResource.addOptionalMetadataHeaders(options.metadata);
    }
  }
};

module.exports = FileResult;