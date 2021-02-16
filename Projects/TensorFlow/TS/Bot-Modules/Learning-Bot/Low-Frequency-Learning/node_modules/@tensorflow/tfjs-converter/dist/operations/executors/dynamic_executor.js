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
// tslint:disable-next-line: no-imports-from-dist
import * as tfOps from '@tensorflow/tfjs-core/dist/ops/ops_for_converter';
import { getParamValue } from './utils';
function nmsParams(node, tensorMap, context) {
    const boxes = getParamValue('boxes', node, tensorMap, context);
    const scores = getParamValue('scores', node, tensorMap, context);
    const maxOutputSize = getParamValue('maxOutputSize', node, tensorMap, context);
    const iouThreshold = getParamValue('iouThreshold', node, tensorMap, context);
    const scoreThreshold = getParamValue('scoreThreshold', node, tensorMap, context);
    const softNmsSigma = getParamValue('softNmsSigma', node, tensorMap, context);
    return {
        boxes,
        scores,
        maxOutputSize,
        iouThreshold,
        scoreThreshold,
        softNmsSigma
    };
}
export const executeOp = async (node, tensorMap, context) => {
    switch (node.op) {
        case 'NonMaxSuppressionV5': {
            const { boxes, scores, maxOutputSize, iouThreshold, scoreThreshold, softNmsSigma } = nmsParams(node, tensorMap, context);
            const result = await tfOps.image.nonMaxSuppressionWithScoreAsync(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold, softNmsSigma);
            return [result.selectedIndices, result.selectedScores];
        }
        case 'NonMaxSuppressionV4': {
            const { boxes, scores, maxOutputSize, iouThreshold, scoreThreshold } = nmsParams(node, tensorMap, context);
            const padToMaxOutputSize = getParamValue('padToMaxOutputSize', node, tensorMap, context);
            const result = await tfOps.image.nonMaxSuppressionPaddedAsync(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold, padToMaxOutputSize);
            return [result.selectedIndices, result.validOutputs];
        }
        case 'NonMaxSuppressionV3':
        case 'NonMaxSuppressionV2': {
            const { boxes, scores, maxOutputSize, iouThreshold, scoreThreshold } = nmsParams(node, tensorMap, context);
            return [await tfOps.image.nonMaxSuppressionAsync(boxes, scores, maxOutputSize, iouThreshold, scoreThreshold)];
        }
        case 'Where': {
            const condition = tfOps.cast(getParamValue('condition', node, tensorMap, context), 'bool');
            const result = [await tfOps.whereAsync(condition)];
            condition.dispose();
            return result;
        }
        case 'ListDiff': {
            return tfOps.setdiff1dAsync(getParamValue('x', node, tensorMap, context), getParamValue('y', node, tensorMap, context));
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'dynamic';
//# sourceMappingURL=dynamic_executor.js.map