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
 *  Advanced activation layers.
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Constraint } from '../constraints';
import { Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Shape } from '../keras_format/common';
import { Regularizer } from '../regularizers';
import { Kwargs } from '../types';
export declare interface ReLULayerArgs extends LayerArgs {
    /**
     * Float, the maximum output value.
     */
    maxValue?: number;
}
export declare class ReLU extends Layer {
    /** @nocollapse */
    static className: string;
    maxValue: number;
    constructor(args?: ReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
export declare interface LeakyReLULayerArgs extends LayerArgs {
    /**
     * Float `>= 0`. Negative slope coefficient. Defaults to `0.3`.
     */
    alpha?: number;
}
export declare class LeakyReLU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly alpha: number;
    readonly DEFAULT_ALPHA = 0.3;
    constructor(args?: LeakyReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
export declare interface PReLULayerArgs extends LayerArgs {
    /**
     * Initializer for the learnable alpha.
     */
    alphaInitializer?: Initializer | InitializerIdentifier;
    /**
     * Regularizer for the learnable alpha.
     */
    alphaRegularizer?: Regularizer;
    /**
     * Constraint for the learnable alpha.
     */
    alphaConstraint?: Constraint;
    /**
     * The axes along which to share learnable parameters for the activation
     * function. For example, if the incoming feature maps are from a 2D
     * convolution with output shape `[numExamples, height, width, channels]`,
     * and you wish to share parameters across space (height and width) so that
     * each filter channels has only one set of parameters, set
     * `shared_axes: [1, 2]`.
     */
    sharedAxes?: number | number[];
}
export declare class PReLU extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly alphaInitializer;
    private readonly alphaRegularizer;
    private readonly alphaConstraint;
    private readonly sharedAxes;
    private alpha;
    readonly DEFAULT_ALPHA_INITIALIZER: InitializerIdentifier;
    constructor(args?: PReLULayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface ELULayerArgs extends LayerArgs {
    /**
     * Float `>= 0`. Negative slope coefficient. Defaults to `1.0`.
     */
    alpha?: number;
}
export declare class ELU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly alpha: number;
    readonly DEFAULT_ALPHA = 1;
    constructor(args?: ELULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
export declare interface ThresholdedReLULayerArgs extends LayerArgs {
    /**
     * Float >= 0. Threshold location of activation.
     */
    theta?: number;
}
export declare class ThresholdedReLU extends Layer {
    /** @nocollapse */
    static className: string;
    readonly theta: number;
    readonly DEFAULT_THETA = 1;
    constructor(args?: ThresholdedReLULayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
export declare interface SoftmaxLayerArgs extends LayerArgs {
    /**
     * Integer, axis along which the softmax normalization is applied.
     * Defaults to `-1` (i.e., the last axis).
     */
    axis?: number;
}
export declare class Softmax extends Layer {
    /** @nocollapse */
    static className: string;
    readonly axis: number;
    readonly softmax: (t: Tensor, a?: number) => Tensor;
    readonly DEFAULT_AXIS = 1;
    constructor(args?: SoftmaxLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): serialization.ConfigDict;
}
