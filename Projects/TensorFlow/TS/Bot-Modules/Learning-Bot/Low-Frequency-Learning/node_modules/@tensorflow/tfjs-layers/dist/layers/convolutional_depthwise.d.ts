/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { Initializer, InitializerIdentifier } from '../initializers';
import { DataFormat, Shape } from '../keras_format/common';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs } from '../types';
import { BaseConv, BaseConvLayerArgs } from './convolutional';
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
export declare function depthwiseConv2d(x: Tensor, depthwiseKernel: Tensor, strides?: [number, number], padding?: string, dataFormat?: DataFormat, dilationRate?: [number, number]): Tensor;
export declare interface DepthwiseConv2DLayerArgs extends BaseConvLayerArgs {
    /**
     * An integer or Array of 2 integers, specifying the width and height of the
     * 2D convolution window. Can be a single integer to specify the same value
     * for all spatial dimensions.
     */
    kernelSize: number | [number, number];
    /**
     * The number of depthwise convolution output channels for each input
     * channel.
     * The total number of depthwise convolution output channels will be equal to
     * `filtersIn * depthMultiplier`.
     * Default: 1.
     */
    depthMultiplier?: number;
    /**
     * Initializer for the depthwise kernel matrix.
     * Default: GlorotNormal.
     */
    depthwiseInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the depthwise kernel matrix.
     */
    depthwiseConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regulzarizer function for the depthwise kernel matrix.
     */
    depthwiseRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare class DepthwiseConv2D extends BaseConv {
    /** @nocollapse */
    static className: string;
    private readonly depthMultiplier;
    private readonly depthwiseInitializer;
    private readonly depthwiseConstraint;
    private readonly depthwiseRegularizer;
    private depthwiseKernel;
    constructor(args: DepthwiseConv2DLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
