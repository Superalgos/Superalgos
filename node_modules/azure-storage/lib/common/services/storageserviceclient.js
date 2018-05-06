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
var request = require('../request-wrapper');
var url = require('url');
var qs = require('querystring');
var util = require('util');
var xml2js = require('xml2js');
var events = require('events');
var _ = require('underscore');
var guid = require('uuid');
var os = require('os');
var extend = require('extend');
var Parser = require('json-edm-parser');

var Md5Wrapper = require('../md5-wrapper');
var azureutil = require('../util/util');
var validate = require('../util/validate');
var SR = require('../util/sr');
var WebResource = require('../http/webresource');
var BufferStream = require('../streams/bufferstream.js');

var ServiceSettings = require('./servicesettings');
var StorageServiceSettings = require('./storageservicesettings');
var Constants = require('../util/constants');
var StorageUtilities = require('../util/storageutilities');
var ServicePropertiesResult = require('../models/servicepropertiesresult');
var TableUtilities = require('../../services/table/tableutilities');

var SharedKey = require('../signing/sharedkey');
var SharedAccessSignature = require('../signing/sharedaccesssignature');

var HeaderConstants = Constants.HeaderConstants;
var QueryStringConstants = Constants.QueryStringConstants;
var HttpResponseCodes = Constants.HttpConstants.HttpResponseCodes;
var StorageServiceClientConstants = Constants.StorageServiceClientConstants;
var defaultRequestLocationMode = Constants.RequestLocationMode.PRIMARY_ONLY;
var RequestLocationMode = Constants.RequestLocationMode;

var Logger = require('../diagnostics/logger');
var errors = require('../errors/errors');
var ArgumentError = errors.ArgumentError;
var ArgumentNullError = errors.ArgumentNullError;
var TimeoutError = errors.TimeoutError;
var StorageError = errors.StorageError;

/**
* Creates a new StorageServiceClient object.
*
* @class
* The StorageServiceClient class is the base class of all the service classes.
* @constructor
* @param {string} storageAccount           The storage account.
* @param {string} storageAccessKey         The storage access key.
* @param {object} host                     The host for the service.
* @param {bool}   usePathStyleUri          Boolean value indicating wether to use path style uris.
* @param {string} sasToken                 The Shared Access Signature token.
*/
function StorageServiceClient(storageAccount, storageAccessKey, host, usePathStyleUri, sasToken) {
  StorageServiceClient['super_'].call(this);

  if(storageAccount && storageAccessKey) {
    // account and key
    this.storageAccount = storageAccount;
    this.storageAccessKey = storageAccessKey;
    this.storageCredentials = new SharedKey(this.storageAccount, this.storageAccessKey, usePathStyleUri);
  } else if (sasToken) {
    // sas
    this.sasToken = sasToken;
    this.storageCredentials = new SharedAccessSignature(sasToken);
  } else {
    // anonymous
    this.anonymous = true;
    this.storageCredentials = {
      signRequest: function(webResource, callback){
        // no op, anonymous access
        callback(null);
      }
    };
  }

  if(host){
    this.setHost(host);
  }

  this.apiVersion = HeaderConstants.TARGET_STORAGE_VERSION;
  this.usePathStyleUri = usePathStyleUri;

  this._initDefaultFilter();

  /**
   * The logger of the service. To change the log level of the services, set the `[logger.level]{@link Logger#level}`.
   * @name StorageServiceClient#logger
   * @type Logger
   * */
  this.logger = new Logger(Logger.LogLevels.INFO);

  this._setDefaultProxy();

  this.xml2jsSettings = StorageServiceClient._getDefaultXml2jsSettings();
  this.defaultLocationMode = StorageUtilities.LocationMode.PRIMARY_ONLY;
}

util.inherits(StorageServiceClient, events.EventEmitter);

/**
* Gets the default xml2js settings.
* @ignore
* @return {object} The default settings
*/
StorageServiceClient._getDefaultXml2jsSettings = function() {
  var xml2jsSettings = _.clone(xml2js.defaults['0.2']);

  // these determine what happens if the xml contains attributes
  xml2jsSettings.attrkey = Constants.TableConstants.XML_METADATA_MARKER;
  xml2jsSettings.charkey = Constants.TableConstants.XML_VALUE_MARKER;

  // from xml2js guide: always put child nodes in an array if true; otherwise an array is created only if there is more than one.
  xml2jsSettings.explicitArray = false;

  return xml2jsSettings;
};

/**
* Sets a host for the service.
* @ignore
* @param {string}     host                              The host for the service.
*/
StorageServiceClient.prototype.setHost = function (host) {
  var parseHost = function(hostUri){
    var parsedHost;
    if(!azureutil.objectIsNull(hostUri)) {
      if(hostUri.indexOf('http') === -1 && hostUri.indexOf('//') !== 0){
        hostUri = '//' + hostUri;
      }
      parsedHost = url.parse(hostUri, false, true);

      if(!parsedHost.protocol){
        parsedHost.protocol = ServiceSettings.DEFAULT_PROTOCOL;
      }

      if (!parsedHost.port) {
        if (parsedHost.protocol === Constants.HTTPS) {
          parsedHost.port = Constants.DEFAULT_HTTPS_PORT;
        } else {
          parsedHost.port = Constants.DEFAULT_HTTP_PORT;
        }
      }

      parsedHost = url.format({
        protocol: parsedHost.protocol,
        port: parsedHost.port,
        hostname: parsedHost.hostname,
        pathname: parsedHost.pathname
      });
    }

    return parsedHost;
  };

  validate.isValidHost(host);

  this.host = {
    primaryHost: parseHost(host.primaryHost),
    secondaryHost: parseHost(host.secondaryHost)
  };
};

/**
* Performs a REST service request through HTTP expecting an input stream.
* @ignore
*
* @param {WebResource} webResource                        The webresource on which to perform the request.
* @param {string}      outputData                         The outgoing request data as a raw string.
* @param {object}      [options]                          The request options.
* @param {int}         [options.timeoutIntervalInMs]      The timeout interval, in milliseconds, to use for the request.
* @param {int}         [options.clientRequestTimeoutInMs] The timeout of client requests, in milliseconds, to use for the request.
* @param {function}    callback                           The response callback function.
*/
StorageServiceClient.prototype.performRequest = function (webResource, outputData, options, callback) {
    this._performRequest(webResource, { outputData: outputData }, options, callback);
};

