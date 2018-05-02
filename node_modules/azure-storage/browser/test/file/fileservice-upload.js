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


var assert = require('assert');
var TestSuite = require('../../../test/framework/test-suite');
var testUtil = require('../../../test/framework/util');

var suite = new TestSuite('fileservice-upload-browser');

if (testUtil.isBrowser()) {
  var azure = AzureStorage.File;
  var shareNamesPrefix = 'upload-test-share-';
  var fileNamesPrefix = 'upload-test-file-';
  var shareName;
  var fileName; 
  
  describe('FileServiceUpload', function () {
    before(function (done) {
      fileService = azure.createFileService(process.env['AZURE_STORAGE_CONNECTION_STRING']);
      assert.notEqual(null, fileService, 'FileService should not be null');
  
      shareName = suite.getName(shareNamesPrefix);
      fileService.createShareIfNotExists(shareName, function (err) {
        assert.equal(err, null);
        done();
      });
    });
    
    after(function (done) {
      fileService.deleteShareIfExists(shareName, function (err) {
        assert.equal(err, null);
        done();
      });
    });
    
    beforeEach(function () {
      fileName = suite.getName(fileNamesPrefix);
    });
    
    afterEach(function (done) {
      fileService.deleteFileIfExists(shareName, '', fileName, function (err) {
        assert.equal(err, null);
        done();
      });
    });
  
    describe('createFileFromBrowserFile', function () {
      it('upload file with invalid type should not work', function () {
        try {
          fileService.createFileFromBrowserFile(shareName, '', fileName, 'abcde', function (err, res, resp) {});
        } catch (e) {
          assert.notEqual(e, null);
        }
      });
  
      it('upload file with md5 calculation should work', function (done) {
        var size = 33 * 1024 * 1024;
        var file = testUtil.getBrowserFile(fileName, size);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, { storeFileContentMD5: true}, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, size);
            assert.notEqual(res.contentSettings.contentMD5, null);
            done();
          });
        });
      });
  
      it('upload file with 0 bytes should work', function (done) {
        var file = testUtil.getBrowserFile(fileName, 0);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, 0);
            done();          
          });
        });
      });
  
      it('upload file with 4 * 1024 * 1024 - 1 bytes should work', function (done) {
        var size = 4 * 1024 * 1024 - 1;
        var file = testUtil.getBrowserFile(fileName, size);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, size);
            done();
          });
        });
      });
  
      it('upload file with 4 * 1024 * 1024 bytes should work', function (done) {
        var size = 4 * 1024 * 1024;
        var file = testUtil.getBrowserFile(fileName, size);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, size);
            done();
          });
        });
      });
  
      it('upload file with 4 * 1024 * 1024 + 1 bytes should work', function (done) {
        var size = 4 * 1024 * 1024 + 1;
        var file = testUtil.getBrowserFile(fileName, size);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, size);
            done();
          });
        });
      });
  
      it('upload file with 128 * 1024 * 1024 bytes should work', function (done) {
        var size = 128 * 1024 * 1024;
        var file = testUtil.getBrowserFile(fileName, size);
        fileService.createFileFromBrowserFile(shareName, '', fileName, file, function (err, res, resp) {
          assert.equal(err, null);
          fileService.getFileProperties(shareName, '', fileName, function (err, res) {
            assert.equal(err, null);
            assert.equal(res.name, fileName);
            assert.equal(res.contentLength, size);
            done();
          });
        });
      });
    });
  });
}