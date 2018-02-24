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
* In this sample, we demonstrate how to generate and use the blob level shared access signature and the container level
* shared access signature.
* 
* In the blob level shared access signature sample, there are the following steps: 
* 
* 1. Create a container and a blob.
*
* 2. Generate a shared access signature for the blob and download the blob using it.
* 
* 3. Upload a "ReadWrite" policy and a "Read" permission to the container.
*
* 4. Generate a shared access signature for the blob using the policy id and download the blob using it.
*/

var fs = require('fs');
var assert = require('assert');

var azure;
if (fs.existsSync('../../lib/azure-storage.js')) {
  azure = require('../../lib/azure-storage');
} else {
  azure = require('azure-storage');
}
var BlobUtilities = azure.BlobUtilities;

var container = 'container-sassample';
var blob = 'blob-sassample';

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

function sasSample () {
  console.log('Starting sasSample.');

  // Create the container.
  createContainer(function () {

    // Create a blob.
    createBlob( function () {

      // Create a shared access signature and use it to download the blob just created.
      downloadBlobUsingSharedAccessSignature(function () {

        // Add Shared Access policies to the container
        createPolicies(function () {

          // Use the read policy just created
          usePermissions(function () {

            // Delete the container
            deleteContainer(function () {
              console.log('Ending sasSample.');
            });
          });
        });
      });
    });
  });
}

function createContainer (callback) {
  // Create the container.
  blobService.createContainerIfNotExists(container, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Created the container ' + container);
      callback();
    }
  });
}

function createBlob (callback) {
  // Create the blob
  blobService.createBlockBlobFromText(container, blob, 'test blob', function (error) {
    if (error) {
      console.log(error);
    }
    else {
      console.log('Created the blob ' + container);
      callback();
    }
  });
}

function downloadBlobUsingSharedAccessSignature (callback) {
  var startDate = new Date();
  var expiryDate = new Date(startDate);
  expiryDate.setMinutes(startDate.getMinutes() + 5);

  var sharedAccessPolicy = {
    AccessPolicy: {
      Permissions: BlobUtilities.SharedAccessPermissions.READ,
      Start: startDate,
      Expiry: expiryDate
    }
  };

  var sharedAccessSignatureToken = blobService.generateSharedAccessSignature(container, blob, sharedAccessPolicy);

  var sharedBlobService = azure.createBlobServiceWithSas(blobService.host, sharedAccessSignatureToken);

  // Download the blob by using the shared access signature URL. 
  sharedBlobService.getBlobProperties(container, blob, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Downloaded the blob ' + blob + ' by using the shared access signature URL: \n ' + sharedBlobService.getUrl(container, blob, sharedAccessSignatureToken));
    }

    callback();
  });
}

function createPolicies (callback) {
  // Create a "ReadWrite" policy and a "Read" policy.
  var readWriteStartDate = new Date();
  var readWriteExpiryDate = new Date(readWriteStartDate);
  readWriteExpiryDate.setMinutes(readWriteStartDate.getMinutes() + 10);
  
  var signedIdentifiers = {
    readwrite: {
      Start: readWriteStartDate,
      Expiry: readWriteExpiryDate,
      Permissions: 'rw'
    },
    read: {
      Expiry: readWriteStartDate,
      Permissions: 'r'
    }
  };

  // Wait 30 seconds for the container acl to be processed
  var func = function () {
    var options = { publicAccessLevel: BlobUtilities.BlobContainerPublicAccessType.CONTAINER };
    blobService.setContainerAcl(container, signedIdentifiers, options, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log('Uploaded the permissions for the container ' + container);
        callback();
      }
    });
  };

  setTimeout(func, 30000);
}

function usePermissions (callback) {
  // Read, write the blob using the shared access signature from "ReadWrite" policy.
  var readWriteAccessPolicy = {
    Id: 'readwrite'
  };

  var headers = {
    cacheControl: 'no-transform',
    contentDisposition: 'attachment',
    contentEncoding: 'gzip',
    contentLanguage: 'tr,en',
    contentType: 'text/html'
  };

  var sharedAccessSignatureToken = blobService.generateSharedAccessSignature(container, null, {Id: 'readwrite'}, headers);

  var sharedBlobService = azure.createBlobServiceWithSas(blobService.host, sharedAccessSignatureToken);

  sharedBlobService.getBlobProperties(container, blob, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      console.log('Downloaded the blob ' + blob + ' by using the shared access signature URL: \n ' + sharedBlobService.getUrl(container, blob, sharedAccessSignatureToken));

    }

    callback();
  });
}

function deleteContainer (callback) {
  // Delete the container.
  blobService.deleteContainerIfExists(container, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Deleted the container ' + container);
      callback();
    }
  });
}

sasSample();