/**
* Performs a REST service request through HTTP expecting an input stream.
* @ignore
*
* @param {WebResource} webResource                        The webresource on which to perform the request.
* @param {Stream}      outputStream                       The outgoing request data as a stream.
* @param {object}      [options]                          The request options.
* @param {int}         [options.timeoutIntervalInMs]      The timeout interval, in milliseconds, to use for the request.
* @param {int}         [options.clientRequestTimeoutInMs] The timeout of client requests, in milliseconds, to use for the request.
* @param {function}    callback                           The response callback function.
*/
StorageServiceClient.prototype.performRequestOutputStream = function (webResource, outputStream, options, callback) {
  this._performRequest(webResource, { outputStream: outputStream }, options, callback);
};

/**
* Performs a REST service request through HTTP expecting an input stream.
* @ignore
*
* @param {WebResource} webResource                        The webresource on which to perform the request.
* @param {string}      outputData                         The outgoing request data as a raw string.
* @param {Stream}      inputStream                        The ingoing response data as a stream.
* @param {object}      [options]                          The request options.
* @param {int}         [options.timeoutIntervalInMs]      The timeout interval, in milliseconds, to use for the request.
* @param {int}         [options.clientRequestTimeoutInMs] The timeout of client requests, in milliseconds, to use for the request.
* @param {function}    callback                           The response callback function.
*/
StorageServiceClient.prototype.performRequestInputStream = function (webResource, outputData, inputStream, options, callback) {
  this._performRequest(webResource, { outputData: outputData, inputStream: inputStream }, options, callback);
};

