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
import { backend_util, buffer, DataStorage, engine, env, kernel_impls, KernelBackend, util } from '@tensorflow/tfjs-core';
const whereImpl = kernel_impls.whereImpl;
import { assertNotComplex } from './cpu_util';
export class MathBackendCPU extends KernelBackend {
    constructor() {
        super();
        this.blockSize = 48;
        this.firstUse = true;
        this.data = new DataStorage(this, engine());
    }
    write(values, shape, dtype) {
        if (this.firstUse) {
            this.firstUse = false;
            if (env().get('IS_NODE')) {
                backend_util.warn('\n============================\n' +
                    'Hi there 👋. Looks like you are running TensorFlow.js in ' +
                    'Node.js. To speed things up dramatically, install our node ' +
                    'backend, which binds to TensorFlow C++, by running ' +
                    'npm i @tensorflow/tfjs-node, ' +
                    'or npm i @tensorflow/tfjs-node-gpu if you have CUDA. ' +
                    'Then call require(\'@tensorflow/tfjs-node\'); (-gpu ' +
                    'suffix for CUDA) at the start of your program. ' +
                    'Visit https://github.com/tensorflow/tfjs-node for more details.' +
                    '\n============================');
            }
        }
        const dataId = {};
        this.data.set(dataId, { values, dtype, refCount: 1 });
        return dataId;
    }
    /**
     * Create a data bucket in cpu backend.
     * @param shape Shape of the `TensorInfo`.
     * @param dtype DType of the `TensorInfo`.
     * @param values The value of the `TensorInfo` stored as a flattened array.
     */
    makeTensorInfo(shape, dtype, values) {
        let outId;
        if (dtype === 'string' && values != null && values.length > 0 &&
            util.isString(values[0])) {
            const encodedValues = values.map(d => util.encodeString(d));
            outId = this.write(encodedValues, shape, dtype);
        }
        else {
            outId = this.write(values, shape, dtype);
        }
        return { dataId: outId, shape, dtype };
    }
    /** Increase refCount of a `TensorData`. */
    incRef(dataId) {
        const tensorData = this.data.get(dataId);
        tensorData.refCount++;
    }
    /** Decrease refCount of a `TensorData`. */
    decRef(dataId) {
        if (this.data.has(dataId)) {
            const tensorData = this.data.get(dataId);
            tensorData.refCount--;
        }
    }
    move(dataId, values, shape, dtype) {
        this.data.set(dataId, { values, dtype, refCount: 1 });
    }
    numDataIds() {
        return this.data.numDataIds();
    }
    async read(dataId) {
        return this.readSync(dataId);
    }
    readSync(dataId) {
        const { dtype, complexTensorInfos } = this.data.get(dataId);
        if (dtype === 'complex64') {
            const realValues = this.readSync(complexTensorInfos.real.dataId);
            const imagValues = this.readSync(complexTensorInfos.imag.dataId);
            return backend_util.mergeRealAndImagArrays(realValues, imagValues);
        }
        return this.data.get(dataId).values;
    }
    bufferSync(t) {
        const data = this.readSync(t.dataId);
        let decodedData = data;
        if (t.dtype === 'string') {
            try {
                // Decode the bytes into string.
                decodedData = data.map(d => util.decodeString(d));
            }
            catch (_a) {
                throw new Error('Failed to decode encoded string bytes into utf-8');
            }
        }
        return buffer(t.shape, t.dtype, decodedData);
    }
    makeOutput(values, shape, dtype) {
        const dataId = this.write(values, shape, dtype);
        return engine().makeTensorFromDataId(dataId, shape, dtype, this);
    }
    disposeData(dataId) {
        if (this.data.has(dataId)) {
            const { complexTensorInfos } = this.data.get(dataId);
            if (complexTensorInfos != null) {
                this.disposeData(complexTensorInfos.real.dataId);
                this.disposeData(complexTensorInfos.imag.dataId);
            }
            this.data.delete(dataId);
        }
    }
    disposeIntermediateTensorInfo(tensorInfo) {
        const dataId = tensorInfo.dataId;
        if (this.data.has(dataId)) {
            const tensorData = this.data.get(dataId);
            tensorData.refCount--;
            if (tensorData.refCount < 1) {
                this.disposeData(dataId);
            }
        }
    }
    async time(f) {
        const start = util.now();
        f();
        const kernelMs = util.now() - start;
        return { kernelMs };
    }
    memory() {
        return {
            // Unreliable due to automatic gc. The numbers above are cumulative.
            unreliable: true,
            reasons: ['The reported memory is an upper bound. Due to automatic garbage ' +
                    'collection, the true allocated memory may be less.']
        };
    }
    where(condition) {
        assertNotComplex([condition], 'where');
        const condVals = this.readSync(condition.dataId);
        return whereImpl(condition.shape, condVals);
    }
    dispose() { }
    floatPrecision() {
        return 32;
    }
    /** Returns the smallest representable number.  */
    epsilon() {
        return super.epsilon();
    }
}
//# sourceMappingURL=backend_cpu.js.map