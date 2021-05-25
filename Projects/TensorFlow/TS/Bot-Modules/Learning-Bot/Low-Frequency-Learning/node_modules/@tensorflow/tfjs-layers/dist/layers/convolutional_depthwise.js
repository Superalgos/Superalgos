/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * TensorFlow.js Layers: Depthwise Convolutional Layers
 */
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy } from '@tensorflow/tfjs-core';
import { imageDataFormat } from '../backend/common';
import * as K from '../backend/tfjs_backend';
import { checkDataFormat } from '../common';
import { getConstraint, serializeConstraint } from '../constraints';
import { ValueError } from '../errors';
import { getInitializer, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import { convOutputLength } from '../utils/conv_utils';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
import { BaseConv, preprocessConv2DInput } from './convolutional';
/**
 * 2D convolution with separable filters.
 * @param x Input tensor.
 * @param depthwiseKernel Convolution kernel for depthwise convolution.
 * @param strides Strides (Array of two integers).
 * @param padding Padding model.
 * @param dataFormat Data format.
 * @param dilationRate Array of two integers, dilation rates for the separable
 *   convolution.
 * @returns Output tensor.
 * @throws ValueError If depthwiseKernel is not a 4D array.
 */
export function depthwiseConv2d(x, depthwiseKernel, strides = [1, 1], padding = 'valid', dataFormat, dilationRate) {
    return tidy(() => {
        if (dataFormat == null) {
            dataFormat = imageDataFormat();
        }
        checkDataFormat(dataFormat);
        let y = preprocessConv2DInput(x, dataFormat);
        if (x.rank !== 4) {
            throw new ValueError(`Input for depthwiseConv2d is required to be 4-D, but is instead ` +
                `${x.rank}-D`);
        }
        if (depthwiseKernel.rank !== 4) {
            throw new ValueError(`depthwiseKernel is required to be 4-D, but is instead ` +
                `${depthwiseKernel.rank}-D`);
        }
        y = tfc.depthwiseConv2d(y, depthwiseKernel, strides, padding === 'same' ? 'same' : 'valid', 'NHWC', dilationRate);
        if (dataFormat === 'channelsFirst') {
            y = tfc.transpose(y, [0, 3, 1, 2]);
        }
        return y;
    });
}
export class DepthwiseConv2D extends BaseConv {
    constructor(args) {
        super(2, args);
        this.depthwiseKernel = null;
        this.depthMultiplier =
            args.depthMultiplier == null ? 1 : args.depthMultiplier;
        this.depthwiseInitializer = getInitializer(args.depthwiseInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.depthwiseConstraint = getConstraint(args.depthwiseConstraint);
        this.depthwiseRegularizer = getRegularizer(args.depthwiseRegularizer);
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        if (inputShape.length < 4) {
            throw new ValueError(`Inputs to DepthwiseConv2D should have rank 4. ` +
                `Received input shape: ${JSON.stringify(inputShape)}.`);
        }
        const channelAxis = this.dataFormat === 'channelsFirst' ? 1 : 3;
        if (inputShape[channelAxis] == null || inputShape[channelAxis] < 0) {
            throw new ValueError('The channel dimension of the inputs to DepthwiseConv2D should ' +
                `be defined, but is not (${inputShape[channelAxis]}).`);
        }
        const inputDim = inputShape[channelAxis];
        const depthwiseKernelShape = [
            this.kernelSize[0], this.kernelSize[1], inputDim, this.depthMultiplier
        ];
        this.depthwiseKernel = this.addWeight('depthwise_kernel', depthwiseKernelShape, null, this.depthwiseInitializer, this.depthwiseRegularizer, true, this.depthwiseConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [inputDim * this.depthMultiplier], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.built = true;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = getExactlyOneTensor(inputs);
            let outputs = depthwiseConv2d(inputs, this.depthwiseKernel.read(), this.strides, this.padding, this.dataFormat, null);
            // TODO(cais): Add support for dilation.
            if (this.useBias) {
                outputs = K.biasAdd(outputs, this.bias.read(), this.dataFormat);
            }
            if (this.activation != null) {
                outputs = this.activation.apply(outputs);
            }
            return outputs;
        });
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const rows = this.dataFormat === 'channelsFirst' ? inputShape[2] : inputShape[1];
        const cols = this.dataFormat === 'channelsFirst' ? inputShape[3] : inputShape[2];
        const outFilters = this.dataFormat === 'channelsFirst' ?
            inputShape[1] * this.depthMultiplier :
            inputShape[3] * this.depthMultiplier;
        const outRows = convOutputLength(rows, this.kernelSize[0], this.padding, this.strides[0]);
        const outCols = convOutputLength(cols, this.kernelSize[1], this.padding, this.strides[1]);
        if (this.dataFormat === 'channelsFirst') {
            return [inputShape[0], outFilters, outRows, outCols];
        }
        else {
            // In this case, assume 'channelsLast'.
            return [inputShape[0], outRows, outCols, outFilters];
        }
    }
    getConfig() {
        const config = super.getConfig();
        config['depthMultiplier'] = this.depthMultiplier;
        config['depthwiseInitializer'] =
            serializeInitializer(this.depthwiseInitializer);
        config['depthwiseRegularizer'] =
            serializeRegularizer(this.depthwiseRegularizer);
        config['depthwiseConstraint'] =
            serializeConstraint(this.depthwiseRegularizer);
        return config;
    }
}
/** @nocollapse */
DepthwiseConv2D.className = 'DepthwiseConv2D';
serialization.registerClass(DepthwiseConv2D);
//# sourceMappingURL=convolutional_depthwise.js.map