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
import { Tensor1D, Tensor2D } from '../tensor';
import { TensorLike } from '../types';
/**
 * Batch normalization, strictly for 2D. For the more relaxed version, see
 * `tf.batchNorm`.
 *
 * @param x The input Tensor.
 * @param mean A mean Tensor.
 * @param variance A variance Tensor.
 * @param offset An offset Tensor.
 * @param scale A scale Tensor.
 * @param varianceEpsilon A small float number to avoid dividing by 0.
 */
declare function batchNorm2d_(x: Tensor2D | TensorLike, mean: Tensor2D | Tensor1D | TensorLike, variance: Tensor2D | Tensor1D | TensorLike, offset?: Tensor2D | Tensor1D | TensorLike, scale?: Tensor2D | Tensor1D | TensorLike, varianceEpsilon?: number): Tensor2D;
export declare const batchNorm2d: typeof batchNorm2d_;
export {};
