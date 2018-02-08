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

'use strict';

var _ = require('underscore');
var url = require('url');

var util = require('../util/util');
var ServiceSettings = require('./servicesettings');
var Constants = require('../util/constants');
var StorageServiceClientConstants = Constants.StorageServiceClientConstants;
var ConnectionStringKeys = Constants.ConnectionStringKeys;
var Validate = require('../util/validate');
var SR = require('../util/sr');

var useDevelopmentStorageSetting = ServiceSettings.setting(ConnectionStringKeys.USE_DEVELOPMENT_STORAGE_NAME, true);
var developmentStorageProxyUriSetting = ServiceSettings.settingWithFunc(ConnectionStringKeys.DEVELOPMENT_STORAGE_PROXY_URI_NAME, Validate.isValidUri);
var defaultEndpointsProtocolSetting = ServiceSettings.setting(ConnectionStringKeys.DEFAULT_ENDPOINTS_PROTOCOL_NAME, 'http', 'https');
var accountNameSetting = ServiceSettings.setting(ConnectionStringKeys.ACCOUNT_NAME_NAME);
var accountKeySetting = ServiceSettings.settingWithFunc(ConnectionStringKeys.ACCOUNT_KEY_NAME, Validate.isBase64Encoded);
var sasSetting = ServiceSettings.settingWithFunc(ConnectionStringKeys.SHARED_ACCESS_SIGNATURE_NAME, _.isString);

var blobEndpointSetting = ServiceSettings.settingWithFunc(
  ConnectionStringKeys.BLOB_ENDPOINT_NAME,
  Validate.isValidHost
);

var queueEndpointSetting = ServiceSettings.settingWithFunc(
  ConnectionStringKeys.QUEUE_ENDPOINT_NAME,
  Validate.isValidHost
);

var tableEndpointSetting = ServiceSettings.settingWithFunc(
  ConnectionStringKeys.TABLE_ENDPOINT_NAME,
  Validate.isValidHost
);

var fileEndpointSetting = ServiceSettings.settingWithFunc(
  ConnectionStringKeys.FILE_ENDPOINT_NAME,
  Validate.isValidHost
);

var endpointSuffixSetting = ServiceSettings.settingWithFunc(
  ConnectionStringKeys.ENDPOINT_SUFFIX_NAME,
  Validate.isValidHost
);

var validKeys = [
  ConnectionStringKeys.USE_DEVELOPMENT_STORAGE_NAME,
  ConnectionStringKeys.DEVELOPMENT_STORAGE_PROXY_URI_NAME,
  ConnectionStringKeys.DEFAULT_ENDPOINTS_PROTOCOL_NAME,
  ConnectionStringKeys.ACCOUNT_NAME_NAME,
  ConnectionStringKeys.ACCOUNT_KEY_NAME,
  ConnectionStringKeys.SHARED_ACCESS_SIGNATURE_NAME,
  ConnectionStringKeys.BLOB_ENDPOINT_NAME,
  ConnectionStringKeys.QUEUE_ENDPOINT_NAME,
  ConnectionStringKeys.TABLE_ENDPOINT_NAME,
  ConnectionStringKeys.FILE_ENDPOINT_NAME,
  ConnectionStringKeys.ENDPOINT_SUFFIX_NAME
];

/**
* Creates new storage service settings instance.
*
* @param {string} name                      The storage service name.
* @param {string} key                       The storage service key.
* @param {string} sasToken                  The storage service shared access signature token.
* @param {string} blobEndpoint              The storage service blob endpoint.
* @param {string} queueEndpoint             The storage service queue endpoint.
* @param {string} tableEndpoint             The storage service table endpoint.
* @param {string} fileEndpoint              The storage service file endpoint.
* @param {bool}   usePathStyleUri           Boolean value indicating wether to use path style uri or not.
*/
function StorageServiceSettings(name, key, sasToken, blobEndpoint, queueEndpoint, tableEndpoint, fileEndpoint, usePathStyleUri) {
  this._name = name;
  this._key = key;

  if (sasToken && sasToken[0] === '?') {
    this._sasToken = sasToken.slice(1);
  } else {
    this._sasToken = sasToken;
  }

  this._blobEndpoint = blobEndpoint;
  this._queueEndpoint = queueEndpoint;
  this._tableEndpoint = tableEndpoint;
  this._fileEndpoint = fileEndpoint;

  if (usePathStyleUri) {
    this._usePathStyleUri = usePathStyleUri;
  } else {
    this._usePathStyleUri = false;
  }
}

/**
* Creates a StorageServiceSettings object from the given connection string.
*
* @param {string} connectionString The storage settings connection string.
* @return {StorageServiceSettings}
*/
StorageServiceSettings.createFromConnectionString = function (connectionString) {
  var tokenizedSettings = ServiceSettings.parseAndValidateKeys(connectionString, validKeys);

  try {
    return StorageServiceSettings.createFromSettings(tokenizedSettings);
  } catch (e) {
    if (e instanceof ServiceSettings.NoMatchError) {
      // Replace no match settings exception by no match connection string one.
      ServiceSettings.noMatchConnectionString(connectionString);
    } else {
      throw e;
    }
  }
};

