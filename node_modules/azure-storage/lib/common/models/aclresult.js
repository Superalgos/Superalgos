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

// Module dependencies.
var _ = require('underscore');
var xmlbuilder = require('xmlbuilder');

var azureutil = require('../util/util');
var ISO8061Date = require('../util/iso8061date');
var Constants = require('../util/constants');
var AclConstants = Constants.AclConstants;

exports = module.exports;

/**
* Builds an XML representation for container acl permissions.
*
* @param  {Object.<string, AccessPolicy>}  entity The signed identifiers.
* @return {string} The XML container acl permissions.
*/
exports.serialize = function (signedIdentifiersJs) {
  var doc = xmlbuilder.create();
  doc = doc.begin(AclConstants.SIGNED_IDENTIFIERS_ELEMENT, { version: '1.0', encoding: 'utf-8' });

  var keys = Object.keys(signedIdentifiersJs);
  if (keys.length > 0) {
    keys.forEach(function (key) {
      var accessPolicy = signedIdentifiersJs[key];
      doc = doc
        .ele(AclConstants.SIGNED_IDENTIFIER_ELEMENT)
          .ele(AclConstants.ID)
            .txt(key)
          .up()
          .ele(AclConstants.ACCESS_POLICY);

      if (accessPolicy.Start) {
        var startIsoString = accessPolicy.Start;
        if (!_.isDate(startIsoString)) {
          startIsoString = new Date(startIsoString);
        }

        // Convert to expected ISO 8061 date format
        startIsoString = ISO8061Date.format(startIsoString);

        doc = doc
            .ele(AclConstants.START)
              .txt(startIsoString)
            .up();
      }

      if (accessPolicy.Expiry) {
        var expiryIsoString = accessPolicy.Expiry;
        if (!_.isDate(expiryIsoString)) {
          expiryIsoString = new Date(expiryIsoString);
        }

        // Convert to expected ISO 8061 date format
        expiryIsoString = ISO8061Date.format(expiryIsoString);

        doc = doc
            .ele(AclConstants.EXPIRY)
              .txt(expiryIsoString)
            .up();
      }

      if (accessPolicy.Permissions) {
        doc = doc
            .ele(AclConstants.PERMISSION)
              .txt(accessPolicy.Permissions)
            .up();
      }

      doc = doc.up().up();
    });
  }
  return doc.doc().toString();
};

exports.parse = function (signedIdentifiersXml) {
  var signedIdentifiers = {};

  signedIdentifiersXml = azureutil.tryGetValueChain(signedIdentifiersXml, [ 'SignedIdentifiers', 'SignedIdentifier' ]);
  if (signedIdentifiersXml) {
    if (!_.isArray(signedIdentifiersXml)) {
      signedIdentifiersXml = [ signedIdentifiersXml ];
    }

    signedIdentifiersXml.forEach(function (signedIdentifier) {
      var accessPolicy = {};
      if (signedIdentifier.AccessPolicy) {
        if (signedIdentifier.AccessPolicy.Start) {
          accessPolicy.Start = ISO8061Date.parse(signedIdentifier.AccessPolicy.Start);
        }

        if (signedIdentifier.AccessPolicy.Expiry) {
          accessPolicy.Expiry = ISO8061Date.parse(signedIdentifier.AccessPolicy.Expiry);
        }

        if (signedIdentifier.AccessPolicy.Permission) {
          accessPolicy.Permissions = signedIdentifier.AccessPolicy.Permission;
        }
      }

      signedIdentifiers[signedIdentifier.Id] = accessPolicy;
    });
  }

  return signedIdentifiers;
};