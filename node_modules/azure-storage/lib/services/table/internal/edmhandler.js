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

var _ = require('underscore');
var util = require('util');
var guid = require('uuid');

var azureCommon = require('./../../../common/common.core');
var azureutil = azureCommon.util;
var SR = azureCommon.SR;

var TableUtilities = require('../tableutilities');
var EdmType = TableUtilities.EdmType;

/**
* Get the Edm type of an object.
*
* @param {object} value A typed instance.
* @return {string} The Edm type.
*/
exports.propertyType = function (value, guessNumberType) {
  if (_.isNumber(value)) {
    if (guessNumberType) {
      if (azureutil.objectIsInt(value)) {
        return 'Edm.Int32';
      } else {
        return 'Edm.Double';
      }
    } else {
      return null;
    }
  } else if (_.isBoolean(value)) {
    return 'Edm.Boolean';
  } else if (_.isDate(value)) {
    return 'Edm.DateTime';
  } else {
    return 'Edm.String';
  }
};

/**
* Convert a JSON value from over the wire into the correct EDM type.
* 
* Note that Int64, is remaining a string.  Converting it to a Number would lose precision.
* Int32, Boolean, and Double should already be the correct non-string types
*
* @param {string} type  The type of the value as it appears in the type attribute.
* @param value The value in JSON format.
* @return {object} The unserialized value.
*/
exports.deserializeValueFromJson = function (type, value) {
  if (type) {
    switch (type) {
      case EdmType.BINARY:
        return new Buffer(value, 'base64');
      case EdmType.DATETIME:
        return new Date(value);
      case EdmType.GUID:
        return value;
      case EdmType.DOUBLE:
        // Account for Infinity and NaN:
        if (typeof value !== 'number') {
          return parseFloat(value);
        }
        return value;
      case EdmType.INT32:
      case EdmType.INT64:
      case EdmType.STRING:
      case EdmType.BOOLEAN:
        return value;
      default:
        throw new Error(util.format(SR.TYPE_NOT_SUPPORTED, type));
    }
  } else {
    return value;
  }
};

/**
* Convert a raw EdmType value into the JSON value expected to be sent over the wire.
*
* TODO: validate correct input types?
* Expects Edm.Int64 and Edm.String to be string, Edm.Double and Edm.Int32 to be Number,
* Edm.Guid to be an array or buffer compatible with Node.uuid, Edm.Binary to be a Node Buffer, Edm.DateTime to be a Date,
* and Edm.Boolean to be a boolean.
*
* @param {string} type  The type of the value as it will appear in the type attribute.
* @param {string} value The value
* @return {object} The serialized value.
*/
exports.serializeValue = function (type, value) {
  switch (type) {
    case EdmType.BINARY:
      if (Buffer.isBuffer(value)) {
        return value.toString('base64');
      }
      return value;
    case EdmType.DATETIME:
      if (_.isDate(value)) {
        return value.toISOString();
      }
      return value;
    case EdmType.GUID:
      if (Buffer.isBuffer(value) || _.isArray(value)) {
        return guid.unparse(value);
      }
      return value;
    case EdmType.INT64:
    case EdmType.DOUBLE:
      return value.toString();
    case EdmType.INT32:
      if (value === Number.POSITIVE_INFINITY) {
        return 'Infinity';
      }
      if (value === Number.NEGATIVE_INFINITY) {
        return '-Infinity';
      }
      if (azureutil.objectIsNaN(value)) {
        return 'NaN';
      }
      return value;
    case EdmType.STRING:
    case EdmType.BOOLEAN:
      return value;
    default:
      throw new Error(SR.TYPE_NOT_SUPPORTED + type);
  }
};

/*
* Determines if a type annotation is required for the input type when sending JSON data to the service. 
*/
exports.isTypeRequired = function(type, value) {
  switch (type) {
  case EdmType.BINARY:
  case EdmType.INT64:
  case EdmType.DATETIME:
  case EdmType.GUID:
  case EdmType.DOUBLE:
    return true;
  case EdmType.INT32:
    if (typeof value !== 'number' || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY || (azureutil.objectIsNaN(value))) {
      return true;
    }
    return false;
  case EdmType.STRING:
  case EdmType.BOOLEAN:
    return false;
  default:
    throw new Error(util.format(SR.TYPE_NOT_SUPPORTED, type));
  }
};

/**
* Serializes value into proper value to be used in odata query value.
*
* @param {object} value The value to be serialized.
* @return {string} The serialized value.
*/
exports.serializeQueryValue = function (value, type) {
  var edmType = type || exports.propertyType(value, true);
  switch (edmType) {
    case EdmType.INT32:
      return value.toString();
    case EdmType.BOOLEAN:
      return value ? 'true' : 'false';
    case EdmType.DOUBLE:
      return value.toString();
    case EdmType.INT64:
      return value.toString() + 'L';
    case EdmType.DATETIME:
      if(_.isDate(value)) {
        var dateTimeString = value.toISOString();
        return 'datetime\'' + dateTimeString + '\'';
      }
      throw new Error(util.format(SR.INVALID_EDM_TYPE, value, type));
    case EdmType.GUID:
      return 'guid\'' + value.toString() + '\'';
    case EdmType.BINARY:
      return 'X\'' + value.toString('hex') + '\'';
    default:
      return '\'' + value.toString().replace(/'/g, '\'\'') + '\'';
  }   
};