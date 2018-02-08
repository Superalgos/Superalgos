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
* This sample demonstrates how to handle continuation tokens and virtual "pages" of results when performing a listing
* operation on the blob service.
*
* This sample peformsthe following steps:
*
* 0. Create container.
*
* 1. Create 50 blobs.
*
* 2. List the first 10(page size) blobs.
*
* 3. Check whether there are more results.
*
* 4. Repeat 2 and 3 until complete.
*
*/

var fs = require('fs');

var azure;
if (fs.existsSync('absolute path to azure-storage.js')) {
  azure = require('absolute path to azure-storage');
} else {
  azure = require('azure-storage');
}

var container = 'paginationsample';
var blob = 'contsample';
var blobs = [];

var blobService = azure.createBlobService()
      .withFilter(new azure.ExponentialRetryPolicyFilter());

// optionally set a proxy
/*var proxy = {
  protocol: 'http:',
  host: '127.0.0.1',
  port: 8888
};

blobService.setProxy(proxy);
*/

var totalBlobsCount;
var pageSize;

function continuationSample () {
  var processArguments = process.argv;
  if (processArguments.length !== 4) {
    console.log('Incorrect number of arguments. Should be: numBlobs pageSize [deleteContainer]\nTry: 51 10');
    process.exit(1);
  } 

  totalBlobsCount = parseInt(processArguments[2], 10);
  pageSize = parseInt(processArguments[3], 10);

  console.log('Starting continuationSample.');

  // Create the container
  createContainer(container, function () {

  console.log('Entering createBlobs.');

    // Upload blobs from text.
    createBlobs(totalBlobsCount, function () {
      var options = {
        maxResults: pageSize,
        include: 'metadata',
        locationMode: azure.StorageUtilities.LocationMode.PRIMARY_THEN_SECONDARY
      };

      console.log('Entering listBlobs.');

      // List blobs using continuation tokens.
      listBlobs(options, null, function () {

        // Delete the container
        deleteContainer(container, function () {
          console.log('Ending continuationSample.');
        });
      });
    });
  });
}

function createContainer (container, callback) {
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

function createBlobs(currentBlobsCount, callback) {
  // Upload totalBlobsCount blobs to the container.
  var options = {};
  options.metadata = {'hello':'world'};

  blobService.createBlockBlobFromText(container, blob + currentBlobsCount, 'blob' + currentBlobsCount, options, function (error) {
    if (error) {
      console.log(error);
    } else if (currentBlobsCount > 1) {
      createBlobs(--currentBlobsCount, callback);
    } else {
      console.log(' Created ' + totalBlobsCount + ' blobs.');
      callback();
    }
  });
}

function listBlobs (options, token, callback) {
  blobService.listBlobsSegmented(container, token, options, function(error, result) {
    blobs.push.apply(blobs, result.entries);
    var token = result.continuationToken;
    if(token) {
      console.log(' Received a page of results. There are ' + result.entries.length + ' blobs on this page.');
      listBlobs(options, token, callback);
    }
    else {
      console.log(' Completed listing. There are ' + blobs.length + ' blobs');
      callback();
    }
  });
}

function deleteContainer (container, callback) {
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

continuationSample();
