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
var azureutil = azureCommon.util;
var Constants = azureCommon.Constants;
var HeaderConstants = Constants.HeaderConstants;

/**
* Creates a new ShareResult object.
* @class
* The ShareResult class is used to store the share information.
* 
 * @property  {string}                      name                                  The share name.
 * @property  {object}                      metadata                              The metadata key/value pair.
 * @property  {string}                      etag                                  The etag.
 * @property  {string}                      lastModified                          The date/time that the share was last modified.
 * @property  {string}                      requestId                             The request id.
 * @property  {string}                      quota                                 The share quota.
 * 
* @constructor
* @param {string} [name]                    The share name.
*/
function ShareResult(name) {
  this.name = name;
}

ShareResult.parse = function (shareXml, name) {
  var shareResult = new ShareResult(name);
  for (var propertyName in shareXml) {
    if (shareXml.hasOwnProperty(propertyName)) {
      if (propertyName === 'Properties') {
        //  Lift out the properties onto the main object to keep consistent across all APIs like: getShareProperties
        azureutil.setPropertyValueFromXML(shareResult, shareXml[propertyName], true);
      } else if (propertyName === 'Metadata' || propertyName === 'ShareStats') {
        var resultPropertyName = azureutil.normalizePropertyNameFromXML(propertyName);
        shareResult[resultPropertyName] = {};
        azureutil.setPropertyValueFromXML(shareResult[resultPropertyName], shareXml[propertyName], propertyName === 'ShareStats');
      } else {
        shareResult[propertyName.toLowerCase()] = shareXml[propertyName];
      }
    }
  }

  return shareResult;
};

ShareResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;

  var setSharePropertyFromHeaders = function (shareProperty, headerProperty) {
    if (!self[shareProperty] && headers[headerProperty.toLowerCase()]) {
      self[shareProperty] = headers[headerProperty.toLowerCase()];
    }
  };

  setSharePropertyFromHeaders('etag', HeaderConstants.ETAG);
  setSharePropertyFromHeaders('lastModified', HeaderConstants.LAST_MODIFIED);
  setSharePropertyFromHeaders('requestId', HeaderConstants.REQUEST_ID);
  setSharePropertyFromHeaders('quota', HeaderConstants.SHARE_QUOTA);
};

/**
* The share ACL settings.
* @typedef    {object}                ShareAclResult
* @extends    {ShareAclResult}
* @property   {Object.<string, AccessPolicy>}    signedIdentifiers   The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
*/

module.exports = ShareResult;