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
var Constants = azureCommon.Constants;
var TableConstants = Constants.TableConstants;
var HeaderConstants = Constants.HeaderConstants;
var odataHandler = require('../internal/odatahandler');

exports = module.exports;

exports.serialize = function (entity) {
  return odataHandler.serializeJson(entity);
};

exports.parseQuery = function (response, autoResolveProperties, propertyResolver, entityResolver) {
  var result = {};
  if (response.body) {
    result = odataHandler.parseJsonEntities(response.body, autoResolveProperties, propertyResolver, entityResolver);
  }

  return result;
};

exports.parseEntity = function (response, autoResolveProperties, propertyResolver, entityResolver) {
  var result = {};
  if (response.body) {
    result = odataHandler.parseJsonSingleEntity(response.body, autoResolveProperties, propertyResolver, entityResolver);
  }

  if (response.headers && response.headers[HeaderConstants.ETAG.toLowerCase()]) {
    if (!result[TableConstants.ODATA_METADATA_MARKER]) {
      result[TableConstants.ODATA_METADATA_MARKER] = {};
    }

    result[TableConstants.ODATA_METADATA_MARKER].etag = response.headers[HeaderConstants.ETAG.toLowerCase()];
  }

  return result;
};

exports.getEtag = function (entity) {
  var etag;
  if (entity && entity[TableConstants.ODATA_METADATA_MARKER]) {
    etag = entity[TableConstants.ODATA_METADATA_MARKER].etag;
  } 
  return etag;
};