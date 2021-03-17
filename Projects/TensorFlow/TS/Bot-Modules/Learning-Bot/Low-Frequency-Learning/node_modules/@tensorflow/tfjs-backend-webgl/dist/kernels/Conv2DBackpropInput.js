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
import { backend_util, Conv2DBackpropInput } from '@tensorflow/tfjs-core';
import { Conv2DDerInputProgram } from '../conv_backprop_gpu';
export function conv2DBackpropInput(args) {
    const { inputs, backend, attrs } = args;
    const { dy, filter } = inputs;
    const { inputShape, strides, pad, dataFormat, dimRoundingMode } = attrs;
    const $dataFormat = backend_util.convertConv2DDataFormat(dataFormat);
    const convInfo = backend_util.computeConv2DInfo(inputShape, filter.shape, strides, 1 /* dilations */, pad, dimRoundingMode, false, $dataFormat);
    const program = new Conv2DDerInputProgram(convInfo);
    return backend.runWebGLProgram(program, [dy, filter], 'float32');
}
export const conv2DBackpropInputConfig = {
    kernelName: Conv2DBackpropInput,
    backendName: 'webgl',
    kernelFunc: conv2DBackpropInput,
};
//# sourceMappingURL=Conv2DBackpropInput.js.map