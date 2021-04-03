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
import { Rsqrt } from '../kernel_names';
import { div } from '../ops/div';
import { mul } from '../ops/mul';
import { neg } from '../ops/neg';
import { pow } from '../ops/pow';
export const rsqrtGradConfig = {
    kernelName: Rsqrt,
    inputsToSave: ['x'],
    gradFunc: (dy, saved) => {
        const [x] = saved;
        return { x: () => neg(div(dy, mul(pow(x, 1.5), 2))) };
    }
};
//# sourceMappingURL=Rsqrt_grad.js.map