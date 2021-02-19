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
import { backend_util, buffer, Slice, slice_util, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
export function sliceImpl(vals, begin, size, shape, dtype) {
    const isContinous = slice_util.isSliceContinous(shape, begin, size);
    const length = util.sizeFromShape(size);
    const xStrides = util.computeStrides(shape);
    if (isContinous) {
        const flatOffset = slice_util.computeFlatOffset(begin, xStrides);
        if (dtype === 'string') {
            return vals.slice(flatOffset, flatOffset + length);
        }
        return vals.subarray(flatOffset, flatOffset + length);
    }
    const decodedData = dtype === 'string' ?
        backend_util.fromUint8ToStringArray(vals) :
        vals;
    const inBuf = buffer(shape, dtype, decodedData);
    const outBuf = buffer(size, dtype);
    for (let i = 0; i < outBuf.size; ++i) {
        const outLoc = outBuf.indexToLoc(i);
        const inLoc = outLoc.map((idx, j) => idx + begin[j]);
        outBuf.set(inBuf.get(...inLoc), ...outLoc);
    }
    if (dtype === 'string') {
        return backend_util.fromStringArrayToUint8(outBuf.values);
    }
    return outBuf.values;
}
export function slice(args) {
    const { inputs, backend, attrs } = args;
    const { x } = inputs;
    const { begin, size } = attrs;
    assertNotComplex(x, 'slice');
    const [$begin, $size] = slice_util.parseSliceParams(x, begin, size);
    slice_util.assertParamsValid(x, $begin, $size);
    const vals = backend.data.get(x.dataId).values;
    const outVals = sliceImpl(vals, $begin, $size, x.shape, x.dtype);
    return backend.makeTensorInfo($size, x.dtype, outVals);
}
export const sliceConfig = {
    kernelName: Slice,
    backendName: 'cpu',
    kernelFunc: slice
};
//# sourceMappingURL=Slice.js.map