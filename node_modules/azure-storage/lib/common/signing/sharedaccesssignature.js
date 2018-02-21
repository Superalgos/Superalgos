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
var HmacSha256Sign = require('./hmacsha256sign');
var Constants = require('./../util/constants');
var SR = require('./../util/sr');

/**
* Creates a new SharedAccessSignature object.
*
* @constructor
* @param {string} sasToken    The sasToken.
*/
function SharedAccessSignature(sasToken) {
  this.sasToken = sasToken;
  this.signer = new HmacSha256Sign(sasToken);
}

/**
* Signs a request with the signature header.
*
* @this {SharedAccessSignature}
* @param {WebResource} The webresource to be signed.
* @param {function(error)}  callback  The callback function.
*/
SharedAccessSignature.prototype.signRequest = function (webResource, callback) {
  if (webResource.uri.indexOf('?') === -1) {
    webResource.uri += '?';
  } else {
    webResource.uri += '&';
  }

  webResource.uri += this.sasToken;

  // Add the api-version
  if (this.sasToken.indexOf('api-version') == -1) {
    webResource.uri += '&' + Constants.QueryStringConstants.API_VERSION + '=' + Constants.HeaderConstants.TARGET_STORAGE_VERSION;
  } else {
    throw new SyntaxError(SR.INVALID_SAS_TOKEN);
  }
  callback(null);
};

module.exports = SharedAccessSignature;
