/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
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
import { env } from './environment';
import { getGlobal } from './global_util';
const kernelRegistry = getGlobal('kernelRegistry', () => new Map());
const gradRegistry = getGlobal('gradRegistry', () => new Map());
/**
 * Returns the kernel function (code) associated with the provided names.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 */
export function getKernel(kernelName, backendName) {
    const key = makeKey(kernelName, backendName);
    return kernelRegistry.get(key);
}
/**
 * Returns the registered gradient info associated with the provided kernel.
 * @param kernelName The official TF kernel name.
 */
export function getGradient(kernelName) {
    return gradRegistry.get(kernelName);
}
export function getKernelsForBackend(backendName) {
    const it = kernelRegistry.entries();
    const result = [];
    while (true) {
        const { done, value } = it.next();
        if (done) {
            break;
        }
        const [key, config] = value;
        const [backend,] = key.split('_');
        if (backend === backendName) {
            result.push(config);
        }
    }
    return result;
}
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
export function registerKernel(config) {
    const { kernelName, backendName } = config;
    const key = makeKey(kernelName, backendName);
    if (kernelRegistry.has(key)) {
        console.warn(`The kernel '${kernelName}' for backend ` +
            `'${backendName}' is already registered`);
    }
    kernelRegistry.set(key, config);
}
/**
 * Registers a gradient function for a given kernel in the global registry,
 * to be used during the back-propagation of that kernel.
 *
 * @param config An object with the following properties:
 * - `kernelName` The name of the kernel that the gradient function is for.
 * - `gradFunc` The function to run during back-propagation.
 */
export function registerGradient(config) {
    const { kernelName } = config;
    if (gradRegistry.has(kernelName)) {
        // TODO (yassogba) after 3.0 assess whether we need to keep this gated
        // to debug mode.
        if (env().getBool('DEBUG')) {
            console.warn(`Overriding the gradient for '${kernelName}'`);
        }
    }
    gradRegistry.set(kernelName, config);
}
/**
 * Removes the kernel function from the registry.
 *
 * @param kernelName The official name of the kernel.
 * @param backendName The official name of the backend.
 *
 */
export function unregisterKernel(kernelName, backendName) {
    const key = makeKey(kernelName, backendName);
    if (!kernelRegistry.has(key)) {
        throw new Error(`The kernel '${kernelName}' for backend ` +
            `'${backendName}' is not registered`);
    }
    kernelRegistry.delete(key);
}
/** Removes the registered gradient from the global registry. */
export function unregisterGradient(kernelName) {
    if (!gradRegistry.has(kernelName)) {
        throw new Error(`The gradient '${kernelName}' for backend is not registered`);
    }
    gradRegistry.delete(kernelName);
}
/**
 * Finds kernels that have already been registered to a backend and re-registers
 * them for a new backend. Useful for registering custom backends.
 * @param registeredBackendName Already registered backend.
 * @param newBackendName New backend.
 */
export function copyRegisteredKernels(registeredBackendName, newBackendName) {
    const kernels = getKernelsForBackend(registeredBackendName);
    kernels.forEach(kernelConfig => {
        const newKernelConfig = Object.assign({}, kernelConfig, { backendName: newBackendName });
        registerKernel(newKernelConfig);
    });
}
function makeKey(kernelName, backendName) {
    return `${backendName}_${kernelName}`;
}
//# sourceMappingURL=kernel_registry.js.map