/**
* Performs a REST service request through HTTP.
* @ignore
*
* @param {WebResource} webResource                        The webresource on which to perform the request.
* @param {object}      body                               The request body.
* @param {string}      [body.outputData]                  The outgoing request data as a raw string.
* @param {Stream}      [body.outputStream]                The outgoing request data as a stream.
* @param {Stream}      [body.inputStream]                 The ingoing response data as a stream.
* @param {object}      [options]                          The request options.
* @param {string}      [options.clientRequestId]          A string that represents the client request ID with a 1KB character limit.
* @param {int}         [options.timeoutIntervalInMs]      The timeout interval, in milliseconds, to use for the request.
* @param {int}         [options.clientRequestTimeoutInMs] The timeout of client requests, in milliseconds, to use for the request.
* @param {function}    callback                           The response callback function.
*/
StorageServiceClient.prototype._performRequest = function (webResource, body, options, callback) {
  var self = this;

  // Sets a requestId on the webResource
  if(!options.clientRequestId) {
    options.clientRequestId = guid.v1();
  }
  
  webResource.withHeader(HeaderConstants.CLIENT_REQUEST_ID, options.clientRequestId);

  // Sets the user-agent string
  var userAgentComment = util.format('(NODE-VERSION %s; %s %s)', process.version, os.type(), os.release());
  webResource.withHeader(HeaderConstants.USER_AGENT, Constants.USER_AGENT_PRODUCT_NAME + '/' + Constants.USER_AGENT_PRODUCT_VERSION + ' ' + userAgentComment);

  // Initialize the location that the request is going to be sent to.
  if(azureutil.objectIsNull(options.locationMode)) {
    options.locationMode = this.defaultLocationMode;
  }

  // Initialize the location that the request can be sent to.
  if(azureutil.objectIsNull(options.requestLocationMode)) {
    options.requestLocationMode = defaultRequestLocationMode;
  }

  // Initialize whether nagling is used or not.
  if(azureutil.objectIsNull(options.useNagleAlgorithm)) {
    options.useNagleAlgorithm = this.useNagleAlgorithm;
  }

  this._initializeLocation(options);
  
  // Initialize the operationExpiryTime
  this._setOperationExpiryTime(options);

  // If the output stream already got sent to server and got error back, 
  // we should NOT retry within the SDK as the stream data is not valid anymore if we retry directly.
  // And it's very hard for SDK to re-wind the stream.
  //
  // If users want to retry on this kind of error, they can implement their own logic to parse the response and 
  // determine if they need to re-prepare a stream and call our SDK API to retry.
  //
  // Currently for blobs/files with size greater than 32MB (DEFAULT_SINGLE_BLOB_PUT_THRESHOLD_IN_BYTES), 
  // we'll send the steam by chunk buffers which doesn't have this issue.
  var outputStreamSent = false;

  var operation = function (options, next) {
    self._validateLocation(options);
    var currentLocation = options.currentLocation;
    self._buildRequestOptions(webResource, body, options, function (err, finalRequestOptions) {
      if (err) {
        callback({ error: err, response: null }, function (finalRequestOptions, finalCallback) {
          finalCallback(finalRequestOptions);
        });
      } else {
        self.logger.log(Logger.LogLevels.DEBUG, 'FINAL REQUEST OPTIONS:\n' + util.inspect(finalRequestOptions));

        if(self._maximumExecutionTimeExceeded(Date.now(), options.operationExpiryTime)) {
          callback({ error: new TimeoutError(SR.MAXIMUM_EXECUTION_TIMEOUT_EXCEPTION), response: null }, function (finalRequestOptions, finalCallback) {
            finalCallback(finalRequestOptions);
          });
        } else {
          var processResponseCallback = function (error, response) {
            var responseObject;

            if (error) {
              responseObject = { error: error, response: null };
            } else {
              responseObject = self._processResponse(webResource, response, options);
              responseObject.contentMD5 = response.contentMD5;
              responseObject.length = response.length;
            }

            responseObject.operationEndTime = new Date();
            // Required for listing operations to make sure successive operations go to the same location.
            responseObject.targetLocation = currentLocation;
            responseObject.outputStreamSent = outputStreamSent;

            callback(responseObject, next);
          };

          var endResponse;
          var buildRequest = function (headersOnly, inputStream) {
            // Build request (if body was set before, request will process immediately, if not it'll wait for the piping to happen
            var requestStream;

            var requestWithDefaults;
            
            if(self.proxy) {
              if(requestWithDefaults === undefined) {
                requestWithDefaults = request.defaults({'proxy':self.proxy});
              }
            } else {
              requestWithDefaults = request;
            }

            if (headersOnly) {
              requestStream = requestWithDefaults(finalRequestOptions);

              requestStream.on('error', processResponseCallback);
              requestStream.on('response', function (response) {
                var isValid = WebResource.validResponse(response.statusCode);
                if (!isValid) {
                    // When getting invalid response, try to get the error message for future steps to extract the detailed error information
                    var contentLength = parseInt(response.headers['content-length']);
                    var errorMessageBuffer;
                    var index = 0;
                    if (contentLength !== undefined) {
                      errorMessageBuffer = new Buffer(contentLength);
                    }
                    
                    requestStream.on('data', function (data) {
                      if (contentLength !== undefined) {
                        data.copy(errorMessageBuffer, index);
                        index += data.length;
                      } else {
                        if (!errorMessageBuffer) {
                          errorMessageBuffer = data;
                        } else {
                          errorMessageBuffer = Buffer.concat([errorMessageBuffer, data]);
                        }
                      }
                    });
                    requestStream.on('end', function () {
                      if (errorMessageBuffer) {
                        // Strip the UTF8 BOM following the same ways as 'request' module
                        if (errorMessageBuffer.length > 3 &&
                          errorMessageBuffer[0] === 239 &&
                          errorMessageBuffer[1] === 187 &&
                          errorMessageBuffer[2] === 191) {
                          response.body = errorMessageBuffer.toString('utf8', 3);
                        } else {
                          response.body = errorMessageBuffer.toString('utf8');
                        }
                      }
                      processResponseCallback(null, response);
                    });
                } else {
                  // Only pipe to the destination stream when we get a valid response from service
                  // Error message should NOT be piped to the destination stream
                  if (inputStream) {
                    requestStream.pipe(inputStream);
                  }

                  var responseLength = 0;
                  var internalHash = new Md5Wrapper().createMd5Hash();
                  response.on('data', function(data) {
                    responseLength += data.length;
                    internalHash.update(data);
                  });

                  response.on('end', function () {
                    // Calculate and set MD5 here
                    if(azureutil.objectIsNull(options.disableContentMD5Validation) || options.disableContentMD5Validation === false) {
                      response.contentMD5 = internalHash.digest('base64');
                    }
                      
                    response.length = responseLength;
                    endResponse = response;
                  });
                }
              });
            } else {
              requestStream = requestWithDefaults(finalRequestOptions, processResponseCallback);
            }

            //If useNagleAlgorithm is not set or the value is set and is false, setNoDelay is set to true.
            if (azureutil.objectIsNull(options.useNagleAlgorithm) || options.useNagleAlgorithm === false) {
              requestStream.on('request', function(httpRequest) {
                httpRequest.setNoDelay(true);
              });
            }

            // Workaround to avoid request from potentially setting unwanted (rejected) headers by the service
            var oldEnd = requestStream.end;
            requestStream.end = function () {
              if (finalRequestOptions.headers['content-length']) {
                requestStream.headers['content-length'] = finalRequestOptions.headers['content-length'];
              } else if (requestStream.headers['content-length']) {
                delete requestStream.headers['content-length'];
              }

              oldEnd.call(requestStream);
            };

            // Bubble events up -- This is when the request is going to be made.
            requestStream.on('response', function (response) {
              self.emit('receivedResponseEvent', response);
            });

            return requestStream;
          };

          if (body && body.outputData) {
            if (!azureutil.isBrowser() && Buffer.isBuffer(body.outputData)) {
              // Request module will take 200MB additional memory when we pass a 100MB buffer as body
              // Transfer buffer to stream will highly reduce the memory used by request module
              finalRequestOptions.body = new BufferStream(body.outputData);              
            } else {
              finalRequestOptions.body = body.outputData;
            }
          }

          // Pipe any input / output streams
          if (body && body.inputStream) {
            body.inputStream.on('close', function () {
              if (endResponse) {
                processResponseCallback(null, endResponse);
                endResponse = null;
              }
            });
            body.inputStream.on('end', function () {
              if (endResponse) {
                processResponseCallback(null, endResponse);
                endResponse = null;
              }
            });
            body.inputStream.on('finish', function () {
              if (endResponse) {
                processResponseCallback(null, endResponse);
                endResponse = null;
              }
            });
            buildRequest(true, body.inputStream);
          } else if (body && body.outputStream) {
            var sendUnchunked = function () {
              var size = finalRequestOptions.headers['content-length'] ?
                finalRequestOptions.headers['content-length'] :
                Constants.BlobConstants.MAX_SINGLE_UPLOAD_BLOB_SIZE_IN_BYTES;

              var concatBuf = new Buffer(size);
              var index = 0;

              body.outputStream.on('data', function (d) {
                outputStreamSent = true;
                if(self._maximumExecutionTimeExceeded(Date.now(), options.operationExpiryTime)) {
                  processResponseCallback(new TimeoutError(SR.MAXIMUM_EXECUTION_TIMEOUT_EXCEPTION));
                } else {
                  d.copy(concatBuf, index);
                  index += d.length;
                }
              }).on('end', function () {
                var requestStream = buildRequest();
                requestStream.write(concatBuf);
                requestStream.end();
              });
              if (azureutil.isStreamPaused(body.outputStream)) {
                body.outputStream.resume();
              }
            };

            var sendStream = function () {
              // NOTE: workaround for an unexpected EPIPE exception when piping streams larger than 29 MB
              if (!azureutil.objectIsNull(finalRequestOptions.headers['content-length']) && finalRequestOptions.headers['content-length'] < 29 * 1024 * 1024) {
                body.outputStream.pipe(buildRequest());
                outputStreamSent = true;

                if (azureutil.isStreamPaused(body.outputStream)) {
                  body.outputStream.resume();
                }
              } else {
                sendUnchunked();
              }
            };

            if (!body.outputStream.readable) {
              // if the content length is zero, build the request and don't send a body
              if (finalRequestOptions.headers['content-length'] === 0) {
                buildRequest();
              } else {
                // otherwise, wait until we know the readable stream is actually valid before piping
                body.outputStream.on('open', function () {
                  sendStream();
                });
              }
            } else {
              sendStream();
            }

            // This catches any errors that happen while creating the readable stream (usually invalid names)
            body.outputStream.on('error', function (error) {
              processResponseCallback(error);
            });
          } else {
            buildRequest();
          }
        }
      }
    });
  };

  // The filter will do what it needs to the requestOptions and will provide a
  // function to be handled after the reply
  self.filter(options, function (postFiltersRequestOptions, nextPostCallback) {
    if(self._maximumExecutionTimeExceeded(Date.now() + postFiltersRequestOptions.retryInterval, postFiltersRequestOptions.operationExpiryTime)) {
      callback({ error: new TimeoutError(SR.MAXIMUM_EXECUTION_TIMEOUT_EXCEPTION), response: null}, function (postFiltersRequestOptions, finalCallback) {
        finalCallback(postFiltersRequestOptions);
      });
    } else {
      // If there is a filter, flow is:
      // filter -> operation -> process response
      if(postFiltersRequestOptions.retryContext) {
        var func = function() {
          operation(postFiltersRequestOptions, nextPostCallback);
        };

        // Sleep for retryInterval before making the request
        setTimeout(func, postFiltersRequestOptions.retryInterval);
      } else {
        // No retry policy filter specified
        operation(postFiltersRequestOptions, nextPostCallback);
      }
    }
  });
};


