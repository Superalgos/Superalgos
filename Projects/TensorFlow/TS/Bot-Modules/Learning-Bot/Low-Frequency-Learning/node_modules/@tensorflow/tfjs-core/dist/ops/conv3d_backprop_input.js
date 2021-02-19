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
import { ENGINE } from '../engine';
import { Conv3DBackpropInputV2 } from '../kernel_names';
import * as util from '../util';
import { op } from './operation';
import { reshape } from './reshape';
/**
 * Computes the derivative of the input of a 3D convolution.
 *
 * @param xShape The shape of the input: [batch, depth, height, width,
 * in_channels]. If length of 4, batch of 1 is assumed.
 * @param dy The derivative of the output, of rank 5 or rank 4 of shape
 *   `[batch, outDepth, outHeight, outWidth, in_channels]`.
 * If rank 4, batch of 1 is assumed.
 * @param filter The filter, rank 5, of shape
 *     `[filterDepth, filterHeight, filterWidth, inDepth, outDepth]`.
 * @param strides The strides of the convolution: `[strideDepth, strideHeight,
 * strideWidth]`.
 * @param pad The type of padding algorithm used:
 *    - `same` and stride 1: output will be of same size as input,
 *       regardless of filter size.
 *    - `valid`: output will be smaller than input if filter is larger
 *       than 1x1.
 */
function conv3DBackpropInput_(xShape, dy, filter, strides, pad) {
    util.assert(xShape.length === dy.rank, () => `Length of inShape ` +
        `(${xShape.length}) and rank of dy (${dy.rank}) must match`);
    let xShape5D = xShape;
    let dy5D = dy;
    let reshapedTo5D = false;
    if (dy.rank === 4) {
        reshapedTo5D = true;
        dy5D = reshape(dy, [1, dy.shape[0], dy.shape[1], dy.shape[2], dy.shape[3]]);
        xShape5D = [1, xShape[0], xShape[1], xShape[2], xShape[3]];
    }
    const inDepth = xShape5D[4];
    const outDepth = dy5D.shape[4];
    util.assert(xShape5D.length === 5, () => `Error in conv3dDerInput: inShape must be length 5, but got length ` +
        `${xShape5D.length}.`);
    util.assert(dy5D.rank === 5, () => `Error in conv3dDerInput: dy must be rank 5, but got ` +
        `rank ${dy5D.rank}`);
    util.assert(filter.rank === 5, () => `Error in conv3dDerInput: filter must be rank 5, but got ` +
        `rank ${filter.rank}`);
    util.assert(inDepth === filter.shape[3], () => `Error in conv3dDerInput: depth of input (${inDepth}) must ` +
        `match input depth for filter ${filter.shape[3]}.`);
    util.assert(outDepth === filter.shape[4], () => `Error in conv3dDerInput: depth of output (${outDepth}) must ` +
        `match output depth for filter ${filter.shape[4]}.`);
    const inputs = { dy: dy5D, filter };
    const attrs = { pad, strides, inputShape: xShape5D };
    // tslint:disable-next-line: no-unnecessary-type-assertion
    const res = ENGINE.runKernel(Conv3DBackpropInputV2, inputs, attrs);
    if (reshapedTo5D) {
        return reshape(res, [res.shape[1], res.shape[2], res.shape[3], res.shape[4]]);
    }
    return res;
}
export const conv3DBackpropInput = op({ conv3DBackpropInput_ });
//# sourceMappingURL=conv3d_backprop_input.js.map