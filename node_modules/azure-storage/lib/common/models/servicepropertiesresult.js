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

var Constants = require('../util/constants');
var ServicePropertiesConstants = Constants.ServicePropertiesConstants;

exports = module.exports;

function serializeRetentionPolicy(doc, policy){
  if(policy !== null){
    if (typeof policy === 'undefined'){
      policy = {};
    }

    doc = doc.ele(ServicePropertiesConstants.RETENTION_POLICY_ELEMENT);
    if (typeof policy.Enabled !== 'undefined') {
      doc = doc.ele(ServicePropertiesConstants.ENABLED_ELEMENT)
                .txt(policy.Enabled)
               .up();
    } else {
      doc = doc.ele(ServicePropertiesConstants.ENABLED_ELEMENT)
                .txt(false)
                .up();
    }

    if (typeof policy.Days !== 'undefined') {
      doc = doc.ele(ServicePropertiesConstants.DAYS_ELEMENT)
                .txt(policy.Days)
               .up();
    } else if (policy.Enabled === true){
      doc = doc.ele(ServicePropertiesConstants.DAYS_ELEMENT)
                .txt(1)
                .up();
    }

    doc = doc.up();
  }
}

function serializeLogging(doc, logging){
  if (typeof logging.Version !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.VERSION_ELEMENT)
            .txt(logging.Version)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.VERSION_ELEMENT)
        .txt(ServicePropertiesConstants.DEFAULT_ANALYTICS_VERSION)
      .up();
  }

  if (typeof logging.Delete !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.DELETE_ELEMENT)
            .txt(logging.Delete)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.DELETE_ELEMENT)
        .txt(false)
      .up();
  }

  if (typeof logging.Read !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.READ_ELEMENT)
            .txt(logging.Read)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.READ_ELEMENT)
        .txt(false)
      .up();
  }

  if (typeof logging.Write !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.WRITE_ELEMENT)
            .txt(logging.Write)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.WRITE_ELEMENT)
        .txt(false)
      .up();
  }

  serializeRetentionPolicy(doc, logging.RetentionPolicy);

  doc = doc.up();
}

function serializeMetrics(doc, metrics){
  if (typeof metrics.Version !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.VERSION_ELEMENT)
            .txt(metrics.Version)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.VERSION_ELEMENT)
        .txt(ServicePropertiesConstants.DEFAULT_ANALYTICS_VERSION)
      .up();
  }

  if (typeof metrics.Enabled !== 'undefined') {
    doc = doc.ele(ServicePropertiesConstants.ENABLED_ELEMENT)
            .txt(metrics.Enabled)
          .up();
  } else {
    doc = doc.ele(ServicePropertiesConstants.ENABLED_ELEMENT)
        .txt(false)
      .up();
  }

  if(metrics.Enabled) {
    if (typeof metrics.IncludeAPIs !== 'undefined') {
      doc = doc.ele(ServicePropertiesConstants.INCLUDE_APIS_ELEMENT)
              .txt(metrics.IncludeAPIs)
            .up();
    } else if (metrics.Enabled === true){
      doc = doc.ele(ServicePropertiesConstants.INCLUDE_APIS_ELEMENT)
          .txt(false)
        .up();
    }
  }
  serializeRetentionPolicy(doc, metrics.RetentionPolicy);
}

