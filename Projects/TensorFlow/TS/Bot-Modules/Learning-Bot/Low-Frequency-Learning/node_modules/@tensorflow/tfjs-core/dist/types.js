/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
export var Rank;
(function (Rank) {
    Rank["R0"] = "R0";
    Rank["R1"] = "R1";
    Rank["R2"] = "R2";
    Rank["R3"] = "R3";
    Rank["R4"] = "R4";
    Rank["R5"] = "R5";
    Rank["R6"] = "R6";
})(Rank || (Rank = {}));
// Looks for upcasting types. Used, for example, in operations with mixed dtype
// inputs.
var UpcastInt32AndMap;
(function (UpcastInt32AndMap) {
    UpcastInt32AndMap["float32"] = "float32";
    UpcastInt32AndMap["int32"] = "int32";
    UpcastInt32AndMap["bool"] = "int32";
    UpcastInt32AndMap["complex64"] = "complex64";
})(UpcastInt32AndMap || (UpcastInt32AndMap = {}));
var UpcastBoolAndMap;
(function (UpcastBoolAndMap) {
    UpcastBoolAndMap["float32"] = "float32";
    UpcastBoolAndMap["int32"] = "int32";
    UpcastBoolAndMap["bool"] = "bool";
    UpcastBoolAndMap["complex64"] = "complex64";
})(UpcastBoolAndMap || (UpcastBoolAndMap = {}));
var UpcastFloat32AndMap;
(function (UpcastFloat32AndMap) {
    UpcastFloat32AndMap["float32"] = "float32";
    UpcastFloat32AndMap["int32"] = "float32";
    UpcastFloat32AndMap["bool"] = "float32";
    UpcastFloat32AndMap["complex64"] = "complex64";
})(UpcastFloat32AndMap || (UpcastFloat32AndMap = {}));
var UpcastComplex64AndMap;
(function (UpcastComplex64AndMap) {
    UpcastComplex64AndMap["float32"] = "complex64";
    UpcastComplex64AndMap["int32"] = "complex64";
    UpcastComplex64AndMap["bool"] = "complex64";
    UpcastComplex64AndMap["complex64"] = "complex64";
})(UpcastComplex64AndMap || (UpcastComplex64AndMap = {}));
const upcastTypeMap = {
    'float32': UpcastFloat32AndMap,
    'int32': UpcastInt32AndMap,
    'bool': UpcastBoolAndMap,
    'complex64': UpcastComplex64AndMap
};
export function upcastType(typeA, typeB) {
    if (typeA === 'string' || typeB === 'string') {
        if (typeA === 'string' && typeB === 'string') {
            return 'string';
        }
        throw new Error(`Can not upcast ${typeA} with ${typeB}`);
    }
    return upcastTypeMap[typeA][typeB];
}
/** Returns the output type after summation. */
export function sumOutType(type) {
    return upcastType(type, 'int32');
}
//# sourceMappingURL=types.js.map