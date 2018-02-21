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
var azureCommon = require('./../../../common/common.core');
var Md5Wrapper = require('./../../../common/md5-wrapper');
var StorageServiceClient = azureCommon.StorageServiceClient;
var WebResource = azureCommon.WebResource;
var Constants = azureCommon.Constants;
var HeaderConstants = Constants.HeaderConstants;
var TableConstants = Constants.TableConstants;

var RequestHandler = require('../internal/requesthandler');
var entityResult = require('./entityresult');

/**
* Creates a new BatchResult.
*
* @param {TableService}      tableService    The table service.
* @param {string}            table           The table name.
* @param {array}             operations      The array of batch operations.
* @constructor
* @ignore
*/
function BatchResult(tableService, table, operations) {
  this.tableService = tableService;
  this.table = table;
  this.operations = operations;
  this.batchBoundary = 'batch_' + BatchResult._getBoundary();
  this.changesetBoundary = 'changeset_' + BatchResult._getBoundary();
}

/**
* Gets a boundary string.
*
* @return {string}   The boundary string.
* @ignore
*/
BatchResult._getBoundary = function () {
  return (new Md5Wrapper().createMd5Hash()).update('' + (new Date()).getTime()).digest('hex');
};

/**
* Constructs the batch web request.
*
* @return {WebResource}   The batch WebResource.
* @ignore
*/
BatchResult.prototype.constructWebResource = function () {
  var webResource = WebResource.post('$batch')
    .withRawResponse(true);

  webResource.withHeader(HeaderConstants.CONTENT_TYPE, 'multipart/mixed; charset="utf-8"; boundary=' + this.batchBoundary);
  webResource.withHeader(HeaderConstants.DATA_SERVICE_VERSION, '3.0;');
  webResource.withHeader(HeaderConstants.MAX_DATA_SERVICE_VERSION, '3.0;NetFx');

  return webResource;
};

/**
* Serializes the batch web body.
*
* @return {string}      The serialized batch content.
* @ignore
*/
BatchResult.prototype.serialize = function () {
  var body = '--' + this.batchBoundary + '\n';
  
  if (this.operations.length === 1 && this.operations[0].type === TableConstants.Operations.RETRIEVE) {
    body += HeaderConstants.CONTENT_TYPE + ': application/http\n';
    body += HeaderConstants.CONTENT_TRANSFER_ENCODING + ': binary\n\n';
    body += this._serializeOperation(this.operations[0]);
  } else {
    body += HeaderConstants.CONTENT_TYPE + ': multipart/mixed;charset="utf-8";boundary=' + this.changesetBoundary + '\n\n';

    for (var i = 0; i < this.operations.length; i++) {
      body += '--' + this.changesetBoundary + '\n';
      body += HeaderConstants.CONTENT_TYPE + ': application/http\n';
      body += HeaderConstants.CONTENT_TRANSFER_ENCODING + ': binary\n\n';
      body += this._serializeOperation(this.operations[i], i) + '\n';
    }
    body += '--' + this.changesetBoundary + '--\n';
  } 
  body += '--' + this.batchBoundary + '--';

  return body;
};

/**
* Serializes a request within the batch.
*
* @param {object}       The operation to serialize.  
* @param {number}       The index of the operation in the operations arrray.
* @return {string}      The serialized operation content.
* @ignore
*/
BatchResult.prototype._serializeOperation = function (operation, count) {
  operation.options.payloadFormat = operation.options.payloadFormat || this.tableService.defaultPayloadFormat;
  var webResource = RequestHandler.constructEntityWebResource(operation.type, this.table, operation.entity, operation.options);

  if (count) {
    webResource.headers[HeaderConstants.CONTENT_ID] = count;
  }

  if (webResource.headers[HeaderConstants.CONTENT_TYPE]) {
    webResource.headers[HeaderConstants.CONTENT_TYPE] += 'type=entry';
  }

  this.tableService._setRequestUrl(webResource);

  var content = webResource.method + ' ' + webResource.uri + ' HTTP/1.1\n';

  Object.keys(webResource.headers).forEach(function (header) {
    content += header + ': ' + webResource.headers[header] + '\n';
  });

  content += '\n';
  content += webResource.body || '';

  return content;
};

/**
* Parses a batch response.
*
* @param {object} responseObject    The response object for the batch request.
* @return {array} An array with the processed / parsed responses.
*/
BatchResult.prototype.parse = function (responseObject) {
  var responses = null;
  if (responseObject && responseObject.response && responseObject.response.body &&
      typeof responseObject.response.body === 'string') {
    responses = [];
    var rawResponses = responseObject.response.body.split(TableConstants.CHANGESET_DELIMITER);

    if(rawResponses.length === 1) {
      rawResponses = responseObject.response.body.split(TableConstants.BATCH_DELIMITER);
    }

    var self = this;
    rawResponses.forEach(function (rawResponse) {
      // Find HTTP/1.1 CODE line
      var httpLocation = rawResponse.indexOf('HTTP/1.1');
      if (httpLocation !== -1) {
        rawResponse = rawResponse.substring(httpLocation);

        // valid response
        var response = self._parseOperation(rawResponse);
        responses.push(response);
      }
    });
  }

  return responses;
};

/**
* Parses a partial response.
*
* @param {string}      rawResponse      The raw, unparsed, http response from the server for the batch response.
* @return {object}      A response object.
*/
BatchResult.prototype._parseOperation = function (rawResponse) {
  var responseObject = {
    error: null,
    response: { }
  };

  // Split into multiple lines and process them
  var responseLines = rawResponse.split('\r\n');

  if (responseLines.length > 0) {
    // Retrieve response code
    var headers = responseLines.shift().split(' ');
    if (headers.length >= 2) {
      responseObject.response.statusCode = parseInt(headers[1]);
      responseObject.response.isSuccessful = WebResource.validResponse(responseObject.response.statusCode);
    }

    // Populate headers
    responseObject.response.headers = { };
    responseObject.response.body = '';

    var isBody = false;
    responseLines.forEach(function (line) {
      if (line === '' && !isBody) {
        isBody = true;
      } else if (isBody) {
        responseObject.response.body += line;
      } else {
        var headerSplit = line.indexOf(':');
        if (headerSplit !== -1) {
          responseObject.response.headers[line.substring(0, headerSplit).trim().toLowerCase()] = line.substring(headerSplit + 1).trim();
        }
      }
    });

    StorageServiceClient._parseResponse(responseObject.response, this.tableService.xml2jsSettings);
    if (!responseObject.response.isSuccessful) {
      responseObject.error = StorageServiceClient._normalizeError(responseObject.response.body, responseObject.response);
    }

    if (!responseObject.error) {
      var index = responseObject.response.headers[HeaderConstants.CONTENT_ID] || 0;
      var propertyResolver;
      var entityResolver;
      if (index && this.operations[index]) {
        var options = this.operations[index].options;
        propertyResolver = options.propertyResolver;
        entityResolver = options.entityResolver;
      } 
      responseObject.entity = entityResult.parseEntity(responseObject.response, propertyResolver, entityResolver);
    }
  }

  return responseObject;
};

module.exports = BatchResult;