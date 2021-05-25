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
import { Backend, DataId } from '../tensor';
import { BackendValues, DataType } from '../types';
export declare const EPSILON_FLOAT32 = 1e-7;
export declare const EPSILON_FLOAT16 = 0.0001;
export interface BackendTimingInfo {
    kernelMs: number | {
        error: string;
    };
    getExtraProfileInfo?(): string;
}
export interface TensorStorage {
    read(dataId: DataId): Promise<BackendValues>;
    readSync(dataId: DataId): BackendValues;
    disposeData(dataId: DataId, force?: boolean): boolean;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId;
    move(dataId: DataId, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    memory(): {
        unreliable: boolean;
    };
    /** Returns number of data ids currently in the storage. */
    numDataIds(): number;
    refCount(dataId: DataId): number;
}
/** Convenient class for storing tensor-related data. */
export declare class DataStorage<T> {
    private backend;
    private dataMover;
    private data;
    private dataIdsCount;
    constructor(backend: KernelBackend, dataMover: DataMover);
    get(dataId: DataId): T;
    set(dataId: DataId, value: T): void;
    has(dataId: DataId): boolean;
    delete(dataId: DataId): boolean;
    numDataIds(): number;
}
export interface DataMover {
    /**
     * To be called by backends whenever they see a dataId that they don't own.
     * Upon calling this method, the mover will fetch the tensor from another
     * backend and register it with the current active backend.
     */
    moveData(backend: KernelBackend, dataId: DataId): void;
}
export interface BackendTimer {
    timerAvailable(): boolean;
    time(f: () => void): Promise<BackendTimingInfo>;
}
/**
 * The interface that defines the kernels that should be implemented when
 * adding a new backend. New backends don't need to implement every one of the
 * methods, this can be done gradually (throw an error for unimplemented
 * methods).
 */
export declare class KernelBackend implements TensorStorage, Backend, BackendTimer {
    refCount(dataId: DataId): number;
    incRef(dataId: DataId): void;
    timerAvailable(): boolean;
    time(f: () => void): Promise<BackendTimingInfo>;
    read(dataId: object): Promise<BackendValues>;
    readSync(dataId: object): BackendValues;
    numDataIds(): number;
    disposeData(dataId: object, force?: boolean): boolean;
    write(values: BackendValues, shape: number[], dtype: DataType): DataId;
    move(dataId: DataId, values: BackendValues, shape: number[], dtype: DataType, refCount: number): void;
    memory(): {
        unreliable: boolean;
        reasons?: string[];
    };
    /** Returns the highest precision for floats in bits (e.g. 16 or 32) */
    floatPrecision(): 16 | 32;
    /** Returns the smallest representable number.  */
    epsilon(): number;
    dispose(): void;
}
