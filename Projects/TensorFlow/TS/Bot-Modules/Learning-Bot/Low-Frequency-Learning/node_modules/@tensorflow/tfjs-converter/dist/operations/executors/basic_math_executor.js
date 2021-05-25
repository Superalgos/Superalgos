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
import { getParamValue, getTensor } from './utils';
export const executeOp = (node, tensorMap, context) => {
    switch (node.op) {
        case 'Abs':
        case 'ComplexAbs':
            return [tfOps.abs(getParamValue('x', node, tensorMap, context))];
        case 'Acos':
            return [tfOps.acos(getParamValue('x', node, tensorMap, context))];
        case 'Acosh':
            return [tfOps.acosh(getParamValue('x', node, tensorMap, context))];
        case 'Asin':
            return [tfOps.asin(getParamValue('x', node, tensorMap, context))];
        case 'Asinh':
            return [tfOps.asinh(getParamValue('x', node, tensorMap, context))];
        case 'Atan':
            return [tfOps.atan(getParamValue('x', node, tensorMap, context))];
        case 'Atan2':
            return [tfOps.atan2(getParamValue('x', node, tensorMap, context), getParamValue('y', node, tensorMap, context))];
        case 'Atanh':
            return [tfOps.atanh(getParamValue('x', node, tensorMap, context))];
        case 'Ceil':
            return [tfOps.ceil(getParamValue('x', node, tensorMap, context))];
        case 'Complex':
            return [tfOps.complex(getParamValue('real', node, tensorMap, context), getParamValue('imag', node, tensorMap, context))];
        case 'Cos':
            return [tfOps.cos(getParamValue('x', node, tensorMap, context))];
        case 'Cosh':
            return [tfOps.cosh(getParamValue('x', node, tensorMap, context))];
        case 'Elu':
            return [tfOps.elu(getParamValue('x', node, tensorMap, context))];
        case 'Erf':
            return [tfOps.erf(getParamValue('x', node, tensorMap, context))];
        case 'Exp':
            return [tfOps.exp(getParamValue('x', node, tensorMap, context))];
        case 'Expm1': {
            return [tfOps.expm1(getParamValue('x', node, tensorMap, context))];
        }
        case 'Floor':
            return [tfOps.floor(getParamValue('x', node, tensorMap, context))];
        case 'Log':
            return [tfOps.log(getParamValue('x', node, tensorMap, context))];
        case 'Log1p': {
            return [tfOps.log1p(getParamValue('x', node, tensorMap, context))];
        }
        case 'Imag':
            return [tfOps.imag(getParamValue('x', node, tensorMap, context))];
        case 'Neg':
            return [tfOps.neg(getParamValue('x', node, tensorMap, context))];
        case 'Reciprocal': {
            return [tfOps.reciprocal(getParamValue('x', node, tensorMap, context))];
        }
        case 'Real':
            return [tfOps.real(getParamValue('x', node, tensorMap, context))];
        case 'Relu':
            return [tfOps.relu(getParamValue('x', node, tensorMap, context))];
        case 'Round': {
            return [tfOps.round(getParamValue('x', node, tensorMap, context))];
        }
        case 'Selu':
            return [tfOps.selu(getParamValue('x', node, tensorMap, context))];
        case 'Sigmoid':
            return [tfOps.sigmoid(getParamValue('x', node, tensorMap, context))];
        case 'Sin':
            return [tfOps.sin(getParamValue('x', node, tensorMap, context))];
        case 'Sign': {
            return [tfOps.sign(getParamValue('x', node, tensorMap, context))];
        }
        case 'Sinh': {
            return [tfOps.sinh(getParamValue('x', node, tensorMap, context))];
        }
        case 'Softplus': {
            return [tfOps.softplus(getParamValue('x', node, tensorMap, context))];
        }
        case 'Sqrt': {
            return [tfOps.sqrt(getParamValue('x', node, tensorMap, context))];
        }
        case 'Square': {
            return [tfOps.square(getParamValue('x', node, tensorMap, context))];
        }
        case 'Tanh': {
            return [tfOps.tanh(getParamValue('x', node, tensorMap, context))];
        }
        case 'Tan':
            return [tfOps.tan(getParamValue('x', node, tensorMap, context))];
        case 'ClipByValue':
            return [tfOps.clipByValue(getParamValue('x', node, tensorMap, context), getParamValue('clipValueMin', node, tensorMap, context), getParamValue('clipValueMax', node, tensorMap, context))];
        case 'Relu6':
            return [tfOps.relu6(getParamValue('x', node, tensorMap, context))];
        case 'Rsqrt':
            return [tfOps.rsqrt(getTensor(node.inputNames[0], tensorMap, context))];
        case 'Prod':
            return [tfOps.prod(getParamValue('x', node, tensorMap, context), getParamValue('axes', node, tensorMap, context))];
        case 'LeakyRelu':
            return [tfOps.leakyRelu(getParamValue('x', node, tensorMap, context), getParamValue('alpha', node, tensorMap, context))];
        case 'Prelu':
            return [tfOps.prelu(getParamValue('x', node, tensorMap, context), getParamValue('alpha', node, tensorMap, context))];
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'basic_math';
//# sourceMappingURL=basic_math_executor.js.map