/**
* Builds the request options to be passed to the http.request method.
* @ignore
* @param {WebResource} webResource The webresource where to build the options from.
* @param {object}      options     The request options.
* @param {function(error, requestOptions)}  callback  The callback function.
*/
StorageServiceClient.prototype._buildRequestOptions = function (webResource, body, options, callback) {
  webResource.withHeader(HeaderConstants.STORAGE_VERSION, this.apiVersion);
  webResource.withHeader(HeaderConstants.MS_DATE, new Date().toUTCString());
  if (!webResource.headers[HeaderConstants.ACCEPT]) {
    webResource.withHeader(HeaderConstants.ACCEPT, 'application/atom+xml,application/xml');
  }
  webResource.withHeader(HeaderConstants.ACCEPT_CHARSET, 'UTF-8');

  // Browsers cache GET/HEAD requests by adding conditional headers such as 'IF_MODIFIED_SINCE' after Azure Storage 'Authorization header' calculation, 
  // which may result in a 403 authorization error. So add timestamp to GET/HEAD request URLs thus avoid the browser cache. 
  if (azureutil.isBrowser() && (
    webResource.method === Constants.HttpConstants.HttpVerbs.GET || 
    webResource.method === Constants.HttpConstants.HttpVerbs.HEAD)) {
    webResource.withQueryOption(HeaderConstants.FORCE_NO_CACHE_IN_BROWSER, new Date().getTime());
  }

  if(azureutil.objectIsNull(options.timeoutIntervalInMs)) {
    options.timeoutIntervalInMs = this.defaultTimeoutIntervalInMs;
  }

  if(azureutil.objectIsNull(options.clientRequestTimeoutInMs)) {
    options.clientRequestTimeoutInMs = this.defaultClientRequestTimeoutInMs;
  }

  if(!azureutil.objectIsNull(options.timeoutIntervalInMs) && options.timeoutIntervalInMs > 0) {
    webResource.withQueryOption(QueryStringConstants.TIMEOUT, Math.ceil(options.timeoutIntervalInMs / 1000));
  }
  
  if(options.accessConditions) {
    webResource.withHeader(HeaderConstants.IF_MATCH, options.accessConditions.EtagMatch);
    webResource.withHeader(HeaderConstants.IF_MODIFIED_SINCE, options.accessConditions.DateModifedSince);
    webResource.withHeader(HeaderConstants.IF_NONE_MATCH, options.accessConditions.EtagNonMatch);
    webResource.withHeader(HeaderConstants.IF_UNMODIFIED_SINCE, options.accessConditions.DateUnModifiedSince);
    webResource.withHeader(HeaderConstants.SEQUENCE_NUMBER_EQUAL, options.accessConditions.SequenceNumberEqual);
    webResource.withHeader(HeaderConstants.SEQUENCE_NUMBER_LESS_THAN, options.accessConditions.SequenceNumberLessThan);
    webResource.withHeader(HeaderConstants.SEQUENCE_NUMBER_LESS_THAN_OR_EQUAL, options.accessConditions.SequenceNumberLessThanOrEqual);
    webResource.withHeader(HeaderConstants.BLOB_CONDITION_MAX_SIZE, options.accessConditions.MaxBlobSize);
    webResource.withHeader(HeaderConstants.BLOB_CONDITION_APPEND_POSITION, options.accessConditions.MaxAppendPosition);
  }

  if(options.sourceAccessConditions) {
    webResource.withHeader(HeaderConstants.SOURCE_IF_MATCH, options.sourceAccessConditions.EtagMatch);
    webResource.withHeader(HeaderConstants.SOURCE_IF_MODIFIED_SINCE, options.sourceAccessConditions.DateModifedSince);
    webResource.withHeader(HeaderConstants.SOURCE_IF_NONE_MATCH, options.sourceAccessConditions.EtagNonMatch);
    webResource.withHeader(HeaderConstants.SOURCE_IF_UNMODIFIED_SINCE, options.sourceAccessConditions.DateUnModifiedSince);
  }
  
  if (!webResource.headers || webResource.headers[HeaderConstants.CONTENT_TYPE] === undefined) {
    // work around to add an empty content type header to prevent the request module from magically adding a content type.
    webResource.headers[HeaderConstants.CONTENT_TYPE] = '';
  } else if (webResource.headers && webResource.headers[HeaderConstants.CONTENT_TYPE] === null) {
    delete webResource.headers[HeaderConstants.CONTENT_TYPE];
  }

  if (!webResource.headers || webResource.headers[HeaderConstants.CONTENT_LENGTH] === undefined) {
    if (body && body.outputData) {
      webResource.withHeader(HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(body.outputData, 'UTF8'));
    } else if (webResource.headers[HeaderConstants.CONTENT_LENGTH] === undefined) {
      webResource.withHeader(HeaderConstants.CONTENT_LENGTH, 0);
    }
  } else if (webResource.headers && webResource.headers[HeaderConstants.CONTENT_LENGTH] === null) {
    delete webResource.headers[HeaderConstants.CONTENT_LENGTH];
  }

  // Sets the request url in the web resource.
  this._setRequestUrl(webResource, options);

  this.emit('sendingRequestEvent', webResource);

  // Now that the web request is finalized, sign it
  this.storageCredentials.signRequest(webResource, function (error) {
    var requestOptions = null;

    if (!error) {
      var targetUrl = webResource.uri;

      requestOptions = {
        uri: url.format(targetUrl),
        method: webResource.method,
        headers: webResource.headers,
        mode: 'disable-fetch'
      };

      if (options) {
        //set encoding of response data. If set to null, the body is returned as a Buffer
        requestOptions.encoding = options.responseEncoding;
      }
      
      if (options && options.clientRequestTimeoutInMs) {
        requestOptions.timeout = options.clientRequestTimeoutInMs;
      } else {
        requestOptions.timeout = Constants.DEFAULT_CLIENT_REQUEST_TIMEOUT_IN_MS; // 2 minutes
      }

      requestOptions.forever = true;
    }

    callback(error, requestOptions);
  });
};