StorageServiceSettings.createExplicitly = function (storageAccount, storageAccessKey, host, sasToken, endpointSuffix) {
  var settings = {};
  function addIfNotNullOrEmpty(key, value){
    if(typeof value === 'string' && !util.stringIsEmpty(value)){
      settings[key] = value;
    } else if (typeof value == 'object' && !util.objectIsNull(value)) {
      settings[key] = value;
    }
  }

  // Endpoints
  if (host) {
    addIfNotNullOrEmpty('blobendpoint', host);
    addIfNotNullOrEmpty('tableendpoint', host);
    addIfNotNullOrEmpty('queueendpoint', host);
    addIfNotNullOrEmpty('fileendpoint', host);
  } else {
    addIfNotNullOrEmpty('defaultendpointsprotocol', ServiceSettings.DEFAULT_PROTOCOL.split(':', 1)[0]);
  }

  addIfNotNullOrEmpty('accountname', storageAccount);
  addIfNotNullOrEmpty('accountkey', storageAccessKey);
  addIfNotNullOrEmpty('sharedaccesssignature', sasToken);
  addIfNotNullOrEmpty('endpointsuffix', endpointSuffix);

  return StorageServiceSettings.createFromSettings(settings);
};

StorageServiceSettings.createFromEnvironment = function () {
  var emulated = process.env[StorageServiceClientConstants.EnvironmentVariables.EMULATED];
  if (emulated) {
    return StorageServiceSettings.getDevelopmentStorageAccountSettings();
  } 

  var connectionString = process.env[StorageServiceClientConstants.EnvironmentVariables.AZURE_STORAGE_CONNECTION_STRING];
  if (connectionString) {
    return StorageServiceSettings.createFromConnectionString(connectionString);
  } 

  var storageAccount = process.env[StorageServiceClientConstants.EnvironmentVariables.AZURE_STORAGE_ACCOUNT];
  var storageAccessKey = process.env[StorageServiceClientConstants.EnvironmentVariables.AZURE_STORAGE_ACCESS_KEY];
  if(storageAccount && storageAccessKey){
    return StorageServiceSettings.createExplicitly(storageAccount, storageAccessKey, null, null, null);
  }

  throw new Error(SR.NO_CREDENTIALS_PROVIDED);
};

/**
* Creates a StorageServiceSettings object from a set of settings.
*
* @param {object} settings The settings object.
* @return {StorageServiceSettings}
*/
StorageServiceSettings.createFromSettings = function (settings) {
  // Devstore case
  var matchedSpecs = ServiceSettings.matchedSpecification(
    settings,
    ServiceSettings.allRequired(useDevelopmentStorageSetting),
    ServiceSettings.optional(developmentStorageProxyUriSetting)
  );

  if (matchedSpecs) {
    var proxyUri = util.tryGetValueInsensitive(
      ConnectionStringKeys.DEVELOPMENT_STORAGE_PROXY_URI_NAME,
      settings
    );

    return this.getDevelopmentStorageAccountSettings(proxyUri);
  }

  // Account/Key automatic case
  matchedSpecs = ServiceSettings.matchedSpecification(
    settings,
    ServiceSettings.allRequired(
      defaultEndpointsProtocolSetting,
      accountNameSetting,
      accountKeySetting
    ), 
    ServiceSettings.optional(
      blobEndpointSetting,
      queueEndpointSetting,
      tableEndpointSetting,
      fileEndpointSetting,
      endpointSuffixSetting
    )
  );

  if (matchedSpecs) {  
    return this._createStorageServiceSettings(settings);
  }

  // Account/Key explicit case
  matchedSpecs = ServiceSettings.matchedSpecification(
    settings,
    ServiceSettings.allRequired(
      accountNameSetting,
      accountKeySetting
    ),
    ServiceSettings.atLeastOne(
      blobEndpointSetting,
      queueEndpointSetting,
      tableEndpointSetting,
      fileEndpointSetting,
      endpointSuffixSetting
    )
  );

  if (matchedSpecs) {  
    return this._createStorageServiceSettings(settings);
  }

  // SAS case
  matchedSpecs = ServiceSettings.matchedSpecification(
    settings,
    ServiceSettings.allRequired(
      sasSetting
    ),
    ServiceSettings.atLeastOne(
      blobEndpointSetting,
      queueEndpointSetting,
      tableEndpointSetting,
      fileEndpointSetting,
      endpointSuffixSetting
    )
  );

  if(matchedSpecs) {
    return this._createStorageServiceSettings(settings);
  }

  // anonymous explicit case
  // Only blob anonymous access is valid.
  matchedSpecs = ServiceSettings.matchedSpecification(
    settings,
    ServiceSettings.allRequired(
      blobEndpointSetting
    ),
    ServiceSettings.optional(
      fileEndpointSetting,
      queueEndpointSetting,
      tableEndpointSetting,
      endpointSuffixSetting
    )
  );

  if(matchedSpecs) {
    return this._createStorageServiceSettings(settings);
  }

  ServiceSettings.noMatchSettings(settings);
};

