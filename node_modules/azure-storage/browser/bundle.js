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
var factor = require('factor-bundle');
var fs = require('fs');
var path = require('path');

var outputFolder = 'bundle';
var outputFolderPath = path.resolve(__dirname, outputFolder);

console.log('Generating Azure Storage JavaScript Client Library to ' + outputFolderPath + ' ...\n');

if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
}

var b = browserify([
    path.resolve(__dirname, 'azure-storage.blob.export.js'),
    path.resolve(__dirname, 'azure-storage.file.export.js'),
    path.resolve(__dirname, 'azure-storage.queue.export.js'),
    path.resolve(__dirname, 'azure-storage.table.export.js')
], {require: ['stream', 'util', 'buffer']});

b.plugin(factor, {
    outputs: [
        path.resolve(outputFolderPath, 'azure-storage.blob.js'),
        path.resolve(outputFolderPath, 'azure-storage.file.js'),
        path.resolve(outputFolderPath, 'azure-storage.queue.js'),
        path.resolve(outputFolderPath, 'azure-storage.table.js')
    ] 
});

b.bundle().pipe(
    fs.createWriteStream(path.resolve(outputFolderPath, 'azure-storage.common.js'))
);
