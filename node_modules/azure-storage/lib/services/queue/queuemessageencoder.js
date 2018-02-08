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

var util = require('util');

/**
 * The interface for classes that represent a encoder which can be used to specify how the queue service encodes and decodes queue messages.
 * 
 * To specify how the queue service encodes and decodes queue messages, set `queueService.messageEncoder` to object of built-in encoder types
 * `[TextBase64QueueMessageEncoder]{@link TextBase64QueueMessageEncoder}`, `[BinaryBase64QueueMessageEncoder]{@link BinaryBase64QueueMessageEncoder}`, `[TextXmlQueueMessageEncoder]{@link TextXmlQueueMessageEncoder}`,
 * or custom implementation of the QueueMessageEncoder.
 * 
 * @class
 */
function QueueMessageEncoder() {
}

/**
 * Function to encode queue messages.
 * 
 * @param   {object}    [input]               The target to be encoded.
 * @return  {string}
 */
QueueMessageEncoder.prototype.encode = function(input){
  return input;
};

/**
 * Function to decode queue messages
 * 
 * @param   {string}    [textToBeDecoded]     The base64 string to be decoded.
 * @returns {any}
 */
QueueMessageEncoder.prototype.decode = function(textToBeDecoded){
  return textToBeDecoded;
};


/**
 * Create a new TextBase64QueueMessageEncoder object
 * @class
 * 
 * Encode from utf-8 string to base64 string
 * Decode from base64 string to utf-8 string.
 * 
 * @constructor
 * @extends {QueueMessageEncoder}
 */
function TextBase64QueueMessageEncoder(){
}
util.inherits(TextBase64QueueMessageEncoder, QueueMessageEncoder);

/**
 * Encode from utf-8 string to base64 string
 * @this TextBase64QueueMessageEncoder
 * 
 * @param   {string}    [input]               The target to be encoded.
 * 
 * @return {string}
 */
TextBase64QueueMessageEncoder.prototype.encode = function(input){
  return new Buffer(input, 'utf8').toString('base64');
};

/**
 * Decode from base64 string to utf-8 string.
 * @this TextBase64QueueMessageEncoder
 * 
 * @param   {string}    [textToBeDecoded]     The base64 string to be decoded.
 * 
 * @return {string}
 */
TextBase64QueueMessageEncoder.prototype.decode = function(textToDecode){
  return new Buffer(textToDecode, 'base64').toString('utf8');
};


/**
 * Create a new BinaryBase64QueueMessageEncoder object
 * @class
 * 
 * Encode from binary buffer to base64 string
 * Decode from base64 string to binary buffer.
 * 
 * @constructor
 * @extends {QueueMessageEncoder}
 */
function BinaryBase64QueueMessageEncoder(){
}
util.inherits(BinaryBase64QueueMessageEncoder, QueueMessageEncoder);

/**
 * Encode from binary buffer string to base64 string
 * @this BinaryBase64QueueMessageEncoder
 * 
 * @param   {Buffer}    [input]               The target to be encoded.
 * 
 * @return {string}
 */
BinaryBase64QueueMessageEncoder.prototype.encode = function(input){
  return input.toString('base64');
};


/**
 * Decode from base64 string to binary buffer.
 * @this BinaryBase64QueueMessageEncoder
 * 
 * @param   {string}    [textToBeDecoded]     The base64 string to be decoded.
 * 
 * @return {Buffer}
 */
BinaryBase64QueueMessageEncoder.prototype.decode = function(textToDecode){
  return new Buffer(textToDecode, 'base64');
};


/**
 * Create a new TextXmlQueueMessageEncoder object
 * @class
 * 
 * Encode utf-8 string by escaping the xml markup characters.
 * Decode from utf-8 string by unescaping the xml markup characters.
 * 
 * @constructor
 * @extends {QueueMessageEncoder}
 */
function TextXmlQueueMessageEncoder(){
}
util.inherits(TextXmlQueueMessageEncoder, QueueMessageEncoder);

/**
 * Encode utf-8 string by escaping the xml markup characters.
 * @this TextXmlQueueMessageEncoder
 * 
 * @param   {string}    [input]               The target to be encoded.
 * 
 * @return {string}
 */
TextXmlQueueMessageEncoder.prototype.encode = function(input){
  return input.replace(/&/gm, '&amp;')
    .replace(/</gm, '&lt;')
    .replace(/>/gm, '&gt;')
    .replace(/"/gm, '&quot;')
    .replace(/'/gm, '&apos;');
};

/**
 * Decode from utf-8 string by unescaping the xml markup characters.
 * @this TextXmlQueueMessageEncoder
 * 
 * @param   {string}    [textToBeDecoded]     The base64 string to be decoded.
 * 
 * @return {string}
 */
TextXmlQueueMessageEncoder.prototype.decode = function(textToDecode){
  return textToDecode.replace(/&amp;/gm, '&')
    .replace(/&lt;/gm, '<')
    .replace(/&gt;/gm, '>')
    .replace(/&quot;/gm, '"')
    .replace(/&apos;/gm, '\'');
};

module.exports = QueueMessageEncoder;
module.exports.TextBase64QueueMessageEncoder = TextBase64QueueMessageEncoder;
module.exports.BinaryBase64QueueMessageEncoder = BinaryBase64QueueMessageEncoder;
module.exports.TextXmlQueueMessageEncoder = TextXmlQueueMessageEncoder;