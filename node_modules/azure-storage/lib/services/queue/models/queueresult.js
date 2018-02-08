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
var Constants = require('./../../../common/common.core').Constants;
var HeaderConstants = Constants.HeaderConstants;

/**
* Creates a new QueueResult object.
* @class
* The QueueResult class is used to store the queue information.
* 
* @property   {string}                      name                                  The queue name.
* @property   {object}                      metadata                              The metadata key/value pair.
* @property   {number}                      approximateMessageCount               The approximate number of messages in the queue. This number is not lower than the actual number of messages in the queue, but could be higher.
* @property   {Object.<string, AccessPolicy>}  signedIdentifiers                     The container ACL settings. See `[AccessPolicy]{@link AccessPolicy}` for detailed information.
 * 
* @constructor
* @param {string} [name]                    The queue name.
* @param {string} [metadata]                The metadata key/value pair.
*/
function QueueResult(name, metadata) {
  if (name) {
    this.name = name;
  }

  if (metadata) {
    this.metadata = metadata;
  }
}

QueueResult.parse = function (messageXml) {
  var queueResult = new QueueResult();
  for (var property in messageXml) {
    if (messageXml.hasOwnProperty(property)) {
      queueResult[property.toLowerCase()] = messageXml[property];
    }
  }

  return queueResult;
};

QueueResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;

  var setPropertyFromHeaders = function (queueProperty, headerProperty, typeConverterFunc) {
    if (!self[queueProperty] && headers[headerProperty.toLowerCase()]) {
      if(typeConverterFunc) {
        self[queueProperty] = typeConverterFunc(headers[headerProperty.toLowerCase()]);
      } else{
        self[queueProperty] = headers[headerProperty.toLowerCase()];
      }
    }
  };

  setPropertyFromHeaders('approximateMessageCount', HeaderConstants.APPROXIMATE_MESSAGES_COUNT, parseInt);
};

module.exports = QueueResult;