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
import { Tanh } from '../kernel_names';
import { mul } from '../ops/mul';
import { scalar } from '../ops/scalar';
import { square } from '../ops/square';
import { sub } from '../ops/sub';
export const tanhGradConfig = {
    kernelName: Tanh,
    outputsToSave: [true],
    gradFunc: (dy, saved) => {
        const [y] = saved;
        return { x: () => mul(sub(scalar(1), square(y)), dy) };
    }
};
//# sourceMappingURL=Tanh_grad.js.map