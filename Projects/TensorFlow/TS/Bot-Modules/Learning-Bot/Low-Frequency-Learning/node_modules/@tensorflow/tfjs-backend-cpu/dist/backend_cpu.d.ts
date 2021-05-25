/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
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
import { backend_util, BackendTimingInfo, DataStorage, DataType, KernelBackend, Rank, Tensor, Tensor2D, TensorBuffer, TensorInfo } from '@tensorflow/tfjs-core';
interface DataId {
}
export interface TensorData<D extends DataType> {
    values?: backend_util.BackendValues;
    dtype: D;
    complexTensorInfos?: {
        real: TensorInfo;
        imag: TensorInfo;
    };
    refCount: number;
}
export declare class MathBackendCPU extends KernelBackend {
    blockSize: number;
    data: DataStorage<TensorData<DataType>>;
    private firstUse;
    constructor();
    write(values: backend_util.BackendValues, shape: number[], dtype: DataType): DataId;
    /**
     * Create a data bucket in cpu backend.
     * @param shape Shape of the `TensorInfo`.
     * @param dtype DType of the `TensorInfo`.
     * @param values The value of the `TensorInfo` stored as a flattened array.
     */
    makeTensorInfo(shape: number[], dtype: DataType, values?: backend_util.BackendValues | string[]): TensorInfo;
    /** Increase refCount of a `TensorData`. */
    incRef(dataId: DataId): void;
    /** Decrease refCount of a `TensorData`. */
    decRef(dataId: DataId): void;
    move(dataId: DataId, values: backend_util.BackendValues, shape: number[], dtype: DataType): void;
    numDataIds(): number;
    read(dataId: DataId): Promise<backend_util.BackendValues>;
    readSync(dataId: DataId): backend_util.BackendValues;
    bufferSync<R extends Rank>(t: TensorInfo): TensorBuffer<R>;
    makeOutput<T extends Tensor>(values: backend_util.BackendValues, shape: number[], dtype: DataType): T;
    disposeData(dataId: DataId): void;
    disposeIntermediateTensorInfo(tensorInfo: TensorInfo): void;
    time(f: () => void): Promise<BackendTimingInfo>;
    memory(): {
        unreliable: boolean;
        reasons: string[];
    };
    where(condition: Tensor): Tensor2D;
    dispose(): void;
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
}
export {};
