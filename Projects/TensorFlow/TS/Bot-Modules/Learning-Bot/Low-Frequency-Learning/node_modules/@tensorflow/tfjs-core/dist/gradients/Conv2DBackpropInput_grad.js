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
import { Conv2DBackpropInput } from '../kernel_names';
import { conv2d } from '../ops/conv2d';
import { conv2DBackpropFilter } from '../ops/conv2d_backprop_filter';
export const conv2DBackpropInputGradConfig = {
    kernelName: Conv2DBackpropInput,
    inputsToSave: ['dy', 'filter'],
    gradFunc: (ddx, saved, attrs) => {
        const [dy, filter] = saved;
        const { strides, pad, dataFormat, dimRoundingMode } = attrs;
        return {
            dy: () => conv2d(ddx, filter, strides, pad, dataFormat, 1 /* dilations */, dimRoundingMode),
            filter: () => conv2DBackpropFilter(ddx, dy, filter.shape, strides, pad, dataFormat, dimRoundingMode)
        };
    }
};
//# sourceMappingURL=Conv2DBackpropInput_grad.js.map