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
import { KernelBackend } from './backends/backend';
import { Environment, setEnvironmentGlobal } from './environment';
import { getGlobalNamespace } from './global_util';
import { Add, Cast, Identity } from './kernel_names';
import { getGradient, getKernel, getKernelsForBackend } from './kernel_registry';
import { Profiler } from './profiler';
import { backpropagateGradients, getFilteredNodesXToY } from './tape';
import { setTensorTracker, Tensor, Variable } from './tensor';
import { getTensorsInContainer } from './tensor_util';
import * as util from './util';
import { bytesFromStringArray, makeOnesTypedArray, now, sizeFromShape } from './util';
function isRegisteredKernelInvocation(kernelInvocation) {
    return kernelInvocation.kernelName != null;
}
class EngineState {
    constructor() {
        // Public since optimizers will use it.
        this.registeredVariables = {};
        this.nextTapeNodeId = 0;
        this.numBytes = 0;
        this.numTensors = 0;
        this.numStringTensors = 0;
        this.numDataBuffers = 0;
        // Number of nested tf.grad() statements when computing higher-order
        // gradients. E.g. `1` for first-order gradients and `2` for second-order
        // gradients. Used to track if the tape should be removed after a backprop.
        this.gradientDepth = 0;
        // Number of nested kernel calls. When kernel depth is greater than 1, we turn
        // off the tape.
        this.kernelDepth = 0;
        this.scopeStack = [];
        /**
         * Keeps track of the number of data moves during a kernel execution. We
         * maintain a stack since kernels can call other kernels, recursively.
         */
        this.numDataMovesStack = [];
        this.nextScopeId = 0;
        this.tensorInfo = new WeakMap();
        this.profiling = false;
        this.activeProfile = {
            newBytes: 0,
            newTensors: 0,
            peakBytes: 0,
            kernels: [],
            result: null,
            get kernelNames() {
                return Array.from(new Set(this.kernels.map(k => k.name)));
            }
        };
    }
    dispose() {
        for (const variableName in this.registeredVariables) {
            this.registeredVariables[variableName].dispose();
        }
    }
}
export class Engine {
    constructor(ENV) {
        this.ENV = ENV;
        this.registry = {};
        this.registryFactory = {};
        this.pendingBackendInitId = 0;
        this.state = new EngineState();
    }
    async ready() {
        if (this.pendingBackendInit != null) {
            return this.pendingBackendInit.then(() => { });
        }
        if (this.backendInstance != null) {
            return;
        }
        const sortedBackends = this.getSortedBackends();
        for (let i = 0; i < sortedBackends.length; i++) {
            const backendName = sortedBackends[i];
            const success = await this.initializeBackend(backendName).success;
            if (success) {
                await this.setBackend(backendName);
                return;
            }
        }
        throw new Error(`Could not initialize any backends, all backend initializations ` +
            `failed.`);
    }
    get backend() {
        if (this.pendingBackendInit != null) {
            throw new Error(`Backend '${this.backendName}' has not yet been initialized. Make ` +
                `sure to await tf.ready() or await tf.setBackend() before calling ` +
                `other methods`);
        }
        if (this.backendInstance == null) {
            const { name, asyncInit } = this.initializeBackendsAndReturnBest();
            if (asyncInit) {
                throw new Error(`The highest priority backend '${name}' has not yet been ` +
                    `initialized. Make sure to await tf.ready() or ` +
                    `await tf.setBackend() before calling other methods`);
            }
            this.setBackend(name);
        }
        return this.backendInstance;
    }
    backendNames() {
        return Object.keys(this.registryFactory);
    }
    findBackend(backendName) {
        if (!(backendName in this.registry)) {
            // If the backend hasn't been initialized but we have a registry entry for
            // it, initialize it and return it.
            if (backendName in this.registryFactory) {
                const { asyncInit } = this.initializeBackend(backendName);
                if (asyncInit) {
                    // Backend is not ready yet.
                    return null;
                }
            }
            else {
                return null;
            }
        }
        return this.registry[backendName];
    }
    findBackendFactory(backendName) {
        if (!(backendName in this.registryFactory)) {
            return null;
        }
        return this.registryFactory[backendName].factory;
    }
    registerBackend(backendName, factory, priority = 1) {
        if (backendName in this.registryFactory) {
            console.warn(`${backendName} backend was already registered. ` +
                `Reusing existing backend factory.`);
            return false;
        }
        this.registryFactory[backendName] = { factory, priority };
        return true;
    }
    async setBackend(backendName) {
        if (this.registryFactory[backendName] == null) {
            throw new Error(`Backend name '${backendName}' not found in registry`);
        }
        this.backendName = backendName;
        if (this.registry[backendName] == null) {
            this.backendInstance = null;
            const { success, asyncInit } = this.initializeBackend(backendName);
            const result = asyncInit ? await success : success;
            if (!result) {
                return false;
            }
        }
        this.backendInstance = this.registry[backendName];
        this.setupRegisteredKernels();
        // Reset the profiler.
        this.profiler = new Profiler(this.backendInstance);
        return true;
    }
    setupRegisteredKernels() {
        const kernels = getKernelsForBackend(this.backendName);
        kernels.forEach(kernel => {
            if (kernel.setupFunc != null) {
                kernel.setupFunc(this.backendInstance);
            }
        });
    }
    disposeRegisteredKernels(backendName) {
        const kernels = getKernelsForBackend(backendName);
        kernels.forEach(kernel => {
            if (kernel.disposeFunc != null) {
                kernel.disposeFunc(this.registry[backendName]);
            }
        });
    }
    /**
     * Initializes a backend by looking up the backend name in the factory
     * registry and calling the factory method. Returns a boolean representing
     * whether the initialization of the backend suceeded. Throws an error if
     * there is no backend in the factory registry.
     */
    initializeBackend(backendName) {
        const registryFactoryEntry = this.registryFactory[backendName];
        if (registryFactoryEntry == null) {
            throw new Error(`Cannot initialize backend ${backendName}, no registration found.`);
        }
        try {
            const backend = registryFactoryEntry.factory();
            /* Test if the factory returns a promise.
            Done in a more liberal way than
            previous 'Promise.resolve(backend)===backend'
            as we needed to account for custom Promise
            implementations (e.g. Angular) */
            if (backend && !(backend instanceof KernelBackend) &&
                typeof backend.then === 'function') {
                const promiseId = ++this.pendingBackendInitId;
                const success = backend
                    .then(backendInstance => {
                    // Outdated promise. Another backend was set in the meantime.
                    if (promiseId < this.pendingBackendInitId) {
                        return false;
                    }
                    this.registry[backendName] = backendInstance;
                    this.pendingBackendInit = null;
                    return true;
                })
                    .catch(err => {
                    // Outdated promise. Another backend was set in the meantime.
                    if (promiseId < this.pendingBackendInitId) {
                        return false;
                    }
                    this.pendingBackendInit = null;
                    console.warn(`Initialization of backend ${backendName} failed`);
                    console.warn(err.stack || err.message);
                    return false;
                });
                this.pendingBackendInit = success;
                return { success, asyncInit: true };
            }
            else {
                this.registry[backendName] = backend;
                return { success: true, asyncInit: false };
            }
        }
        catch (err) {
            console.warn(`Initialization of backend ${backendName} failed`);
            console.warn(err.stack || err.message);
            return { success: false, asyncInit: false };
        }
    }
    removeBackend(backendName) {
        if (!(backendName in this.registryFactory)) {
            throw new Error(`${backendName} backend not found in registry`);
        }
        if (this.backendName === backendName && this.pendingBackendInit != null) {
            // There is a pending promise of the backend we want to remove. Make it
            // obsolete.
            this.pendingBackendInitId++;
        }
        if (backendName in this.registry) {
            this.disposeRegisteredKernels(backendName);
            this.registry[backendName].dispose();
            delete this.registry[backendName];
        }
        delete this.registryFactory[backendName];
        // Unset the backend if it is active.
        if (this.backendName === backendName) {
            this.pendingBackendInit = null;
            this.backendName = null;
            this.backendInstance = null;
        }
    }
    getSortedBackends() {
        if (Object.keys(this.registryFactory).length === 0) {
            throw new Error('No backend found in registry.');
        }
        return Object.keys(this.registryFactory).sort((a, b) => {
            // Highest priority comes first.
            return this.registryFactory[b].priority -
                this.registryFactory[a].priority;
        });
    }
    initializeBackendsAndReturnBest() {
        const sortedBackends = this.getSortedBackends();
        for (let i = 0; i < sortedBackends.length; i++) {
            const backendName = sortedBackends[i];
            const { success, asyncInit } = this.initializeBackend(backendName);
            if (asyncInit || success) {
                return { name: backendName, asyncInit };
            }
        }
        throw new Error(`Could not initialize any backends, all backend initializations ` +
            `failed.`);
    }
    moveData(backend, dataId) {
        const info = this.state.tensorInfo.get(dataId);
        const srcBackend = info.backend;
        const values = this.readSync(dataId);
        const refCount = srcBackend.refCount(dataId);
        // Delete the tensor from the old backend and move it to the new
        // backend.
        srcBackend.disposeData(dataId, true);
        info.backend = backend;
        backend.move(dataId, values, info.shape, info.dtype, refCount);
        if (this.shouldCheckForMemLeaks()) {
            // Track the number of moves during a kernel execution to correctly
            // detect memory leaks.
            this.state.numDataMovesStack[this.state.numDataMovesStack.length - 1]++;
        }
    }
    tidy(nameOrFn, fn) {
        let name = null;
        if (fn == null) {
            // Called with only 1 argument.
            if (typeof nameOrFn !== 'function') {
                throw new Error('Please provide a function to tidy()');
            }
            fn = nameOrFn;
        }
        else {
            // Called with 2 arguments.
            if (typeof nameOrFn !== 'string' && !(nameOrFn instanceof String)) {
                throw new Error('When calling with two arguments, the first argument ' +
                    'to tidy() must be a string');
            }
            if (typeof fn !== 'function') {
                throw new Error('When calling with two arguments, the 2nd argument ' +
                    'to tidy() must be a function');
            }
            name = nameOrFn;
            // TODO(nsthorat,smilkov): Do operation logging and performance
            // profiling.
        }
        let result;
        return this.scopedRun(() => this.startScope(name), () => this.endScope(result), () => {
            result = fn();
            if (result instanceof Promise) {
                console.error('Cannot return a Promise inside of tidy.');
            }
            return result;
        });
    }
    scopedRun(start, end, f) {
        start();
        try {
            const res = f();
            end();
            return res;
        }
        catch (ex) {
            end();
            throw ex;
        }
    }
    nextTensorId() {
        return Engine.nextTensorId++;
    }
    nextVariableId() {
        return Engine.nextVariableId++;
    }
    /**
     * This method is called instead of the public-facing tensor.clone() when
     * saving a tensor for backwards pass. It makes sure to add the clone
     * operation to the tape regardless of being called inside a kernel
     * execution.
     */
    clone(x) {
        const y = ENGINE.runKernel(Identity, { x });
        const inputs = { x };
        const grad = (dy) => ({
            x: () => {
                const dtype = 'float32';
                const gradInputs = { x: dy };
                const attrs = { dtype };
                return ENGINE.runKernel(Cast, gradInputs, 
                // tslint:disable-next-line: no-unnecessary-type-assertion
                attrs);
            }
        });
        const saved = [];
        this.addTapeNode(this.state.activeScope.name, inputs, [y], grad, saved, {});
        return y;
    }
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
    runKernel(kernelName, inputs, attrs) {
        const hasKernel = getKernel(kernelName, this.backendName) != null;
        if (!hasKernel) {
            throw new Error(`Kernel '${kernelName}' not registered for backend '${this.backendName}'`);
        }
        return this.runKernelFunc({ kernelName, inputs, attrs });
    }
    shouldCheckForMemLeaks() {
        return this.ENV.getBool('IS_TEST');
    }
    checkKernelForMemLeak(kernelName, numDataIdsBefore, outInfos) {
        const numDataIdsAfter = this.backend.numDataIds();
        // Count the number of data ids associated with the result of the kernel.
        let numOutputDataIds = 0;
        outInfos.forEach(info => {
            // Complex numbers allocate 3 data ids, one for 'real', one for
            // 'imaginary', and one for the container that holds the former two.
            numOutputDataIds += (info.dtype === 'complex64' ? 3 : 1);
        });
        // Account for the number of moves during kernel execution. A "data move"
        // can happen in the middle of a kernel execution, placing a new (key,value)
        // pair in the data storage. Since data moves have net zero effect (we
        // always remove the data from the old backend), we have to cancel them out
        // when detecting memory leaks.
        const numMoves = this.state.numDataMovesStack[this.state.numDataMovesStack.length - 1];
        const dataIdsLeaked = numDataIdsAfter - numDataIdsBefore - numOutputDataIds - numMoves;
        if (dataIdsLeaked > 0) {
            throw new Error(`Backend '${this.backendName}' has an internal memory leak ` +
                `(${dataIdsLeaked} data ids) after running '${kernelName}'`);
        }
    }
    /**
     * Internal helper method to execute a kernel Func
     *
     * Use `runKernel` to execute kernels from outside of engine.
     */
    runKernelFunc(kernelParams) {
        let outputs;
        let saved = [];
        const isTapeOn = this.isTapeOn();
        const startingBytecount = this.state.numBytes;
        const startingNumTensors = this.state.numTensors;
        if (this.shouldCheckForMemLeaks()) {
            this.state.numDataMovesStack.push(0);
        }
        let kernelFunc;
        if (this.backendName == null) {
            // backend has not been initialized yet (backend initialization is lazy
            // can be deferred until an op/ kernel is run).
            // The below getter has side effects that will try to initialize the
            // backend and set properties like this.backendName
            // tslint:disable-next-line: no-unused-expression
            this.backend;
        }
        let out;
        const kernelOrScopeName = isRegisteredKernelInvocation(kernelParams) ?
            kernelParams.kernelName :
            this.state.activeScope != null ? this.state.activeScope.name : '';
        // Create the kernelFunc from either a registered kernel OR passed in
        // forward/backward functions (used by custom grad). In this context a
        // kernelFunc wraps a kernel implementation with some bookkeeping.
        if (isRegisteredKernelInvocation(kernelParams)) {
            const { kernelName, inputs, attrs } = kernelParams;
            if (this.backendName == null) {
                // backend has not been initialized yet (backend initialization is lazy
                // can be deferred until an op/ kernel is run).
                // The below getter has side effects that will try to initialize the
                // backend and set properties like this.backendName
                // tslint:disable-next-line: no-unused-expression
                this.backend;
            }
            const kernel = getKernel(kernelName, this.backendName);
            util.assert(kernel != null, () => `Cannot find registered kernel '${kernelName}' for backend '${this.backendName}'`);
            kernelFunc = () => {
                const numDataIdsBefore = this.backend.numDataIds();
                out = kernel.kernelFunc({ inputs, attrs, backend: this.backend });
                const outInfos = Array.isArray(out) ? out : [out];
                if (this.shouldCheckForMemLeaks()) {
                    this.checkKernelForMemLeak(kernelName, numDataIdsBefore, outInfos);
                }
                const outTensors = outInfos.map((outInfo) => {
                    // todo (yassogba) remove this option (Tensor) when node backend
                    // methods have been modularized and they all return tensorInfo.
                    // TensorInfos do not have a rank attribute.
                    if (outInfo.rank != null) {
                        return outInfo;
                    }
                    const { dataId, shape, dtype } = outInfo;
                    return this.makeTensorFromDataId(dataId, shape, dtype);
                });
                // Save any required inputs and outputs.
                // Do not save unless we are recording to the tape. Otherwise it would
                // cause a mem leak since there would be no backprop for these tensors
                // (which would otherwise dispose them).
                if (isTapeOn) {
                    const tensorsToSave = this.getTensorsForGradient(kernelName, inputs, outTensors);
                    saved = this.saveTensorsForBackwardMode(tensorsToSave);
                }
                return outTensors;
            };
        }
        else {
            const { forwardFunc } = kernelParams;
            // Running a customGrad op.
            const saveFunc = (tensors) => {
                // Do not save unless we are recording to the tape. Otherwise it would
                // cause a mem leak since we would never run backprop, which disposes
                // the kept tensors.
                if (!isTapeOn) {
                    return;
                }
                saved = tensors.map(tensor => this.keep(this.clone(tensor)));
            };
            kernelFunc = () => {
                const numDataIdsBefore = this.backend.numDataIds();
                out = this.tidy(() => forwardFunc(this.backend, saveFunc));
                const outs = (Array.isArray(out) ? out : [out]);
                if (this.shouldCheckForMemLeaks()) {
                    // Scope name is used to print a more helpful error message if needed.
                    this.checkKernelForMemLeak(kernelOrScopeName, numDataIdsBefore, outs);
                }
                return outs;
            };
        }
        //
        // Run the kernelFunc. Optionally profiling it.
        //
        const { inputs, attrs } = kernelParams;
        const backwardsFunc = isRegisteredKernelInvocation(kernelParams) ?
            null :
            kernelParams.backwardsFunc;
        let kernelProfile;
        this.scopedRun(
        // Stop recording to a tape when running a kernel.
        () => this.state.kernelDepth++, () => this.state.kernelDepth--, () => {
            if (!this.ENV.getBool('DEBUG') && !this.state.profiling) {
                outputs = kernelFunc();
            }
            else {
                kernelProfile = this.profiler.profileKernel(kernelOrScopeName, inputs, () => kernelFunc());
                if (this.ENV.getBool('DEBUG')) {
                    this.profiler.logKernelProfile(kernelProfile);
                }
                outputs = kernelProfile.outputs;
            }
        });
        if (isTapeOn) {
            this.addTapeNode(kernelOrScopeName, inputs, outputs, backwardsFunc, saved, attrs);
        }
        if (this.state.profiling) {
            this.state.activeProfile.kernels.push({
                name: kernelOrScopeName,
                bytesAdded: this.state.numBytes - startingBytecount,
                totalBytesSnapshot: this.state.numBytes,
                tensorsAdded: this.state.numTensors - startingNumTensors,
                totalTensorsSnapshot: this.state.numTensors,
                inputShapes: Object.keys(inputs).map(key => inputs[key] != null ? inputs[key].shape : null),
                outputShapes: outputs.map(item => item.shape),
                kernelTimeMs: kernelProfile.timeMs,
                extraInfo: kernelProfile.extraInfo
            });
        }
        return (Array.isArray(out) ? outputs : outputs[0]);
    }
    /**
     * Saves tensors used in forward mode for use in backward mode.
     *
     * @param tensors the list of tensors to save.
     */
    saveTensorsForBackwardMode(tensors) {
        const saved = tensors.map(tensor => this.keep(this.clone(tensor)));
        return saved;
    }
    /**
     * Returns a list of tensors to save for a given gradient calculation.
     *
     * @param kernelName name of kernel to look up gradient for.
     * @param inputs a map of input tensors.
     * @param outputs an array of output tensors from forward mode of kernel.
     */
    getTensorsForGradient(kernelName, inputs, outputs) {
        const gradConfig = getGradient(kernelName);
        if (gradConfig != null) {
            const inputsToSave = gradConfig.inputsToSave || [];
            const outputsToSave = gradConfig.outputsToSave || [];
            // If saveAllInputs is true, all inputs will be saved. Otherwise, inputs
            // specified in inputsToSave will be saved.
            let inputTensorsToSave;
            if (gradConfig.saveAllInputs) {
                util.assert(Array.isArray(inputs), () => 'saveAllInputs is true, expected inputs to be an array.');
                inputTensorsToSave = Object.keys(inputs).map((key) => inputs[key]);
            }
            else {
                inputTensorsToSave = inputsToSave.map((inputName) => inputs[inputName]);
            }
            const outputTensorsToSave = outputs.filter((_, i) => outputsToSave[i]);
            return inputTensorsToSave.concat(outputTensorsToSave);
        }
        // We return an empty list rather than throw an error because the kernel we
        // are looking up may not actually be relevant to backproping through the
        // overall function
        //
        // See 'does not error if irrelevant (pruned) ops are missing grads' test
        // in gradients_test.ts for an example.
        return [];
    }
    /**
     * Internal method used by public APIs for tensor creation. Makes a new
     * tensor with the provided shape, dtype and values. It always
     * creates a new data id and writes the values to the underlying backend.
     */
    makeTensor(values, shape, dtype, backend) {
        if (values == null) {
            throw new Error('Values passed to engine.makeTensor() are null');
        }
        dtype = dtype || 'float32';
        backend = backend || this.backend;
        let backendVals = values;
        if (dtype === 'string' && util.isString(values[0])) {
            backendVals = values.map(d => util.encodeString(d));
        }
        const dataId = backend.write(backendVals, shape, dtype);
        const t = new Tensor(shape, dtype, dataId, this.nextTensorId());
        this.trackTensor(t, backend);
        // Count bytes for string tensors.
        if (dtype === 'string') {
            const info = this.state.tensorInfo.get(dataId);
            const newBytes = bytesFromStringArray(backendVals);
            this.state.numBytes += newBytes - info.bytes;
            info.bytes = newBytes;
        }
        return t;
    }
    /**
     * Internal method used by backends. Makes a new tensor
     * that is a wrapper around an existing data id. It doesn't create
     * a new data id, only increments the ref count used in memory tracking.
     */
    makeTensorFromDataId(dataId, shape, dtype, backend) {
        dtype = dtype || 'float32';
        const t = new Tensor(shape, dtype, dataId, this.nextTensorId());
        this.trackTensor(t, backend);
        return t;
    }
    makeVariable(initialValue, trainable = true, name, dtype) {
        name = name || this.nextVariableId().toString();
        if (dtype != null && dtype !== initialValue.dtype) {
            initialValue = initialValue.cast(dtype);
        }
        const v = new Variable(initialValue, trainable, name, this.nextTensorId());
        if (this.state.registeredVariables[v.name] != null) {
            throw new Error(`Variable with name ${v.name} was already registered`);
        }
        this.state.registeredVariables[v.name] = v;
        this.incRef(v, this.backend);
        return v;
    }
    trackTensor(a, backend) {
        this.state.numTensors++;
        if (a.dtype === 'string') {
            this.state.numStringTensors++;
        }
        // Bytes for complex numbers are counted by their components. Bytes for
        // string tensors are counted when writing values.
        let bytes = 0;
        if (a.dtype !== 'complex64' && a.dtype !== 'string') {
            bytes = a.size * util.bytesPerElement(a.dtype);
        }
        this.state.numBytes += bytes;
        if (!this.state.tensorInfo.has(a.dataId)) {
            this.state.numDataBuffers++;
            this.state.tensorInfo.set(a.dataId, {
                backend: backend || this.backend,
                dtype: a.dtype,
                shape: a.shape,
                bytes
            });
        }
        if (!(a instanceof Variable)) {
            this.track(a);
        }
    }
    // Track the tensor by dataId and increase the refCount for the dataId in the
    // backend.
    // TODO(pyu10055): This is currently used by makeVariable method, to increase
    // refCount on the backend for the dataId. It can potentially be replaced with
    // Identity op indead of calling backend directly.
    incRef(a, backend) {
        this.trackTensor(a, backend);
        this.backend.incRef(a.dataId);
    }
    removeDataId(dataId, backend) {
        if (this.state.tensorInfo.has(dataId) &&
            this.state.tensorInfo.get(dataId).backend === backend) {
            this.state.tensorInfo.delete(dataId);
            this.state.numDataBuffers--;
        }
    }
    disposeTensor(a) {
        if (!this.state.tensorInfo.has(a.dataId)) {
            return;
        }
        const info = this.state.tensorInfo.get(a.dataId);
        this.state.numTensors--;
        if (a.dtype === 'string') {
            this.state.numStringTensors--;
            this.state.numBytes -= info.bytes;
        }
        // Don't count bytes for complex numbers as they are counted by their
        // components.
        if (a.dtype !== 'complex64' && a.dtype !== 'string') {
            const bytes = a.size * util.bytesPerElement(a.dtype);
            this.state.numBytes -= bytes;
        }
        // Remove the reference to dataId if backend dispose the data successfully
        if (info.backend.disposeData(a.dataId)) {
            this.removeDataId(a.dataId, info.backend);
        }
        // TODO(nsthorat): Construct an error and save the stack trace for
        // debugging when in debug mode. Creating a stack trace is too expensive
        // to do unconditionally.
    }
    disposeVariables() {
        for (const varName in this.state.registeredVariables) {
            const v = this.state.registeredVariables[varName];
            this.disposeVariable(v);
        }
    }
    disposeVariable(v) {
        this.disposeTensor(v);
        if (this.state.registeredVariables[v.name] != null) {
            delete this.state.registeredVariables[v.name];
        }
    }
    memory() {
        const info = this.backend.memory();
        info.numTensors = this.state.numTensors;
        info.numDataBuffers = this.state.numDataBuffers;
        info.numBytes = this.state.numBytes;
        if (this.state.numStringTensors > 0) {
            info.unreliable = true;
            if (info.reasons == null) {
                info.reasons = [];
            }
            info.reasons.push('Memory usage by string tensors is approximate ' +
                '(2 bytes per character)');
        }
        return info;
    }
    async profile(query) {
        this.state.profiling = true;
        const startBytes = this.state.numBytes;
        const startNumTensors = this.state.numTensors;
        this.state.activeProfile.kernels = [];
        this.state.activeProfile.result = await query();
        this.state.profiling = false;
        this.state.activeProfile.peakBytes = Math.max(...this.state.activeProfile.kernels.map(d => d.totalBytesSnapshot));
        this.state.activeProfile.newBytes = this.state.numBytes - startBytes;
        this.state.activeProfile.newTensors =
            this.state.numTensors - startNumTensors;
        for (const kernel of this.state.activeProfile.kernels) {
            kernel.kernelTimeMs = await kernel.kernelTimeMs;
            kernel.extraInfo = await kernel.extraInfo;
        }
        return this.state.activeProfile;
    }
    isTapeOn() {
        return this.state.gradientDepth > 0 && this.state.kernelDepth === 0;
    }
    addTapeNode(kernelName, inputs, outputs, gradientsFunc, saved, attrs) {
        const tapeNode = { id: this.state.nextTapeNodeId++, kernelName, inputs, outputs, saved };
        const gradConfig = getGradient(kernelName);
        if (gradConfig != null) {
            gradientsFunc = gradConfig.gradFunc;
        }
        if (gradientsFunc != null) {
            tapeNode.gradient = (dys) => {
                // TODO(smilkov): To optimize back-prop, pass dys that are not used in
                // the backprop graph to the user as null instead of zeros
                dys = dys.map((dy, i) => {
                    if (dy == null) {
                        const output = outputs[i];
                        const vals = util.makeZerosTypedArray(output.size, output.dtype);
                        return this.makeTensor(vals, output.shape, output.dtype);
                    }
                    return dy;
                });
                // Grad functions of ops with single outputs expect a dy, while ops
                // with multiple outputs expect dys (array of dy).
                return gradientsFunc(dys.length > 1 ? dys : dys[0], saved, attrs);
            };
        }
        this.state.activeTape.push(tapeNode);
    }
    keep(result) {
        result.kept = true;
        return result;
    }
    startTape() {
        if (this.state.gradientDepth === 0) {
            this.state.activeTape = [];
        }
        this.state.gradientDepth++;
    }
    endTape() {
        this.state.gradientDepth--;
    }
    /**
     * Start a scope. Use this with endScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    startScope(name) {
        const scopeInfo = {
            track: [],
            name: 'unnamed scope',
            id: this.state.nextScopeId++
        };
        if (name) {
            scopeInfo.name = name;
        }
        this.state.scopeStack.push(scopeInfo);
        this.state.activeScope = scopeInfo;
    }
    /**
     * End a scope. Use this with startScope() to achieve the same functionality
     * as scope() without the need for a function closure.
     */
    endScope(result) {
        const tensorsToTrackInParent = getTensorsInContainer(result);
        const tensorsToTrackInParentSet = new Set(tensorsToTrackInParent.map(t => t.id));
        // Dispose the arrays tracked in this scope.
        for (let i = 0; i < this.state.activeScope.track.length; i++) {
            const tensor = this.state.activeScope.track[i];
            if (!tensor.kept && !tensorsToTrackInParentSet.has(tensor.id)) {
                tensor.dispose();
            }
        }
        const oldScope = this.state.scopeStack.pop();
        this.state.activeScope = this.state.scopeStack.length === 0 ?
            null :
            this.state.scopeStack[this.state.scopeStack.length - 1];
        // Track the current result in the parent scope.
        tensorsToTrackInParent.forEach(tensor => {
            // Only track the tensor if was allocated in the inner scope and is not
            // globally kept.
            if (!tensor.kept && tensor.scopeId === oldScope.id) {
                this.track(tensor);
            }
        });
    }
    /**
     * Returns gradients of `f` with respect to each of the `xs`. The gradients
     * returned are of the same length as `xs`, but some might be null if `f`
     * was not a function of that `x`. It also takes optional dy to multiply the
     * gradient, which defaults to `1`.
     */
    gradients(f, xs, dy, allowNoGradients = false) {
        util.assert(xs.length > 0, () => 'gradients() received an empty list of xs.');
        if (dy != null && dy.dtype !== 'float32') {
            throw new Error(`dy must have 'float32' dtype, but has '${dy.dtype}'`);
        }
        const y = this.scopedRun(() => this.startTape(), () => this.endTape(), () => this.tidy('forward', f));
        util.assert(y instanceof Tensor, () => 'The result y returned by f() must be a tensor.');
        // Filter out the nodes that don't connect x => y.
        const filteredTape = getFilteredNodesXToY(this.state.activeTape, xs, y);
        if (!allowNoGradients && filteredTape.length === 0 && xs.length > 0) {
            throw new Error('Cannot compute gradient of y=f(x) with respect to x. Make sure ' +
                'that the f you passed encloses all operations that lead from x ' +
                'to y.');
        }
        return this.tidy('backward', () => {
            const accumulatedGradientMap = {};
            accumulatedGradientMap[y.id] = (dy == null) ? ones(y.shape) : dy;
            // Backprop gradients through the filtered nodes.
            backpropagateGradients(accumulatedGradientMap, filteredTape, 
            // Pass the tidy function to avoid circular dep with `tape.ts`.
            f => this.tidy(f), 
            // Pass an add function to avoide a circular dep with `tape.ts`.
            add);
            const grads = xs.map(x => accumulatedGradientMap[x.id]);
            if (this.state.gradientDepth === 0) {
                // This means that we are not computing higher-order gradients
                // and can clean up the tape.
                this.state.activeTape.forEach(node => {
                    for (const tensor of node.saved) {
                        tensor.dispose();
                    }
                });
                this.state.activeTape = null;
            }
            return { value: y, grads };
        });
    }
    customGrad(f) {
        util.assert(util.isFunction(f), () => 'The f passed in customGrad(f) must be a function.');
        return (...inputs) => {
            util.assert(inputs.every(t => t instanceof Tensor), () => 'The args passed in customGrad(f)(x1, x2,...) must all be ' +
                'tensors');
            let res;
            const inputMap = {};
            inputs.forEach((input, i) => {
                inputMap[i] = input;
            });
            const forwardFunc = (_, save) => {
                res = f(...[...inputs, save]);
                util.assert(res.value instanceof Tensor, () => 'The function f passed in customGrad(f) must return an ' +
                    'object where `obj.value` is a tensor');
                util.assert(util.isFunction(res.gradFunc), () => 'The function f passed in customGrad(f) must return an ' +
                    'object where `obj.gradFunc` is a function.');
                return res.value;
            };
            const backwardsFunc = (dy, saved) => {
                const gradRes = res.gradFunc(dy, saved);
                const grads = Array.isArray(gradRes) ? gradRes : [gradRes];
                util.assert(grads.length === inputs.length, () => 'The function f passed in customGrad(f) must return an ' +
                    'object where `obj.gradFunc` is a function that returns ' +
                    'the same number of tensors as inputs passed to f(...).');
                util.assert(grads.every(t => t instanceof Tensor), () => 'The function f passed in customGrad(f) must return an ' +
                    'object where `obj.gradFunc` is a function that returns ' +
                    'a list of only tensors.');
                const gradMap = {};
                grads.forEach((grad, i) => {
                    gradMap[i] = () => grad;
                });
                return gradMap;
            };
            return this.runKernelFunc({
                forwardFunc,
                backwardsFunc,
                inputs: inputMap,
            });
        };
    }
    readSync(dataId) {
        // Route the read to the correct backend.
        const info = this.state.tensorInfo.get(dataId);
        return info.backend.readSync(dataId);
    }
    read(dataId) {
        // Route the read to the correct backend.
        const info = this.state.tensorInfo.get(dataId);
        return info.backend.read(dataId);
    }
    async time(query) {
        const start = now();
        const timingInfo = await this.backend.time(query);
        timingInfo.wallMs = now() - start;
        return timingInfo;
    }
    /**
     * Tracks a Tensor in the current scope to be automatically cleaned up
     * when the current scope ends, and returns the value.
     *
     * @param result The Tensor to track in the current scope.
     */
    track(result) {
        if (this.state.activeScope != null) {
            result.scopeId = this.state.activeScope.id;
            this.state.activeScope.track.push(result);
        }
        return result;
    }
    get registeredVariables() {
        return this.state.registeredVariables;
    }
    /**
     * Resets the engine state. Removes all backends but does not remove
     * registered backend factories.
     */
    reset() {
        // Make any pending promise obsolete.
        this.pendingBackendInitId++;
        this.state.dispose();
        this.ENV.reset();
        this.state = new EngineState();
        for (const backendName in this.registry) {
            this.disposeRegisteredKernels(backendName);
            this.registry[backendName].dispose();
            delete this.registry[backendName];
        }
        this.backendName = null;
        this.backendInstance = null;
        this.pendingBackendInit = null;
    }
}
Engine.nextTensorId = 0;
Engine.nextVariableId = 0;
function ones(shape) {
    const values = makeOnesTypedArray(sizeFromShape(shape), 'float32');
    return ENGINE.makeTensor(values, shape, 'float32');
}
export function getOrMakeEngine() {
    const ns = getGlobalNamespace();
    if (ns._tfengine == null) {
        const environment = new Environment(ns);
        ns._tfengine = new Engine(environment);
    }
    setEnvironmentGlobal(ns._tfengine.ENV);
    // Tell the current tensor interface that the global engine is responsible
    // for tracking.
    setTensorTracker(() => ns._tfengine);
    return ns._tfengine;
}
export const ENGINE = getOrMakeEngine();
/**
 * A implementation of the add op for use within engine and tape.
 *
 * This allows us to avoid a circular dependency between add.ts and engine.
 * It is exported to be available in tape tests.
 */
export function add(a, b) {
    // We duplicate Add here to avoid a circular dependency with add.ts.
    const inputs = { a, b };
    return ENGINE.runKernel(Add, inputs);
}
//# sourceMappingURL=engine.js.map