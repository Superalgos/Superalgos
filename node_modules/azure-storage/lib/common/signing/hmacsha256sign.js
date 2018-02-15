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
var crypto = require('crypto');

/**
* Creates a new HmacSHA256Sign object.
*
* @constructor
*/
function HmacSha256Sign(accessKey) {
  this._accessKey = accessKey;
  this._decodedAccessKey = new Buffer(this._accessKey, 'base64');
}

/**
* Computes a signature for the specified string using the HMAC-SHA256 algorithm.
*
* @param {string} stringToSign The UTF-8-encoded string to sign.
* @return A String that contains the HMAC-SHA256-encoded signature.
*/
HmacSha256Sign.prototype.sign = function (stringToSign) {
  // Encoding the Signature
  // Signature=Base64(HMAC-SHA256(UTF8(StringToSign)))

  return crypto.createHmac('sha256', this._decodedAccessKey).update(stringToSign, 'utf-8').digest('base64');
};

module.exports = HmacSha256Sign;