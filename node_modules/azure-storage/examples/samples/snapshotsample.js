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
* This sample is used to provide an overview of blob snapshots and how to work with them.
* 
* 1. Upload blocks and commit them.
* 
* 2. Take a snapshot for that blob.
* 
* 3. Re-upload one of the three blocks and commit them.
* 
* 4. Get the snapshot.
* 
* 5. List blobs including snapshots.
* 
* 6. Delete the snapshot.
*/

var fs = require('fs');

var azure;
if (fs.existsSync('absolute path to azure-storage.js')) {
  azure = require('absolute path to azure-storage');
} else {
  azure = require('azure-storage');
}

var BlobUtilities = azure.BlobUtilities;

var container = 'snapshotsample';
var blob = 'snapshotsample';

var blockList = ['b1', 'b2', 'b3'];
var blockContent = ['content1', 'content2', 'content3'];
var blockContentAlternative2 = 'alternative2';

var blobService = azure.createBlobService();

// optionally set a proxy
/*var proxy = {
  protocol: 'http:',
  host: '127.0.0.1',
  port: 8888
};

blobService.setProxy(proxy);*/

function snapshotSample () {
  var processArguments = process.argv;
  if (processArguments.length !== 2) {
    console.log('Incorrect number of arguments. No arguments should be given.');
    process.exit(1);
  } 

  console.log('Starting snapshotSample.');

  // Create the container
  createContainer(function () {

    // Upload a blob
    uploadBlockBlob(function () {

      // Create a snapshot of the blob
      createSnapshot(function (snapshot) {

        // Update the blob
        blockContent[1] = blockContentAlternative2;
        uploadBlockBlob(function () {

          // Create a snapshot of the modified blob
          getSnapshotToText(snapshot, function () {

            // List the blob and its snapshots
            listSnapshots(function () {

              // Delete the snapshots
              deleteSnapshots(function () {

                // Delete the container
                deleteContainer(function () {
                  console.log('Ending snapshotSample.');
                });
              });
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

function uploadBlockBlob(callback) {
  // Upload 3 blocks and commit them.
  var blocks = 0;
  var blobCallbackCounter = function (block) {
    ++blocks;
    if (blocks === blockList.length) {
      console.log(' Created ' + blocks + ' blocks.');

      blobService.commitBlocks(container, blob, {LatestBlocks: blockList}, function (error4) {
        if (error4) {
          console.log(error4);
        }
        else {
          console.log('Committed the blob ' + blob);
          callback();
        }
      });
    }
  }

  for(var i = 0; i < blockList.length; i++) {
    console.log(' Uploading a block. ID: ' + blockList[i] + ' Content: ' + blockContent[i]);
    blobService.createBlockFromText(blockList[i], container, blob, blockContent[i], blockContent[i].length, function (error) {
      if (error) {
        console.log(error);
      } else {
        blobCallbackCounter();
      } 
    });
  }
}

function createSnapshot(callback) {
  // Creates a snapshot.
  blobService.createBlobSnapshot(container, blob, function (error, snapshot) {
    if (error) {
      console.log(error);
    } else {
      console.log('Created a snapshot for the blob ' + blob);
      callback(snapshot);
    }
  });
}

function getSnapshotToText(snapshot, callback) {
  // Gets a snapshot.
  blobService.getBlobToText(container, blob, {snapshotId: snapshot}, function (error, text) {
    if (error) {
      console.log(error);
    } else {
      console.log('Snapshot ' + blob + '?' + snapshot + ' text: ' + text);
      callback();
    }
  });
}

function listSnapshots (callback) {
  // List the blobs, including snapshots
  blobService.listBlobsSegmented(container, null, { include: BlobUtilities.BlobListingDetails.SNAPSHOTS }, function (error, results) {
    if (error) {
      console.log(error);
    } else {
      console.log('Listing the blobs under the container ' + container);

      results.entries.forEach(function (blob) {
        var snapshot = '';
        if (blob.snapshot) {
          snapshot = '; BlobSnapshot: ' + blob.snapshot;
        }
        console.log(' BlobName: ' + blob.name + snapshot);
      });

      callback();
    }
  });
};

function deleteSnapshots (callback) {
  // Delete the snapshot.
  blobService.deleteBlob(container, blob, { deleteSnapshots: BlobUtilities.SnapshotDeleteOptions.SNAPSHOTS_ONLY }, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Deleted the snapshots.');
      callback();
    }
  });
};

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

snapshotSample();
