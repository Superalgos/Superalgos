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

var util = require('util');
var azureCommon = require('./../../../common/common.core');
var WebResource = azureCommon.WebResource;
var SR = azureCommon.SR;
var Constants = azureCommon.Constants;
var HeaderConstants = Constants.HeaderConstants;
var TableConstants = Constants.TableConstants;
var entityResult = require('../models/entityresult');

exports = module.exports;

/**
* Retrieves the entity path from the table name and an entity descriptor.
* @ignore
*
* @param {string}   table         The table name.
* @param {object}   entity        The entity descriptor.
* @return {string} The entity path.
*/
function getEntityPath (tableName, partitionKey, rowKey) {
  var path = '/' + tableName;

  if (typeof (partitionKey) === 'string' && typeof (rowKey) === 'string') {
    // Escape single quotes according to OData Protocol Specification: "single quotes within string literals are represented as two consecutive single quotes".
    partitionKey = partitionKey.replace(/'/g, '\'\'');
    rowKey = rowKey.replace(/'/g, '\'\'');
    path = path + '(PartitionKey=\'' + encodeURIComponent(partitionKey.toString('utf8')) + '\',RowKey=\'' + encodeURIComponent(rowKey.toString('utf8')) + '\')';
  } else {
    throw new Error(SR.INCORRECT_ENTITY_KEYS);
  }

  return path;
}

/**
* Constructs the web resource for a table operation.
*
* @param {string}             operation                           The operation to perform.
* @param {string}             table                               The table name.
* @param {object}             entityDescriptor                    The entity descriptor.
* @param {object}             [options]                           The create options or callback function.
* @param {boolean}            [options.checkEtag]                 Boolean value indicating weather the etag should be matched or not.
* @param {string}             [options.echoContent]               Whether or not to return the entity upon a successful insert. Default to false.
* @param {string}             [options.payloadFormat]             The payload format to use for the request.
* @param {LocationMode}       [options.locationMode]              Specifies the location mode used to decide which location the request should be sent to. 
*                                                                 Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]  The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                 The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                 execution time is checked intermittently while performing requests, and before executing retries.
* @return {webResource}
*/
exports.constructEntityWebResource = function (operation, table, entityDescriptor, options) {
  var webResource = null;
  if (operation === TableConstants.Operations.INSERT) {
    webResource = WebResource.post(table)
      .withHeader(HeaderConstants.PREFER, options.echoContent ? HeaderConstants.PREFER_CONTENT : HeaderConstants.PREFER_NO_CONTENT);
  } else {
    var partitionKey;
    var rowKey;

    if (typeof (entityDescriptor.PartitionKey) === 'string') {
      partitionKey = entityDescriptor.PartitionKey;
    } else {
      partitionKey = entityDescriptor.PartitionKey[TableConstants.ODATA_VALUE_MARKER];
    }

    if (typeof (entityDescriptor.RowKey) === 'string') {
      rowKey = entityDescriptor.RowKey;
    } else {
      rowKey = entityDescriptor.RowKey[TableConstants.ODATA_VALUE_MARKER];
    }

    var path = getEntityPath(table, partitionKey, rowKey);

    if (operation === TableConstants.Operations.DELETE) {
      webResource = WebResource.del(path);
    } else if (operation === TableConstants.Operations.MERGE || operation === TableConstants.Operations.INSERT_OR_MERGE) {
      webResource = WebResource.merge(path);
    } else if (operation === TableConstants.Operations.REPLACE || operation === TableConstants.Operations.INSERT_OR_REPLACE) {
      webResource = WebResource.put(path);
    } else if (operation === TableConstants.Operations.RETRIEVE) {
      webResource = WebResource.get(path);
    } else {
      throw new Error(util.format(SR.INVALID_TABLE_OPERATION, operation));
    }
  }

  if (operation === TableConstants.Operations.DELETE || operation === TableConstants.Operations.REPLACE || operation === TableConstants.Operations.MERGE) {
    webResource.withHeader(HeaderConstants.IF_MATCH, entityResult.getEtag(entityDescriptor) || '*');
  }

  var entitySerializedDescriptor;
  if (!(operation === TableConstants.Operations.DELETE || operation === TableConstants.Operations.RETRIEVE)) {
    entitySerializedDescriptor = entityResult.serialize(entityDescriptor);
  }

  exports.setTableRequestHeadersAndBody(webResource, entitySerializedDescriptor, options.payloadFormat);

  return webResource;
};

/**
* Sets the table request headers.
*
* @param {string}             webResource       The webResource to add headers to.
* @param {object}             [body]            The body of the request.
*/
exports.setTableRequestHeadersAndBody = function (webResource, body, acceptType) {
  if (body) {
    webResource.withHeader(HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(body, 'utf8'))
      .withBody(body)
      .withHeader(HeaderConstants.CONTENT_TYPE, HeaderConstants.JSON_CONTENT_TYPE_VALUE);
  }

  webResource.withHeader(HeaderConstants.ACCEPT, acceptType)
    .withHeader(HeaderConstants.MAX_DATA_SERVICE_VERSION, TableConstants.DEFAULT_DATA_SERVICE_VERSION);
};