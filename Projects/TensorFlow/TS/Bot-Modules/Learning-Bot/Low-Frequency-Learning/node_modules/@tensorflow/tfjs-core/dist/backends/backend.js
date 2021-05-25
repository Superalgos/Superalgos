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
export const EPSILON_FLOAT32 = 1e-7;
export const EPSILON_FLOAT16 = 1e-4;
/** Convenient class for storing tensor-related data. */
export class DataStorage {
    constructor(backend, dataMover) {
        this.backend = backend;
        this.dataMover = dataMover;
        this.data = new WeakMap();
        this.dataIdsCount = 0;
    }
    get(dataId) {
        if (!this.data.has(dataId)) {
            this.dataMover.moveData(this.backend, dataId);
        }
        return this.data.get(dataId);
    }
    set(dataId, value) {
        this.dataIdsCount++;
        this.data.set(dataId, value);
    }
    has(dataId) {
        return this.data.has(dataId);
    }
    delete(dataId) {
        this.dataIdsCount--;
        return this.data.delete(dataId);
    }
    numDataIds() {
        return this.dataIdsCount;
    }
}
/**
 * The interface that defines the kernels that should be implemented when
 * adding a new backend. New backends don't need to implement every one of the
 * methods, this can be done gradually (throw an error for unimplemented
 * methods).
 */
export class KernelBackend {
    refCount(dataId) {
        return notYetImplemented('refCount');
    }
    incRef(dataId) {
        return notYetImplemented('incRef');
    }
    timerAvailable() {
        return true;
    }
    time(f) {
        return notYetImplemented('time');
    }
    read(dataId) {
        return notYetImplemented('read');
    }
    readSync(dataId) {
        return notYetImplemented('readSync');
    }
    numDataIds() {
        return notYetImplemented('numDataIds');
    }
    disposeData(dataId, force) {
        return notYetImplemented('disposeData');
    }
    write(values, shape, dtype) {
        return notYetImplemented('write');
    }
    move(dataId, values, shape, dtype, refCount) {
        return notYetImplemented('move');
    }
    memory() {
        return notYetImplemented('memory');
    }
    /** Returns the highest precision for floats in bits (e.g. 16 or 32) */
    floatPrecision() {
        return notYetImplemented('floatPrecision');
    }
    /** Returns the smallest representable number.  */
    epsilon() {
        return this.floatPrecision() === 32 ? EPSILON_FLOAT32 : EPSILON_FLOAT16;
    }
    dispose() {
        return notYetImplemented('dispose');
    }
}
function notYetImplemented(kernelName) {
    throw new Error(`'${kernelName}' not yet implemented or not found in the registry. ` +
        `This kernel may not be supported by the tfjs backend you have chosen`);
}
//# sourceMappingURL=backend.js.map