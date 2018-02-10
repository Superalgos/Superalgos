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
* 1. Demonstrates how to upload all files from a given directory in parallel
* 
* 2. Demonstrates how to download all files from a given blob container to a given destination directory.
* 
* 3. Demonstrate making requests using AccessConditions.
*/

var fs = require('fs');

var azure;
if (fs.existsSync('absolute path to azure-storage.js')) {
  azure = require('absolute path to azure-storage');
} else {
  azure = require('azure-storage');
}

var container = 'updownsample3';
var blob = 'updownsample';
var blobAccess = 'updownaccesssample';

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

function uploadSample() {
  var processArguments = process.argv;
  if (processArguments.length !== 4) {
    console.log('Incorrect number of arguments. Should be: srcPath destPath');
    process.exit(1);
  } 

  var srcPath = processArguments[2];
  var destPath = processArguments[3];

  console.log('Starting blobuploaddownloadsample.');

  // Create the container
  createContainer(container, function () {
    
    // Demonstrates how to upload all files from a given directoy
    uploadBlobs(srcPath, container, function () {

      // Demonstrates how to download all files from a given
      // blob container to a given destination directory.
      downloadBlobs(container, destPath, function () {

        // Demonstrate making requests using AccessConditions.
        useAccessCondition(container, function () {

          // Delete the container
          deleteContainer(container, function () {
            console.log('Ending blobuploaddownloadsample.');
          });
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

function uploadBlobs(sourceDirectoryPath, containerName, callback) {
  console.log('Entering uploadBlobs.');

  // validate directory is valid.
  if (!fs.existsSync(sourceDirectoryPath)) {
    console.log(sourceDirectoryPath + ' is an invalid directory path.');
  } else {
    // Search the directory and generate a list of files to upload.
    walk(sourceDirectoryPath, function (error, files) {
      if (error) {
        console.log(error);
      } else {
        var finished = 0;

        // generate and schedule an upload for each file
        files.forEach(function (file) {
          var blobName = file.replace(/^.*[\\\/]/, '');

          blobService.createBlockBlobFromLocalFile(containerName, blobName, file, function (error) {
            finished++;

            if (error) {
              console.log(error);
            } else {
              console.log(' Blob ' + blobName + ' upload finished.');

              if (finished === files.length) {
                // Wait until all workers complete and the blobs are uploaded to the server.
                console.log('All files uploaded');
                callback();
              }
            }
          });
        });
      }
    });
  }
}

function downloadBlobs(containerName, destinationDirectoryPath, callback) {
  console.log('Entering downloadBlobs.');

  // Validate directory
  if (!fs.existsSync(destinationDirectoryPath)) {
    console.log(destinationDirectoryPath + ' does not exist. Attempting to create this directory...');
    fs.mkdirSync(destinationDirectoryPath);
    console.log(destinationDirectoryPath + ' created.');
  }

  // NOTE: does not handle pagination.
  blobService.listBlobsSegmented(containerName, null, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      var blobs = result.entries;
      var blobsDownloaded = 0;

      blobs.forEach(function (blob) {
          blobService.getBlobToLocalFile(containerName, blob.name, destinationDirectoryPath + '/' + blob.name, function (error2) {
          blobsDownloaded++;

          if (error2) {
            console.log(error2);
          } else {
            console.log(' Blob ' + blob.name + ' download finished.');

            if (blobsDownloaded === blobs.length) {
              // Wait until all workers complete and the blobs are downloaded
              console.log('All files downloaded');
              callback();
            }
          }
        });
      });
    }
  });
}

function useAccessCondition(containerName, callback) {
  console.log('Entering useAccessCondition.');

  // Create a blob.
  blobService.createBlockBlobFromText(containerName, blobAccess, 'hello', function (error, blobInformation) {
    if (error) {
      console.log(error);
    } else {
      console.log(' Created the blob ' + blobInformation.name);
      console.log(' Blob Etag is: ' + blobInformation.etag);
          
      // Use the If-not-match ETag condition to access the blob. By
      // using the IfNoneMatch condition we are asserting that the blob needs
      // to have been modified in order to complete the request. In this
      // sample no other client is accessing the blob, so this will fail as
      // expected.
      var options = { accessConditions: { EtagNonMatch: blobInformation.etag} };
      blobService.createBlockBlobFromText(containerName, blobInformation.name, 'new hello', options, function (error2) {
        if (error2 && error2.statusCode === 412 && error2.code === 'ConditionNotMet') {
          console.log('Attempted to recreate the blob with the if-none-match access condition and got the expected exception.');
          callback();
        } else {
          console.log(' Blob was incorrectly updated');
          if (error2) {
            console.log(error2);
          }
        }
      });
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

// Utility function

var walk = function (dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function (err2, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function (err3, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

uploadSample();