function serializeCorsRules(doc, rules){
  if(typeof rules !== 'undefined' && rules !== null && _.isArray(rules)){
    rules.forEach(function (rule) {
      doc = doc.ele(ServicePropertiesConstants.CORS_RULE_ELEMENT);
      
      if(typeof rule.AllowedMethods !== 'undefined' && _.isArray(rule.AllowedMethods)){
        doc = doc.ele(ServicePropertiesConstants.ALLOWED_METHODS_ELEMENT)
                .txt(rule.AllowedMethods.join(','))
                .up();
      }

      if(typeof rule.AllowedOrigins !== 'undefined' && _.isArray(rule.AllowedOrigins)){
        doc = doc.ele(ServicePropertiesConstants.ALLOWED_ORIGINS_ELEMENT)
                .txt(rule.AllowedOrigins.join(','))
                .up();
      }

      if(typeof rule.AllowedHeaders !== 'undefined' && _.isArray(rule.AllowedHeaders)){
        doc = doc.ele(ServicePropertiesConstants.ALLOWED_HEADERS_ELEMENT)
                .txt(rule.AllowedHeaders.join(','))
                .up();
      } else {
        doc = doc.ele(ServicePropertiesConstants.ALLOWED_HEADERS_ELEMENT)
                .txt('')
                .up();
      }

      if(typeof rule.ExposedHeaders !== 'undefined' && _.isArray(rule.ExposedHeaders)){
        doc = doc.ele(ServicePropertiesConstants.EXPOSED_HEADERS_ELEMENT)
                .txt(rule.ExposedHeaders.join(','))
                .up();
      } else {
        doc = doc.ele(ServicePropertiesConstants.EXPOSED_HEADERS_ELEMENT)
                .txt('')
                .up();
      }

      if(typeof rule.MaxAgeInSeconds !== 'undefined'){
        doc = doc.ele(ServicePropertiesConstants.MAX_AGE_IN_SECONDS_ELEMENT)
                .txt(rule.MaxAgeInSeconds)
                .up();
      } else {
        doc = doc.ele(ServicePropertiesConstants.MAX_AGE_IN_SECONDS_ELEMENT)
                .txt('0')
                .up();
      }

      doc = doc.up();
    });
  }
}

exports.serialize = function (servicePropertiesJs) {
  var doc = xmlbuilder.create();
  doc = doc.begin(ServicePropertiesConstants.STORAGE_SERVICE_PROPERTIES_ELEMENT, { version: '1.0', encoding: 'utf-8' });

  if (servicePropertiesJs.Logging) {
    doc = doc.ele(ServicePropertiesConstants.LOGGING_ELEMENT);
    serializeLogging(doc, servicePropertiesJs.Logging);
    doc = doc.up();
  }

  if (servicePropertiesJs.HourMetrics) {
    doc = doc.ele(ServicePropertiesConstants.HOUR_METRICS_ELEMENT);
    serializeMetrics(doc, servicePropertiesJs.HourMetrics);
    doc = doc.up();
  }

  if (servicePropertiesJs.MinuteMetrics) {
    doc = doc.ele(ServicePropertiesConstants.MINUTE_METRICS_ELEMENT);
    serializeMetrics(doc, servicePropertiesJs.MinuteMetrics);
    doc = doc.up();
  }

  if (servicePropertiesJs.Cors) {
    doc = doc.ele(ServicePropertiesConstants.CORS_ELEMENT);
    serializeCorsRules(doc, servicePropertiesJs.Cors.CorsRule);
    doc = doc.up();
  }

  if (servicePropertiesJs.DefaultServiceVersion) {
    doc = doc.ele(ServicePropertiesConstants.DEFAULT_SERVICE_VERSION_ELEMENT)
               .txt(servicePropertiesJs.DefaultServiceVersion)
             .up();
  }

  return doc.doc().toString();
};

function parseRetentionPolicy(policyXml){
    var policy = {};

    if (typeof policyXml.Enabled !== 'undefined') {
      policy.Enabled = policyXml.Enabled === 'true';
    }

    if (typeof policyXml.Days !== 'undefined') {
      policy.Days = parseInt(policyXml.Days, 10);
    }

    return policy;
}

