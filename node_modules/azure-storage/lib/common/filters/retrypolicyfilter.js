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

var azureutil = require('../util/util');
var Constants = require('../util/constants');
var StorageUtilities = require('../util/storageutilities');
var extend = require('util')._extend;

/**
* Creates a new RetryPolicyFilter instance.
* @class
* The RetryPolicyFilter allows you to retry operations,
* using a custom retry policy. Users are responsible to 
* define the shouldRetry method.
* To apply a filter to service operations, use `withFilter`
* and specify the filter to be used when creating a service.
* @constructor
* @param {number} [retryCount=30000]        The client retry count.
* @param {number} [retryInterval=3]     The client retry interval, in milliseconds.
*
* @example
* var azure = require('azure-storage');
* var retryPolicy = new azure.RetryPolicyFilter();
* retryPolicy.retryCount = 3;
* retryPolicy.retryInterval = 3000;
* retryPolicy.shouldRetry = function(statusCode, retryContext) {
*
* };
* var blobService = azure.createBlobService().withFilter(retryPolicy);
*/
function RetryPolicyFilter(retryCount, retryInterval) {
  this.retryCount = retryCount ? retryCount : RetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT;
  this.retryInterval = retryInterval ? retryInterval : RetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL;
}

/**
* Represents the default client retry interval, in milliseconds.
*/
RetryPolicyFilter.DEFAULT_CLIENT_RETRY_INTERVAL = 1000 * 30;

/**
* Represents the default client retry count.
*/
RetryPolicyFilter.DEFAULT_CLIENT_RETRY_COUNT = 3;

/**
* Handles an operation with a retry policy.
*
* @param {Object}   requestOptions The original request options.
* @param {function} next           The next filter to be handled.
*/
RetryPolicyFilter.prototype.handle = function (requestOptions, next) {
  RetryPolicyFilter._handle(this, requestOptions, next);
};

