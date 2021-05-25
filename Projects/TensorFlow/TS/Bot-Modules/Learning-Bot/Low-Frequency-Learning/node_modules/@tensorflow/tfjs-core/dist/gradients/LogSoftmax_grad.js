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
import { LogSoftmax } from '../kernel_names';
import { exp } from '../ops/exp';
import { mul } from '../ops/mul';
import { sub } from '../ops/sub';
import { sum } from '../ops/sum';
export const logSoftmaxGradConfig = {
    kernelName: LogSoftmax,
    inputsToSave: [],
    outputsToSave: [true],
    gradFunc: (dy, saved, attrs) => {
        const [value] = saved;
        const { axis } = attrs;
        return {
            logits: () => {
                const keepDims = true;
                const softmax = exp(value);
                return sub(dy, mul(sum(dy, axis, keepDims), softmax));
            }
        };
    }
};
//# sourceMappingURL=LogSoftmax_grad.js.map