function parseLogging(loggingXml){
  var logging = {};

  if (typeof loggingXml.Version !== 'undefined') {
    logging.Version = loggingXml.Version;
  }

  if (typeof loggingXml.Delete !== 'undefined') {
    logging.Delete = loggingXml.Delete === 'true';
  }

  if (typeof loggingXml.Read !== 'undefined') {
    logging.Read = loggingXml.Read === 'true';
  }

  if (typeof loggingXml.Write !== 'undefined') {
    logging.Write = loggingXml.Write === 'true';
  }

  if (typeof loggingXml.RetentionPolicy !== 'undefined') {
    logging.RetentionPolicy = parseRetentionPolicy(loggingXml.RetentionPolicy);
  }

  return logging;
}

function parseMetrics(metricsXml){
  var metrics = {};

  if (typeof metricsXml.Version !== 'undefined') {
    metrics.Version = metricsXml.Version;
  }

  if (typeof metricsXml.Enabled !== 'undefined') {
    metrics.Enabled = metricsXml.Enabled === 'true';
  }

  if (typeof metricsXml.IncludeAPIs !== 'undefined') {
    metrics.IncludeAPIs = metricsXml.IncludeAPIs === 'true';
  }

  if (typeof metricsXml.RetentionPolicy !== 'undefined') {
    metrics.RetentionPolicy = parseRetentionPolicy(metricsXml.RetentionPolicy);
  }

  return metrics;
}

function parseCors(corsXml){
  var cors = {};

  if (typeof corsXml.CorsRule !== 'undefined') {
    var rulesXml = corsXml.CorsRule;
    if (!_.isArray(rulesXml)) {
        rulesXml = [ rulesXml ];
    }

    cors.CorsRule = [];
    rulesXml.forEach(function (ruleXml) {
      var rule = {};

      if(typeof ruleXml.AllowedMethods !== 'undefined'){
        if(ruleXml.AllowedMethods  !== ''){
          rule.AllowedMethods = ruleXml.AllowedMethods.split(',');
        }
        else {
          rule.AllowedMethods = [];
        }
      }

      if(typeof ruleXml.AllowedOrigins !== 'undefined'){
        if(ruleXml.AllowedOrigins  !== ''){
          rule.AllowedOrigins = ruleXml.AllowedOrigins.split(',');
        }
        else {
          rule.AllowedOrigins = [];
        }
      }

      if(typeof ruleXml.AllowedHeaders !== 'undefined'){
        if(ruleXml.AllowedHeaders  !== ''){
          rule.AllowedHeaders = ruleXml.AllowedHeaders.split(',');
        }
        else {
          rule.AllowedHeaders = [];
        }
      }

      if(typeof ruleXml.ExposedHeaders !== 'undefined'){
        if(ruleXml.ExposedHeaders  !== ''){
          rule.ExposedHeaders = ruleXml.ExposedHeaders.split(',');
        }
        else {
          rule.ExposedHeaders = [];
        }
      }

      if(typeof ruleXml.MaxAgeInSeconds !== 'undefined'){
        rule.MaxAgeInSeconds = parseInt(ruleXml.MaxAgeInSeconds, 10);
      }

      cors.CorsRule.push(rule);
    });
  }

  return cors;
}

exports.parse = function (servicePropertiesXml) {
  var serviceProperties = {};

  if (typeof servicePropertiesXml.Logging !== 'undefined') {
    serviceProperties.Logging = parseLogging(servicePropertiesXml.Logging); 
  }

  if (typeof servicePropertiesXml.HourMetrics !== 'undefined') {
    serviceProperties.HourMetrics = parseMetrics(servicePropertiesXml.HourMetrics);
  }

  if (typeof servicePropertiesXml.MinuteMetrics !== 'undefined') {
    serviceProperties.MinuteMetrics = parseMetrics(servicePropertiesXml.MinuteMetrics);
  }

  if (typeof servicePropertiesXml.Cors !== 'undefined') {
    serviceProperties.Cors = parseCors(servicePropertiesXml.Cors);
  }

  if (typeof servicePropertiesXml.DefaultServiceVersion !== 'undefined') {
    serviceProperties.DefaultServiceVersion = servicePropertiesXml.DefaultServiceVersion;
  }

  return serviceProperties;
};