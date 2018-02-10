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

/**
* Demonstrates how to define sendingrequest and receivedresponse event handlers.
*/
var fs = require('fs');

var azure;
if (fs.existsSync('absolute path to azure-storage.js')) {
  azure = require('absolute path to azure-storage');
} else {
  azure = require('azure-storage');
}

var container = 'sendingrequestevent3';

// The service object which will define the event handlers
var blobService = azure.createBlobService();

// optionally set a proxy
/*var proxy = {
  protocol: 'http:',
  host: '127.0.0.1',
  port: 8888
};

blobService.setProxy(proxy);
blobService2.setProxy(proxy);
*/

// the sending request event handler
var sendingRequestHandler = function (webresource) {
  webresource.withHeader('x-ms-custom-header', 'value');
  console.log(' sending request event handler called');
};

// the response received event handler
var responseReceivedHandler = function (response) {
  console.log(' received response event handler called');
};

function eventHandlersSample () {
  console.log('Starting eventHandlersSample.');

  // set the event handlers
  blobService.on('sendingRequestEvent', sendingRequestHandler);
  blobService.on('receivedResponseEvent', responseReceivedHandler);

  // create and delete a container with these handlers
  createContainer(container, function () {
    // Delete the container
    deleteContainer(container, function () {
      console.log('Ending eventHandlersSample.');
    });
  });
}

function createContainer (container, callback) {
  // Create the container.
  blobService.createContainer(container, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Created the container ' + container);
      callback();
    }
  });
}

function deleteContainer (container, callback) {
  // Delete the container.
  blobService.deleteContainer(container, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Deleted the container ' + container);
      callback();
    }
  });
}

eventHandlersSample();
