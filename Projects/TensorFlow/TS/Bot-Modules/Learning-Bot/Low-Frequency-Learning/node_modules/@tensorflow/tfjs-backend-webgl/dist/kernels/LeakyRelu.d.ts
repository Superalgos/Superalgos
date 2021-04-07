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
import { KernelConfig, LeakyReluAttrs, LeakyReluInputs, TensorInfo } from '@tensorflow/tfjs-core';
import { MathBackendWebGL } from '../backend_webgl';
export declare const LEAKYRELU = "return (a < 0.) ? b * a : a;";
export declare const LEAKYRELU_PACKED = "\n  vec4 aLessThanZero = vec4(lessThan(a, vec4(0.)));\n  return (aLessThanZero * (b * a)) + ((vec4(1.0) - aLessThanZero) * a);\n";
export declare function leakyRelu(args: {
    inputs: LeakyReluInputs;
    backend: MathBackendWebGL;
    attrs: LeakyReluAttrs;
}): TensorInfo;
export declare const leakyReluConfig: KernelConfig;