/**
* Process the response.
* @ignore
*
* @param {WebResource} webResource                The web resource that made the request.
* @param {Response}    response                   The response object.
* @param {Options}     options                    The response parsing options.
* @param {String}      options.payloadFormat      The payload format.
* @return The normalized responseObject.
*/
StorageServiceClient.prototype._processResponse = function (webResource, response, options) {
  var self = this;

  function convertRawHeadersToHeaders(rawHeaders) {
    var headers = {};
    if(!rawHeaders) {
      return undefined;
    }

    for(var i = 0; i < rawHeaders.length; i++) {
      var headerName;
      if (rawHeaders[i].indexOf(HeaderConstants.PREFIX_FOR_STORAGE_METADATA) === 0) {
        headerName = rawHeaders[i];
      } else {
        headerName = rawHeaders[i].toLowerCase();
      }
      headers[headerName] = rawHeaders[++i];
    }

    return headers;
  }

  var validResponse = WebResource.validResponse(response.statusCode);
  var rsp = StorageServiceClient._buildResponse(validResponse, response.body, convertRawHeadersToHeaders(response.rawHeaders) || response.headers, response.statusCode, response.md5);
  var responseObject;

  if (validResponse && webResource.rawResponse) {
    responseObject = { error: null, response: rsp };
  } else {
    // attempt to parse the response body, errors will be returned in rsp.error without modifying the body
    rsp = StorageServiceClient._parseResponse(rsp, self.xml2jsSettings, options);

    if (validResponse && !rsp.error) {
        responseObject = { error: null, response: rsp };
    } else {
      rsp.isSuccessful = false;

      if (response.statusCode < 400 || response.statusCode >= 500) {
        this.logger.log(Logger.LogLevels.DEBUG,
            'ERROR code = ' + response.statusCode + ' :\n' + util.inspect(rsp.body));
      }

      // responseObject.error should contain normalized parser errors if they occured in _parseResponse
      // responseObject.response.body should contain the raw response body in that case
      var errorBody = rsp.body;
      if(rsp.error) {
        errorBody = rsp.error;
        delete rsp.error;
      }

      if (!errorBody) {
        var code = Object.keys(HttpResponseCodes).filter(function (name) {
          if (HttpResponseCodes[name] === rsp.statusCode) {
            return name;
          }
        });

        errorBody = { error: { code: code[0] } };
      }

      var normalizedError = StorageServiceClient._normalizeError(errorBody, response);
      responseObject = { error: normalizedError, response: rsp };
    }
  }

  this.logger.log(Logger.LogLevels.DEBUG, 'RESPONSE:\n' + util.inspect(responseObject));

  return responseObject;
};

/**
* Associate a filtering operation with this StorageServiceClient. Filtering operations
* can include logging, automatically retrying, etc. Filter operations are objects
* that implement a method with the signature:
*
*     "function handle (requestOptions, next)".
*
* After doing its preprocessing on the request options, the method needs to call
* "next" passing a callback with the following signature:
* signature:
*
*     "function (returnObject, finalCallback, next)"
*
* In this callback, and after processing the returnObject (the response from the
* request to the server), the callback needs to either invoke next if it exists to
* continue processing other filters or simply invoke finalCallback otherwise to end
* up the service invocation.
*
* @param {Object} filter The new filter object.
* @return {StorageServiceClient} A new service client with the filter applied.
*/
StorageServiceClient.prototype.withFilter = function (newFilter) {
    // Create a new object with the same members as the current service
    var derived = _.clone(this);

    // If the current service has a filter, merge it with the new filter
    // (allowing us to effectively pipeline a series of filters)
    var parentFilter = this.filter;
    var mergedFilter = newFilter;
    if (parentFilter !== undefined) {
      // The parentFilterNext is either the operation or the nextPipe function generated on a previous merge
      // Ordering is [f3 pre] -> [f2 pre] -> [f1 pre] -> operation -> [f1 post] -> [f2 post] -> [f3 post]
      mergedFilter = function (originalRequestOptions, parentFilterNext) {
        newFilter.handle(originalRequestOptions, function (postRequestOptions, newFilterCallback) {
          // handle parent filter pre and get Parent filter post
          var next = function (postPostRequestOptions, parentFilterCallback) {
            // The parentFilterNext is the filter next to the merged filter.
            // For 2 filters, that'd be the actual operation.
            parentFilterNext(postPostRequestOptions, function (responseObject, responseCallback, finalCallback) {
              parentFilterCallback(responseObject, finalCallback, function (postResponseObject) {
                newFilterCallback(postResponseObject, responseCallback, finalCallback);
              });
            });
          };

          parentFilter(postRequestOptions, next);
        });
      };
    }

    // Store the filter so it can be applied in performRequest
    derived.filter = mergedFilter;
    return derived;
  };

/*
* Builds a response object with normalized key names.
* @ignore
*
* @param {Bool}     isSuccessful    Boolean value indicating if the request was successful
* @param {Object}   body            The response body.
* @param {Object}   headers         The response headers.
* @param {int}      statusCode      The response status code.
* @param {string}   md5             The response's content md5 hash.
* @return {Object} A response object.
*/
StorageServiceClient._buildResponse = function (isSuccessful, body, headers, statusCode, md5) {
  var response = {
    isSuccessful: isSuccessful,
    statusCode: statusCode,
    body: body,
    headers: headers,
    md5: md5
  };

  if (!azureutil.objectIsNull(headers)) {
    if (headers[HeaderConstants.REQUEST_SERVER_ENCRYPTED] !== undefined) {
      response.requestServerEncrypted = (headers[HeaderConstants.REQUEST_SERVER_ENCRYPTED] === 'true');
    }
  }

  return response;
};

