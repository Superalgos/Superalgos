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

var azureCommon = require('../common.browser');
var Duplex = require('stream').Duplex;
var extend = require('extend');
var http = require('http');
var https = require('https');
var url = require('url');
var util = require('util');

/**
* Creates a new Request object.
*
* @constructor
* @param {object} options    The options for a Request object.
* @param {function} callback Callback
*/
function Request(options, callback) {
    Duplex.call(this);

    this._init(options, callback);
    this._send();
}

util.inherits(Request, Duplex);

Request.prototype._init = function (options, callback) {
    this.callback = callback;

    var nonReservedProperties = azureCommon.util.filterOutNonReservedProperties(this, options);
    extend(this, nonReservedProperties);

    this.agent = this.agent || false;
    this.timeout = this.timeout || Math.pow(2, 32) * 1000;

    this._initUri();
    this._initHeaders();
};

Request.prototype._initUri = function () {
    if (!this.uri) {
        return this.emit('error', new Error('options.uri is a required argument'));
    }

    if (typeof this.uri === 'string') {
        this.uri = url.parse(this.uri);
    }

    if (!this.uri.href) {
        this.uri.href = url.format(this.uri);
    }
};

Request.prototype._initHeaders = function () {
    this.headers = this.headers || {};
    this.headers['content-length'] = this.headers['content-length'] || 0;
};

Request.prototype._send = function () {
    this._sent = true;

    var protocol = this.uri.protocol || '';
    var iface = (protocol === 'https:' ? https : http);

    var options = {
        scheme: protocol.replace(/:$/, ''),
        method: this.method,
        host: this.uri.hostname,
        port: Number(this.uri.port) || (protocol === 'https:' ? 443 : 80),
        path: this.uri.path,
        agent: this.agent,
        headers: this.headers,
        withCredentials: this.withCredentials,
        localAddress: this.localAddress,
        mode: this.mode
    };

    if (protocol === 'https:') {
        options.pfx = this.pfx;
        options.key = this.key;
        options.cert = this.cert;
        options.ca = this.ca;
        options.ciphers = this.ciphers;
        options.rejectUnauthorized = this.rejectUnauthorized;
        options.secureProtocol = this.secureProtocol;
    }

    var httpRequest = iface.request(options);
    if (this.timeout && httpRequest.setTimeout) {
        httpRequest.setTimeout(this.timeout);
    }

    this.httpRequest = httpRequest;
    this.emit('request', httpRequest);

    this._sendBody();
    this._listenHttpResponse();
    this._listenHttpError();

    return httpRequest;
};

Request.prototype._sendBody = function () {
    if (this.body) {
        this.httpRequest.write(this.body);
        this.httpRequest.end();
        return;
    }

    if (this.headers['content-length'] == '0') {
        this.httpRequest.end();
        return;
    }
};

Request.prototype._listenHttpError = function() {
    var self = this;

    self.httpRequest.on('error', function(error) {
        self.emit('error', error);
    });

    self.on('error', function(error) {
        if (self.callback) {
            self.callback(error);
        }
    });
};

Request.prototype._listenHttpResponse = function () {
    var self = this;

    self.httpRequest.on('response', function (response) {
        var buffers = [];
        var bufferLength = 0;

        self.response = response;

        response.on('data', function (chunk) {
            self.push(chunk);
            buffers.push(chunk);
            bufferLength += chunk.length;
        });

        response.on('error', function (error) {
            self.emit('error', error);
        });

        response.on('end', function () {
            self.push(null);

            response.body = '';
            if (bufferLength > 0) {
                response.body = Buffer.concat(buffers, bufferLength);
            }

            if (self.encoding !== null) {
                response.body = response.body.toString(self.encoding);
            }

            if (self.callback) {
                self.callback(null, response);
            }
        });

        self.emit('response', response);
    });
};

/**
* Set a Request header.
*
* @param {string} key The user provided header key.
* @param {string} value The valid header value.
*/
Request.prototype.setHeader = function (key, value) {
    if (this._sent) {
        throw new Error('Request already sent');
    }

    this.headers[key] = value;
    return this;
};

/**
* Set a Request URI.
*
* @param {string} uri The user provided uri.
*/
Request.prototype.setLocation = function (uri) {
    this.uri = uri;
    return this;
};

Request.prototype.end = function (chunk) {
    if (chunk) {
        this.httpRequest.write(chunk);
    }

    this.httpRequest.end();
};

Request.prototype._write = function (chunk, encoding, callback) {
    this.httpRequest.write(chunk);
    callback();
};

Request.prototype._read = function () {
};

/**
* Create a Request object
* @ignore
*
* @param {object} options Options
* @param {function} callback Callback
* @return {Request} The created request object.
*/
function req(optionsOrCallback, callback) {
    var reqDefaults = req.defaults();
    return reqDefaults(optionsOrCallback, callback);
}

/**
* Create a Request creator with default options
* @ignore
*
* @param {object} defaultOptions Default options
* @return {function}
*/
req.defaults = function (defaultOptions) {
    return function (optionsOrCallback, callback) {
        var options;
        azureCommon.util.normalizeArgs(optionsOrCallback, callback, function (o, c) { options = o; callback = c; });

        var nonReservedProperties = azureCommon.util.filterOutNonReservedProperties(options, defaultOptions);
        extend(options, nonReservedProperties);

        var request = new Request(options, callback);
        return request;
    };
};

module.exports = req;