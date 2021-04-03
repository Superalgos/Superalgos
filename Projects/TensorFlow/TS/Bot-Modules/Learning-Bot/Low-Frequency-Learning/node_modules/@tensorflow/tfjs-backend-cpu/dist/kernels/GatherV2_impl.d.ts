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
import { DataType, Rank, TensorBuffer } from '@tensorflow/tfjs-core';
export declare function gatherV2Impl<R extends Rank, D extends DataType>(xBuf: TensorBuffer<R, D>, indicesBuf: TensorBuffer<R, D>, flattenOutputShape: number[]): TensorBuffer<R, D>;
