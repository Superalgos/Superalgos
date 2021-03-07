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
import { backend_util, DepthwiseConv2dNativeBackpropInput } from '@tensorflow/tfjs-core';
import { DepthwiseConv2DDerInputProgram } from '../conv_backprop_gpu_depthwise';
export function depthwiseConv2dNativeBackpropInput(args) {
    const { inputs, backend, attrs } = args;
    const { dy, filter } = inputs;
    const { strides, dilations, pad, dimRoundingMode, inputShape } = attrs;
    const convInfo = backend_util.computeConv2DInfo(inputShape, filter.shape, strides, dilations, pad, dimRoundingMode, true /* depthwise */);
    const program = new DepthwiseConv2DDerInputProgram(convInfo);
    return backend.runWebGLProgram(program, [dy, filter], 'float32');
}
export const depthwiseConv2dNativeBackpropInputConfig = {
    kernelName: DepthwiseConv2dNativeBackpropInput,
    backendName: 'webgl',
    kernelFunc: depthwiseConv2dNativeBackpropInput
};
//# sourceMappingURL=DepthwiseConv2dNativeBackpropInput.js.map