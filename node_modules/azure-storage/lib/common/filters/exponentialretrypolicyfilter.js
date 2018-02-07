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
* Creates a new 'ExponentialRetryPolicyFilter' instance.
* @class
* The ExponentialRetryPolicyFilter allows you to retry operations,
* using an exponential back-off interval between retries.
* To apply a filter to service operations, use `withFilter`
* and specify the filter to be used when creating a service.
* @constructor
* @param {number} [retryCount=3]            The client retry count.
* @param {number} [retryInterval=30000]     The client retry interval, in milliseconds.
* @param {number} [minRetryInterval=3000]   The minimum retry interval, in milliseconds.
* @param {number} [maxRetryInterval=90000]  The maximum retry interval, in milliseconds.
* 
* @example
* var azure = require('azure-storage');
* var retryOperations = new azure.ExponentialRetryPolicyFilter();
* var blobService = azure.createBlobService().withFilter(retryOperations)
*/
function ExponentialRetryPolicyFilter(retryCount, retryInterval, minRetryInterval, maxRetryInterval) {
  this.retryCount = retryCount ? retryCount : ExponentialRetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT;
  this.retryInterval = retryInterval ? retryInterval : ExponentialRetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL;
  this.minRetryInterval = minRetryInterval ? minRetryInterval : ExponentialRetryPolicyFilter.DEFAULT_CLIENT_MIN_RETRY_INTERVAL;
  this.maxRetryInterval = maxRetryInterval ? maxRetryInterval : ExponentialRetryPolicyFilter.DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
}

/**
* Represents the default client retry interval, in milliseconds.
*/
ExponentialRetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL = 1000 * 30;

/**
* Represents the default client retry count.
*/
ExponentialRetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT = 3;

/**
* Represents the default maximum retry interval, in milliseconds.
*/
ExponentialRetryPolicyFilter.DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1000 * 90;

/**
* Represents the default minimum retry interval, in milliseconds.
*/
ExponentialRetryPolicyFilter.DEFAULT_CLIENT_MIN_RETRY_INTERVAL = 1000 * 3;

/**
 * Determines if the operation should be retried and how long to wait until the next retry.
 *
 * @param {number} statusCode The HTTP status code.
 * @param {object} requestOptions  The request options.
 * @return {retryInfo} Information about whether the operation qualifies for a retry and the retryInterval.
 */
ExponentialRetryPolicyFilter.prototype.shouldRetry = function (statusCode, requestOptions) {
  var retryData = (requestOptions && requestOptions.retryContext) ? requestOptions.retryContext : {};

  // Adjust retry interval
  var incrementDelta = Math.pow(2, retryData.retryCount) - 1;
  var boundedRandDelta = this.retryInterval * 0.8 + Math.floor(Math.random() * (this.retryInterval * 1.2 - this.retryInterval * 0.8));
  incrementDelta *= boundedRandDelta;
      
  retryData.retryInterval = Math.min(this.minRetryInterval + incrementDelta, this.maxRetryInterval);

  return RetryPolicyFilter._shouldRetryOnError(statusCode, requestOptions);
};

/**
* Handles an operation with an exponential retry policy.
*
* @param {Object}   requestOptions The original request options.
* @param {function} next           The next filter to be handled.
*/
ExponentialRetryPolicyFilter.prototype.handle = function (requestOptions, next) {
  RetryPolicyFilter._handle(this, requestOptions, next);
};

module.exports = ExponentialRetryPolicyFilter;
