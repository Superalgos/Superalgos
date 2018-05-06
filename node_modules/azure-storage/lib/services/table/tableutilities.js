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

// Expose 'HeaderConstants'.
exports = module.exports;

/**
* Defines constants, enums, and utility functions for use with the Table service.
* @namespace TableUtilities
*/
var TableUtilities = {
  /**
  * Permission types.
  *
  * @const
  * @enum {string}
  */
  SharedAccessPermissions: {
    QUERY: 'r',
    ADD: 'a',
    UPDATE: 'u',
    DELETE: 'd'
  },

  /**
  * Payload Format.
  *
  * @const
  * @enum {string}
  */
  PayloadFormat: {
    FULL_METADATA: 'application/json;odata=fullmetadata',
    MINIMAL_METADATA: 'application/json;odata=minimalmetadata',
    NO_METADATA: 'application/json;odata=nometadata'
  },

  /**
  * Defines the set of Boolean operators for constructing queries.
  *
  * @const
  * @enum {string}
  */
  TableOperators: {
    AND: 'and',
    NOT: 'not',
    OR: 'or'
  },

  /**
  * Filter property comparison operators.
  *
  * @const
  * @enum {string}
  */
  QueryComparisons: {
    EQUAL: 'eq',
    NOT_EQUAL: 'ne',
    GREATER_THAN: 'gt',
    GREATER_THAN_OR_EQUAL: 'ge',
    LESS_THAN: 'lt',
    LESS_THAN_OR_EQUAL: 'le'
  },

  /**
  * Edm types.
  *
  * @const
  * @enum {string}
  */
  EdmType: {
    STRING: 'Edm.String',
    BINARY: 'Edm.Binary',
    INT64: 'Edm.Int64',
    INT32: 'Edm.Int32',
    DOUBLE: 'Edm.Double',
    DATETIME: 'Edm.DateTime',
    GUID: 'Edm.Guid',
    BOOLEAN: 'Edm.Boolean'
  },

  /**
  * A helper to create table entities.
  *
  * @example
  * var entGen = TableUtilities.entityGenerator;
  * var entity = {  PartitionKey: entGen.String('part2'),
  *        RowKey: entGen.String('row1'),
  *        boolValue: entGen.Boolean(true),
  *        intValue: entGen.Int32(42),
  *        dateValue: entGen.DateTime(new Date(Date.UTC(2011, 10, 25))),
  *       };
  */
  entityGenerator: (function()
  {
    var EntityProperty = function (value, type) {
        var entityProperty = { _:value};
        if (type) {
          entityProperty['$'] = type;
        }
        return entityProperty;
      };

      return {
      EntityProperty : EntityProperty,
      
      Int32 : function(value) {
        return new EntityProperty(value, 'Edm.Int32');
      },

      Int64 : function(value) {
        return new EntityProperty(value, 'Edm.Int64');
      },

      Binary : function(value) {
        return new EntityProperty(value, 'Edm.Binary');
      },

      Boolean : function(value) {
        return new EntityProperty(value, 'Edm.Boolean');
      },

      String : function(value) {
        return new EntityProperty(value, 'Edm.String');
      },

      Guid : function(value) {
        return new EntityProperty(value, 'Edm.Guid');
      },

      Double : function(value) {
        return new EntityProperty(value, 'Edm.Double');
      },

      DateTime : function(value) {
        return new EntityProperty(value, 'Edm.DateTime');
      }
    };
  })()
};

module.exports = TableUtilities;