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
/** An implementation of the TopK kernel shared between webgl and cpu. */
import { NumericDataType, Rank, Tensor, TensorBuffer, TypedArray } from '@tensorflow/tfjs-core';
export declare function topKImpl<T extends Tensor, R extends Rank>(x: TypedArray, xShape: number[], xDtype: NumericDataType, k: number, sorted: boolean): [TensorBuffer<R, NumericDataType>, TensorBuffer<R, 'int32'>];
