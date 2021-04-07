/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
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
import { Cast } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import * as util from '../util';
import { op } from './operation';
/**
 * Casts a `tf.Tensor` to a new dtype.
 *
 * ```js
 * const x = tf.tensor1d([1.5, 2.5, 3]);
 * tf.cast(x, 'int32').print();
 * ```
 * @param x The input tensor to be casted.
 * @param dtype The dtype to cast the input tensor to.
 *
 * @doc {heading: 'Tensors', subheading: 'Transformations'}
 */
function cast_(x, dtype) {
    const $x = convertToTensor(x, 'x', 'cast');
    // Sanity checks.
    if (!util.isValidDtype(dtype)) {
        throw new Error(`Failed to cast to unknown dtype ${dtype}`);
    }
    if (dtype === 'string' && $x.dtype !== 'string' ||
        dtype !== 'string' && $x.dtype === 'string') {
        throw new Error('Only strings can be casted to strings');
    }
    const inputs = { x: $x };
    const attrs = { dtype };
    return ENGINE.runKernel(Cast, inputs, attrs);
}
export const cast = op({ cast_ });
//# sourceMappingURL=cast.js.map