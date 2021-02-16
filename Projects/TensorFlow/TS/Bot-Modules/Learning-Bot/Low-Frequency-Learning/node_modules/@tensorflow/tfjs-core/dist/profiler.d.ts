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
import { BackendTimer } from './backends/backend';
import { Tensor } from './tensor';
import { NamedTensorMap } from './tensor_types';
import { DataType, DataTypeMap, TypedArray } from './types';
export declare type KernelProfile = {
    kernelName: string;
    outputs: Tensor[];
    inputs: NamedTensorMap;
    timeMs: Promise<number | {
        error: string;
    }>;
    extraInfo: Promise<string>;
};
export declare class Profiler {
    private backendTimer;
    private logger?;
    constructor(backendTimer: BackendTimer, logger?: Logger);
    profileKernel(kernelName: string, inputs: NamedTensorMap, f: () => Tensor[]): KernelProfile;
    logKernelProfile(kernelProfile: KernelProfile): void;
}
export declare function checkComputationForErrors<D extends DataType>(vals: DataTypeMap[D], dtype: D, kernelName: string): boolean;
export declare class Logger {
    logKernelProfile(name: string, result: Tensor, vals: TypedArray, timeMs: number | {
        error: string;
    }, inputs: NamedTensorMap, extraInfo?: string): void;
}
