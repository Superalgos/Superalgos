/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { fused, serialization, Tensor } from '@tensorflow/tfjs-core';
import { Activation } from '../activations';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { InputSpec, Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { ActivationIdentifier } from '../keras_format/activation_config';
import { DataFormat, InterpolationFormat, PaddingMode, Shape } from '../keras_format/common';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs } from '../types';
import { LayerVariable } from '../variables';
/**
 * Transpose and cast the input before the conv2d.
 * @param x Input image tensor.
 * @param dataFormat
 */
export declare function preprocessConv2DInput(x: Tensor, dataFormat: DataFormat): Tensor;
/**
 * Transpose and cast the input before the conv3d.
 * @param x Input image tensor.
 * @param dataFormat
 */
export declare function preprocessConv3DInput(x: Tensor, dataFormat: DataFormat): Tensor;
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
export declare function conv1dWithBias(x: Tensor, kernel: Tensor, bias: Tensor, strides?: number, padding?: string, dataFormat?: DataFormat, dilationRate?: number): Tensor;
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
export declare function conv1d(x: Tensor, kernel: Tensor, strides?: number, padding?: string, dataFormat?: DataFormat, dilationRate?: number): Tensor;
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
export declare function conv2d(x: Tensor, kernel: Tensor, strides?: number[], padding?: string, dataFormat?: DataFormat, dilationRate?: [number, number]): Tensor;
/**
 * 2D Convolution with an added bias and optional activation.
 * Note: This function does not exist in the Python Keras Backend. This function
 * is exactly the same as `conv2d`, except the added `bias`.
 */
export declare function conv2dWithBiasActivation(x: Tensor, kernel: Tensor, bias: Tensor, strides?: number[], padding?: string, dataFormat?: DataFormat, dilationRate?: [number, number], activation?: fused.Activation): Tensor;
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
export declare function conv3d(x: Tensor, kernel: Tensor, strides?: number[], padding?: string, dataFormat?: DataFormat, dilationRate?: [number, number, number]): Tensor;
/**
 * 3D Convolution with an added bias.
 * Note: This function does not exist in the Python Keras Backend. This function
 * is exactly the same as `conv3d`, except the added `bias`.
 */
export declare function conv3dWithBias(x: Tensor, kernel: Tensor, bias: Tensor, strides?: number[], padding?: string, dataFormat?: DataFormat, dilationRate?: [number, number, number]): Tensor;
/**
 * Base LayerConfig for depthwise and non-depthwise convolutional layers.
 */
export declare interface BaseConvLayerArgs extends LayerArgs {
    /**
     * The dimensions of the convolution window. If kernelSize is a number, the
     * convolutional window will be square.
     */
    kernelSize: number | number[];
    /**
     * The strides of the convolution in each dimension. If strides is a number,
     * strides in both dimensions are equal.
     *
     * Specifying any stride value != 1 is incompatible with specifying any
     * `dilationRate` value != 1.
     */
    strides?: number | number[];
    /**
     * Padding mode.
     */
    padding?: PaddingMode;
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     *  `channels_first` corresponds to inputs with shape `(batch, channels,
     * ...)`.
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
    /**
     * The dilation rate to use for the dilated convolution in each dimension.
     * Should be an integer or array of two or three integers.
     *
     * Currently, specifying any `dilationRate` value != 1 is incompatible with
     * specifying any `strides` value != 1.
     */
    dilationRate?: number | [number] | [number, number] | [number, number, number];
    /**
     * Activation function of the layer.
     *
     * If you don't specify the activation, none is applied.
     */
    activation?: ActivationIdentifier;
    /**
     * Whether the layer uses a bias vector. Defaults to `true`.
     */
    useBias?: boolean;
    /**
     * Initializer for the convolutional kernel weights matrix.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the convolutional kernel weights.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer function applied to the kernel weights matrix.
     */
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the bias vector.
     */
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the activation.
     */
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}
/**
 * LayerConfig for non-depthwise convolutional layers.
 * Applies to non-depthwise convolution of all ranks (e.g, Conv1D, Conv2D,
 * Conv3D).
 */
export declare interface ConvLayerArgs extends BaseConvLayerArgs {
    /**
     * The dimensionality of the output space (i.e. the number of filters in the
     * convolution).
     */
    filters: number;
}
/**
 * Abstract convolution layer.
 */
