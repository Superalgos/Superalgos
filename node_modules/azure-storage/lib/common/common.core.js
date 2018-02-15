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

var exports = module.exports;

var azureutil = require('./util/util');

require('./util/patch-xmlbuilder');

var nodeVersion = azureutil.getNodeVersion();
if (nodeVersion.major === 0 && nodeVersion.minor > 8 && !(nodeVersion.minor > 10 || (nodeVersion.minor === 10 && nodeVersion.patch >= 3))) {
  throw new Error('The Microsoft Azure node SDK does not work with node versions > 0.9.0 and < 0.10.3. Please upgrade to node >= 0.10.3');
}

exports.xmlbuilder = require('xmlbuilder');
exports.xml2js = require('xml2js');

exports.Logger = require('./diagnostics/logger');
exports.WebResource = require('./http/webresource');

// Services
exports.StorageServiceClient = require('./services/storageserviceclient');

// Models
exports.ServicePropertiesResult = require('./models/servicepropertiesresult');
exports.ServiceStatsParser = require('./models/servicestatsparser');
exports.AclResult = require('./models/aclresult');

// Filters
exports.LinearRetryPolicyFilter = require('./filters/linearretrypolicyfilter');
exports.ExponentialRetryPolicyFilter = require('./filters/exponentialretrypolicyfilter');
exports.RetryPolicyFilter = require('./filters/retrypolicyfilter');

// Signing
exports.SharedAccessSignature = require('./signing/sharedaccesssignature');
exports.SharedKey = require('./signing/sharedkey');

// Streams
exports.BatchOperation = require('./streams/batchoperation');
exports.ChunkAllocator = require('./streams/chunkallocator');
exports.ChunkStream = require('./streams/chunkstream');
exports.ChunkStreamWithStream = require('./streams/chunkstreamwithstream');
exports.SpeedSummary = require('./streams/speedsummary');
exports.BufferStream = require('./streams/bufferstream');

// Utilities
exports.Constants = require('./util/constants');
exports.SR = require('./util/sr');
exports.date = require('./util/date');
exports.ISO8061Date = require('./util/iso8061date');
exports.util = require('./util/util');
exports.validate = require('./util/validate');
exports.StorageUtilities = require('./util/storageutilities');
exports.AccessCondition = require('./util/accesscondition');