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
import { UnsortedSegmentSum, util } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
import { cast } from './Cast';
import { equal } from './Equal';
import { expandDims } from './ExpandDims';
import { multiply } from './Multiply';
import { pack } from './Pack';
import { sum } from './Sum';
export function unsortedSegmentSum(args) {
    const { inputs, backend, attrs } = args;
    const { x, segmentIds } = inputs;
    const { numSegments } = attrs;
    assertNotComplex(x, 'unsortedSegmentSum');
    const xRank = x.shape.length;
    const segmentIdsRank = segmentIds.shape.length;
    const res = [];
    const intermediates = [];
    // Reshape the segment id's so that they can be broadcast with
    // x. The new shape should be [segmentIds.shape, 1, ..., 1]
    const numIters = xRank - segmentIdsRank;
    let $segmentIds = segmentIds;
    for (let i = 0; i < numIters; ++i) {
        const expanded = expandDims({ inputs: { input: $segmentIds }, backend, attrs: { dim: i + 1 } });
        $segmentIds = expanded;
        intermediates.push(expanded);
    }
    for (let i = 0; i < numSegments; ++i) {
        const scalarValue = util.createScalarValue(i, 'int32');
        const segmentId = backend.makeTensorInfo([], 'int32', scalarValue);
        const mask = equal({ inputs: { a: segmentId, b: $segmentIds }, backend });
        const maskCasted = cast({ inputs: { x: mask }, backend, attrs: { dtype: 'float32' } });
        const mul = multiply({ inputs: { a: maskCasted, b: x }, backend });
        const sumTensorInfo = sum({ inputs: { x: mul }, backend, attrs: { axis: 0, keepDims: false } });
        res.push(sumTensorInfo);
        intermediates.push(segmentId);
        intermediates.push(mask);
        intermediates.push(maskCasted);
        intermediates.push(mul);
        intermediates.push(sumTensorInfo);
    }
    const result = pack({ inputs: res, backend, attrs: { axis: 0 } });
    intermediates.forEach(t => backend.disposeIntermediateTensorInfo(t));
    return result;
}
export const unsortedSegmentSumConfig = {
    kernelName: UnsortedSegmentSum,
    backendName: 'cpu',
    kernelFunc: unsortedSegmentSum
};
//# sourceMappingURL=UnsortedSegmentSum.js.map