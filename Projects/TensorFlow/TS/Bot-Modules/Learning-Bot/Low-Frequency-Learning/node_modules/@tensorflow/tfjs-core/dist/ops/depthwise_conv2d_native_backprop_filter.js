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
import { DepthwiseConv2dNativeBackpropFilter } from '../kernel_names';
import { op } from './operation';
import { reshape } from './reshape';
function depthwiseConv2dNativeBackpropFilter_(x, dy, filterShape, strides, pad, dilations = [1, 1], dimRoundingMode) {
    let x4D = x;
    if (x.rank === 3) {
        x4D = reshape(x, [1, x.shape[0], x.shape[1], x.shape[2]]);
    }
    let dy4D = dy;
    if (dy4D.rank === 3) {
        dy4D = reshape(dy, [1, dy.shape[0], dy.shape[1], dy.shape[2]]);
    }
    const inputs = { x: x4D, dy: dy4D };
    const attrs = { strides, pad, dimRoundingMode, dilations, filterShape };
    // tslint:disable-next-line: no-unnecessary-type-assertion
    return ENGINE.runKernel(DepthwiseConv2dNativeBackpropFilter, inputs, attrs);
}
export const depthwiseConv2dNativeBackpropFilter = op({ depthwiseConv2dNativeBackpropFilter_ });
//# sourceMappingURL=depthwise_conv2d_native_backprop_filter.js.map