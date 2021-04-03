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
import { Conv3DBackpropFilterV2Attrs, Conv3DBackpropFilterV2Inputs, KernelConfig } from '@tensorflow/tfjs-core';
import { MathBackendWebGL } from '../backend_webgl';
export declare function conv3DBackpropFilterV2(args: {
    inputs: Conv3DBackpropFilterV2Inputs;
    attrs: Conv3DBackpropFilterV2Attrs;
    backend: MathBackendWebGL;
}): import("@tensorflow/tfjs-core").TensorInfo;
export declare const conv3DBackpropFilterV2Config: KernelConfig;
