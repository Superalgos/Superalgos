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
import { MaxPool } from '../kernel_names';
import { maxPoolGrad } from '../ops/max_pool_grad';
export const maxPoolGradConfig = {
    kernelName: MaxPool,
    inputsToSave: ['x'],
    outputsToSave: [true],
    gradFunc: (dy, saved, attrs) => {
        const [x, y] = saved;
        const { filterSize, strides, pad } = attrs;
        return {
            x: () => maxPoolGrad(dy, x, y, filterSize, strides, pad)
        };
    }
};
//# sourceMappingURL=MaxPool_grad.js.map