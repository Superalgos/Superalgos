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
import { TensorInfo } from '../kernel_registry';
import { Tensor } from '../tensor';
/**
 * Check whether updates.shape = indices.shape[:batchDim] +
 * shape[sliceDim:]
 *
 * @param x The input tensor.
 */
export declare function validateUpdateShape(shape: number[], indices: Tensor, updates: Tensor): void;
export interface ScatterShapeInfo {
    sliceRank: number;
    numUpdates: number;
    sliceSize: number;
    strides: number[];
    outputSize: number;
}
/**
 * Validate scatter nd inputs.
 *
 * @param update The tensor contains the update values.
 * @param indices The tensor contains the indices for the update values.
 * @param shape The shape of the output tensor.
 */
export declare function validateInput(updates: Tensor, indices: Tensor, shape: number[]): void;
/**
 * Calculate the shape information for the output.
 *
 * @param update The tensor contains the update values.
 * @param indices The tensor contains the indices for the update values.
 * @param shape The shape of the output tensor.
 *
 * @returns ScatterShapeInfo
 */
export declare function calculateShapes(updates: TensorInfo, indices: TensorInfo, shape: number[]): ScatterShapeInfo;
