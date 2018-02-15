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
var util = require('util');

var azureCommon = require('./../../../common/common.core');
var azureutil = azureCommon.util;
var SR = azureCommon.SR;
var Constants = azureCommon.Constants;
var edmHandler = require('./edmhandler');

var prefixLength = Constants.TableConstants.ODATA_PREFIX.length;
var suffixLength = Constants.TableConstants.ODATA_TYPE_SUFFIX.length;

exports = module.exports;

/* Serialize an entity to an Odata (Json based) payload
* Input must be in the following format:
* { stringValue: { '$': 'Edm.String', '_': 'my string' }, myInt: { '$': 'Edm.Int32', '_': 3 } }
*/
exports.serializeJson = function (entity) {
  function normalizeEntityProperty(property) {
    if(azureutil.objectIsNull(property)) {
      return { _: property };
    }

    if (typeof property === 'object' && property.hasOwnProperty(Constants.TableConstants.ODATA_VALUE_MARKER)) {
      return property;
    }

    var result = { _: property };
    result[Constants.TableConstants.ODATA_TYPE_MARKER] = edmHandler.propertyType(property, true);

    return result;
  }

  var result = {};
  for (var propName in entity) {
    // ignore if .metadata or null or undefined
    if (propName !== Constants.TableConstants.ODATA_METADATA_MARKER) {
      var property = normalizeEntityProperty(entity[propName]);
      if (!azureutil.objectIsNull(property[Constants.TableConstants.ODATA_VALUE_MARKER])) {
        var value = property[Constants.TableConstants.ODATA_VALUE_MARKER];
        var type = property[Constants.TableConstants.ODATA_TYPE_MARKER];

        if (type === undefined) {
          type = edmHandler.propertyType(value, true);
        }

        result[propName] = edmHandler.serializeValue(type, value);
        if (edmHandler.isTypeRequired(type, value)) {
          result[propName + Constants.TableConstants.ODATA_TYPE_SUFFIX] = type;
        }
      }
    } 
  }

  var replacer = function(key, value) {
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
  };
  
  return JSON.stringify(result, replacer);
};

/*
Input: The body of the HTTP response from the server from a table list as JSON (responseObject.response.body).

Return:
This will return an array in the following format:

[
  tableName1,
  tableName2
]

For example,

[
  myTable1,
  myTable2
]

*/
exports.parseJsonTables = function (response) {
  var result = [];

  if (response.value) {
    for (var i = 0; i < response.value.length; i++) {
      var entity = response.value[i].TableName;
      result.push(entity);
    }
  }

  return result;
};

/*
Input: The body of the HTTP response from the server from a table query as JSON (responseObject.response.body).

Return:
This will return an array in the following format:

[
  {{ '$': edmHandler1, '_': value1}, { '$': edmHandler2, '_': value2}, { '$': edmHandler3, '_': value3}},
  {{ '$': edmHandler4, '_': value4}, { '$': edmHandler5, '_': value5}, { '$': edmHandler6, '_': value6}}
]

For example,

[
  {{ '$': Edm.Int32, '_': 42}, { '$': Edm.String, '_': 'sample string'}, { '$': Edm.Boolean, '_': false}},
  {{ '$': Edm.Int64, '_': 42}, { '$': Edm.String, '_': 'sample string 2'}, { '$': Edm.Boolean, '_': true}}
]

*/
exports.parseJsonEntities = function (response, autoResolveProperties, propertyResolver, entityResolver) {
  if (!response.value) {
    return [exports.parseJsonSingleEntity(response, autoResolveProperties, propertyResolver, entityResolver)];
  } else {
    var result = [];

    for (var i = 0; i < response.value.length; i++) {
      var rawEntity = response.value[i];
      var entity = exports.parseJsonSingleEntity(rawEntity, autoResolveProperties, propertyResolver, entityResolver);
      result.push(entity);
    }

    return result;  
  }
};

exports.parseJsonSingleEntity = function(rawEntity, autoResolveProperties, propertyResolver, entityResolver) {
  var rawEntityProperties = {};
  var entityPropertyTypes = {PartitionKey: 'Edm.String', RowKey: 'Edm.String', Timestamp: 'Edm.DateTime'};
  var odataMetadata = {};

  // parse properties
  for (var entityPropertyName in rawEntity) {
    if (azureutil.stringStartsWith(entityPropertyName, Constants.TableConstants.ODATA_PREFIX)) {
      odataMetadata[entityPropertyName.slice(prefixLength)] = rawEntity[entityPropertyName];
    } else if (azureutil.stringEndsWith(entityPropertyName, Constants.TableConstants.ODATA_TYPE_SUFFIX)) {
      entityPropertyTypes[entityPropertyName.slice(0, entityPropertyName.length - suffixLength)] = rawEntity[entityPropertyName];
    } else {
      rawEntityProperties[entityPropertyName] = rawEntity[entityPropertyName];
    }
  }

  // make sure etag is set
  if (!odataMetadata.etag && rawEntityProperties.Timestamp) {
    var timestampString = new Buffer(rawEntityProperties.Timestamp).toString();
    odataMetadata.etag = 'W/"datetime\'' + timestampString + '\'"';
  }

  var entity = {};
  for (var entityPropertyName in rawEntityProperties) {
    if (rawEntityProperties.hasOwnProperty(entityPropertyName)) {
      // set the type, if given in the response
      var entityPropertyType = entityPropertyTypes[entityPropertyName];
      entity[entityPropertyName] = {};  

      // use the given property resolver if present, otherwise infer type if undefined
      if (propertyResolver) {
        // partition key, row key, name, value, type if present
        entityPropertyType = propertyResolver(rawEntityProperties.PartitionKey, rawEntityProperties.RowKey, entityPropertyName, rawEntityProperties[entityPropertyName], entityPropertyType);
      }
      if (!entityPropertyType && autoResolveProperties) {
        entityPropertyType = edmHandler.propertyType(rawEntityProperties[entityPropertyName], false);
      } 

      if (entityPropertyType) {
        entity[entityPropertyName][Constants.TableConstants.ODATA_TYPE_MARKER] = entityPropertyType;
      } 

      try {
        entity[entityPropertyName][Constants.TableConstants.ODATA_VALUE_MARKER] = edmHandler.deserializeValueFromJson(entityPropertyType, rawEntityProperties[entityPropertyName]);
      } catch (err) {
        if (propertyResolver) {
          // if a property resolver was used and the type is invalid, throw an appropriate error
          throw new Error(util.format(SR.INVALID_PROPERTY_RESOLVER, entityPropertyName, entityPropertyType, rawEntityProperties[entityPropertyName]));
        } else {
          throw err;
        }
      }
    }
  }

  entity[Constants.TableConstants.ODATA_METADATA_MARKER] = odataMetadata;

  if (entityResolver) {
    entity = entityResolver(entity);
  }

  return entity;
};
