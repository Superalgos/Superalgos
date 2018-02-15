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

var AzureStorage = window.AzureStorage || {};

AzureStorage.generateDevelopmentStorageCredentials = function (proxyUri) {
  var devStore = 'UseDevelopmentStorage=true;';
  if(proxyUri){
    devStore += 'DevelopmentStorageProxyUri=' + proxyUri;
  }

  return devStore;
};

var FileService = require('../lib/services/file/fileservice.browser');

AzureStorage.FileService = FileService;
AzureStorage.FileUtilities = require('../lib/services/file/fileutilities');

AzureStorage.createFileService = function (storageAccountOrConnectionString, storageAccessKey, host) {
  return new FileService(storageAccountOrConnectionString, storageAccessKey, host);
};

AzureStorage.createFileServiceWithSas = function (hostUri, sasToken) {
  return new FileService(null, null, hostUri, sasToken);
};

var azureCommon = require('../lib/common/common.browser');
var StorageServiceClient = azureCommon.StorageServiceClient;
var SharedKey = azureCommon.SharedKey;

AzureStorage.generateAccountSharedAccessSignature = function(storageAccountOrConnectionString, storageAccessKey, sharedAccessAccountPolicy)
{
  var storageSettings = StorageServiceClient.getStorageSettings(storageAccountOrConnectionString, storageAccessKey);
  var sharedKey = new SharedKey(storageSettings._name, storageSettings._key);
  
  return sharedKey.generateAccountSignedQueryString(sharedAccessAccountPolicy);
};

AzureStorage.Constants = azureCommon.Constants;
AzureStorage.StorageUtilities = azureCommon.StorageUtilities;
AzureStorage.AccessCondition = azureCommon.AccessCondition;

AzureStorage.SR = azureCommon.SR;
AzureStorage.StorageServiceClient = StorageServiceClient;
AzureStorage.Logger = azureCommon.Logger;
AzureStorage.WebResource = azureCommon.WebResource;
AzureStorage.Validate = azureCommon.validate;
AzureStorage.date = azureCommon.date;

// Other filters
AzureStorage.LinearRetryPolicyFilter = azureCommon.LinearRetryPolicyFilter;
AzureStorage.ExponentialRetryPolicyFilter = azureCommon.ExponentialRetryPolicyFilter;
AzureStorage.RetryPolicyFilter = azureCommon.RetryPolicyFilter;

window.AzureStorage = AzureStorage;