/**
* Returns a StorageServiceSettings with development storage credentials using
* the specified proxy Uri.
*
* @param {string} proxyUri The proxy endpoint to use.
* @return {StorageServiceSettings}
*/
StorageServiceSettings.getDevelopmentStorageAccountSettings = function (proxyUri) {
  if (!proxyUri) {
    proxyUri = StorageServiceClientConstants.DEV_STORE_URI;
  }

  var parsedUri = url.parse(proxyUri);
  var scheme = parsedUri.protocol;
  var host   = parsedUri.host;
  var prefix = scheme + '//' + host;

  var blobEndpoint = {
    primaryHost: prefix + ':10000' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT,
    secondaryHost: prefix + ':10000' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT + '-secondary'
  };

  var queueEndpoint = {
    primaryHost: prefix + ':10001' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT,
    secondaryHost: prefix + ':10001' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT + '-secondary'
  };

  var tableEndpoint = {
    primaryHost: prefix + ':10002' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT,
    secondaryHost: prefix + ':10002' + '/' + StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT + '-secondary'
  };

  return new StorageServiceSettings(
    StorageServiceClientConstants.DEVSTORE_STORAGE_ACCOUNT,
    StorageServiceClientConstants.DEVSTORE_STORAGE_ACCESS_KEY,
    null,
    blobEndpoint,
    queueEndpoint,
    tableEndpoint,
    null,
    true
  );
};

/**
* Creates StorageServiceSettings object given endpoints uri.
*
* @ignore
* @param {array}  settings         The service settings.
* @param {string} blobEndpointUri  The blob endpoint uri.
* @param {string} queueEndpointUri The queue endpoint uri.
* @param {string} tableEndpointUri The table endpoint uri.
* @param {string} fileEndpointUri  The file endpoint uri.
* @return {StorageServiceSettings}
*/
StorageServiceSettings._createStorageServiceSettings = function (settings) {
  var standardizeHost = function (host, accountName, scheme, dns){
    var storageHost;
    if (host) {
      storageHost = {};
      storageHost.primaryHost = _.isString(host) ? host : host.primaryHost;
      storageHost.secondaryHost = _.isString(host) ? undefined : host.secondaryHost;
    }

    if (scheme && accountName && dns) {
      storageHost = storageHost ? storageHost : {};
      storageHost.primaryHost = storageHost.primaryHost ? storageHost.primaryHost : url.format({ protocol: scheme, hostname: accountName + '.' + dns});
      storageHost.secondaryHost = storageHost.secondaryHost ? storageHost.secondaryHost : url.format({ protocol: scheme, hostname: accountName + '-secondary.' + dns});
    }

    return storageHost;
  };

  var scheme = util.tryGetValueInsensitive(
    ConnectionStringKeys.DEFAULT_ENDPOINTS_PROTOCOL_NAME,
    settings
  );

  var accountName = util.tryGetValueInsensitive(
    ConnectionStringKeys.ACCOUNT_NAME_NAME,
    settings
  );

  var accountKey = util.tryGetValueInsensitive(
    ConnectionStringKeys.ACCOUNT_KEY_NAME,
    settings
  );

  var sasToken = util.tryGetValueInsensitive(
    ConnectionStringKeys.SHARED_ACCESS_SIGNATURE_NAME,
    settings
  );

  var endpointSuffix = util.tryGetValueInsensitive(
    ConnectionStringKeys.ENDPOINT_SUFFIX_NAME,
    settings
  );

  var blobEndpoint = standardizeHost(
      util.tryGetValueInsensitive(ConnectionStringKeys.BLOB_ENDPOINT_NAME, settings),
      accountName,
      scheme,
      endpointSuffix ? 'blob.' + endpointSuffix : StorageServiceClientConstants.CLOUD_BLOB_HOST);

  var queueEndpoint = standardizeHost(
      util.tryGetValueInsensitive(ConnectionStringKeys.QUEUE_ENDPOINT_NAME, settings),
      accountName,
      scheme,
      endpointSuffix ? 'queue.' + endpointSuffix : StorageServiceClientConstants.CLOUD_QUEUE_HOST);

  var tableEndpoint = standardizeHost(
      util.tryGetValueInsensitive(ConnectionStringKeys.TABLE_ENDPOINT_NAME, settings),
      accountName,
      scheme,
      endpointSuffix ? 'table.' + endpointSuffix : StorageServiceClientConstants.CLOUD_TABLE_HOST);

  var fileEndpoint = standardizeHost(
      util.tryGetValueInsensitive(ConnectionStringKeys.FILE_ENDPOINT_NAME, settings),
      accountName,
      scheme,
      endpointSuffix ? 'file.' + endpointSuffix : StorageServiceClientConstants.CLOUD_FILE_HOST);


  return new StorageServiceSettings(
    accountName,
    accountKey,
    sasToken,
    blobEndpoint,
    queueEndpoint,
    tableEndpoint,
    fileEndpoint
  );
};

StorageServiceSettings.validKeys = validKeys;

exports = module.exports = StorageServiceSettings;