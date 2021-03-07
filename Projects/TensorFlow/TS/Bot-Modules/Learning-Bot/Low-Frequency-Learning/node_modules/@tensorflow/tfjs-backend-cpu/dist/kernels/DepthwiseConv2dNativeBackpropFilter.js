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
import { backend_util, DepthwiseConv2dNativeBackpropFilter, TensorBuffer } from '@tensorflow/tfjs-core';
import { assertNotComplex } from '../cpu_util';
export function depthwiseConv2dNativeBackpropFilter(args) {
    const { inputs, backend, attrs } = args;
    const { x, dy } = inputs;
    const { strides, dilations, pad, dimRoundingMode, filterShape } = attrs;
    assertNotComplex([x, dy], 'depthwiseConv2dNativeBackpropFilter');
    const convInfo = backend_util.computeConv2DInfo(x.shape, filterShape, strides, dilations, pad, dimRoundingMode, true /* depthwise */);
    const { strideHeight, strideWidth, filterHeight, filterWidth } = convInfo;
    const dW = new TensorBuffer(convInfo.filterShape, 'float32');
    const leftPad = convInfo.padInfo.left;
    const topPad = convInfo.padInfo.top;
    const chMul = convInfo.outChannels / convInfo.inChannels;
    const xVals = backend.data.get(x.dataId).values;
    const xBuf = new TensorBuffer(x.shape, x.dtype, xVals);
    const dyVals = backend.data.get(dy.dataId).values;
    const dyBuf = new TensorBuffer(dy.shape, dy.dtype, dyVals);
    for (let wR = 0; wR < filterHeight; ++wR) {
        const yRMin = Math.max(0, Math.ceil((topPad - wR) / strideHeight));
        const yRMax = Math.min(convInfo.outHeight, (convInfo.inHeight + topPad - wR) / strideHeight);
        for (let wC = 0; wC < filterWidth; ++wC) {
            const yCMin = Math.max(0, Math.ceil((leftPad - wC) / strideWidth));
            const yCMax = Math.min(convInfo.outWidth, (convInfo.inWidth + leftPad - wC) / strideWidth);
            for (let d2 = 0; d2 < convInfo.outChannels; ++d2) {
                const d1 = Math.trunc(d2 / chMul);
                const dm = d2 % chMul;
                let dotProd = 0;
                for (let b = 0; b < convInfo.batchSize; ++b) {
                    for (let yR = yRMin; yR < yRMax; ++yR) {
                        const xR = wR + yR * strideHeight - topPad;
                        for (let yC = yCMin; yC < yCMax; ++yC) {
                            const xC = wC + yC * strideWidth - leftPad;
                            dotProd += xBuf.get(b, xR, xC, d1) *
                                dyBuf.get(b, yR, yC, d2);
                        }
                    }
                }
                dW.set(dotProd, wR, wC, d1, dm);
            }
        }
    }
    return backend.makeTensorInfo(dW.shape, dW.dtype, dW.values);
}
export const depthwiseConv2dNativeBackpropFilterConfig = {
    kernelName: DepthwiseConv2dNativeBackpropFilter,
    backendName: 'cpu',
    kernelFunc: depthwiseConv2dNativeBackpropFilter
};
//# sourceMappingURL=DepthwiseConv2dNativeBackpropFilter.js.map