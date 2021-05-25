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
import { backend_util, kernel_impls, NonMaxSuppressionV5 } from '@tensorflow/tfjs-core';
const nonMaxSuppressionV5Impl = kernel_impls.nonMaxSuppressionV5Impl;
export function nonMaxSuppressionV5(args) {
    backend_util.warn('tf.nonMaxSuppression() in webgl locks the UI thread. ' +
        'Call tf.nonMaxSuppressionAsync() instead');
    const { inputs, backend, attrs } = args;
    const { boxes, scores } = inputs;
    const { maxOutputSize, iouThreshold, scoreThreshold, softNmsSigma } = attrs;
    const boxesVals = backend.readSync(boxes.dataId);
    const scoresVals = backend.readSync(scores.dataId);
    const maxOutputSizeVal = maxOutputSize;
    const iouThresholdVal = iouThreshold;
    const scoreThresholdVal = scoreThreshold;
    const softNmsSigmaVal = softNmsSigma;
    const { selectedIndices, selectedScores } = nonMaxSuppressionV5Impl(boxesVals, scoresVals, maxOutputSizeVal, iouThresholdVal, scoreThresholdVal, softNmsSigmaVal);
    return [
        backend.makeTensorInfo([selectedIndices.length], 'int32', new Int32Array(selectedIndices)),
        backend.makeTensorInfo([selectedScores.length], 'float32', new Float32Array(selectedScores))
    ];
}
export const nonMaxSuppressionV5Config = {
    kernelName: NonMaxSuppressionV5,
    backendName: 'webgl',
    kernelFunc: nonMaxSuppressionV5
};
//# sourceMappingURL=NonMaxSuppressionV5.js.map