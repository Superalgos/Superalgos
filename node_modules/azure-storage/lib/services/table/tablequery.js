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
var util = require('util');

var azureCommon = require('./../../common/common.core');
var azureutil = azureCommon.util;
var SR = azureCommon.SR;
var QueryStringConstants =  azureCommon.Constants.QueryStringConstants;

var edmHandler = require('./internal/edmhandler');
var TableUtilities = require('./tableutilities');
var QueryComparisons = TableUtilities.QueryComparisons;
var TableOperators = TableUtilities.TableOperators;
var EdmType = TableUtilities.EdmType;

/**
 * Creates a new TableQuery object.
 *
 * @constructor
 */
function TableQuery() {
  this._fields = [];
  this._where = [];
  this._top = null;
}

/**
* Specifies the select clause. If no arguments are given, all fields will be selected.
*
* @param {array} fields The fields to be selected.
* @return {TableQuery} A table query object with the select clause.
* @example
* var tableQuery = new TableQuery().select('field1', 'field2');
*/
TableQuery.prototype.select = function () {
  var self = this;
  if (arguments) {
    _.each(arguments, function (argument) {
      self._fields.push(argument);
    });
  }

  return this;
};

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
TableQuery.prototype.top = function (top) {
  this._top = top;
  return this;
};

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
 * var tableQuery = new TableQuery().where('Name == ?string? && Value == ?int64?', name1, int64Val);
 *
 * // tasktable should already exist and have entities
 * tableService.queryEntities('tasktable', tableQuery, null \/*currentToken*\/, function(error, result, response) {
 *   if(!error) { 
 *     var entities = result.entities;
 *     // do stuff with the returned entities if there are any
 *   }
 * });
 */
TableQuery.prototype.where = function (condition) {  
  this._where.push(TableQuery._encodeConditionString(condition, arguments));
  return this;
};

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
TableQuery.int32Filter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.INT32);
};

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
TableQuery.int64Filter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.INT64);
};

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
TableQuery.doubleFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.DOUBLE);
};

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
TableQuery.booleanFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.BOOLEAN);
};

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
TableQuery.dateFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.DATETIME);
};

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
TableQuery.guidFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.GUID);
};

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
TableQuery.binaryFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.BINARY);
};

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
TableQuery.stringFilter = function (propertyName, operation, value) {
  return TableQuery._concatFilterString(propertyName, operation, value, EdmType.STRING);
};

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
 * var combinedFilter = TableQuery.combineFilters(filter1, TableUtilities.TableOperators.AND, filter2);
 */
TableQuery.combineFilters = function (filterA, operatorString, filterB) {
  return filterA + ' ' + operatorString + ' ' + filterB;
};

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
TableQuery.prototype.and = function (condition) {
  if (this._where.length === 0) {
    throw new Error(util.format(SR.QUERY_OPERATOR_REQUIRES_WHERE, 'AND'));
  }

  this._where.push(' and ' + TableQuery._encodeConditionString(condition, arguments));
  return this;
};

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
TableQuery.prototype.or = function (condition) {
  if (this._where.length === 0) {
    throw new Error(util.format(SR.QUERY_OPERATOR_REQUIRES_WHERE, 'OR'));
  }

  this._where.push(' or ' + TableQuery._encodeConditionString(condition, arguments));
  return this;
};

/**
 * Returns the query string object for the query.
 *
 * @return {object} JSON object representing the query string arguments for the query.
 */
TableQuery.prototype.toQueryObject = function () {
  var query = {};
  if (this._fields.length > 0) {
    query[QueryStringConstants.SELECT] = this._fields.join(',');
  }

  if (this._where.length > 0) {
    query[QueryStringConstants.FILTER] = this._where.join('');
  }

  if (this._top) {
    query[QueryStringConstants.TOP] = this._top;
  }

  return query;
};

// Functions

