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
import { BackendTimingInfo, DataMover, KernelBackend } from './backends/backend';
import { Environment } from './environment';
import { NamedAttrMap } from './kernel_registry';
import { TapeNode } from './tape';
import { DataId, Tensor, TensorTracker, Variable } from './tensor';
import { GradSaveFunc, NamedTensorMap, NamedVariableMap, TensorContainer } from './tensor_types';
import { BackendValues, DataType, DataValues } from './types';
/**
 * A function that computes an output. The save function is for saving tensors
 * computed in the forward pass, that we need in the backward pass.
 */
export declare type ForwardFunc<T> = (backend: KernelBackend, save?: GradSaveFunc) => T;
/**
 * @docalias (a: Tensor, b: Tensor,..., save?: Function) => {
 *   value: Tensor,
 *   gradFunc: (dy: Tensor, saved?: NamedTensorMap) => Tensor | Tensor[]
 * }
 */
export declare type CustomGradientFunc<T extends Tensor> = (...inputs: Array<Tensor | GradSaveFunc>) => {
    value: T;
    gradFunc: (dy: T, saved: Tensor[]) => Tensor | Tensor[];
};
export declare type MemoryInfo = {
    numTensors: number;
    numDataBuffers: number;
    numBytes: number;
    unreliable?: boolean;
    reasons: string[];
};
declare type KernelInfo = {
    name: string;
    bytesAdded: number;
    totalBytesSnapshot: number;
    tensorsAdded: number;
    totalTensorsSnapshot: number;
    inputShapes: number[][];
    outputShapes: number[][];
    kernelTimeMs: number | {
        error: string;
    } | Promise<number | {
        error: string;
    }>;
    extraInfo: string | Promise<string>;
};
export declare type ProfileInfo = {
    newBytes: number;
    newTensors: number;
    peakBytes: number;
    kernels: KernelInfo[];
    result: TensorContainer;
    kernelNames: string[];
};
export interface TimingInfo extends BackendTimingInfo {
    wallMs: number;
}
/** @docalias Function */
export declare type ScopeFn<T extends TensorContainer> = () => T;
interface ScopeState {
    track: Tensor[];
    name: string;
    id: number;
}
declare class EngineState {
    registeredVariables: NamedVariableMap;
    nextTapeNodeId: number;
    numBytes: number;
    numTensors: number;
    numStringTensors: number;
    numDataBuffers: number;
    activeTape: TapeNode[];
    gradientDepth: number;
    kernelDepth: number;
    activeScope: ScopeState;
    scopeStack: ScopeState[];
    /**
     * Keeps track of the number of data moves during a kernel execution. We
     * maintain a stack since kernels can call other kernels, recursively.
     */
    numDataMovesStack: number[];
    nextScopeId: number;
    tensorInfo: WeakMap<object, {
        backend: KernelBackend;
        bytes: number;
        dtype: "string" | "float32" | "int32" | "bool" | "complex64";
        shape: number[];
    }>;
    profiling: boolean;
    activeProfile: ProfileInfo;
    dispose(): void;
}
export declare class Engine implements TensorTracker, DataMover {
    ENV: Environment;
    state: EngineState;
    backendName: string;
    registry: {
        [id: string]: KernelBackend;
    };
    registryFactory: {
        [id: string]: {
            factory: () => KernelBackend | Promise<KernelBackend>;
            priority: number;
        };
    };
    private profiler;
    private backendInstance;
    private pendingBackendInit;
    private pendingBackendInitId;
    constructor(ENV: Environment);
    ready(): Promise<void>;
    readonly backend: KernelBackend;
    backendNames(): string[];
    findBackend(backendName: string): KernelBackend;
    findBackendFactory(backendName: string): () => KernelBackend | Promise<KernelBackend>;
    registerBackend(backendName: string, factory: () => KernelBackend | Promise<KernelBackend>, priority?: number): boolean;
    setBackend(backendName: string): Promise<boolean>;
    private setupRegisteredKernels;
    private disposeRegisteredKernels;
    /**
     * Initializes a backend by looking up the backend name in the factory
     * registry and calling the factory method. Returns a boolean representing
     * whether the initialization of the backend suceeded. Throws an error if
     * there is no backend in the factory registry.
     */
    private initializeBackend;
    removeBackend(backendName: string): void;
    private getSortedBackends;
    private initializeBackendsAndReturnBest;
    moveData(backend: KernelBackend, dataId: DataId): void;
    tidy<T extends TensorContainer>(nameOrFn: string | ScopeFn<T>, fn?: ScopeFn<T>): T;
    private scopedRun;
    private static nextTensorId;
    private nextTensorId;
    private static nextVariableId;
    private nextVariableId;
    /**
     * This method is called instead of the public-facing tensor.clone() when
     * saving a tensor for backwards pass. It makes sure to add the clone
     * operation to the tape regardless of being called inside a kernel
     * execution.
     */
    private clone;
    /**
     * Execute a kernel with the given name and return the output tensor.
     *
     * @param kernelName The name of the kernel to execute.
     * @param inputs A map of input names to tensors.
     * @param attrs A map of attribute names to their values. An attribute is a
     *     primitive (non-tensor) input to the kernel.
     * @param inputsToSave A list of tensors, inputs to save for the backprop
     *     computation.
     * @param outputsToSave A list of booleans, specifying which output to save
     *     for the backprop computation. These are booleans since the output
     * tensors are not visible to the user.
     */
    runKernel<T extends Tensor | Tensor[]>(kernelName: string, inputs: NamedTensorMap, attrs?: NamedAttrMap): T;
    private shouldCheckForMemLeaks;
    private checkKernelForMemLeak;
    /**
     * Internal helper method to execute a kernel Func
     *
     * Use `runKernel` to execute kernels from outside of engine.
     */
    private runKernelFunc;
    /**
     * Saves tensors used in forward mode for use in backward mode.
     *
     * @param tensors the list of tensors to save.
     */
    private saveTensorsForBackwardMode;
    /**
     * Returns a list of tensors to save for a given gradient calculation.
     *
     * @param kernelName name of kernel to look up gradient for.
     * @param inputs a map of input tensors.
     * @param outputs an array of output tensors from forward mode of kernel.
     */
    private getTensorsForGradient;
    /**
     * Internal method used by public APIs for tensor creation. Makes a new
     * tensor with the provided shape, dtype and values. It always
     * creates a new data id and writes the values to the underlying backend.
     */
    makeTensor(values: DataValues, shape: number[], dtype: DataType, backend?: KernelBackend): Tensor;
    /**
     * Internal method used by backends. Makes a new tensor
     * that is a wrapper around an existing data id. It doesn't create
     * a new data id, only increments the ref count used in memory tracking.
     */
    makeTensorFromDataId(dataId: DataId, shape: number[], dtype: DataType, backend?: KernelBackend): Tensor;
    makeVariable(initialValue: Tensor, trainable?: boolean, name?: string, dtype?: DataType): Variable;
    trackTensor(a: Tensor, backend: KernelBackend): void;
    incRef(a: Tensor, backend: KernelBackend): void;
    removeDataId(dataId: DataId, backend: KernelBackend): void;
    disposeTensor(a: Tensor): void;
    disposeVariables(): void;
    disposeVariable(v: Variable): void;
    memory(): MemoryInfo;
    profile(query: () => (TensorContainer | Promise<TensorContainer>)): Promise<ProfileInfo>;
    isTapeOn(): boolean;
    private addTapeNode;
    keep<T extends Tensor>(result: T): T;
    private startTape;
    private endTape;
    /**
     * Start a scope. Use this with endScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    startScope(name?: string): void;
    /**
     * End a scope. Use this with startScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    endScope(result?: TensorContainer): void;
    /**
     * Returns gradients of `f` with respect to each of the `xs`. The gradients
     * returned are of the same length as `xs`, but some might be null if `f`
     * was not a function of that `x`. It also takes optional dy to multiply the
     * gradient, which defaults to `1`.
     */
    gradients<T extends Tensor>(f: () => T, xs: Tensor[], dy?: T, allowNoGradients?: boolean): {
        value: T;
        grads: Tensor[];
    };
    customGrad<T extends Tensor>(f: CustomGradientFunc<T>): (...args: Array<Tensor | GradSaveFunc>) => T;
    readSync(dataId: DataId): BackendValues;
    read(dataId: DataId): Promise<BackendValues>;
    time(query: () => void): Promise<TimingInfo>;
    /**
     * Tracks a Tensor in the current scope to be automatically cleaned up
     * when the current scope ends, and returns the value.
     *
     * @param result The Tensor to track in the current scope.
     */
    private track;
    readonly registeredVariables: NamedVariableMap;
    /**
     * Resets the engine state. Removes all backends but does not remove
     * registered backend factories.
     */
    reset(): void;
}
export declare function getOrMakeEngine(): Engine;
export declare const ENGINE: Engine;
/**
 * A implementation of the add op for use within engine and tape.
 *
 * This allows us to avoid a circular dependency between add.ts and engine.
 * It is exported to be available in tape tests.
 */
export declare function add(a: Tensor, b: Tensor): Tensor;
export {};
