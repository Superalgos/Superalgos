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
 * TensorFlow.js Layers: Convolutional Layers
 */
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy } from '@tensorflow/tfjs-core';
import { getActivation, serializeActivation } from '../activations';
import { imageDataFormat } from '../backend/common';
import * as K from '../backend/tfjs_backend';
import { checkDataFormat, checkInterpolationFormat, checkPaddingMode } from '../common';
import { getConstraint, serializeConstraint } from '../constraints';
import { InputSpec, Layer } from '../engine/topology';
import { NotImplementedError, ValueError } from '../errors';
import { getInitializer, serializeInitializer } from '../initializers';
import { getRegularizer, serializeRegularizer } from '../regularizers';
import { convOutputLength, deconvLength, normalizeArray } from '../utils/conv_utils';
import * as generic_utils from '../utils/generic_utils';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
/**
 * Transpose and cast the input before the conv2d.
 * @param x Input image tensor.
 * @param dataFormat
 */
export function preprocessConv2DInput(x, dataFormat) {
    // TODO(cais): Cast type to float32 if not.
    return tidy(() => {
        checkDataFormat(dataFormat);
        if (dataFormat === 'channelsFirst') {
            return tfc.transpose(x, [0, 2, 3, 1]); // NCHW -> NHWC.
        }
        else {
            return x;
        }
    });
}
/**
 * Transpose and cast the input before the conv3d.
 * @param x Input image tensor.
 * @param dataFormat
 */
export function preprocessConv3DInput(x, dataFormat) {
    return tidy(() => {
        checkDataFormat(dataFormat);
        if (dataFormat === 'channelsFirst') {
            return tfc.transpose(x, [0, 2, 3, 4, 1]); // NCDHW -> NDHWC.
        }
        else {
            return x;
        }
    });
}
/**
 * 1D-convolution with bias added.
 *
 * Porting Note: This function does not exist in the Python Keras backend.
 *   It is exactly the same as `conv2d`, except the added `bias`.
 *
 * @param x Input tensor, rank-3, of shape `[batchSize, width, inChannels]`.
 * @param kernel Kernel, rank-3, of shape `[filterWidth, inDepth, outDepth]`.
 * @param bias Bias, rank-3, of shape `[outDepth]`.
 * @param strides
 * @param padding Padding mode.
 * @param dataFormat Data format.
 * @param dilationRate
 * @returns The result of the 1D convolution.
 * @throws ValueError, if `x`, `kernel` or `bias` is not of the correct rank.
 */
export function conv1dWithBias(x, kernel, bias, strides = 1, padding = 'valid', dataFormat, dilationRate = 1) {
    return tidy(() => {
        if (dataFormat == null) {
            dataFormat = imageDataFormat();
        }
        checkDataFormat(dataFormat);
        // Check the ranks of x, kernel and bias.
        if (x.shape.length !== 3) {
            throw new ValueError(`The input of a conv1dWithBias operation should be 3, but is ` +
                `${x.shape.length} instead.`);
        }
        if (kernel.shape.length !== 3) {
            throw new ValueError(`The kernel for a conv1dWithBias operation should be 3, but is ` +
                `${kernel.shape.length} instead`);
        }
        if (bias != null && bias.shape.length !== 1) {
            throw new ValueError(`The bias for a conv1dWithBias operation should be 1, but is ` +
                `${kernel.shape.length} instead`);
        }
        // TODO(cais): Support CAUSAL padding mode.
        if (dataFormat === 'channelsFirst') {
            x = tfc.transpose(x, [0, 2, 1]); // NCW -> NWC.
        }
        if (padding === 'causal') {
            throw new NotImplementedError('The support for CAUSAL padding mode in conv1dWithBias is not ' +
                'implemented yet.');
        }
        let y = tfc.conv1d(x, kernel, strides, padding === 'same' ? 'same' : 'valid', 'NWC', dilationRate);
        if (bias != null) {
            y = K.biasAdd(y, bias);
        }
        return y;
    });
}
/**
 * 1D-convolution.
 *
 * @param x Input tensor, rank-3, of shape `[batchSize, width, inChannels]`.
 * @param kernel Kernel, rank-3, of shape `[filterWidth, inDepth, outDepth]`.s
 * @param strides
 * @param padding Padding mode.
 * @param dataFormat Data format.
 * @param dilationRate
 * @returns The result of the 1D convolution.
 * @throws ValueError, if `x`, `kernel` or `bias` is not of the correct rank.
 */
