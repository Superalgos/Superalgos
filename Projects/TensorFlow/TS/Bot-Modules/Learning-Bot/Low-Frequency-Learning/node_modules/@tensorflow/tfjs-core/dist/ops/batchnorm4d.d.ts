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
import { Tensor1D, Tensor4D } from '../tensor';
import { TensorLike } from '../types';
/**
 * Batch normalization, strictly for 4D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
declare function batchNorm4d_(x: Tensor4D | TensorLike, mean: Tensor4D | Tensor1D | TensorLike, variance: Tensor4D | Tensor1D | TensorLike, offset?: Tensor4D | Tensor1D | TensorLike, scale?: Tensor4D | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor4D;
export declare const batchNorm4d: typeof batchNorm4d_;
export {};
