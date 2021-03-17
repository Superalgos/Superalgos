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
import { backend_util, Cumsum, upcastType, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { transpose } from './Transpose';
export function cumsum(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { axis, exclusive, reverse } = attrs;
    assertNotComplex(x, 'cumsum');
    const permutation = backend_util.getAxesPermutation([axis], x.shape.length);
    let $x = x;
    if (permutation != null) {
        $x = transpose({ inputs: { x }, backend, attrs: { perm: permutation } });
    }
    const permutedAxis = backend_util.getInnerMostAxes(1, x.shape.length)[0];
    if (permutedAxis !== $x.shape.length - 1) {
        throw new Error(`backend.cumsum in CPU expects an inner-most ` +
            `axis=${$x.shape.length - 1} but got axis=${permutedAxis}`);
    }
    const resultDtype = upcastType($x.dtype, 'int32');
    const vals = util.makeZerosTypedArray(util.sizeFromShape($x.shape), resultDtype);
    const aVals = backend.data.get($x.dataId).values;
    const finalDim = $x.shape[$x.shape.length - 1];
    const indexAdjuster = reverse ?
        (i, j) => i + finalDim - j - 1 :
        (i, j) => i + j;
    for (let i = 0; i < aVals.length; i += finalDim) {
        for (let j = 0; j < finalDim; j++) {
            const idx = indexAdjuster(i, j);
            if (j === 0) {
                vals[idx] = exclusive ? 0 : aVals[idx];
            }
            else {
                const prevIdx = indexAdjuster(i, j - 1);
                vals[idx] = exclusive ? aVals[prevIdx] + vals[prevIdx] :
                    aVals[idx] + vals[prevIdx];
            }
        }
    }
    const result = backend.makeTensorInfo($x.shape, resultDtype, vals);
    if (permutation != null) {
        const reversePermutation = backend_util.getUndoAxesPermutation(permutation);
        const reverseTransposedResult = transpose({ inputs: { x: result }, backend, attrs: { perm: reversePermutation } });
        backend.disposeIntermediateTensorInfo(result);
        backend.disposeIntermediateTensorInfo($x);
        return reverseTransposedResult;
    }
    return result;
}
export const cumsumConfig = {
    kernelName: Cumsum,
    backendName: 'cpu',
    kernelFunc: cumsum
};
//# sourceMappingURL=Cumsum.js.map