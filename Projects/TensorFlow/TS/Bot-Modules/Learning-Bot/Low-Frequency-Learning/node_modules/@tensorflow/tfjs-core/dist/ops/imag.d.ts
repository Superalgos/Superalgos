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
import { Tensor } from '../tensor';
import { TensorLike } from '../types';
/**
 * Returns the imaginary part of a complex (or real) tensor.
 *
 * Given a tensor input, this operation returns a tensor of type float that is
 * the imaginary part of each element in input considered as a complex number.
 * If input is real, a tensor of all zeros is returned.
 *
 * ```js
 * const x = tf.complex([-2.25, 3.25], [4.75, 5.75]);
 * tf.imag(x).print();
 * ```
 *
 * @doc {heading: 'Tensors', subheading: 'Creation'}
 */
declare function imag_<T extends Tensor>(input: T | TensorLike): T;
export declare const imag: typeof imag_;
export {};
