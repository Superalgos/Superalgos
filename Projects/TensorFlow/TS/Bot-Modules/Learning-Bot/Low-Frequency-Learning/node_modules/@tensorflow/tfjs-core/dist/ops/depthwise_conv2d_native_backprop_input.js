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
import { ENGINE } from '../engine';
import { DepthwiseConv2dNativeBackpropInput } from '../kernel_names';
import { op } from './operation';
import { reshape } from './reshape';
function depthwiseConv2dNativeBackpropInput_(xShape, dy, filter, strides, pad, dilations = [1, 1], dimRoundingMode) {
    let dy4D = dy;
    let reshapedTo4D = false;
    if (dy.rank === 3) {
        reshapedTo4D = true;
        dy4D = reshape(dy, [1, dy.shape[0], dy.shape[1], dy.shape[2]]);
    }
    const inputs = { dy: dy4D, filter };
    const attrs = { strides, pad, dimRoundingMode, dilations, inputShape: xShape };
    const res = 
    // tslint:disable-next-line: no-unnecessary-type-assertion
    ENGINE.runKernel(DepthwiseConv2dNativeBackpropInput, inputs, attrs);
    if (reshapedTo4D) {
        return reshape(res, [res.shape[1], res.shape[2], res.shape[3]]);
    }
    return res;
}
export const depthwiseConv2dNativeBackpropInput = op({ depthwiseConv2dNativeBackpropInput_ });
//# sourceMappingURL=depthwise_conv2d_native_backprop_input.js.map