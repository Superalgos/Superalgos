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
var BlobUtilities = require('../blobutilities');

/**
* Creates a new ContainerResult object.
* @class
* The ContainerResult class is used to store the container information.
* 
 * @property  {string}                      name                                  The container name.
 * @property  {string}                      publicAccessLevel                     The public access level.
 * @property  {object}                      metadata                              The metadata key/value pair.
 * @property  {string}                      etag                                  The etag.
 * @property  {string}                      lastModified                          The date/time that the container was last modified.
 * @property  {string}                      requestId                             The request id.
 * @property  {object}                      lease                                 The lease information.
 * @property  {string}                      lease.status                          The lease status.
 * @property  {string}                      lease.state                           The lease state.
 * @property  {string}                      lease.duration                        The lease duration.
 * 
* @constructor
* @param {string} [container]               The container name.
* @param {string} [publicAccessLevel]       The public access level.
*/
function ContainerResult(name, publicAccessLevel) {
  if (name) {
    this.name = name;
  }

  if (publicAccessLevel) {
    this.publicAccessLevel = publicAccessLevel;
  }
}

ContainerResult.parse = function (containerXml) {
  var containerResult = new ContainerResult();
  
  for (var propertyName in containerXml) {
    if (containerXml.hasOwnProperty(propertyName)) {
      if (propertyName === 'Properties') {
        //  Lift out the properties onto the main object to keep consistent across all APIs like: getContainerProperties
        azureutil.setPropertyValueFromXML(containerResult, containerXml[propertyName], true);
      } else if (propertyName === 'Metadata') {
        var resultPropertyName = azureutil.normalizePropertyNameFromXML(propertyName);
        containerResult[resultPropertyName] = {};
        azureutil.setPropertyValueFromXML(containerResult[resultPropertyName], containerXml[propertyName], false);
      } else {
        containerResult[propertyName.toLowerCase()] = containerXml[propertyName];
      }
    }
  }

  if (!containerResult.publicAccessLevel) {
    containerResult.publicAccessLevel = BlobUtilities.BlobContainerPublicAccessType.OFF;
  }

  return containerResult;
};

ContainerResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;
  
  var setContainerPropertyFromHeaders = function (containerProperty, headerProperty) {
    if (!azureutil.tryGetValueChain(self, containerProperty.split('.'), null) && headers[headerProperty.toLowerCase()]) {
      azureutil.setObjectInnerPropertyValue(self, containerProperty.split('.'), headers[headerProperty.toLowerCase()]);
    }
  };

  setContainerPropertyFromHeaders('etag', HeaderConstants.ETAG);
  setContainerPropertyFromHeaders('lastModified', HeaderConstants.LAST_MODIFIED);
  setContainerPropertyFromHeaders('lease.status', HeaderConstants.LEASE_STATUS);
  setContainerPropertyFromHeaders('lease.state', HeaderConstants.LEASE_STATE);
  setContainerPropertyFromHeaders('lease.duration', HeaderConstants.LEASE_DURATION);
  setContainerPropertyFromHeaders('requestId', HeaderConstants.REQUEST_ID);

  if (!self.publicAccessLevel) {
    self.publicAccessLevel = BlobUtilities.BlobContainerPublicAccessType.OFF;
    if (headers[HeaderConstants.BLOB_PUBLIC_ACCESS]) {
      self.publicAccessLevel = headers[HeaderConstants.BLOB_PUBLIC_ACCESS];
    }
  }

  if (self.publicAccessLevel === 'true') {
    // The container was marked for full public read access using a version prior to 2009-09-19.
    self.publicAccessLevel = BlobUtilities.BlobContainerPublicAccessType.CONTAINER;
  }
};

/**
* The container ACL settings.
* @typedef    {object}                        ContainerAclResult
* @extends    {ContainerResult}
* @property   {Object.<string, AccessPolicy>}    signedIdentifiers   The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
*/

module.exports = ContainerResult;