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
var SharedKey = azureCommon.SharedKey;
var azureutil = azureCommon.util;
var Constants = azureCommon.Constants;
var HeaderConstants = Constants.HeaderConstants;
var QueryStringConstants = Constants.QueryStringConstants;

/**
* Creates a new SharedKeyTable object.
*
* @constructor
* @param {string} storageAccount    The storage account.
* @param {string} storageAccessKey  The storage account's access key.
* @param {bool}   usePathStyleUri   Boolean value indicating if the path, or the hostname, should include the storage account.
*/
function SharedKeyTable(storageAccount, storageAccessKey, usePathStyleUri) {
  SharedKeyTable['super_'].call(this,
    storageAccount,
    storageAccessKey,
    usePathStyleUri);
}

util.inherits(SharedKeyTable, SharedKey);

/**
* Signs a request with the Authentication header.
*
* @param {WebResource} The webresource to be signed.
* @param {function(error)}  callback  The callback function.
*/
SharedKeyTable.prototype.signRequest = function (webResource, callback) {
  var getvalueToAppend = function (value) {
    if (azureutil.objectIsNull(value)) {
      return '\n';
    } else {
      return value + '\n';
    }
  };

  var stringToSign =
      webResource.method + '\n' +
      getvalueToAppend(webResource.headers[HeaderConstants.CONTENT_MD5]) +
      getvalueToAppend(webResource.headers[HeaderConstants.CONTENT_TYPE]) +
      getvalueToAppend(webResource.headers[HeaderConstants.MS_DATE]) +
      this._getCanonicalizedResource(webResource);

  var signature = this.signer.sign(stringToSign);

  webResource.withHeader(HeaderConstants.AUTHORIZATION, 'SharedKey ' + this.storageAccount + ':' + signature);
  callback(null);
};

/*
* Retrieves the webresource's canonicalized resource string.
* @param {WebResource} webResource The webresource to get the canonicalized resource string from.
* @return {string} The canonicalized resource string.
*/
SharedKeyTable.prototype._getCanonicalizedResource = function (webResource) {
  var path = '/';
  if (webResource.path) {
    path = webResource.path;
  }

  var canonicalizedResource = '/' + this.storageAccount + path;

  var queryStringValues = webResource.queryString;
  if (queryStringValues[QueryStringConstants.COMP]) {
    canonicalizedResource += '?comp=' + queryStringValues[QueryStringConstants.COMP];
  }

  return canonicalizedResource;
};

module.exports = SharedKeyTable;