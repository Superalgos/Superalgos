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

var suite = new TestSuite('blobservice-upload-browser');

if (testUtil.isBrowser()) {
    var azure = AzureStorage.Blob;
    var containerNamesPrefix = 'upload-test-container-';
    var blobNamesPrefix = 'upload-teset-blob-';
    var containerName;
    var blobName;
    
    describe('BlobServiceUpload', function () {
        before(function (done) {
            blobService = azure.createBlobService(process.env['AZURE_STORAGE_CONNECTION_STRING']);
            assert.notEqual(null, blobService, 'blobService should not be null');
    
            containerName = suite.getName(containerNamesPrefix);
            blobService.createContainerIfNotExists(containerName, function (err) {
                assert.equal(err, null);
                done();
            });
        });
    
        after(function (done) {
            blobService.deleteContainerIfExists(containerName, function (err) {
                assert.equal(err, null);
                done();
            });
        });
    
        beforeEach(function () {
            blobName = suite.getName(blobNamesPrefix);
        });
    
        afterEach(function () {
        });
    
        describe('createBlockBlobFromBrowserFile', function () {
            it('upload block blob with invalid type should not work', function () {
                try {
                    blobService.createBlockBlobFromBrowserFile(containerName, blobName, 'abcde', function (err, res, resp) { });
                } catch (e) {
                    assert.notEqual(e, null);
                }
            });
    
            it('upload block blob with md5 calculation should work', function (done) {
                var size = 7 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, { storeBlobContentMD5: true }, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        assert.notEqual(res.contentSettings.contentMD5, null);
                        done();
                    });
                });
            });
    
            it('upload block blob with 0 bytes should work', function (done) {
                var size = 0;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.blobType, AzureStorage.Blob.Constants.BlobConstants.BlobTypes.BLOCK);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload block blob with 4 * 1024 * 1024 - 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 - 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload block blob with 4 * 1024 * 1024 bytes should work', function (done) {
                var size = 4 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload block blob with 4 * 1024 * 1024 + 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 + 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload block blob with 128 * 1024 * 1024 bytes should work', function (done) {
                var size = 128 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createBlockBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
        });
    
        describe('createPageBlobFromBrowserFile', function () {
            it('upload page blob with invalid type should not work', function () {
                try {
                    blobService.createPageBlobFromBrowserFile(containerName, blobName, 'abcde', function (err, res, resp) { });
                } catch (e) {
                    assert.notEqual(e, null);
                }
            });
    
            it('upload page blob with md5 calculation should work', function (done) {
                var size = 3 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createPageBlobFromBrowserFile(containerName, blobName, file, { storeBlobContentMD5: true }, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        assert.notEqual(res.contentSettings.contentMD5, null);
                        done();
                    });
                });
            });
    
            it('upload page blob with 0 bytes should work', function (done) {
                var file = testUtil.getBrowserFile(blobName, 0);
                blobService.createPageBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.blobType, AzureStorage.Blob.Constants.BlobConstants.BlobTypes.PAGE);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, 0);
                        done();
                    });
                });
            });
    
            it('upload page blob with 4 * 1024 * 1024 - 1 bytes should not work', function () {
                var size = 4 * 1024 * 1024 - 1;
                var file = testUtil.getBrowserFile(blobName, size);
                try {
                    blobService.createPageBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) { });
                } catch (e) {
                    assert.notEqual(e, null);
                }
            });
    
            it('upload page blob with 4 * 1024 * 1024 bytes should work', function (done) {
                var size = 4 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createPageBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload page blob with 128 * 1024 * 1024 bytes should work', function (done) {
                var size = 128 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createPageBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
        });
    
        describe('createAppendBlobFromBrowserFile', function () {
            it('upload append blob with invalid type should not work', function () {
                try {
                    blobService.createAppendBlobFromBrowserFile(containerName, blobName, 'abcde', function (err, res, resp) { });
                } catch (e) {
                    assert.notEqual(e, null);
                }
            });
    
            it('upload append blob with md5 calculation should work', function (done) {
                var size = 7 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, { storeBlobContentMD5: true }, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        assert.notEqual(res.contentSettings.contentMD5, null);
                        done();
                    });
                });
            });
    
            it('upload append blob with 0 bytes should work', function (done) {
                var file = testUtil.getBrowserFile(blobName, 0);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.blobType, AzureStorage.Blob.Constants.BlobConstants.BlobTypes.APPEND);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, 0);
                        done();
                    });
                });
            });
    
            it('upload append blob with 4 * 1024 * 1024 - 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 - 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload append blob with 4 * 1024 * 1024 bytes should work', function (done) {
                var size = 4 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload append blob with 4 * 1024 * 1024 + 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 + 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('upload append blob with 128 * 1024 * 1024 bytes should work', function (done) {
                var size = 128 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
        });
    
        describe('appendFromBrowserFile', function () {
            beforeEach(function (done) {
                var size = 2 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.createAppendBlobFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size);
                        done();
                    });
                });
            });
    
            it('append blob with 0 bytes should work', function (done) {
                var file = testUtil.getBrowserFile(blobName, 0);
                blobService.appendFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.blobType, AzureStorage.Blob.Constants.BlobConstants.BlobTypes.APPEND);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, 2 * 1024 * 1024);
                        done();
                    });
                });
            });
    
            it('append blob with 4 * 1024 * 1024 - 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 - 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.appendFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size + 2 * 1024 * 1024);
                        done();
                    });
                });
            });
    
            it('append blob with 4 * 1024 * 1024 bytes should work', function (done) {
                var size = 4 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.appendFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size + 2 * 1024 * 1024);
                        done();
                    });
                });
            });
    
            it('append blob with 4 * 1024 * 1024 + 1 bytes should work', function (done) {
                var size = 4 * 1024 * 1024 + 1;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.appendFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size + 2 * 1024 * 1024);
                        done();
                    });
                });
            });
    
            it('append blob with 128 * 1024 * 1024 bytes should work', function (done) {
                var size = 128 * 1024 * 1024;
                var file = testUtil.getBrowserFile(blobName, size);
                blobService.appendFromBrowserFile(containerName, blobName, file, function (err, res, resp) {
                    assert.equal(err, null);
                    blobService.getBlobProperties(containerName, blobName, function (err, res) {
                        assert.equal(err, null);
                        assert.equal(res.name, blobName);
                        assert.equal(res.contentLength, size + 2 * 1024 * 1024);
                        done();
                    });
                });
            });
        });
    });
}