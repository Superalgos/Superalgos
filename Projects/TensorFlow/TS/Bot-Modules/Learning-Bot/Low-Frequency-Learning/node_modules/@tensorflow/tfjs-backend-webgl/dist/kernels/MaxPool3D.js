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
import { backend_util, MaxPool3D } from '@tensorflow/tfjs-core';
import { Pool3DProgram } from '../pool_gpu';
export function maxPool3d(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { filterSize, strides, pad, dataFormat, dimRoundingMode } = attrs;
    const dilations = [1, 1, 1];
    const convInfo = backend_util.computePool3DInfo(x.shape, filterSize, strides, dilations, pad, dimRoundingMode, dataFormat);
    const maxPoolProgram = new Pool3DProgram(convInfo, 'max', false);
    return backend.runWebGLProgram(maxPoolProgram, [x], x.dtype);
}
export const maxPool3DConfig = {
    kernelName: MaxPool3D,
    backendName: 'webgl',
    kernelFunc: maxPool3d
};
//# sourceMappingURL=MaxPool3D.js.map