/**
* Handles an operation with a retry policy.
*
* @param {Object}   requestOptions The original request options.
* @param {function} next           The next filter to be handled.
*/
RetryPolicyFilter._handle = function (self, requestOptions, next) {

  var retryRequestOptions = extend({}, requestOptions);
  retryRequestOptions.retryInterval = 0;

  // Initialize retryContext because that will be passed to the shouldRetry method which users will implement 
  retryRequestOptions.retryContext = {
    retryCount: 0,
    error: null,
    retryInterval: retryRequestOptions.retryInterval,
    locationMode: retryRequestOptions.locationMode,
    currentLocation: retryRequestOptions.currentLocation
  };

  var lastPrimaryAttempt;
  var lastSecondaryAttempt;
  var operation = function () {
    // retry policies dont really do anything to the request options
    // so move on to next
    if (next) {
      next(retryRequestOptions, function (returnObject, finalCallback, nextPostCallback) {
        // Previous operation ended so update the retry data
        if (returnObject.error) {
          if (retryRequestOptions.retryContext.error) {
            returnObject.error.innerError = retryRequestOptions.retryContext.error;
          }

          retryRequestOptions.retryContext.error = returnObject.error;
        }

        // If a request sent to the secondary location fails with 404 (Not Found), it is possible
        // that the resource replication is not finished yet. So, in case of 404 only in the secondary
        // location, the failure should still be retryable.
        var secondaryNotFound = (retryRequestOptions.currentLocation === Constants.StorageLocation.SECONDARY) && ((returnObject.response && returnObject.response.statusCode === 404) || (returnObject.error && returnObject.error.code === 'ENOTFOUND'));
 
        var notExceedMaxRetryCount = retryRequestOptions.retryContext.retryCount ? retryRequestOptions.retryContext.retryCount <= self.retryCount : true;
        var retryInfo = self.shouldRetry(secondaryNotFound ? 500 : (azureutil.objectIsNull(returnObject.response) ? 306 : returnObject.response.statusCode), retryRequestOptions);
        retryRequestOptions.retryContext.retryCount++;

        if (retryInfo.ignore) {
          returnObject.error = null;
        }

        // If the custom retry logic(shouldRetry) does not return a targetLocation, calculate based on the previous location and locationMode.
        if(azureutil.objectIsNull(retryInfo.targetLocation)) {
          retryInfo.targetLocation = azureutil.getNextLocation(retryRequestOptions.currentLocation, retryRequestOptions.locationMode);
        }

        // If the custom retry logic(shouldRetry) does not return a retryInterval, try to set it to the value on the instance if it is available. Otherwise, the default(30000) will be used.
        if(azureutil.objectIsNull(retryInfo.retryInterval)) {
          retryInfo.retryInterval = self.retryInterval;
        }
        
        // Only in the case of success from server but client side failure like MD5 or length mismatch, returnObject.retryable has a value(we explicitly set it to false). 
        // In this case, we should not retry the request.
        // If the output stream already get sent to server and get error back, 
        // we should NOT retry within the SDK as the stream data is not valid anymore if we retry directly.
        if (
            !returnObject.outputStreamSent && returnObject.error && azureutil.objectIsNull(returnObject.retryable) && notExceedMaxRetryCount &&
            (
              (!azureutil.objectIsNull(returnObject.response) && retryInfo.retryable) || 
              (
                returnObject.error.code === 'ECONNREFUSED' ||
                returnObject.error.code === 'ETIMEDOUT' ||
                returnObject.error.code === 'ESOCKETTIMEDOUT' || 
                returnObject.error.code === 'ECONNRESET' || 
                returnObject.error.code === 'EAI_AGAIN'
              )
            )
          ) {
          if (retryRequestOptions.currentLocation === Constants.StorageLocation.PRIMARY) {
            lastPrimaryAttempt = returnObject.operationEndTime;
          } else {
            lastSecondaryAttempt = returnObject.operationEndTime;
          }

          // Moreover, in case of 404 when trying the secondary location, instead of retrying on the
          // secondary, further requests should be sent only to the primary location, as it most
          // probably has a higher chance of succeeding there.
          if (secondaryNotFound && (retryRequestOptions.locationMode !== StorageUtilities.LocationMode.SECONDARY_ONLY))
          {
            retryInfo.locationMode = StorageUtilities.LocationMode.PRIMARY_ONLY;
            retryInfo.targetLocation = Constants.StorageLocation.PRIMARY;
          }

          // Now is the time to calculate the exact retry interval. ShouldRetry call above already
          // returned back how long two requests to the same location should be apart from each other.
          // However, for the reasons explained above, the time spent between the last attempt to
          // the target location and current time must be subtracted from the total retry interval
          // that ShouldRetry returned.
          var lastAttemptTime = retryInfo.targetLocation === Constants.StorageLocation.PRIMARY ? lastPrimaryAttempt : lastSecondaryAttempt;
          if (!azureutil.objectIsNull(lastAttemptTime)) {
            var sinceLastAttempt = new Date().getTime() - lastAttemptTime.getTime();
            if (sinceLastAttempt < 0) {
              sinceLastAttempt = 0;
            }

            retryRequestOptions.retryInterval = retryInfo.retryInterval - sinceLastAttempt;
          }
          else {
            retryRequestOptions.retryInterval = 0;
          }

          if(!azureutil.objectIsNull(retryInfo.locationMode)) {
            retryRequestOptions.locationMode = retryInfo.locationMode;
          }

          retryRequestOptions.currentLocation = retryInfo.targetLocation;
          operation();
        } else {
          if (nextPostCallback) {
            nextPostCallback(returnObject);
          } else if (finalCallback) {
            finalCallback(returnObject);
          }
        }
      });
    }
  };

  operation();
};

RetryPolicyFilter._shouldRetryOnError = function (statusCode, requestOptions) {
  var retryInfo = (requestOptions && requestOptions.retryContext) ? requestOptions.retryContext : {};

  // Non-timeout Cases
  if (statusCode >= 300 && statusCode != 408) {
    // Always no retry on "not implemented" and "version not supported"
    if (statusCode == 501 || statusCode == 505) {
      retryInfo.retryable = false;
      return retryInfo;
    }
    
    // When absorbConditionalErrorsOnRetry is set (for append blob)
    if (requestOptions && requestOptions.absorbConditionalErrorsOnRetry) {
      if (statusCode == 412) {
        // When appending block with precondition failure and their was a server error before, we ignore the error.
        if (retryInfo.lastServerError) {
          retryInfo.ignore = true;
          retryInfo.retryable = true;
        } else {
          retryInfo.retryable = false;
        }
      } else if (retryInfo.retryable && statusCode >= 500 && statusCode < 600) {
        // Retry on the server error
        retryInfo.retryable = true;
        retryInfo.lastServerError = true;
      }
    } else if (statusCode < 500) {
      // No retry on the client error
      retryInfo.retryable = false;
    }
  }

  return retryInfo;
};

module.exports = RetryPolicyFilter;
