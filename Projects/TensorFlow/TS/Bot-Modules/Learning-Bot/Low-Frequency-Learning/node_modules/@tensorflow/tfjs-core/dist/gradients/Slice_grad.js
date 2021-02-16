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
import { Slice } from '../kernel_names';
import { pad } from '../ops/pad';
import { parseSliceParams } from '../ops/slice_util';
export const sliceGradConfig = {
    kernelName: Slice,
    inputsToSave: ['x'],
    gradFunc: (dy, saved, attrs) => {
        const [x] = saved;
        const { begin, size } = attrs;
        const inputShape = x.shape;
        const [begin_, size_] = parseSliceParams(x, begin, size);
        // Create an Nx2 padding where the first column represents how many
        // zeros are prepended (at start) for each dimension, and the second
        // column indicates how many zeros are appended (at end).
        // The number of zeros to append is the shape of the input
        // elementwise-subtracted by both the begin vector and sizes vector.
        const paddings = [];
        for (let i = 0; i < dy.rank; i++) {
            paddings.push([begin_[i], inputShape[i] - begin_[i] - size_[i]]);
        }
        return { x: () => pad(dy, paddings) };
    }
};
//# sourceMappingURL=Slice_grad.js.map