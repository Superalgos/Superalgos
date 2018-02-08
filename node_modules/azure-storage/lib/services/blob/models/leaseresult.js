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
* Creates a new LeaseResult object.
* @class
* The LeaseResult class is used to store the lease information.
* 
 * @property  {string}                      container                         The container name.
 * @property  {string}                      blob                              The blob name.
 * @property  {string}                      id                                The lease id.
 * @property  {string}                      time                              Approximate time remaining in the lease period, in seconds.
 * @property  {string}                      etag                              The etag.
 * @property  {string}                      lastModified                      The date/time that the lease was last modified.
 * 
* @constructor
* @param {string} [container]               The container name.
* @param {string} [blob]                    The blob name.
* @param {string} [id]                      The lease id.
* @param {string} [time]                    Approximate time remaining in the lease period, in seconds.
*/
function LeaseResult(container, blob, id, time) {
  if (container) {
    this.container = container;
  }

  if (blob) {
    this.blob = blob;
  }

  if (id) {
    this.id = id;
  }

  if (time) {
    this.time = time;
  }
}

LeaseResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;

  if (!self['id'] && headers[HeaderConstants.LEASE_ID]) {
    self['id'] = headers[HeaderConstants.LEASE_ID];
  }

  if (!self['time'] && headers[HeaderConstants.LEASE_TIME]) {
    self['time'] = parseInt(headers[HeaderConstants.LEASE_TIME], 10);
  }

  self['etag'] = headers[HeaderConstants.ETAG];
  self['lastModified'] = headers[HeaderConstants.LAST_MODIFIED.toLowerCase()];
};

module.exports = LeaseResult;