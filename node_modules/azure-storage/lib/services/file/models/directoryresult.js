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
var HeaderConstants = require('./../../../common/common.core').Constants.HeaderConstants;

/**
* Creates a new DirectoryResult object.
* @class
* The DirectoryResult class is used to store the directory information.
* 
 * @property  {string}                      name                                  The container name.
 * @property  {object}                      metadata                              The metadata key/value pair.
 * @property  {string}                      etag                                  The etag.
 * @property  {string}                      lastModified                          The date/time that the directory was last modified.
 * @property  {string}                      requestId                             The request id.
 * @property  {string}                      serverEncrypted                       If the directory metadata is completely encrypted using the specified algorithm. true/false.
 *
* @constructor
* @param {string} [name]                    The directory name.
*/
function DirectoryResult(name) {
  this.name = name;
}

DirectoryResult.parse = function (dirXml) {
  return new DirectoryResult(dirXml.Name);
};

DirectoryResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;

  var setDirectoryPropertyFromHeaders = function (directoryProperty, headerProperty) {
    if (!self[directoryProperty] && headers[headerProperty.toLowerCase()]) {
      self[directoryProperty] = headers[headerProperty.toLowerCase()];
    }
  };

  setDirectoryPropertyFromHeaders('etag', HeaderConstants.ETAG);
  setDirectoryPropertyFromHeaders('lastModified', HeaderConstants.LAST_MODIFIED);
  setDirectoryPropertyFromHeaders('requestId', HeaderConstants.REQUEST_ID);
  setDirectoryPropertyFromHeaders('serverEncrypted', HeaderConstants.SERVER_ENCRYPTED);
};

module.exports = DirectoryResult;