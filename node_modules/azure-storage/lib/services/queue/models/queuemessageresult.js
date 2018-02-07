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
var xmlbuilder = azureCommon.xmlbuilder;
var Constants = azureCommon.Constants;

var HeaderConstants = Constants.HeaderConstants;

/**
* Creates a new QueueMessageResult object.
* @class
* The QueueMessageResult class is used to store the queue message information.
* 
* @property   {string}                      queue                           The queue name.
* @property   {string}                      messageId                       The message id.
* @property   {string}                      popReceipt                      The pop receipt.
* @property   {string}                      messageText                     The message text.
* @property   {string}                      timeNextVisible                 The time next visible.
* @property   {string}                      insertionTime                   The insertion time.
* @property   {string}                      expirationTime                  The expiration time.
* @property   {number}                      dequeueCount                    The dequeue count.
 * 
* @constructor
* @param {string} [queue]                   The queue name.
* @param {string} [messageId]               The message id.
* @param {string} [popReceipt]              The pop receipt.
*/
function QueueMessageResult(queue, messageId, popReceipt) {
  if (queue) {
    this.queue = queue;
  }

  if (messageId) {
    this.messageId = messageId;
  }

  if (popReceipt) {
    this.popReceipt = popReceipt;
  }
}

/**
* Builds an XML representation for a queue message
*
* @param  {string}  messageJs    The queue message.
* @param  {QueueMessageEncoder}  The message encoder.
* @return {string} The XML queue message.
*/
QueueMessageResult.serialize = function (messageJs, encoder) {
  var doc = xmlbuilder.create();
  doc = doc.begin(Constants.QueueConstants.QUEUE_MESSAGE_ELEMENT, { version: '1.0', encoding: 'utf-8' });

  if (messageJs) {
    var message;
    if (encoder !== null && encoder !== undefined) {
      message = encoder.encode(messageJs);
    } else {
      message = messageJs;
    }
    
    doc.ele(Constants.QueueConstants.MESSAGE_TEXT_ELEMENT)
        .txt(message)
      .up();
  } else {
    doc.ele(Constants.QueueConstants.MESSAGE_TEXT_ELEMENT).up();
  }

  return doc.doc().toString();
};


/**
* Pase the XML representation of a queue message to a QueueMessageResult object.
*
* @param  {Object}  messageXml   The XML representation of the queue message.
* @param  {QueueMessageEncoder}  The message encoder.
* @return {QueueMessageResult}   The QueueMessageResult object.
*/
QueueMessageResult.parse = function (messageXml, encoder) {
  var queueMessageResult = new QueueMessageResult();
  for (var property in messageXml) {
    if (property === Constants.QueueConstants.MESSAGE_TEXT_ELEMENT) {
      if (encoder !== null && encoder !== undefined) {
        queueMessageResult.messageText = encoder.decode(messageXml[property]);
      } else {
        queueMessageResult.messageText = messageXml[property];
      }
    } else {
      var resultPropertyName = azureutil.normalizePropertyNameFromXML(property);
      queueMessageResult[resultPropertyName] = messageXml[property];
    }
  }

  // Convert dequeueCount to number
  if (queueMessageResult.dequeueCount) {
    queueMessageResult.dequeueCount = parseInt(queueMessageResult.dequeueCount);
  }

  return queueMessageResult;
};

QueueMessageResult.prototype.getPropertiesFromHeaders = function (headers) {
  var self = this;

  var setmessagePropertyFromHeaders = function (messageProperty, headerProperty) {
    if (!self[messageProperty] && headers[headerProperty.toLowerCase()]) {
      self[messageProperty] = headers[headerProperty.toLowerCase()];
    }
  };

  setmessagePropertyFromHeaders('popReceipt', HeaderConstants.POP_RECEIPT);
  setmessagePropertyFromHeaders('timeNextVisible', HeaderConstants.TIME_NEXT_VISIBLE);
};

module.exports = QueueMessageResult;