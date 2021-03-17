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
import { EluGrad, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
export function eluGrad(args) {
    const { inputs, backend } = args;
    const { dy, y } = inputs;
    assertNotComplex([dy, y], 'eluGrad');
    const resultValues = new Float32Array(util.sizeFromShape(y.shape));
    const values = backend.data.get(y.dataId).values;
    const dyValues = backend.data.get(dy.dataId).values;
    for (let i = 0; i < values.length; ++i) {
        const v = values[i];
        if (v >= 1) {
            resultValues[i] = dyValues[i];
        }
        else {
            resultValues[i] = dyValues[i] * (v + 1);
        }
    }
    return backend.makeTensorInfo(y.shape, 'float32', resultValues);
}
export const eluGradConfig = {
    kernelName: EluGrad,
    backendName: 'cpu',
    kernelFunc: eluGrad
};
//# sourceMappingURL=EluGrad.js.map