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
 * TensorFlow.js Layers: Noise Layers.
 */
import { Tensor } from '@tensorflow/tfjs-core';
import { Layer, LayerArgs } from '../engine/topology';
import { Shape } from '../keras_format/common';
import { Kwargs } from '../types';
export declare interface GaussianNoiseArgs extends LayerArgs {
    /** Standard Deviation.  */
    stddev: number;
}
export declare class GaussianNoise extends Layer {
    /** @nocollapse */
    static className: string;
    readonly stddev: number;
    constructor(args: GaussianNoiseArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        stddev: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare interface GaussianDropoutArgs extends LayerArgs {
    /** drop probability.  */
    rate: number;
}
export declare class GaussianDropout extends Layer {
    /** @nocollapse */
    static className: string;
    readonly rate: number;
    constructor(args: GaussianDropoutArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        rate: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare interface AlphaDropoutArgs extends LayerArgs {
    /** drop probability.  */
    rate: number;
    /**
     * A 1-D `Tensor` of type `int32`, representing the
     * shape for randomly generated keep/drop flags.
     */
    noiseShape?: Shape;
}
/**
 * Applies Alpha Dropout to the input.
 *
 * As it is a regularization layer, it is only active at training time.
 *
 * Alpha Dropout is a `Dropout` that keeps mean and variance of inputs
 * to their original values, in order to ensure the self-normalizing property
 * even after this dropout.
 * Alpha Dropout fits well to Scaled Exponential Linear Units
 * by randomly setting activations to the negative saturation value.
 *
 * Arguments:
 *   - `rate`: float, drop probability (as with `Dropout`).
 *     The multiplicative noise will have
 *     standard deviation `sqrt(rate / (1 - rate))`.
 *   - `noise_shape`: A 1-D `Tensor` of type `int32`, representing the
 *     shape for randomly generated keep/drop flags.
 *
 * Input shape:
 *   Arbitrary. Use the keyword argument `inputShape`
 *   (tuple of integers, does not include the samples axis)
 *   when using this layer as the first layer in a model.
 *
 * Output shape:
 *   Same shape as input.
 *
 * References:
 *   - [Self-Normalizing Neural Networks](https://arxiv.org/abs/1706.02515)
 */
export declare class AlphaDropout extends Layer {
    /** @nocollapse */
    static className: string;
    readonly rate: number;
    readonly noiseShape: Shape;
    constructor(args: AlphaDropoutArgs);
    _getNoiseShape(inputs: Tensor | Tensor[]): number[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        rate: number;
    };
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