export declare abstract class BaseConv extends Layer {
    protected readonly rank: number;
    protected readonly kernelSize: number[];
    protected readonly strides: number[];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    protected readonly activation: Activation;
    protected readonly useBias: boolean;
    protected readonly dilationRate: number[];
    protected readonly biasInitializer?: Initializer;
    protected readonly biasConstraint?: Constraint;
    protected readonly biasRegularizer?: Regularizer;
    protected bias: LayerVariable;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    constructor(rank: number, args: BaseConvLayerArgs);
    protected static verifyArgs(args: BaseConvLayerArgs): void;
    getConfig(): serialization.ConfigDict;
}
/**
 * Abstract nD convolution layer.  Ancestor of convolution layers which reduce
 * across channels, i.e., Conv1D and Conv2D, but not DepthwiseConv2D.
 */
export declare abstract class Conv extends BaseConv {
    protected readonly filters: number;
    protected kernel: LayerVariable;
    protected readonly kernelInitializer?: Initializer;
    protected readonly kernelConstraint?: Constraint;
    protected readonly kernelRegularizer?: Regularizer;
    constructor(rank: number, args: ConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}
export declare class Conv2D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}
export declare class Conv3D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}
export declare class Conv2DTranspose extends Conv2D {
    /** @nocollapse */
    static className: string;
    inputSpec: InputSpec[];
    constructor(args: ConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
export declare interface SeparableConvLayerArgs extends ConvLayerArgs {
    /**
     * The number of depthwise convolution output channels for each input
     * channel.
     * The total number of depthwise convolution output channels will be equal
     * to `filtersIn * depthMultiplier`. Default: 1.
     */
    depthMultiplier?: number;
    /**
     * Initializer for the depthwise kernel matrix.
     */
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the pointwise kernel matrix.
     */
    pointwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Regularizer function applied to the depthwise kernel matrix.
     */
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer function applied to the pointwise kernel matrix.
     */
    pointwiseRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Constraint function applied to the depthwise kernel matrix.
     */
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint function applied to the pointwise kernel matrix.
     */
    pointwiseConstraint?: ConstraintIdentifier | Constraint;
}
export declare class SeparableConv extends Conv {
    /** @nocollapse */
    static className: string;
    readonly depthMultiplier: number;
    protected readonly depthwiseInitializer?: Initializer;
    protected readonly depthwiseRegularizer?: Regularizer;
    protected readonly depthwiseConstraint?: Constraint;
    protected readonly pointwiseInitializer?: Initializer;
    protected readonly pointwiseRegularizer?: Regularizer;
    protected readonly pointwiseConstraint?: Constraint;
    readonly DEFAULT_DEPTHWISE_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_POINTWISE_INITIALIZER: InitializerIdentifier;
    protected depthwiseKernel: LayerVariable;
    protected pointwiseKernel: LayerVariable;
    constructor(rank: number, config?: SeparableConvLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class SeparableConv2D extends SeparableConv {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeparableConvLayerArgs);
}
export declare class Conv1D extends Conv {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLayerArgs);
    getConfig(): serialization.ConfigDict;
    protected static verifyArgs(args: ConvLayerArgs): void;
}
export declare interface Cropping2DLayerArgs extends LayerArgs {
    /**
     * Dimension of the cropping along the width and the height.
     * - If integer: the same symmetric cropping
     *  is applied to width and height.
     * - If list of 2 integers:
     *   interpreted as two different
     *   symmetric cropping values for height and width:
     *   `[symmetric_height_crop, symmetric_width_crop]`.
     * - If a list of 2 list of 2 integers:
     *   interpreted as
     *   `[[top_crop, bottom_crop], [left_crop, right_crop]]`
     */
    cropping: number | [number, number] | [[number, number], [number, number]];
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     * `channels_first` corresponds to inputs with shape
     *   `(batch, channels, ...)`
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
}
export declare class Cropping2D extends Layer {
    /** @nocollapse */
    static className: string;
    protected readonly cropping: [[number, number], [number, number]];
    protected readonly dataFormat: DataFormat;
    constructor(args: Cropping2DLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface UpSampling2DLayerArgs extends LayerArgs {
    /**
     * The upsampling factors for rows and columns.
     *
     * Defaults to `[2, 2]`.
     */
    size?: number[];
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `"channelsLast"` corresponds to inputs with shape
     *   `[batch, ..., channels]`
     *
     *  `"channelsFirst"` corresponds to inputs with shape `[batch, channels,
     * ...]`.
     *
     * Defaults to `"channelsLast"`.
     */
    dataFormat?: DataFormat;
    /**
     * The interpolation mechanism, one of `"nearest"` or `"bilinear"`, default
     * to `"nearest"`.
     */
    interpolation?: InterpolationFormat;
}
export declare class UpSampling2D extends Layer {
    /** @nocollapse */
    static className: string;
    protected readonly DEFAULT_SIZE: number[];
    protected readonly size: number[];
    protected readonly dataFormat: DataFormat;
    protected readonly interpolation: InterpolationFormat;
    constructor(args: UpSampling2DLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
