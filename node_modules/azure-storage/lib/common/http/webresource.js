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
var azureutil = require('../util/util');
var SR = require('../util/sr');
var Constants = require('../util/constants');
var errors = require('../errors/errors');
var ArgumentError = errors.ArgumentError;
var HeaderConstants = Constants.HeaderConstants;
var HttpConstants = Constants.HttpConstants;
var HttpConstants = Constants.HttpConstants;
var HttpVerbs = HttpConstants.HttpVerbs;

function encodeSpecialCharacters(path) {
  return path.replace(/'/g, '%27');
}

/**
* Creates a new WebResource object.
*
* This class provides an abstraction over a REST call by being library / implementation agnostic and wrapping the necessary
* properties to initiate a request.
*
* @constructor
*/
function WebResource() {
  this.rawResponse = false;
  this.queryString = {};
}

/**
* Creates a new put request web resource.
*
* @param {string} path The path for the put operation.
* @return {WebResource} A new webresource with a put operation for the given path.
*/
WebResource.put = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.PUT;
  return webResource;
};

/**
* Creates a new get request web resource.
*
* @param {string} path The path for the get operation.
* @return {WebResource} A new webresource with a get operation for the given path.
*/
WebResource.get = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.GET;
  return webResource;
};

/**
* Creates a new head request web resource.
*
* @param {string} path The path for the head operation.
* @return {WebResource} A new webresource with a head operation for the given path.
*/
WebResource.head = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.HEAD;
  return webResource;
};

/**
* Creates a new delete request web resource.
*
* @param {string} path The path for the delete operation.
* @return {WebResource} A new webresource with a delete operation for the given path.
*/
WebResource.del = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.DELETE;
  return webResource;
};

/**
* Creates a new post request web resource.
*
* @param {string} path The path for the post operation.
* @return {WebResource} A new webresource with a post operation for the given path.
*/
WebResource.post = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.POST;
  return webResource;
};

/**
* Creates a new merge request web resource.
*
* @param {string} path The path for the merge operation.
* @return {WebResource} A new webresource with a merge operation for the given path.
*/
WebResource.merge = function (path) {
  var webResource = new WebResource();
  webResource.path = path ? encodeSpecialCharacters(path) : null;
  webResource.method = HttpConstants.HttpVerbs.MERGE;
  return webResource;
};

/**
* Specifies a custom property in the web resource.
*
* @param {string} name  The property name.
* @param {string} value The property value.
* @return {WebResource} The webresource.
*/
WebResource.prototype.withProperty = function (name, value) {
  if (!this.properties) {
    this.properties = {};
  }

  this.properties[name] = value;

  return this;
};

/**
* Specifies if the response should be parsed or not.
*
* @param {bool} rawResponse true if the response should not be parsed; false otherwise.
* @return {WebResource} The webresource.
*/
WebResource.prototype.withRawResponse = function (rawResponse) {
  this.rawResponse = rawResponse;

  if (azureutil.objectIsNull(this.rawResponse)) {
    this.rawResponse = true;
  }

  return this;
};

WebResource.prototype.withHeadersOnly = function (headersOnly) {
  if (headersOnly !== undefined) {
    this.headersOnly = headersOnly;
  } else {
    this.headersOnly = true;
  }

  return this;
};

/**
* Adds an optional query string parameter.
*
* @param {Object} name          The name of the query string parameter.
* @param {Object} value         The value of the query string parameter.
* @param {Object} defaultValue  The default value for the query string parameter to be used if no value is passed.
* @return {Object} The web resource.
*/
WebResource.prototype.withQueryOption = function (name, value, defaultValue) {
  if (!azureutil.objectIsNull(value)) {
    this.queryString[name] = value;
  } else if (defaultValue) {
    this.queryString[name] = defaultValue;
  }

  return this;
};

/**
* Adds optional query string parameters.
*
* Additional arguments will be the needles to search in the haystack. 
*
* @param {Object} object  The haystack of query string parameters.
* @return {Object} The web resource.
*/
WebResource.prototype.withQueryOptions = function (object) {
  if (object) {
    for (var i = 1; i < arguments.length; i++) {
      if (object[arguments[i]]) {
        this.withQueryOption(arguments[i], object[arguments[i]]);
      }
    }
  }

  return this;
};

/**
* Adds an optional header parameter.
*
* @param {Object} name  The name of the header parameter.
* @param {Object} value The value of the header parameter.
* @return {Object} The web resource.
*/
WebResource.prototype.withHeader = function (name, value) {
  if (!this.headers) {
    this.headers = {};
  }

  if (!azureutil.IsNullOrEmptyOrUndefinedOrWhiteSpace(value)) {
    value = value instanceof Date ? value.toUTCString() : value;
    
    this.headers[name] = value;
  }

  return this;
};

/**
* Adds an optional body.
*
* @param {Object} body  The request body.
* @return {Object} The web resource.
*/
WebResource.prototype.withBody = function (body) {
  this.body = body;
  return this;
};

/**
* Adds optional query string parameters.
*
* Additional arguments will be the needles to search in the haystack. 
*
* @param {Object} object  The haystack of headers.
* @return {Object} The web resource.
*/
WebResource.prototype.withHeaders = function (object) {
  if (object) {
    for (var i = 1; i < arguments.length; i++) {
      if (object[arguments[i]]) {
        this.withHeader(arguments[i], object[arguments[i]]);
      }
    }
  }

  return this;
};

WebResource.prototype.addOptionalMetadataHeaders = function (metadata) {
  var self = this;

  if (metadata) {
    Object.keys(metadata).forEach(function (metadataKey) {
      if (azureutil.IsNullOrEmptyOrUndefinedOrWhiteSpace(metadataKey)) {
        throw new ArgumentError('metadata', SR.METADATA_KEY_INVALID);
      }

      var value = metadata[metadataKey];
      if (azureutil.IsNullOrEmptyOrUndefinedOrWhiteSpace(value)) {
        throw new ArgumentError('metadata', SR.METADATA_VALUE_INVALID);
      }
      
      var metadataHeaderName = HeaderConstants.PREFIX_FOR_STORAGE_METADATA + metadataKey;
      var existingMetadataHeaderName = '';
      var headers = self.headers ? self.headers : {};
      if (Object.keys(headers).some(function (headerName) {
        existingMetadataHeaderName = headerName;
        return headerName.toString().toLowerCase() === metadataHeaderName.toLowerCase();
      })) {        
        self.withHeader(existingMetadataHeaderName, self.headers[existingMetadataHeaderName] + ',' + value);
      } else {
        self.withHeader(metadataHeaderName, value);
      }
    });
  }

  return this;
};

/**
* Determines if a status code corresponds to a valid response according to the WebResource's expected status codes.
*
* @param {int} statusCode The response status code.
* @return true if the response is valid; false otherwise.
*/
WebResource.validResponse = function (statusCode) {
  if (statusCode >= 200 && statusCode < 300) {
    return true;
  }

  return false;
};

function isMethodWithBody(verb) {
  return verb === HttpVerbs.PUT ||
    verb === HttpVerbs.POST ||
    verb === HttpVerbs.MERGE;
}

/**
* Hook up the given input stream to a destination output stream if the WebResource method
* requires a request body and a body is not already set.
*
* @param {Stream} inputStream the stream to pipe from
* @param {Stream} outputStream the stream to pipe to
*
* @return destStream
*/
WebResource.prototype.pipeInput = function(inputStream, destStream) {
  if (isMethodWithBody(this.method) && !this.hasOwnProperty('body')) {
    inputStream.pipe(destStream);
  }

  return destStream;
};

module.exports = WebResource;