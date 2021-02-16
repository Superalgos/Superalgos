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
export const executeOp = (node, tensorMap, context) => {
    switch (node.op) {
        case 'Cast': {
            return [tfOps.cast(getParamValue('x', node, tensorMap, context), getParamValue('dtype', node, tensorMap, context))];
        }
        case 'ExpandDims': {
            const axis = getParamValue('axis', node, tensorMap, context);
            return [tfOps.expandDims(getParamValue('x', node, tensorMap, context), axis)];
        }
        case 'Squeeze': {
            const axis = getParamValue('axis', node, tensorMap, context);
            return [tfOps.squeeze(getParamValue('x', node, tensorMap, context), axis)];
        }
        case 'Reshape': {
            return [tfOps.reshape(getParamValue('x', node, tensorMap, context), getParamValue('shape', node, tensorMap, context))];
        }
        case 'MirrorPad': {
            return [tfOps.mirrorPad(getParamValue('x', node, tensorMap, context), getParamValue('padding', node, tensorMap, context), getParamValue('mode', node, tensorMap, context))];
        }
        case 'PadV2':
        case 'Pad': {
            return [tfOps.pad(getParamValue('x', node, tensorMap, context), getParamValue('padding', node, tensorMap, context), getParamValue('constantValue', node, tensorMap, context))];
        }
        case 'SpaceToBatchND': {
            const blockShape = getParamValue('blockShape', node, tensorMap, context);
            const paddings = getParamValue('paddings', node, tensorMap, context);
            return [tfOps.spaceToBatchND(getParamValue('x', node, tensorMap, context), blockShape, paddings)];
        }
        case 'BatchToSpaceND': {
            const blockShape = getParamValue('blockShape', node, tensorMap, context);
            const crops = getParamValue('crops', node, tensorMap, context);
            return [tfOps.batchToSpaceND(getParamValue('x', node, tensorMap, context), blockShape, crops)];
        }
        case 'DepthToSpace': {
            const blockSize = getParamValue('blockSize', node, tensorMap, context);
            const dataFormat = getParamValue('dataFormat', node, tensorMap, context).toUpperCase();
            return [tfOps.depthToSpace(getParamValue('x', node, tensorMap, context), blockSize, dataFormat)];
        }
        case 'BroadcastTo': {
            return [tfOps.broadcastTo(getParamValue('x', node, tensorMap, context), getParamValue('shape', node, tensorMap, context))];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'transformation';
//# sourceMappingURL=transformation_executor.js.map