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
import { backend_util, SparseToDense } from '@tensorflow/tfjs-core';
import { ScatterProgram } from '../scatter_gpu';
import { reshape } from './Reshape';
export function sparseToDense(args) {
    const { inputs, backend, attrs } = args;
    const { sparseIndices, sparseValues, defaultValue } = inputs;
    const { outputShape } = attrs;
    const { sliceRank, numUpdates, strides, outputSize } = backend_util.calculateShapes(sparseValues, sparseIndices, outputShape);
    const sumDupeIndices = false;
    const program = new ScatterProgram(numUpdates, sliceRank, sparseIndices.shape.length, sparseValues.shape.length, strides, [outputSize, 1], sumDupeIndices);
    const res = backend.runWebGLProgram(program, [sparseValues, sparseIndices, defaultValue], sparseValues.dtype);
    const reshaped = reshape({ inputs: { x: res }, backend, attrs: { shape: outputShape } });
    backend.disposeIntermediateTensorInfo(res);
    return reshaped;
}
export const sparseToDenseConfig = {
    kernelName: SparseToDense,
    backendName: 'webgl',
    kernelFunc: sparseToDense
};
//# sourceMappingURL=SparseToDense.js.map