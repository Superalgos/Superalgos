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
        case 'Equal': {
            return [tfOps.equal(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'NotEqual': {
            return [tfOps.notEqual(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'Greater': {
            return [tfOps.greater(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'GreaterEqual': {
            return [tfOps.greaterEqual(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'Less': {
            return [tfOps.less(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'LessEqual': {
            return [tfOps.lessEqual(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'LogicalAnd': {
            return [tfOps.logicalAnd(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'LogicalNot': {
            return [tfOps.logicalNot(getParamValue('a', node, tensorMap, context))];
        }
        case 'LogicalOr': {
            return [tfOps.logicalOr(getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        case 'Select':
        case 'SelectV2': {
            return [tfOps.where(getParamValue('condition', node, tensorMap, context), getParamValue('a', node, tensorMap, context), getParamValue('b', node, tensorMap, context))];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'logical';
//# sourceMappingURL=logical_executor.js.map