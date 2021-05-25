/**
 * @license
 * Copyright 2021 Google LLC. All Rights Reserved.
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
import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * Broadcasts parameters for evaluation on an N-D grid.
 *
 * Given N one-dimensional coordinate arrays `*args`, returns a list `outputs`
 * of N-D coordinate arrays for evaluating expressions on an N-D grid.
 *
 * Notes:
 * `meshgrid` supports cartesian ('xy') and matrix ('ij') indexing conventions.
 * When the `indexing` argument is set to 'xy' (the default), the broadcasting
 * instructions for the first two dimensions are swapped.
 * Examples:
 * Calling `const [X, Y] = meshgrid(x, y)` with the tensors
 *
 * ```javascript
 * const x = [1, 2, 3];
 * const y = [4, 5, 6];
 * const [X, Y] = tf.meshgrid(x, y);
 * // X = [[1, 2, 3],
 * //      [1, 2, 3],
 * //      [1, 2, 3]]
 * // Y = [[4, 4, 4],
 * //      [5, 5, 5],
 * //      [6, 6, 6]]
 * ```
 *
 * @param x Tensor with rank geq 1.
 * @param y Tensor with rank geq 1.
 * @param indexing
 *
 * @doc {heading: 'Operations', subheading: 'Slicing and Joining'}
 */
export declare function meshgrid<T extends Tensor>(x?: T | TensorLike, y?: T | TensorLike, { indexing }?: {
    indexing?: string;
}): T[];
