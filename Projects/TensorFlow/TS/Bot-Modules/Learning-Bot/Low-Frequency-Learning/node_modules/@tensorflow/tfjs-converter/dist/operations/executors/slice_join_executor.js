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
import { tidy, util } from '@tensorflow/tfjs-core';
// tslint:disable-next-line: no-imports-from-dist
import * as tfOps from '@tensorflow/tfjs-core/dist/ops/ops_for_converter';
import { getParamValue } from './utils';
export const executeOp = (node, tensorMap, context) => {
    switch (node.op) {
        case 'ConcatV2':
        case 'Concat': {
            const n = getParamValue('n', node, tensorMap, context);
            const axis = getParamValue('axis', node, tensorMap, context);
            let inputs = getParamValue('tensors', node, tensorMap, context);
            inputs = inputs.slice(0, n);
            return [tfOps.concat(inputs, axis)];
        }
        case 'Gather': {
            const input = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [tfOps.gather(input, tfOps.cast(indices, 'int32'), 0)];
        }
        case 'GatherV2': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const batchDims = getParamValue('batchDims', node, tensorMap, context);
            const input = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [tfOps.gather(input, tfOps.cast(indices, 'int32'), axis, batchDims)];
        }
        case 'Reverse': {
            const dims = getParamValue('dims', node, tensorMap, context);
            const axis = [];
            for (let i = 0; i < dims.length; i++) {
                if (dims[i]) {
                    axis.push(i);
                }
            }
            const input = getParamValue('x', node, tensorMap, context);
            return [tfOps.reverse(input, axis)];
        }
        case 'ReverseV2': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const input = getParamValue('x', node, tensorMap, context);
            return [tfOps.reverse(input, axis)];
        }
        case 'Slice': {
            // tslint:disable-next-line:no-any
            const begin = getParamValue('begin', node, tensorMap, context);
            // tslint:disable-next-line:no-any
            const size = getParamValue('size', node, tensorMap, context);
            return [tfOps.slice(getParamValue('x', node, tensorMap, context), begin, size)];
        }
        case 'StridedSlice': {
            const begin = getParamValue('begin', node, tensorMap, context);
            const end = getParamValue('end', node, tensorMap, context);
            const strides = getParamValue('strides', node, tensorMap, context);
            const beginMask = getParamValue('beginMask', node, tensorMap, context);
            const endMask = getParamValue('endMask', node, tensorMap, context);
            const ellipsisMask = getParamValue('ellipsisMask', node, tensorMap, context);
            const newAxisMask = getParamValue('newAxisMask', node, tensorMap, context);
            const shrinkAxisMask = getParamValue('shrinkAxisMask', node, tensorMap, context);
            const tensor = getParamValue('x', node, tensorMap, context);
            return [tfOps.stridedSlice(tensor, begin, end, strides, beginMask, endMask, ellipsisMask, newAxisMask, shrinkAxisMask)];
        }
        case 'Pack': {
            return tidy(() => {
                const axis = getParamValue('axis', node, tensorMap, context);
                const tensors = getParamValue('tensors', node, tensorMap, context);
                // Reshape the tensors to the first tensor's shape if they don't
                // match.
                const shape = tensors[0].shape;
                const squeezedShape = tfOps.squeeze(tensors[0]).shape;
                const mapped = tensors.map(tensor => {
                    const sameShape = util.arraysEqual(tensor.shape, shape);
                    if (!sameShape &&
                        !util.arraysEqual(tfOps.squeeze(tensor).shape, squeezedShape)) {
                        throw new Error('the input tensors shape does not match');
                    }
                    return sameShape ? tensor : tfOps.reshape(tensor, shape);
                });
                return [tfOps.stack(mapped, axis)];
            });
        }
        case 'Unpack': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const tensor = getParamValue('tensor', node, tensorMap, context);
            return tfOps.unstack(tensor, axis);
        }
        case 'Tile': {
            const reps = getParamValue('reps', node, tensorMap, context);
            return [tfOps.tile(getParamValue('x', node, tensorMap, context), reps)];
        }
        case 'Split':
        case 'SplitV': {
            const axis = getParamValue('axis', node, tensorMap, context);
            const numOrSizeSplits = getParamValue('numOrSizeSplits', node, tensorMap, context);
            const tensor = getParamValue('x', node, tensorMap, context);
            return tfOps.split(tensor, numOrSizeSplits, axis);
        }
        case 'ScatterNd': {
            const indices = getParamValue('indices', node, tensorMap, context);
            const values = getParamValue('values', node, tensorMap, context);
            const shape = getParamValue('shape', node, tensorMap, context);
            return [tfOps.scatterND(indices, values, shape)];
        }
        case 'GatherNd': {
            const x = getParamValue('x', node, tensorMap, context);
            const indices = getParamValue('indices', node, tensorMap, context);
            return [tfOps.gatherND(x, indices)];
        }
        case 'SparseToDense': {
            const indices = getParamValue('sparseIndices', node, tensorMap, context);
            const shape = getParamValue('outputShape', node, tensorMap, context);
            const sparseValues = getParamValue('sparseValues', node, tensorMap, context);
            const defaultValue = getParamValue('defaultValue', node, tensorMap, context);
            return [tfOps.sparseToDense(indices, sparseValues, shape, sparseValues.dtype === defaultValue.dtype ?
                    defaultValue :
                    tfOps.cast(defaultValue, sparseValues.dtype))];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'slice_join';
//# sourceMappingURL=slice_join_executor.js.map