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

var BlobService = require('../lib/services/blob/blobservice.browser');

module.exports.BlobService = BlobService;
module.exports.BlobUtilities = require('../lib/services/blob/blobutilities');

module.exports.createBlobService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new BlobService(storageAccountOrConnectionString, storageAccessKey, host, null);
};

module.exports.createBlobServiceWithSas = function (host, sasToken) {
  return new BlobService(null, null, host, sasToken);
};

module.exports.createBlobServiceAnonymous = function (host) {
  return new BlobService(null, null, host, null);
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