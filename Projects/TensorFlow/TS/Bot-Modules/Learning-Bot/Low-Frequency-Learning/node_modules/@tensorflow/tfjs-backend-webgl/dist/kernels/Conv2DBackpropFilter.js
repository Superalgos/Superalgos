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
import { backend_util, Conv2DBackpropFilter } from '@tensorflow/tfjs-core';
import { Conv2DDerFilterProgram } from '../conv_backprop_gpu';
export function conv2DBackpropFilter(args) {
    const { inputs, backend, attrs } = args;
    const { x, dy } = inputs;
    const { strides, pad, dataFormat, dimRoundingMode, filterShape } = attrs;
    const $dataFormat = backend_util.convertConv2DDataFormat(dataFormat);
    const convInfo = backend_util.computeConv2DInfo(x.shape, filterShape, strides, 1 /* dilations */, pad, dimRoundingMode, false /* depthwise */, $dataFormat);
    const program = new Conv2DDerFilterProgram(convInfo);
    return backend.runWebGLProgram(program, [x, dy], 'float32');
}
export const conv2DBackpropFilterConfig = {
    kernelName: Conv2DBackpropFilter,
    backendName: 'webgl',
    kernelFunc: conv2DBackpropFilter,
};
//# sourceMappingURL=Conv2DBackpropFilter.js.map