/**
* Parses a server response body from XML or JSON into a JS object.
* This is done using the xml2js library.
* @ignore
*
* @param {object}     response                   The response object with a property "body" with a XML or JSON string content.
* @param {object}     xml2jsSettings             The XML to json settings.
* @param {Options}    options                    The response parsing options.
* @param {String}     options.payloadFormat      The payload format.
* @return {object} The same response object with the body part as a JS object instead of a XML or JSON string.
*/
StorageServiceClient._parseResponse = function (response, xml2jsSettings, options) {
  function parseXml(body) {
    var parsed;
    var parser = new xml2js.Parser(xml2jsSettings);
    parser.parseString(azureutil.removeBOM(body.toString()), function (err, parsedBody) {
      if (err) {
        var xmlError = new SyntaxError('EXMLFORMAT');
        xmlError.innerError = err;
        throw xmlError;
      } else { parsed = parsedBody; }
    });

    return parsed;
  }

  if (response.body && Buffer.byteLength(response.body.toString()) > 0) {
    var contentType = '';
    if (response.headers && response.headers['content-type']) {
      contentType = response.headers['content-type'].toLowerCase();
    }

    try {
      if (contentType.indexOf('application/json') !== -1) {
        if (options && options.payloadFormat && options.payloadFormat !== TableUtilities.PayloadFormat.NO_METADATA) {
          var parser = new Parser();
          parser.onValue = function (value) {
            response.body = value;
          };
          parser.write(response.body);
        } else {
          response.body = JSON.parse(response.body);
        }
      } else if (contentType.indexOf('application/xml') !== -1 || contentType.indexOf('application/atom+xml') !== -1) {
        response.body = parseXml(response.body);
      } else if (contentType.indexOf('text/html') !== -1) {
        response.body = response.body;
      } else {
        response.body = parseXml(response.body);
        // throw new SyntaxError(SR.CONTENT_TYPE_MISSING, null);
      }
    } catch (e) {
      response.error = e;
    }
  }

  return response;
};

/**
* Gets the storage settings.
*
* @param {string} [storageAccountOrConnectionString]  The storage account or the connection string.
* @param {string} [storageAccessKey]                  The storage access key.
* @param {string} [host]                              The host address.
* @param {object} [sasToken]                          The sas token.
*
* @return {StorageServiceSettings}
*/
StorageServiceClient.getStorageSettings = function (storageAccountOrConnectionString, storageAccessKey, host, sasToken, endpointSuffix) {
  var storageServiceSettings;
  if (storageAccountOrConnectionString && !storageAccessKey && !sasToken) {
    // If storageAccountOrConnectionString was passed and no accessKey was passed, assume connection string
    storageServiceSettings = StorageServiceSettings.createFromConnectionString(storageAccountOrConnectionString);
  } else if ((storageAccountOrConnectionString && storageAccessKey) || sasToken || host) {
    // Account and key or credentials or anonymous
    storageServiceSettings = StorageServiceSettings.createExplicitly(storageAccountOrConnectionString, storageAccessKey, host, sasToken, endpointSuffix);
  } else {
    // Use environment variables
    storageServiceSettings = StorageServiceSettings.createFromEnvironment();
  }

  return storageServiceSettings;
};

/**
* Sets the webResource's requestUrl based on the service client settings.
* @ignore
*
* @param {WebResource} webResource The web resource where to set the request url.
*/
StorageServiceClient.prototype._setRequestUrl = function (webResource, options) {
  // Normalize the path
  // Backup the original path of the webResource to make sure it works fine even this function get executed multiple times - like RetryFilter
  webResource.originalPath = webResource.originalPath || webResource.path;
  webResource.path = this._getPath(webResource.originalPath);

  if(!this.host){
    throw new ArgumentNullError('this.host', SR.STORAGE_HOST_LOCATION_REQUIRED);
  }

  var host = this.host.primaryHost;

  if(!azureutil.objectIsNull(options) && options.currentLocation === Constants.StorageLocation.SECONDARY) {
    host = this.host.secondaryHost;
  }

  if(host && host.lastIndexOf('/') !== (host.length - 1)){
    host = host + '/';
  }
  
  var fullPath = url.format({pathname: webResource.path, query: webResource.queryString});
  webResource.uri = url.resolve(host, fullPath);
  webResource.path = url.parse(webResource.uri).pathname;
};

/**
* Retrieves the normalized path to be used in a request.
* It also removes any leading "/" of the path in case
* it's there before.
* @ignore
* @param {string} path The path to be normalized.
* @return {string} The normalized path.
*/
StorageServiceClient.prototype._getPath = function (path) {
  if (path === null || path === undefined) {
    path = '';
  } else if (path.indexOf('/') === 0) {
    path = path.substring(1);
  }

  return path;
};

/**
 * Get the url of a given path
 */
StorageServiceClient.prototype._getUrl = function (path, sasToken, primary) {
  var host;
  if (!azureutil.objectIsNull(primary) && primary === false) {
    host = this.host.secondaryHost;
  } else {
    host = this.host.primaryHost;
  }

  host = azureutil.trimPortFromUri(host);
  if(host && host.lastIndexOf('/') !== (host.length - 1)){
    host = host + '/';
  }

  var query = qs.parse(sasToken);
  var fullPath = url.format({ pathname: this._getPath(path), query: query });
  return url.resolve(host, fullPath);
};

/**
* Initializes the default filter.
* This filter is responsible for chaining the pre filters request into the operation and, after processing the response,
* pass it to the post processing filters. This method should only be invoked by the StorageServiceClient constructor.
* @ignore
*
*/
StorageServiceClient.prototype._initDefaultFilter = function () {
  this.filter = function (requestOptions, nextPreCallback) {
    if (nextPreCallback) {
      // Handle the next pre callback and pass the function to be handled as post call back.
      nextPreCallback(requestOptions, function (returnObject, finalCallback, nextPostCallback) {
        if (nextPostCallback) {
          nextPostCallback(returnObject);
        } else if (finalCallback) {
          finalCallback(returnObject);
        }
      });
    }
  };
};

/**
* Retrieves the metadata headers from the response headers.
* @ignore
*
* @param {object} headers The metadata headers.
* @return {object} An object with the metadata headers (without the "x-ms-" prefix).
*/
StorageServiceClient.prototype.parseMetadataHeaders = function (headers) {
  var metadata = {};

  if (!headers) {
    return metadata;
  }

  for (var header in headers) {
    if (header.indexOf(HeaderConstants.PREFIX_FOR_STORAGE_METADATA) === 0) {
      var key = header.substr(HeaderConstants.PREFIX_FOR_STORAGE_METADATA.length, header.length - HeaderConstants.PREFIX_FOR_STORAGE_METADATA.length);
      metadata[key] = headers[header];
    }
  }
  
  return metadata;
};

