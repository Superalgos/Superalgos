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
import { ComplexInputs, KernelConfig, TensorInfo } from '@tensorflow/tfjs-core';
import { MathBackendWebGL } from '../backend_webgl';
/**
 * In WebGL data is stored in GPU textures which can't be efficiently copied, so
 * complex tensors share data with their real and imaginary components. Complex
 * tensors increment the `complexParentRefCount` properties of the underlying
 * data buckets to prevent them from being disposed, as the engine's disposal
 * logic does not account for data sharing by complex tensors.
 *
 * When a complex tensor is disposed, it will explicitly decrease the
 * `complexParentRefCount` properties of its underlying components.
 */
export declare function complex(args: {
    inputs: ComplexInputs;
    backend: MathBackendWebGL;
}): TensorInfo;
export declare const complexConfig: KernelConfig;
