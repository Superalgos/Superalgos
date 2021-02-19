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
import { FusedConv2D } from '@tensorflow/tfjs-core';
import { applyActivation } from '../utils/fused_utils';
import { add } from './Add';
import { conv2D } from './Conv2D';
export function fusedConv2D(args) {
    const { inputs, backend, attrs } = args;
    const { x, filter, bias, preluActivationWeights } = inputs;
    const { strides, pad, dataFormat, dilations, dimRoundingMode, activation, leakyreluAlpha } = attrs;
    let result = conv2D({
        inputs: { x, filter },
        backend,
        attrs: { strides, pad, dataFormat, dilations, dimRoundingMode }
    });
    if (bias) {
        const resultOld = result;
        result = add({ inputs: { a: result, b: bias }, backend });
        backend.disposeIntermediateTensorInfo(resultOld);
    }
    if (activation) {
        const resultOld = result;
        result = applyActivation(backend, result, activation, preluActivationWeights, leakyreluAlpha);
        backend.disposeIntermediateTensorInfo(resultOld);
    }
    return result;
}
export const fusedConv2DConfig = {
    kernelName: FusedConv2D,
    backendName: 'cpu',
    kernelFunc: fusedConv2D
};
//# sourceMappingURL=FusedConv2D.js.map