/**
* Gets the properties of a storage account’s service, including Azure Storage Analytics.
* @ignore
*
* @this {StorageServiceClient}
* @param {object}       [options]                               The request options.
* @param {LocationMode} [options.locationMode]                  Specifies the location mode used to decide which location the request should be sent to. 
*                                                               Please see StorageUtilities.LocationMode for the possible values.
* @param {int}          [options.timeoutIntervalInMs]           The server timeout interval, in milliseconds, to use for the request.
* @param {int}          [options.clientRequestTimeoutInMs]      The timeout of client requests, in milliseconds, to use for the request.
* @param {int}          [options.maximumExecutionTimeInMs]      The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                               The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                               execution time is checked intermittently while performing requests, and before executing retries.
* @param {bool}         [options.useNagleAlgorithm]             Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                               The default value is false.
* @param {errorOrResult}  callback                              `error` will contain information if an error occurs; otherwise, `result` will contain the properties 
*                                                               and `response` will contain information related to this operation.
*/
StorageServiceClient.prototype.getAccountServiceProperties = function (optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('getServiceProperties', function (v) {
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  
  var webResource = WebResource.get()
    .withQueryOption(QueryStringConstants.COMP, 'properties')
    .withQueryOption(QueryStringConstants.RESTYPE, 'service');
  
  options.requestLocationMode = RequestLocationMode.PRIMARY_OR_SECONDARY;
  
  var processResponseCallback = function (responseObject, next) {
    responseObject.servicePropertiesResult = null;
    if (!responseObject.error) {
      responseObject.servicePropertiesResult = ServicePropertiesResult.parse(responseObject.response.body.StorageServiceProperties);
    }
    
    // function to be called after all filters
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.servicePropertiesResult, returnObject.response);
    };
    
    // call the first filter
    next(responseObject, finalCallback);
  };
  
  this.performRequest(webResource, null, options, processResponseCallback);
};

/**
* Sets the properties of a storage account’s service, including Azure Storage Analytics.
* You can also use this operation to set the default request version for all incoming requests that do not have a version specified.
*
* @this {StorageServiceClient}
* @param {object}             serviceProperties                        The service properties.
* @param {object}             [options]                                The request options.
* @param {LocationMode}       [options.locationMode]                   Specifies the location mode used to decide which location the request should be sent to. 
*                                                                      Please see StorageUtilities.LocationMode for the possible values.
* @param {int}                [options.timeoutIntervalInMs]            The server timeout interval, in milliseconds, to use for the request.
* @param {int}                [options.clientRequestTimeoutInMs]       The timeout of client requests, in milliseconds, to use for the request.
* @param {int}                [options.maximumExecutionTimeInMs]       The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
*                                                                      The maximum execution time interval begins at the time that the client begins building the request. The maximum
*                                                                      execution time is checked intermittently while performing requests, and before executing retries.
* @param {bool}               [options.useNagleAlgorithm]              Determines whether the Nagle algorithm is used; true to use the Nagle algorithm; otherwise, false.
*                                                                      The default value is false.
* @param {errorOrResponse}    callback                                 `error` will contain information
*                                                                      if an error occurs; otherwise, `response`
*                                                                      will contain information related to this operation.
*/
StorageServiceClient.prototype.setAccountServiceProperties = function (serviceProperties, optionsOrCallback, callback) {
  var userOptions;
  azureutil.normalizeArgs(optionsOrCallback, callback, function (o, c) { userOptions = o; callback = c; });
  
  validate.validateArgs('setServiceProperties', function (v) {
    v.object(serviceProperties, 'serviceProperties');
    v.callback(callback);
  });
  
  var options = extend(true, {}, userOptions);
  var servicePropertiesXml = ServicePropertiesResult.serialize(serviceProperties);
  
  var webResource = WebResource.put()
    .withQueryOption(QueryStringConstants.COMP, 'properties')
    .withQueryOption(QueryStringConstants.RESTYPE, 'service')
    .withHeader(HeaderConstants.CONTENT_TYPE, 'application/xml;charset="utf-8"')
    .withHeader(HeaderConstants.CONTENT_LENGTH, Buffer.byteLength(servicePropertiesXml))
    .withBody(servicePropertiesXml);
  
  var processResponseCallback = function (responseObject, next) {
    var finalCallback = function (returnObject) {
      callback(returnObject.error, returnObject.response);
    };
    
    next(responseObject, finalCallback);
  };
  
  this.performRequest(webResource, webResource.body, options, processResponseCallback);
};

// Other functions

/**
* Processes the error body into a normalized error object with all the properties lowercased.
*
* Error information may be returned by a service call with additional debugging information:
* http://msdn.microsoft.com/en-us/library/windowsazure/dd179382.aspx
*
* Table services returns these properties lowercased, example, "code" instead of "Code". So that the user
* can always expect the same format, this method lower cases everything.
*
* @ignore
*
* @param {Object} error The error object as returned by the service and parsed to JSON by the xml2json.
* @return {Object} The normalized error object with all properties lower cased.
*/
StorageServiceClient._normalizeError = function (error, response) {
  if (azureutil.objectIsString(error)) {
    return new StorageError(error, null);
  } else if (error) {
    var normalizedError = {};

    // blob/queue errors should have error.Error, table errors should have error['odata.error']
    var errorProperties = error.Error || error.error || error['odata.error'] || error['m:error'] || error;
    normalizedError.code = errorProperties.message; // The message exists when there is error.Error.
    
    for (var property in errorProperties) {
      if (errorProperties.hasOwnProperty(property)) {
        var key = property.toLowerCase();
        if(key.indexOf('m:') === 0) {
          key = key.substring(2);
        }
        
        normalizedError[key] = errorProperties[property];

        // if this is a table error, message is an object - flatten it to normalize with blob/queue errors
        // ex: "message":{"lang":"en-US","value":"The specified resource does not exist."} becomes message: "The specified resource does not exist."
        if (key === 'message' && _.isObject(errorProperties[property])) {
          if (errorProperties[property]['value']) {
            normalizedError[key] = errorProperties[property]['value'];
          }
        }
      }
    }

    // add status code and server request id if available
    if (response) {
      if (response.statusCode) {
        normalizedError.statusCode = response.statusCode;
      }

      if (response.headers && response.headers['x-ms-request-id']) {
        normalizedError.requestId = response.headers['x-ms-request-id'];
      }
    }

    var errorObject = new StorageError(normalizedError.code, normalizedError);
    return errorObject;
  }

  return null;
};

