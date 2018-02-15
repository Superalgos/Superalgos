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
'use strict';
 
var RetryPolicyFilter = require('./retrypolicyfilter');

/**
* Creates a new LinearRetryPolicyFilter instance.
* @class
* The LinearRetryPolicyFilter allows you to retry operations,
* using an linear back-off interval between retries.
* To apply a filter to service operations, use `withFilter`
* and specify the filter to be used when creating a service.
* @constructor
* @param {number} [retryCount=3]            The client retry count.
* @param {number} [retryInterval=30000]     The client retry interval, in milliseconds.
*
* @example
* var azure = require('azure-storage');
* var retryOperations = new azure.LinearRetryPolicyFilter();
* var blobService = azure.createBlobService().withFilter(retryOperations)
*/
function LinearRetryPolicyFilter(retryCount, retryInterval) {
  this.retryCount = retryCount ? retryCount : LinearRetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT;
  this.retryInterval = retryInterval ? retryInterval : LinearRetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL;
}

/**
* Represents the default client retry interval, in milliseconds.
*/
LinearRetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL = 1000 * 30;

/**
* Represents the default client retry count.
*/
LinearRetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT = 3;

/**
* Determines if the operation should be retried and how long to wait until the next retry.
*
 * @param {number} statusCode       The HTTP status code.
 * @param {object} requestOptions   The request options.
 * @return {retryInfo} Information about whether the operation qualifies for a retry and the retryInterval.
*/
LinearRetryPolicyFilter.prototype.shouldRetry = function (statusCode, requestOptions) {
  var retryData = (requestOptions && requestOptions.retryContext) ? requestOptions.retryContext : {};
  retryData.retryInterval = this.retryInterval;

  return RetryPolicyFilter._shouldRetryOnError(statusCode, requestOptions);
};

/**
* Handles an operation with a linear retry policy.
*
* @param {Object}   requestOptions The original request options.
* @param {function} next           The next filter to be handled.
*/
LinearRetryPolicyFilter.prototype.handle = function (requestOptions, next) {
  RetryPolicyFilter._handle(this, requestOptions, next);
};

module.exports = LinearRetryPolicyFilter;
