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

module.exports.generateDevelopmentStorageCredentials = function (proxyUri) {
  var devStore = 'UseDevelopmentStorage=true;';
  if(proxyUri){
    devStore += 'DevelopmentStorageProxyUri=' + proxyUri;
  }

  return devStore;
};

var FileService = require('../lib/services/file/fileservice.browser');

module.exports.FileService = FileService;
module.exports.FileUtilities = require('../lib/services/file/fileutilities');

module.exports.createFileService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new FileService(storageAccountOrConnectionString, storageAccessKey, host);
};

module.exports.createFileServiceWithSas = function (hostUri, sasToken) {
  return new FileService(null, null, hostUri, sasToken);
};

var azureCommon = require('../lib/common/common.browser');
var StorageServiceClient = azureCommon.StorageServiceClient;
var SharedKey = azureCommon.SharedKey;

module.exports.generateAccountSharedAccessSignature = function(storageAccountOrConnectionString, storageAccessKey, sharedAccessAccountPolicy)
{
  var storageSettings = StorageServiceClient.getStorageSettings(storageAccountOrConnectionString, storageAccessKey);
  var sharedKey = new SharedKey(storageSettings._name, storageSettings._key);
  
  return sharedKey.generateAccountSignedQueryString(sharedAccessAccountPolicy);
};

module.exports.Constants = azureCommon.Constants;
module.exports.StorageUtilities = azureCommon.StorageUtilities;
module.exports.AccessCondition = azureCommon.AccessCondition;

module.exports.SR = azureCommon.SR;
module.exports.StorageServiceClient = StorageServiceClient;
module.exports.Logger = azureCommon.Logger;
module.exports.WebResource = azureCommon.WebResource;
module.exports.Validate = azureCommon.validate;
module.exports.date = azureCommon.date;

// Other filters
module.exports.LinearRetryPolicyFilter = azureCommon.LinearRetryPolicyFilter;
module.exports.ExponentialRetryPolicyFilter = azureCommon.ExponentialRetryPolicyFilter;
module.exports.RetryPolicyFilter = azureCommon.RetryPolicyFilter;