/**
* Sets proxy object specified by caller.
*
* @param {object}   proxy       proxy to use for tunneling
*                               {
*                                host: hostname
*                                port: port number
*                                proxyAuth: 'user:password' for basic auth
*                                headers: {...} headers for proxy server
*                                key: key for proxy server
*                                ca: ca for proxy server
*                                cert: cert for proxy server
*                               }
*                               if null or undefined, clears proxy
*/
StorageServiceClient.prototype.setProxy = function (proxy) {
  if (proxy) {
    this.proxy = proxy;
  } else {
    this.proxy = null;
  }
};

/**
* Sets the service host default proxy from the environment.
* Can be overridden by calling _setProxyUrl or _setProxy
*
*/
StorageServiceClient.prototype._setDefaultProxy = function () {
  var proxyUrl = StorageServiceClient._loadEnvironmentProxyValue();
  if (proxyUrl) {
    var parsedUrl = url.parse(proxyUrl);
    if (!parsedUrl.port) {
      parsedUrl.port = 80;
    }
    this.setProxy(parsedUrl);
  } else {
    this.setProxy(null);
  }
};

/*
* Loads the fields "useProxy" and respective protocol, port and url
* from the environment values HTTPS_PROXY and HTTP_PROXY
* in case those are set.
* @ignore
*
* @return {string} or null
*/
StorageServiceClient._loadEnvironmentProxyValue = function () {
  var proxyUrl = null;
  if (process.env[StorageServiceClientConstants.EnvironmentVariables.HTTPS_PROXY]) {
    proxyUrl = process.env[StorageServiceClientConstants.EnvironmentVariables.HTTPS_PROXY];
  } else if (process.env[StorageServiceClientConstants.EnvironmentVariables.HTTPS_PROXY.toLowerCase()]) {
    proxyUrl = process.env[StorageServiceClientConstants.EnvironmentVariables.HTTPS_PROXY.toLowerCase()];
  } else if (process.env[StorageServiceClientConstants.EnvironmentVariables.HTTP_PROXY]) {
    proxyUrl = process.env[StorageServiceClientConstants.EnvironmentVariables.HTTP_PROXY];
  } else if (process.env[StorageServiceClientConstants.EnvironmentVariables.HTTP_PROXY.toLowerCase()]) {
    proxyUrl = process.env[StorageServiceClientConstants.EnvironmentVariables.HTTP_PROXY.toLowerCase()];
  }

  return proxyUrl;
};

/**
* Initializes the location to which the operation is being sent to.
*/
StorageServiceClient.prototype._initializeLocation = function (options) {
  if(!azureutil.objectIsNull(options.locationMode)) {
    switch(options.locationMode) {
    case StorageUtilities.LocationMode.PRIMARY_ONLY:
    case StorageUtilities.LocationMode.PRIMARY_THEN_SECONDARY:
      options.currentLocation = Constants.StorageLocation.PRIMARY;
      break;
    case StorageUtilities.LocationMode.SECONDARY_ONLY:
    case StorageUtilities.LocationMode.SECONDARY_THEN_PRIMARY:
      options.currentLocation = Constants.StorageLocation.SECONDARY;
      break;
    default:
      throw new RangeError(util.format(SR.ARGUMENT_OUT_OF_RANGE_ERROR, 'locationMode', options.locationMode));
    }
  } else {
    options.locationMode = StorageUtilities.LocationMode.PRIMARY_ONLY;
    options.currentLocation = Constants.StorageLocation.PRIMARY;
  }
};

/**
* Validates the location to which the operation is being sent to.
*/
StorageServiceClient.prototype._validateLocation = function (options) {
  if(this._invalidLocationMode(options.locationMode)) {
    throw new ArgumentNullError('host', SR.STORAGE_HOST_MISSING_LOCATION);
  }

  switch(options.requestLocationMode) {
  case Constants.RequestLocationMode.PRIMARY_ONLY:
    if(options.locationMode === StorageUtilities.LocationMode.SECONDARY_ONLY) {
      throw new ArgumentError('host.primaryHost', SR.PRIMARY_ONLY_COMMAND);
    }

    options.currentLocation = Constants.StorageLocation.PRIMARY;
    options.locationMode = StorageUtilities.LocationMode.PRIMARY_ONLY;
    break;

  case Constants.RequestLocationMode.SECONDARY_ONLY:
    if(options.locationMode === StorageUtilities.LocationMode.PRIMARY_ONLY) {
      throw new ArgumentError('host.secondaryHost', SR.SECONDARY_ONLY_COMMAND);
    }

    options.currentLocation = Constants.StorageLocation.SECONDARY;
    options.locationMode = StorageUtilities.LocationMode.SECONDARY_ONLY;
    break;

  default:
   // no op
  }
};

/**
* Checks whether we have the relevant host information based on the locationMode.
*/
StorageServiceClient.prototype._invalidLocationMode = function (locationMode) {
  switch(locationMode) {
  case StorageUtilities.LocationMode.PRIMARY_ONLY:
    return azureutil.objectIsNull(this.host.primaryHost);
  case StorageUtilities.LocationMode.SECONDARY_ONLY:
    return azureutil.objectIsNull(this.host.secondaryHost);
  default:
    return (azureutil.objectIsNull(this.host.primaryHost) || azureutil.objectIsNull(this.host.secondaryHost));
  }
};

/**
* Checks to see if the maximum execution timeout provided has been exceeded.
*/
StorageServiceClient.prototype._maximumExecutionTimeExceeded = function (currentTime, expiryTime) {
  if(!azureutil.objectIsNull(expiryTime) && currentTime > expiryTime) {
    return true;
  } else {
    return false;
  }
};

/**
* Sets the operation expiry time.
*/
StorageServiceClient.prototype._setOperationExpiryTime = function (options) {
  if(azureutil.objectIsNull(options.operationExpiryTime)) {
    if(!azureutil.objectIsNull(options.maximumExecutionTimeInMs)) {
      options.operationExpiryTime = Date.now() + options.maximumExecutionTimeInMs;
    } else if(this.defaultMaximumExecutionTimeInMs) {
      options.operationExpiryTime = Date.now() + this.defaultMaximumExecutionTimeInMs;
    }
  }
};

module.exports = StorageServiceClient;
