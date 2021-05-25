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
import { Tan } from '../kernel_names';
import { convertToTensor } from '../tensor_util_env';
import { op } from './operation';
/**
 * Computes tan of the input `tf.Tensor` element-wise, `tan(x)`
 *
 * ```js
 * const x = tf.tensor1d([0, Math.PI / 2, Math.PI * 3 / 4]);
 *
 * x.tan().print();  // or tf.tan(x)
 * ```
 * @param x The input tensor.
 *
 * @doc {heading: 'Operations', subheading: 'Basic math'}
 */
function tan_(x) {
    const $x = convertToTensor(x, 'x', 'tan');
    const inputs = { x: $x };
    return ENGINE.runKernel(Tan, inputs);
}
export const tan = op({ tan_ });
//# sourceMappingURL=tan.js.map