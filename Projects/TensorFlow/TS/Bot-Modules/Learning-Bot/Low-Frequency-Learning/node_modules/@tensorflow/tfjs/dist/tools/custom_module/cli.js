#!/usr/bin/env node
"use strict";
/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Entry point for cli tool to build custom tfjs modules
 */
var fs = require("fs");
var path = require("path");
var yargs = require("yargs");
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var util_1 = require("./util");
var types_1 = require("./types");
var esm_module_provider_1 = require("./esm_module_provider");
// Will be configured when loading the config file.
var moduleProvider;
var BASE_PATH = process.env.BASE_PATH || process.cwd();
var DEFAULT_CUSTOM_BUNDLE_ARGS = {
    entries: [],
    models: [],
    kernels: [],
    forwardModeOnly: true,
    backends: ['cpu', 'webgl'],
    moduleOptions: {},
};
var argParser = yargs.options({
    config: {
        description: 'Path to custom module config file.',
        type: 'string',
        demandOption: true
    }
});
var args = argParser.argv;
function validateArgs() {
    var configFilePath = args.config;
    if (configFilePath == null) {
        util_1.bail("Error: no config file passed");
    }
    configFilePath = path.resolve(BASE_PATH, configFilePath);
    if (!fs.existsSync(configFilePath)) {
        util_1.bail("Error: config file does not exist at " + configFilePath);
    }
    var config;
    try {
        config = JSON.parse(fs.readFileSync(configFilePath, 'utf-8'));
    }
    catch (error) {
        util_1.bail("Error could not read/parse JSON config file. \n " + error.message);
    }
    if (config.outputPath == null) {
        util_1.bail('Error: config must specify "outputPath" property');
    }
    console.log("Using custom module configuration from " + configFilePath + ".");
    var finalConfig = Object.assign({}, DEFAULT_CUSTOM_BUNDLE_ARGS, config);
    if (finalConfig.entries.length !== 0) {
        util_1.bail('Error: config.entries not yet supported');
    }
    // if (finalConfig.models.length !== 0) {
    // TODO validate that all these paths exist.
    // bail('Error: config.models not yet supported');
    // }
    for (var _i = 0, _a = finalConfig.backends; _i < _a.length; _i++) {
        var requestedBackend = _a[_i];
        if (requestedBackend !== types_1.SupportedBackends.cpu &&
            requestedBackend !== types_1.SupportedBackends.webgl &&
            requestedBackend !== types_1.SupportedBackends.wasm) {
            util_1.bail("Error: Unsupported backend specified '" + requestedBackend + "'");
        }
    }
    // Normalize the paths to absolute paths.
    function normalizePath(p) {
        return path.resolve(BASE_PATH, p);
    }
    finalConfig.models = finalConfig.models.map(normalizePath);
    finalConfig.entries = finalConfig.entries.map(normalizePath);
    finalConfig.normalizedOutputPath = normalizePath(finalConfig.outputPath);
    moduleProvider = esm_module_provider_1.getModuleProvider(finalConfig.moduleOptions);
    console.log('Final Configuration', finalConfig);
    return finalConfig;
}
function getKernelNamesForConfig(config) {
    // Later on this will do a union of kernels from entries, models and
    // kernels, (and kernels used by the converter itself) Currently we only
    // support directly listing kernels. remember that this also needs to handle
    // kernels used by gradients if forwardModeOnly is false.
    // Ops in core that are implemented as custom ops may appear in tf.profile
    // they will have __op as a suffix. These do not have corresponding backend
    // kernels so we need to filter them out.
    function isNotCustomOp(kernelName) {
        // opSuffix value is defined in tfjs-core/src/operation.ts
        // duplicating it here to avoid an export.
        return !kernelName.endsWith(tfjs_core_1.OP_SCOPE_SUFFIX);
    }
    return config.kernels.filter(isNotCustomOp);
}
var customConfig = validateArgs();
var kernelsToInclude = getKernelNamesForConfig(customConfig);
customConfig.kernels = kernelsToInclude;
if (moduleProvider != null) {
    moduleProvider.produceCustomTFJSModule(customConfig);
}
else {
    throw new Error('No module provider has been initialized.');
}
//# sourceMappingURL=cli.js.map