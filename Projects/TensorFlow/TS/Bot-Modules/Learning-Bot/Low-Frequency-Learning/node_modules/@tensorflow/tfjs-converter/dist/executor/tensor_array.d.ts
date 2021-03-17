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
import { DataType, Tensor } from '@tensorflow/tfjs-core';
export interface TensorWithState {
    tensor?: Tensor;
    written?: boolean;
    read?: boolean;
    cleared?: boolean;
}
/**
 * The TensorArray object keeps an array of Tensors.  It
 * allows reading from the array and writing to the array.
 */
export declare class TensorArray {
    readonly name: string;
    readonly dtype: DataType;
    private maxSize;
    private elementShape;
    readonly identicalElementShapes: boolean;
    readonly dynamicSize: boolean;
    readonly clearAfterRead: boolean;
    private tensors;
    private closed_;
    readonly idTensor: Tensor;
    constructor(name: string, dtype: DataType, maxSize: number, elementShape: number[], identicalElementShapes: boolean, dynamicSize: boolean, clearAfterRead: boolean);
    readonly id: number;
    readonly closed: boolean;
    /**
     * Dispose the tensors and idTensor and mark the TensoryArray as closed.
     */
    clearAndClose(keepIds?: Set<number>): void;
    size(): number;
    /**
     * Read the value at location index in the TensorArray.
     * @param index Number the index to read from.
     */
    read(index: number): Tensor;
    /**
     * Helper method to read multiple tensors from the specified indices.
     */
    readMany(indices: number[]): Tensor[];
    /**
     * Write value into the index of the TensorArray.
     * @param index number the index to write to.
     * @param tensor
     */
    write(index: number, tensor: Tensor): void;
    /**
     * Helper method to write multiple tensors to the specified indices.
     */
    writeMany(indices: number[], tensors: Tensor[]): void;
    /**
     * Return selected values in the TensorArray as a packed Tensor. All of
     * selected values must have been written and their shapes must all match.
     * @param [indices] number[] Optional. Taking values in [0, max_value). If the
     *    TensorArray is not dynamic, max_value=size(). If not specified returns
     *    all tensors in the original order.
     * @param [dtype]
     */
    gather(indices?: number[], dtype?: DataType): Tensor;
    /**
     * Return the values in the TensorArray as a concatenated Tensor.
     */
    concat(dtype?: DataType): Tensor;
    /**
     * Scatter the values of a Tensor in specific indices of a TensorArray.
     * @param indices nummber[] values in [0, max_value). If the
     *    TensorArray is not dynamic, max_value=size().
     * @param tensor Tensor input tensor.
     */
    scatter(indices: number[], tensor: Tensor): void;
    /**
     * Split the values of a Tensor into the TensorArray.
     * @param length number[] with the lengths to use when splitting value along
     *    its first dimension.
     * @param tensor Tensor, the tensor to split.
     */
    split(length: number[], tensor: Tensor): void;
}
