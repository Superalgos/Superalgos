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
var UglifyJS = require('uglify-js');

var version = process.argv[2] || process.env.AZURE_STORAGE_JAVASCRIPT_VERSION || '';
var license = [
    '// Azure Storage JavaScript Client Library ' + version,
    '// Copyright (c) Microsoft and contributors. All rights reserved.'
].join('\n') + '\n';

var outputFolder = 'bundle';
var outputFolderPath = path.resolve(__dirname, outputFolder);

console.log('Generating Azure Storage JavaScript Client Library to ' + outputFolderPath + ' ...');

if (version === '') {
    console.warn(
        'No version number provided.',
        'You can set up a version number by first parameter of bundle.js or environment value AZURE_STORAGE_JAVASCRIPT_VERSION'
    );
}

if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath);
}

function build(exportFilePath, outputFilePath, moduleName, isMinify) {
    browserify(exportFilePath, {standalone: moduleName}).bundle(function (err, src) {
        if (err) {
            console.error('Failed when parsing', exportFilePath, err);
            return;
        }

        var code = (src || '').toString();
        if (isMinify) {
            result = UglifyJS.minify(code.trim());
            if (result.error) {
                console.error('Minify failed when parsing', exportFilePath, err);
                return;
            }

            code = result.code;
        }

        var ws = fs.createWriteStream(outputFilePath);
        ws.write(license);
        ws.write(code);
        ws.end();
    });
}

build(path.resolve(__dirname, 'azure-storage.blob.export.js'), path.resolve(outputFolderPath, 'azure-storage.blob.js'), 'AzureStorage.Blob');
build(path.resolve(__dirname, 'azure-storage.table.export.js'), path.resolve(outputFolderPath, 'azure-storage.table.js'), 'AzureStorage.Table');
build(path.resolve(__dirname, 'azure-storage.queue.export.js'), path.resolve(outputFolderPath, 'azure-storage.queue.js'), 'AzureStorage.Queue');
build(path.resolve(__dirname, 'azure-storage.file.export.js'), path.resolve(outputFolderPath, 'azure-storage.file.js'), 'AzureStorage.File');
build(path.resolve(__dirname, 'azure-storage.blob.export.js'), path.resolve(outputFolderPath, 'azure-storage.blob.min.js'), 'AzureStorage.Blob', true);
build(path.resolve(__dirname, 'azure-storage.table.export.js'), path.resolve(outputFolderPath, 'azure-storage.table.min.js'), 'AzureStorage.Table', true);
build(path.resolve(__dirname, 'azure-storage.queue.export.js'), path.resolve(outputFolderPath, 'azure-storage.queue.min.js'), 'AzureStorage.Queue', true);
build(path.resolve(__dirname, 'azure-storage.file.export.js'), path.resolve(outputFolderPath, 'azure-storage.file.min.js'), 'AzureStorage.File', true);