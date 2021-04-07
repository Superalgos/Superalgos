"use strict";
/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
var fs = require("fs");
var util_1 = require("./util");
function getOpsForConfig(
// tslint:disable-next-line: no-any
config, kernelToOps) {
    // This will return a list of ops used by the model.json(s) passed in.
    var results = new Set();
    var modelJson;
    for (var _i = 0, _a = config.models; _i < _a.length; _i++) {
        var modelJsonPath = _a[_i];
        try {
            modelJson = JSON.parse(fs.readFileSync(modelJsonPath, 'utf-8'));
        }
        catch (e) {
            util_1.bail("Error loading JSON file " + modelJsonPath);
        }
        var ops = getOps(modelJson, kernelToOps);
        ops.forEach(function (op) { return results.add(op); });
    }
    return Array.from(results);
}
exports.getOpsForConfig = getOpsForConfig;
function getOps(
// tslint:disable-next-line: no-any
modelJson, kernelToOp) {
    var results = new Set();
    var addOpsToResults = function (kernel) {
        var ops = kernelToOp[kernel];
        if (ops == null) {
            console.warn("Kernel => Op warning: could not find op mapping for kernel " + kernel);
        }
        ops.forEach(function (op) {
            results.add(op);
        });
    };
    var graph = modelJson.modelTopology;
    // Parse nodes
    if (graph.node != null) {
        graph.node.forEach(function (node) {
            addOpsToResults(node.op);
        });
    }
    // Parse functionDef nodes
    if (graph.library != null && graph.library.function != null) {
        graph.library.function.forEach(function (functionDef) {
            var nodeDef = functionDef.nodeDef;
            if (nodeDef != null) {
                nodeDef.forEach(function (node) {
                    addOpsToResults(node.op);
                });
            }
        });
    }
    return Array.from(results);
}
exports.getOps = getOps;
//# sourceMappingURL=model_parser.js.map