/**
* Concat the filter string parameters.
*
* @param {string}       propertyName   A string containing the name of the property to compare.
* @param {string}       operation      A string containing the comparison operator to use. 
*                                      See Constants.TableConstants.QueryComparisons for a list of allowed operations.
* @param {object}       value          The value to compare with the property.
* @param {string}       type           A string EdmType of the property to compare.
* @return {string} A string containing the formatted filter condition.
* @ignore
*/
TableQuery._concatFilterString = function (propertyName, operation, value, type) {
  if (azureutil.objectIsNull(propertyName)) {
    throw new Error(util.format(SR.ARGUMENT_NULL_OR_UNDEFINED, 'propertyName'));
  }

  if (azureutil.objectIsNull(operation)) {
    throw new Error(util.format(SR.ARGUMENT_NULL_OR_UNDEFINED, 'operation'));
  }

  if (azureutil.objectIsNull(value)) {
    throw new Error(util.format(SR.ARGUMENT_NULL_OR_UNDEFINED, 'value'));
  }

  var serializedValue = edmHandler.serializeQueryValue(value, type);
  return propertyName + ' ' + operation + ' ' + serializedValue;
};

/**
 * Encodes a condition string.
 *
 * @param {string}       condition   The condition.
 * @param {array}        arguments   Any number of arguments to be replaced in the condition by the question mark (?).
 * @return {TableQuery} A table query object with the or clause
 * @ignore
 */
TableQuery._encodeConditionString = function (condition, args) {
  var encodedCondition = TableQuery._replaceOperators(condition);
  if (args.length > 1) {
    var sections = encodedCondition.split(/(\?string\?|\?int32\?|\?int64\?|\?bool\?|\?double\?|\?date\?|\?binary\?|\?guid\?|\?)/);
    var count = 1;
    for (var i = 0; i < sections.length && count < args.length; i++) {
      if (sections[i].indexOf('?') === 0) {
        var type = TableQuery._getEdmType(sections[i]);
        sections[i] = edmHandler.serializeQueryValue(args[count], type);
        count++;
      }
    }
    encodedCondition = sections.join('');
  }

  return encodedCondition;
};

/**
 * Converts the query string type to an Edm type.
 *
 * @param {string} type The type included in the query string.
 * @return {string} The EdmType.
 * @ignore
 */
TableQuery._getEdmType = function (type) {
  switch (type) {
    case '?binary?':
      return EdmType.BINARY;
    case '?int64?':
      return EdmType.INT64;
    case '?date?':
      return EdmType.DATETIME;
    case '?guid?':
      return EdmType.GUID;
    case '?int32?':
      return EdmType.INT32;
    case '?double?':
      return EdmType.DOUBLE;
    case '?bool?':
      return EdmType.BOOLEAN;
    case '?string?':
      return EdmType.STRING;
    default:
      return undefined;
  }
};

/**
 * Replace operators.
 * @ignore
 * @param {string} whereClause The text where to replace the operators.
 * @return {string} The string with the replaced operators.
 * @ignore
 */
TableQuery._replaceOperators = function (whereClause) {
  var encodedWhereClause = whereClause.replace(/ == /g, ' ' + QueryComparisons.EQUAL + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ != /g, ' ' + QueryComparisons.NOT_EQUAL + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ >= /g, ' ' + QueryComparisons.GREATER_THAN_OR_EQUAL + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ > /g, ' ' + QueryComparisons.GREATER_THAN + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ <= /g, ' ' + QueryComparisons.LESS_THAN_OR_EQUAL + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ < /g, ' ' + QueryComparisons.LESS_THAN + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ \&\& /g, ' ' + TableOperators.AND + ' ');
  encodedWhereClause = encodedWhereClause.replace(/ \|\| /g, ' ' + TableOperators.OR + ' ');
  encodedWhereClause = encodedWhereClause.replace(/!/g, TableOperators.NOT);

  return encodedWhereClause;
};

module.exports = TableQuery;
