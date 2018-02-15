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
var extend = require('extend');

var azureCommon = require('./../../common/common.core');
var SR = azureCommon.SR;
var validate = azureCommon.validate;
var Constants = azureCommon.Constants;
var TableConstants = Constants.TableConstants;

/**
* Creates a new TableBatch.
*
* @constructor
*/
function TableBatch() {
  this.operations = [];
  this.pk = null;
  this.retrieve = false;
}

/**
* Removes all of the operations from the batch.
*/
TableBatch.prototype.clear = function () {
  this.operations = [];
};

/**
* Returns a boolean value indicating weather there are operations in the batch.
*
* @return {Boolean} True if there are operations queued up; false otherwise.
*/
TableBatch.prototype.hasOperations = function () {
  return this.operations.length > 0;
};

/**
* Returns the number of operations in the batch.
*
* @return {number} The number of operations in the batch.
*/
TableBatch.prototype.size = function () {
  return this.operations.length;
};

/**
* Adds a retrieve operation to the batch. Note that this must be the only operation in the batch.
*
* @param {string}             partitionKey                                    The partition key.
* @param {string}             rowKey                                          The row key.
* @param {object}             [options]                                       The request options.
* @param {string}             [options.payloadFormat]                         The payload format to use for the request.
* @param {TableService~propertyResolver}  [options.propertyResolver]  The property resolver. Given the partition key, row key, property name, property value,
*                                                                             and the property Edm type if given by the service, returns the Edm type of the property.
* @param {Function(entity)} [options.entityResolver]                          The entity resolver. Given the single entity returned by the query, returns a modified object.
*/
TableBatch.prototype.retrieveEntity = function (partitionKey, rowKey, options) {
  var entity = { PartitionKey: {_: partitionKey, $: 'Edm.String'},
    RowKey: {_: rowKey, $: 'Edm.String'},
  };
  this.addOperation(TableConstants.Operations.RETRIEVE, entity, options);
};

/**
* Adds an insert operation to the batch.
*
* @param {object}             entity                                          The entity.
* @param {object}             [options]                                       The request options.
* @param {string}             [options.echoContent]                           Whether or not to return the entity upon a successful insert. Inserts only, default to false.
* @param {string}             [options.payloadFormat]                         The payload format to use for the request.
* @param {TableService~propertyResolver}  [options.propertyResolver]  The property resolver. Only applied if echoContent is true. Given the partition key, row key, property name, 
*                                                                             property value, and the property Edm type if given by the service, returns the Edm type of the property.
* @param {Function(entity)} [options.entityResolver]                          The entity resolver. Only applied if echoContent is true. Given the single entity returned by the insert, returns 
*                                                                             a modified object.
*/
TableBatch.prototype.insertEntity = function (entity, options) {
  this.addOperation(TableConstants.Operations.INSERT, entity, options);
};

/**
* Adds a delete operation to the batch.
*
* @param {object}             entity              The entity.
*/
TableBatch.prototype.deleteEntity = function (entity) {
  this.addOperation(TableConstants.Operations.DELETE, entity);
};

/**
* Adds a merge operation to the batch.
*
* @param {object}             entity              The entity.
*/
TableBatch.prototype.mergeEntity = function (entity) {
  this.addOperation(TableConstants.Operations.MERGE, entity);
};

/**
* Adds an replace operation to the batch.
*
* @param {object}             entity              The entity.
*/
TableBatch.prototype.replaceEntity = function (entity) {
  this.addOperation(TableConstants.Operations.REPLACE, entity);
};

/**
* Adds an insert or replace operation to the batch.
*
* @param {object}             entity              The entity.
*/
TableBatch.prototype.insertOrReplaceEntity = function (entity) {
  this.addOperation(TableConstants.Operations.INSERT_OR_REPLACE, entity);
};

/**
* Adds an insert or merge operation to the batch.
*
* @param {object}             entity              The entity.
*/
TableBatch.prototype.insertOrMergeEntity = function (entity) {
  this.addOperation(TableConstants.Operations.INSERT_OR_MERGE, entity);
};

/**
* Adds an operation to the batch after performing checks.
*
* @param {string}             operationType       The type of operation to perform. See Constants.TableConstants.Operations
* @param {object}             entity              The entity.
* @param {object}             [options]                                       The request options.
*/
TableBatch.prototype.addOperation = function (operationType, entity, options) {
  validate.validateArgs('addOperation', function (v) {
    v.object(entity, 'entity');
    v.object(entity.PartitionKey, 'entity.PartitionKey');
    v.object(entity.RowKey, 'entity.RowKey');
    v.stringAllowEmpty(entity.PartitionKey._, 'entity.PartitionKey._');
    v.stringAllowEmpty(entity.RowKey._, 'entity.RowKey._');
  });

  if(this.operations.length >= 100) {
    throw new Error(SR.BATCH_TOO_LARGE);
  }

  if (operationType === TableConstants.Operations.RETRIEVE) {
    if(this.hasOperations()) {
      throw new Error(SR.BATCH_ONE_RETRIEVE);
    } else {
      this.retrieve = true;
    }
  } else if (this.retrieve) {
    throw new Error(SR.BATCH_ONE_RETRIEVE);
  }

  if (!this.hasOperations()) {
    this.pk = entity.PartitionKey._;
  } else if (entity.PartitionKey._ !== this.pk) {
    throw new Error(SR.BATCH_ONE_PARTITION_KEY);
  }

  var copiedOptions = extend(true, {}, options);
  this.operations.push({type: operationType, entity: entity, options: copiedOptions});
};

/**
* Gets an operation from the batch. Returns null if the index does not exist.
*
* @param {number}             index           The index in the operations array at which to remove an element.
* @return {object}                            The removed operation.
*/
TableBatch.prototype.getOperation = function (index) {
  return this.operations[index];
};

/**
* Removes an operation from the batch. Returns null if the index does not exist.
*
* @param {number}             index           The index in the operations array at which to remove an element.
* @return {object}                            The removed operation.
*/
TableBatch.prototype.removeOperation = function (index) {
  var operation = this.operations.splice(index, 1)[0];

  // if the array is empty, unlock the partition key
  if (!this.hasOperations()) {
    this.pk = null;
    this.retrieve = false;
  }

  return operation;
};

module.exports = TableBatch;