export function conv1d(x, kernel, strides = 1, padding = 'valid', dataFormat, dilationRate = 1) {
    return tidy(() => {
        checkDataFormat(dataFormat);
        return conv1dWithBias(x, kernel, null, strides, padding, dataFormat, dilationRate);
    });
}
/**
 * 2D Convolution
 * @param x
 * @param kernel kernel of the convolution.
 * @param strides strides array.
 * @param padding padding mode. Default to 'valid'.
 * @param dataFormat data format. Defaults to 'channelsLast'.
 * @param dilationRate dilation rate array.
 * @returns Result of the 2D pooling.
 */
export function conv2d(x, kernel, strides = [1, 1], padding = 'valid', dataFormat, dilationRate) {
    return tidy(() => {
        checkDataFormat(dataFormat);
        return conv2dWithBiasActivation(x, kernel, null, strides, padding, dataFormat, dilationRate);
    });
}
/**
 * 2D Convolution with an added bias and optional activation.
 * Note: This function does not exist in the Python Keras Backend. This function
 * is exactly the same as `conv2d`, except the added `bias`.
 */
export function conv2dWithBiasActivation(x, kernel, bias, strides = [1, 1], padding = 'valid', dataFormat, dilationRate, activation = null) {
    return tidy(() => {
        if (dataFormat == null) {
            dataFormat = imageDataFormat();
        }
        checkDataFormat(dataFormat);
        if (x.rank !== 3 && x.rank !== 4) {
            throw new ValueError(`conv2dWithBiasActivation expects input to be of rank 3 or 4, ` +
                `but received ${x.rank}.`);
        }
        if (kernel.rank !== 3 && kernel.rank !== 4) {
            throw new ValueError(`conv2dWithBiasActivation expects kernel to be of rank 3 or 4, ` +
                `but received ${x.rank}.`);
        }
        let y = preprocessConv2DInput(x, dataFormat);
        if (padding === 'causal') {
            throw new NotImplementedError('The support for CAUSAL padding mode in conv1dWithBias is not ' +
                'implemented yet.');
        }
        y = tfc.fused.conv2d({
            x: y,
            filter: kernel,
            strides: strides,
            pad: padding === 'same' ? 'same' : 'valid',
            dilations: dilationRate,
            dataFormat: 'NHWC',
            bias,
            activation
        });
        if (dataFormat === 'channelsFirst') {
            y = tfc.transpose(y, [0, 3, 1, 2]);
        }
        return y;
    });
}
/**
 * 3D Convolution.
 * @param x
 * @param kernel kernel of the convolution.
 * @param strides strides array.
 * @param padding padding mode. Default to 'valid'.
 * @param dataFormat data format. Defaults to 'channelsLast'.
 * @param dilationRate dilation rate array.
 * @returns Result of the 3D convolution.
 */
export function conv3d(x, kernel, strides = [1, 1, 1], padding = 'valid', dataFormat, dilationRate) {
    return tidy(() => {
        checkDataFormat(dataFormat);
        return conv3dWithBias(x, kernel, null, strides, padding, dataFormat, dilationRate);
    });
}
/**
 * 3D Convolution with an added bias.
 * Note: This function does not exist in the Python Keras Backend. This function
 * is exactly the same as `conv3d`, except the added `bias`.
 */
export function conv3dWithBias(x, kernel, bias, strides = [1, 1, 1], padding = 'valid', dataFormat, dilationRate) {
    return tidy(() => {
        if (dataFormat == null) {
            dataFormat = imageDataFormat();
        }
        checkDataFormat(dataFormat);
        if (x.rank !== 4 && x.rank !== 5) {
            throw new ValueError(`conv3dWithBias expects input to be of rank 4 or 5, but received ` +
                `${x.rank}.`);
        }
        if (kernel.rank !== 4 && kernel.rank !== 5) {
            throw new ValueError(`conv3dWithBias expects kernel to be of rank 4 or 5, but received ` +
                `${x.rank}.`);
        }
        let y = preprocessConv3DInput(x, dataFormat);
        if (padding === 'causal') {
            throw new NotImplementedError('The support for CAUSAL padding mode in conv3dWithBias is not ' +
                'implemented yet.');
        }
        y = tfc.conv3d(y, kernel, strides, padding === 'same' ? 'same' : 'valid', 'NDHWC', dilationRate);
        if (bias != null) {
            y = K.biasAdd(y, bias);
        }
        if (dataFormat === 'channelsFirst') {
            y = tfc.transpose(y, [0, 4, 1, 2, 3]);
        }
        return y;
    });
}
/**
 * Abstract convolution layer.
 */
