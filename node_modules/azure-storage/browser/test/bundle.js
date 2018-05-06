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

var browserify = require('browserify');
var fs = require('fs');
var path = require('path');

var bs = browserify([
    path.resolve(__dirname, '../../test/services/queue/queueservice-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tablebatch-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tabledatatype-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tablepayload-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tablequery-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tableservice-gb-tests.js'),
    path.resolve(__dirname, '../../test/services/table/tableservice-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-archive-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-container-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-lease-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-sse-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-tests.js'),
    path.resolve(__dirname, '../../test/services/blob/blobservice-uploaddownload-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-directory-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-file-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-share-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-sharesnapshot-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-sse-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-tests.js'),
    path.resolve(__dirname, '../../test/services/file/fileservice-uploaddownload-tests.js'),
    path.resolve(__dirname, '../../test/common/connectionstringparsertests.js'),
    path.resolve(__dirname, '../../test/common/secondarytests.js'),
    path.resolve(__dirname, '../../test/common/servicesettingstests.js'),
    path.resolve(__dirname, '../../test/common/servicestatstests.js'),
    path.resolve(__dirname, '../../test/common/sharedkey-tests.js'),
    path.resolve(__dirname, '../../test/common/storageserviceclienttests.js'),
    path.resolve(__dirname, '../../test/common/storageservicesettingstests.js'),
    path.resolve(__dirname, '../../test/common/filters/exponentialretrypolicyfilter-tests.js'),
    path.resolve(__dirname, '../../test/common/filters/linearretrypolicyfilter-tests.js'),
    path.resolve(__dirname, '../../test/common/util/iso8061date-tests.js'),
    path.resolve(__dirname, '../../test/common/util/util-tests.js'),
    path.resolve(__dirname, '../../test/common/util/validate-tests.js'),
    path.resolve(__dirname, '../../test/azure-tests.js'),
    path.resolve(__dirname, '../../test/accountsas-tests.js'),
    path.resolve(__dirname, './file/fileservice-upload.js'),
    path.resolve(__dirname, './blob/blobservice-upload.js')
], { require: ['https'] }).bundle();

bs.pipe(
    fs.createWriteStream(path.resolve(__dirname, './browser.tests.bundled.js'))
);