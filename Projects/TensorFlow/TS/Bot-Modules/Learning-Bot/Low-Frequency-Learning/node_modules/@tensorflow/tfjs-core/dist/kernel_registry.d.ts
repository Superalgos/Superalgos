import { NamedGradientMap } from './tape';
import { Tensor } from './tensor';
import { DataType, RecursiveArray } from './types';
export declare type DataId = object;
declare type AttributeValue = number | number[] | boolean | boolean[] | string | string[] | NamedAttrMap;
/** These are extra non-tensor/primitive params passed to kernel functions. */
export declare type Attribute = AttributeValue | RecursiveArray<AttributeValue>;
/** Specifies the code to run when executing a kernel. */
export declare type KernelFunc = (params: {
    inputs: NamedTensorInfoMap;
    backend: {};
    attrs?: NamedAttrMap;
}) => TensorInfo | TensorInfo[];
/** The function to run when computing a gradient during backprop. */
export declare type GradFunc = (dy: Tensor | Tensor[], saved: Tensor[], attrs: NamedAttrMap) => NamedGradientMap;
/** Function that gets called after the backend initializes. */
export declare type KernelSetupFunc = (backend: {}) => void;
/** Function that gets called right before the backend is disposed. */
export declare type KernelDisposeFunc = KernelSetupFunc;
/** Config object for registering a kernel in the global registry. */
export interface KernelConfig {
    kernelName: string;
    backendName: string;
    kernelFunc: KernelFunc;
    setupFunc?: KernelSetupFunc;
    disposeFunc?: KernelDisposeFunc;
}
/** Config object for registering a gradient in the global registry. */
export interface GradConfig {
    kernelName: string;
    inputsToSave?: string[];
    saveAllInputs?: boolean;
    outputsToSave?: boolean[];
    gradFunc: GradFunc;
}
/** Holds metadata for a given tensor. */
export interface TensorInfo {
    dataId: DataId;
    shape: number[];
    dtype: DataType;
}
export interface NamedTensorInfoMap {
    [name: string]: TensorInfo;
}
export interface NamedAttrMap {
    [name: string]: Attribute;
}
/**
 * Returns the kernel function (code) associated with the provided names.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 */
export declare function getKernel(kernelName: string, backendName: string): KernelConfig;
/**
 * Returns the registered gradient info associated with the provided kernel.
 * @param kernelName The official TF kernel name.
 */
export declare function getGradient(kernelName: string): GradConfig;
export declare function getKernelsForBackend(backendName: string): KernelConfig[];
/**
 * Registers the function (forward pass) for the kernel in a global registry.
 *
 * @param config A config object with the following properties:
 * - `kernelName` The official name of the kernel.
 * - `backendName` The official name of the backend.
 * - `kernelFunc` The function to run during the forward pass of the kernel.
 * - `setupFunc` Optional. Gets called once, after the backend initializes.
 * - `disposeFunc` Optional. Gets called once, right before the backend is
 * disposed.
 */
export declare function registerKernel(config: KernelConfig): void;
/**
 * Registers a gradient function for a given kernel in the global registry,
 * to be used during the back-propagation of that kernel.
 *
 * @param config An object with the following properties:
 * - `kernelName` The name of the kernel that the gradient function is for.
 * - `gradFunc` The function to run during back-propagation.
 */
export declare function registerGradient(config: GradConfig): void;
/**
 * Removes the kernel function from the registry.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 *
 */
export declare function unregisterKernel(kernelName: string, backendName: string): void;
/** Removes the registered gradient from the global registry. */
export declare function unregisterGradient(kernelName: string): void;
/**
 * Finds kernels that have already been registered to a backend and re-registers
 * them for a new backend. Useful for registering custom backends.
 * @param registeredBackendName Already registered backend.
 * @param newBackendName New backend.
 */
export declare function copyRegisteredKernels(registeredBackendName: string, newBackendName: string): void;
export {};