export class BaseConv extends Layer {
    constructor(rank, args) {
        super(args);
        this.bias = null;
        this.DEFAULT_KERNEL_INITIALIZER = 'glorotNormal';
        this.DEFAULT_BIAS_INITIALIZER = 'zeros';
        BaseConv.verifyArgs(args);
        this.rank = rank;
        generic_utils.assertPositiveInteger(this.rank, 'rank');
        if (this.rank !== 1 && this.rank !== 2 && this.rank !== 3) {
            throw new NotImplementedError(`Convolution layer for rank other than 1, 2, or 3 (${this.rank}) is ` +
                `not implemented yet.`);
        }
        this.kernelSize = normalizeArray(args.kernelSize, rank, 'kernelSize');
        this.strides = normalizeArray(args.strides == null ? 1 : args.strides, rank, 'strides');
        this.padding = args.padding == null ? 'valid' : args.padding;
        checkPaddingMode(this.padding);
        this.dataFormat =
            args.dataFormat == null ? 'channelsLast' : args.dataFormat;
        checkDataFormat(this.dataFormat);
        this.activation = getActivation(args.activation);
        this.useBias = args.useBias == null ? true : args.useBias;
        this.biasInitializer =
            getInitializer(args.biasInitializer || this.DEFAULT_BIAS_INITIALIZER);
        this.biasConstraint = getConstraint(args.biasConstraint);
        this.biasRegularizer = getRegularizer(args.biasRegularizer);
        this.activityRegularizer = getRegularizer(args.activityRegularizer);
        this.dilationRate = normalizeArray(args.dilationRate == null ? 1 : args.dilationRate, rank, 'dilationRate');
        if (this.rank === 1 &&
            (Array.isArray(this.dilationRate) && this.dilationRate.length !== 1)) {
            throw new ValueError(`dilationRate must be a number or an array of a single number ` +
                `for 1D convolution, but received ` +
                `${JSON.stringify(this.dilationRate)}`);
        }
        else if (this.rank === 2) {
            if (typeof this.dilationRate === 'number') {
                this.dilationRate = [this.dilationRate, this.dilationRate];
            }
            else if (this.dilationRate.length !== 2) {
                throw new ValueError(`dilationRate must be a number or array of two numbers for 2D ` +
                    `convolution, but received ${JSON.stringify(this.dilationRate)}`);
            }
        }
        else if (this.rank === 3) {
            if (typeof this.dilationRate === 'number') {
                this.dilationRate =
                    [this.dilationRate, this.dilationRate, this.dilationRate];
            }
            else if (this.dilationRate.length !== 3) {
                throw new ValueError(`dilationRate must be a number or array of three numbers for 3D ` +
                    `convolution, but received ${JSON.stringify(this.dilationRate)}`);
            }
        }
    }
    static verifyArgs(args) {
        // Check config.kernelSize type and shape.
        generic_utils.assert('kernelSize' in args, `required key 'kernelSize' not in config`);
        if (typeof args.kernelSize !== 'number' &&
            !generic_utils.checkArrayTypeAndLength(args.kernelSize, 'number', 1, 3)) {
            throw new ValueError(`BaseConv expects config.kernelSize to be number or number[] with ` +
                `length 1, 2, or 3, but received ${JSON.stringify(args.kernelSize)}.`);
        }
    }
    getConfig() {
        const config = {
            kernelSize: this.kernelSize,
            strides: this.strides,
            padding: this.padding,
            dataFormat: this.dataFormat,
            dilationRate: this.dilationRate,
            activation: serializeActivation(this.activation),
            useBias: this.useBias,
            biasInitializer: serializeInitializer(this.biasInitializer),
            biasRegularizer: serializeRegularizer(this.biasRegularizer),
            activityRegularizer: serializeRegularizer(this.activityRegularizer),
            biasConstraint: serializeConstraint(this.biasConstraint)
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/**
 * Abstract nD convolution layer.  Ancestor of convolution layers which reduce
 * across channels, i.e., Conv1D and Conv2D, but not DepthwiseConv2D.
 */
export class Conv extends BaseConv {
    constructor(rank, args) {
        super(rank, args);
        this.kernel = null;
        Conv.verifyArgs(args);
        this.filters = args.filters;
        generic_utils.assertPositiveInteger(this.filters, 'filters');
        this.kernelInitializer = getInitializer(args.kernelInitializer || this.DEFAULT_KERNEL_INITIALIZER);
        this.kernelConstraint = getConstraint(args.kernelConstraint);
        this.kernelRegularizer = getRegularizer(args.kernelRegularizer);
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const channelAxis = this.dataFormat === 'channelsFirst' ? 1 : inputShape.length - 1;
        if (inputShape[channelAxis] == null) {
            throw new ValueError(`The channel dimension of the input should be defined. ` +
                `Found ${inputShape[channelAxis]}`);
        }
        const inputDim = inputShape[channelAxis];
        const kernelShape = this.kernelSize.concat([inputDim, this.filters]);
        this.kernel = this.addWeight('kernel', kernelShape, null, this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.filters], null, this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        this.inputSpec = [{ ndim: this.rank + 2, axes: { [channelAxis]: inputDim } }];
        this.built = true;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = getExactlyOneTensor(inputs);
            let outputs;
            const biasValue = this.bias == null ? null : this.bias.read();
            const fusedActivationName = generic_utils.mapActivationToFusedKernel(this.activation.getClassName());
            if (fusedActivationName != null && this.rank === 2) {
                outputs = conv2dWithBiasActivation(inputs, this.kernel.read(), biasValue, this.strides, this.padding, this.dataFormat, this.dilationRate, fusedActivationName);
            }
            else {
                if (this.rank === 1) {
                    outputs = conv1dWithBias(inputs, this.kernel.read(), biasValue, this.strides[0], this.padding, this.dataFormat, this.dilationRate[0]);
                }
                else if (this.rank === 2) {
                    // TODO(cais): Move up to constructor.
                    outputs = conv2dWithBiasActivation(inputs, this.kernel.read(), biasValue, this.strides, this.padding, this.dataFormat, this.dilationRate);
                }
                else if (this.rank === 3) {
                    outputs = conv3dWithBias(inputs, this.kernel.read(), biasValue, this.strides, this.padding, this.dataFormat, this.dilationRate);
                }
                else {
                    throw new NotImplementedError('convolutions greater than 3D are not implemented yet.');
                }
                if (this.activation != null) {
                    outputs = this.activation.apply(outputs);
                }
            }
            return outputs;
        });
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const newSpace = [];
        const space = (this.dataFormat === 'channelsLast') ?
            inputShape.slice(1, inputShape.length - 1) :
            inputShape.slice(2);
        for (let i = 0; i < space.length; ++i) {
            const newDim = convOutputLength(space[i], this.kernelSize[i], this.padding, this.strides[i], typeof this.dilationRate === 'number' ? this.dilationRate :
                this.dilationRate[i]);
            newSpace.push(newDim);
        }
        let outputShape = [inputShape[0]];
        if (this.dataFormat === 'channelsLast') {
            outputShape = outputShape.concat(newSpace);
            outputShape.push(this.filters);
        }
        else {
            outputShape.push(this.filters);
            outputShape = outputShape.concat(newSpace);
        }
        return outputShape;
    }
    getConfig() {
        const config = {
            filters: this.filters,
            kernelInitializer: serializeInitializer(this.kernelInitializer),
            kernelRegularizer: serializeRegularizer(this.kernelRegularizer),
            kernelConstraint: serializeConstraint(this.kernelConstraint)
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
    static verifyArgs(args) {
        // Check config.filters type, shape, and value.
        if (!('filters' in args) || typeof args.filters !== 'number' ||
            args.filters < 1) {
            throw new ValueError(`Convolution layer expected config.filters to be a 'number' > 0 ` +
                `but got ${JSON.stringify(args.filters)}`);
        }
    }
}
export class Conv2D extends Conv {
    constructor(args) {
        super(2, args);
        Conv2D.verifyArgs(args);
    }
    getConfig() {
        const config = super.getConfig();
        delete config['rank'];
        return config;
    }
    static verifyArgs(args) {
        // config.kernelSize must be a number or array of numbers.
        if ((typeof args.kernelSize !== 'number') &&
            !generic_utils.checkArrayTypeAndLength(args.kernelSize, 'number', 1, 2)) {
            throw new ValueError(`Conv2D expects config.kernelSize to be number or number[] with ` +
                `length 1 or 2, but received ${JSON.stringify(args.kernelSize)}.`);
        }
    }
}
/** @nocollapse */
Conv2D.className = 'Conv2D';
serialization.registerClass(Conv2D);
export class Conv3D extends Conv {
    constructor(args) {
        super(3, args);
        Conv3D.verifyArgs(args);
    }
    getConfig() {
        const config = super.getConfig();
        delete config['rank'];
        return config;
    }
    static verifyArgs(args) {
        // config.kernelSize must be a number or array of numbers.
        if (typeof args.kernelSize !== 'number') {
            if (!(Array.isArray(args.kernelSize) &&
                (args.kernelSize.length === 1 || args.kernelSize.length === 3))) {
                throw new ValueError(`Conv3D expects config.kernelSize to be number or` +
                    ` [number, number, number], but received ${JSON.stringify(args.kernelSize)}.`);
            }
        }
    }
}
/** @nocollapse */
Conv3D.className = 'Conv3D';
serialization.registerClass(Conv3D);
export class Conv2DTranspose extends Conv2D {
    constructor(args) {
        super(args);
        this.inputSpec = [new InputSpec({ ndim: 4 })];
        if (this.padding !== 'same' && this.padding !== 'valid') {
            throw new ValueError(`Conv2DTranspose currently supports only padding modes 'same' ` +
                `and 'valid', but received padding mode ${this.padding}`);
        }
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        if (inputShape.length !== 4) {
            throw new ValueError('Input should have rank 4; Received input shape: ' +
                JSON.stringify(inputShape));
        }
        const channelAxis = this.dataFormat === 'channelsFirst' ? 1 : inputShape.length - 1;
        if (inputShape[channelAxis] == null) {
            throw new ValueError('The channel dimension of the inputs should be defined. ' +
                'Found `None`.');
        }
        const inputDim = inputShape[channelAxis];
        const kernelShape = this.kernelSize.concat([this.filters, inputDim]);
        this.kernel = this.addWeight('kernel', kernelShape, 'float32', this.kernelInitializer, this.kernelRegularizer, true, this.kernelConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.filters], 'float32', this.biasInitializer, this.biasRegularizer, true, this.biasConstraint);
        }
        // Set input spec.
        this.inputSpec =
            [new InputSpec({ ndim: 4, axes: { [channelAxis]: inputDim } })];
        this.built = true;
    }
    call(inputs, kwargs) {
        return tfc.tidy(() => {
            let input = getExactlyOneTensor(inputs);
            if (input.shape.length !== 4) {
                throw new ValueError(`Conv2DTranspose.call() expects input tensor to be rank-4, but ` +
                    `received a tensor of rank-${input.shape.length}`);
            }
            const inputShape = input.shape;
            const batchSize = inputShape[0];
            let hAxis;
            let wAxis;
            if (this.dataFormat === 'channelsFirst') {
                hAxis = 2;
                wAxis = 3;
            }
            else {
                hAxis = 1;
                wAxis = 2;
            }
            const height = inputShape[hAxis];
            const width = inputShape[wAxis];
            const kernelH = this.kernelSize[0];
            const kernelW = this.kernelSize[1];
            const strideH = this.strides[0];
            const strideW = this.strides[1];
            // Infer the dynamic output shape.
            const outHeight = deconvLength(height, strideH, kernelH, this.padding);
            const outWidth = deconvLength(width, strideW, kernelW, this.padding);
            // Porting Note: We don't branch based on `this.dataFormat` here,
            // because
            //   the tjfs-core function `conv2dTranspose` called below always
            //   assumes channelsLast.
            const outputShape = [batchSize, outHeight, outWidth, this.filters];
            if (this.dataFormat !== 'channelsLast') {
                input = tfc.transpose(input, [0, 2, 3, 1]);
            }
            let outputs = tfc.conv2dTranspose(input, this.kernel.read(), outputShape, this.strides, this.padding);
            if (this.dataFormat !== 'channelsLast') {
                outputs = tfc.transpose(outputs, [0, 3, 1, 2]);
            }
            if (this.bias != null) {
                outputs =
                    K.biasAdd(outputs, this.bias.read(), this.dataFormat);
            }
            if (this.activation != null) {
                outputs = this.activation.apply(outputs);
            }
            return outputs;
        });
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        const outputShape = inputShape.slice();
        let channelAxis;
        let heightAxis;
        let widthAxis;
        if (this.dataFormat === 'channelsFirst') {
            channelAxis = 1;
            heightAxis = 2;
            widthAxis = 3;
        }
        else {
            channelAxis = 3;
            heightAxis = 1;
            widthAxis = 2;
        }
        const kernelH = this.kernelSize[0];
        const kernelW = this.kernelSize[1];
        const strideH = this.strides[0];
        const strideW = this.strides[1];
        outputShape[channelAxis] = this.filters;
        outputShape[heightAxis] =
            deconvLength(outputShape[heightAxis], strideH, kernelH, this.padding);
        outputShape[widthAxis] =
            deconvLength(outputShape[widthAxis], strideW, kernelW, this.padding);
        return outputShape;
    }
    getConfig() {
        const config = super.getConfig();
        delete config['dilationRate'];
        return config;
    }
}
/** @nocollapse */
Conv2DTranspose.className = 'Conv2DTranspose';
serialization.registerClass(Conv2DTranspose);
export class SeparableConv extends Conv {
    constructor(rank, config) {
        super(rank, config);
        this.DEFAULT_DEPTHWISE_INITIALIZER = 'glorotUniform';
        this.DEFAULT_POINTWISE_INITIALIZER = 'glorotUniform';
        this.depthwiseKernel = null;
        this.pointwiseKernel = null;
        if (config.filters == null) {
            throw new ValueError('The `filters` configuration field is required by SeparableConv, ' +
                'but is unspecified.');
        }
        if (config.kernelInitializer != null || config.kernelRegularizer != null ||
            config.kernelConstraint != null) {
            throw new ValueError('Fields kernelInitializer, kernelRegularizer and kernelConstraint ' +
                'are invalid for SeparableConv2D. Use depthwiseInitializer, ' +
                'depthwiseRegularizer, depthwiseConstraint, pointwiseInitializer, ' +
                'pointwiseRegularizer and pointwiseConstraint instead.');
        }
        if (config.padding != null && config.padding !== 'same' &&
            config.padding !== 'valid') {
            throw new ValueError(`SeparableConv${this.rank}D supports only padding modes: ` +
                `'same' and 'valid', but received ${JSON.stringify(config.padding)}`);
        }
        this.depthMultiplier =
            config.depthMultiplier == null ? 1 : config.depthMultiplier;
        this.depthwiseInitializer = getInitializer(config.depthwiseInitializer || this.DEFAULT_DEPTHWISE_INITIALIZER);
        this.depthwiseRegularizer = getRegularizer(config.depthwiseRegularizer);
        this.depthwiseConstraint = getConstraint(config.depthwiseConstraint);
        this.pointwiseInitializer = getInitializer(config.depthwiseInitializer || this.DEFAULT_POINTWISE_INITIALIZER);
        this.pointwiseRegularizer = getRegularizer(config.pointwiseRegularizer);
        this.pointwiseConstraint = getConstraint(config.pointwiseConstraint);
    }
    build(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        if (inputShape.length < this.rank + 2) {
            throw new ValueError(`Inputs to SeparableConv${this.rank}D should have rank ` +
                `${this.rank + 2}, but received input shape: ` +
                `${JSON.stringify(inputShape)}`);
        }
        const channelAxis = this.dataFormat === 'channelsFirst' ? 1 : inputShape.length - 1;
        if (inputShape[channelAxis] == null || inputShape[channelAxis] < 0) {
            throw new ValueError(`The channel dimension of the inputs should be defined, ` +
                `but found ${JSON.stringify(inputShape[channelAxis])}`);
        }
        const inputDim = inputShape[channelAxis];
        const depthwiseKernelShape = this.kernelSize.concat([inputDim, this.depthMultiplier]);
        const pointwiseKernelShape = [];
        for (let i = 0; i < this.rank; ++i) {
            pointwiseKernelShape.push(1);
        }
        pointwiseKernelShape.push(inputDim * this.depthMultiplier, this.filters);
        const trainable = true;
        this.depthwiseKernel = this.addWeight('depthwise_kernel', depthwiseKernelShape, 'float32', this.depthwiseInitializer, this.depthwiseRegularizer, trainable, this.depthwiseConstraint);
        this.pointwiseKernel = this.addWeight('pointwise_kernel', pointwiseKernelShape, 'float32', this.pointwiseInitializer, this.pointwiseRegularizer, trainable, this.pointwiseConstraint);
        if (this.useBias) {
            this.bias = this.addWeight('bias', [this.filters], 'float32', this.biasInitializer, this.biasRegularizer, trainable, this.biasConstraint);
        }
        else {
            this.bias = null;
        }
        this.inputSpec =
            [new InputSpec({ ndim: this.rank + 2, axes: { [channelAxis]: inputDim } })];
        this.built = true;
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = getExactlyOneTensor(inputs);
            let output;
            if (this.rank === 1) {
                throw new NotImplementedError('1D separable convolution is not implemented yet.');
            }
            else if (this.rank === 2) {
                if (this.dataFormat === 'channelsFirst') {
                    inputs = tfc.transpose(inputs, [0, 2, 3, 1]); // NCHW -> NHWC.
                }
                output = tfc.separableConv2d(inputs, this.depthwiseKernel.read(), this.pointwiseKernel.read(), this.strides, this.padding, this.dilationRate, 'NHWC');
            }
            if (this.useBias) {
                output = K.biasAdd(output, this.bias.read(), this.dataFormat);
            }
            if (this.activation != null) {
                output = this.activation.apply(output);
            }
            if (this.dataFormat === 'channelsFirst') {
                output = tfc.transpose(output, [0, 3, 1, 2]); // NHWC -> NCHW.
            }
            return output;
        });
    }
    getConfig() {
        const config = super.getConfig();
        delete config['rank'];
        delete config['kernelInitializer'];
        delete config['kernelRegularizer'];
        delete config['kernelConstraint'];
        config['depthwiseInitializer'] =
            serializeInitializer(this.depthwiseInitializer);
        config['pointwiseInitializer'] =
            serializeInitializer(this.pointwiseInitializer);
        config['depthwiseRegularizer'] =
            serializeRegularizer(this.depthwiseRegularizer);
        config['pointwiseRegularizer'] =
            serializeRegularizer(this.pointwiseRegularizer);
        config['depthwiseConstraint'] =
            serializeConstraint(this.depthwiseConstraint);
        config['pointwiseConstraint'] =
            serializeConstraint(this.pointwiseConstraint);
        return config;
    }
}
/** @nocollapse */
SeparableConv.className = 'SeparableConv';
export class SeparableConv2D extends SeparableConv {
    constructor(args) {
        super(2, args);
    }
}
/** @nocollapse */
SeparableConv2D.className = 'SeparableConv2D';
serialization.registerClass(SeparableConv2D);
export class Conv1D extends Conv {
    constructor(args) {
        super(1, args);
        Conv1D.verifyArgs(args);
        this.inputSpec = [{ ndim: 3 }];
    }
    getConfig() {
        const config = super.getConfig();
        delete config['rank'];
        delete config['dataFormat'];
        return config;
    }
    static verifyArgs(args) {
        // config.kernelSize must be a number or array of numbers.
        if (typeof args.kernelSize !== 'number' &&
            !generic_utils.checkArrayTypeAndLength(args.kernelSize, 'number', 1, 1)) {
            throw new ValueError(`Conv1D expects config.kernelSize to be number or number[] with ` +
                `length 1, but received ${JSON.stringify(args.kernelSize)}.`);
        }
    }
}
/** @nocollapse */
Conv1D.className = 'Conv1D';
serialization.registerClass(Conv1D);
export class Cropping2D extends Layer {
    constructor(args) {
        super(args);
        if (typeof args.cropping === 'number') {
            this.cropping =
                [[args.cropping, args.cropping], [args.cropping, args.cropping]];
        }
        else if (typeof args.cropping[0] === 'number') {
            this.cropping = [
                [args.cropping[0], args.cropping[0]],
                [args.cropping[1], args.cropping[1]]
            ];
        }
        else {
            this.cropping = args.cropping;
        }
        this.dataFormat =
            args.dataFormat === undefined ? 'channelsLast' : args.dataFormat;
        this.inputSpec = [{ ndim: 4 }];
    }
    computeOutputShape(inputShape) {
        if (this.dataFormat === 'channelsFirst') {
            return [
                inputShape[0], inputShape[1],
                inputShape[2] - this.cropping[0][0] - this.cropping[0][1],
                inputShape[3] - this.cropping[1][0] - this.cropping[1][1]
            ];
        }
        else {
            return [
                inputShape[0],
                inputShape[1] - this.cropping[0][0] - this.cropping[0][1],
                inputShape[2] - this.cropping[1][0] - this.cropping[1][1], inputShape[3]
            ];
        }
    }
    call(inputs, kwargs) {
        return tidy(() => {
            inputs = getExactlyOneTensor(inputs);
            if (this.dataFormat === 'channelsLast') {
                const hSliced = K.sliceAlongAxis(inputs, this.cropping[0][0], inputs.shape[1] - this.cropping[0][0] - this.cropping[0][1], 2);
                return K.sliceAlongAxis(hSliced, this.cropping[1][0], inputs.shape[2] - this.cropping[1][1] - this.cropping[1][0], 3);
            }
            else {
                const hSliced = K.sliceAlongAxis(inputs, this.cropping[0][0], inputs.shape[2] - this.cropping[0][0] - this.cropping[0][1], 3);
                return K.sliceAlongAxis(hSliced, this.cropping[1][0], inputs.shape[3] - this.cropping[1][1] - this.cropping[1][0], 4);
            }
        });
    }
    getConfig() {
        const config = { cropping: this.cropping, dataFormat: this.dataFormat };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
Cropping2D.className = 'Cropping2D';
serialization.registerClass(Cropping2D);
export class UpSampling2D extends Layer {
    constructor(args) {
        super(args);
        this.DEFAULT_SIZE = [2, 2];
        this.inputSpec = [{ ndim: 4 }];
        this.size = args.size == null ? this.DEFAULT_SIZE : args.size;
        this.dataFormat =
            args.dataFormat == null ? 'channelsLast' : args.dataFormat;
        checkDataFormat(this.dataFormat);
        this.interpolation =
            args.interpolation == null ? 'nearest' : args.interpolation;
        checkInterpolationFormat(this.interpolation);
    }
    computeOutputShape(inputShape) {
        if (this.dataFormat === 'channelsFirst') {
            const height = inputShape[2] == null ? null : this.size[0] * inputShape[2];
            const width = inputShape[3] == null ? null : this.size[1] * inputShape[3];
            return [inputShape[0], inputShape[1], height, width];
        }
        else {
            const height = inputShape[1] == null ? null : this.size[0] * inputShape[1];
            const width = inputShape[2] == null ? null : this.size[1] * inputShape[2];
            return [inputShape[0], height, width, inputShape[3]];
        }
    }
    call(inputs, kwargs) {
        return tfc.tidy(() => {
            let input = getExactlyOneTensor(inputs);
            const inputShape = input.shape;
            if (this.dataFormat === 'channelsFirst') {
                input = tfc.transpose(input, [0, 2, 3, 1]);
                const height = this.size[0] * inputShape[2];
                const width = this.size[1] * inputShape[3];
                const resized = this.interpolation === 'nearest' ?
                    input.resizeNearestNeighbor([height, width]) :
                    input.resizeBilinear([height, width]);
                return tfc.transpose(resized, [0, 3, 1, 2]);
            }
            else {
                const height = this.size[0] * inputShape[1];
                const width = this.size[1] * inputShape[2];
                return this.interpolation === 'nearest' ?
                    input.resizeNearestNeighbor([height, width]) :
                    input.resizeBilinear([height, width]);
            }
        });
    }
    getConfig() {
        const config = { size: this.size, dataFormat: this.dataFormat };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
UpSampling2D.className = 'UpSampling2D';
serialization.registerClass(UpSampling2D);
//# sourceMappingURL=convolutional.js.map