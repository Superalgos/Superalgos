/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { Softmax } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import { op } from './operation';
/**
 * Computes the softmax normalized vector given the logits.
 *
 * ```js
 * const a = tf.tensor1d([1, 2, 3]);
 *
 * a.softmax().print();  // or tf.softmax(a)
 * ```
 *
 * ```js
 * const a = tf.tensor2d([2, 4, 6, 1, 2, 3], [2, 3]);
 *
 * a.softmax().print();  // or tf.softmax(a)
 * ```
 *
 * @param logits The logits array.
 * @param dim The dimension softmax would be performed on. Defaults to `-1`
 *     which indicates the last dimension.
 *
 * @doc {heading: 'Operations', subheading: 'Normalization'}
 */
function softmax_(logits, dim = -1) {
    const $logits = convertToTensor(logits, 'logits', 'softmax', 'float32');
    if (dim === -1) {
        dim = $logits.rank - 1;
    }
    if (dim !== $logits.rank - 1) {
        throw Error('Softmax along a non-last dimension is not yet supported. ' +
            `Logits was rank ${$logits.rank} and dim was ${dim}`);
    }
    const inputs = { logits: $logits };
    const attrs = { dim };
    return ENGINE.runKernel(Softmax, inputs, attrs);
}
export const softmax = op({ softmax_ });
//# sourceMappingURL=softmax.js.map