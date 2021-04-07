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
 * TensorFlow.js Layers: Basic Layers.
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Activation as ActivationFn } from '../activations';
import { Constraint, ConstraintIdentifier } from '../constraints';
import { DisposeResult, Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { ActivationIdentifier } from '../keras_format/activation_config';
import { DataFormat, Shape } from '../keras_format/common';
import { LayerConfig } from '../keras_format/topology_config';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs } from '../types';
export declare interface DropoutLayerArgs extends LayerArgs {
    /** Float between 0 and 1. Fraction of the input units to drop. */
    rate: number;
    /**
     * Integer array representing the shape of the binary dropout mask that will
     * be multiplied with the input.
     *
     * For instance, if your inputs have shape `(batchSize, timesteps, features)`
     * and you want the dropout mask to be the same for all timesteps, you can use
     * `noise_shape=(batch_size, 1, features)`.
     */
    noiseShape?: number[];
    /** An integer to use as random seed. */
    seed?: number;
}
export declare class Dropout extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly rate;
    private readonly noiseShape;
    private readonly seed;
    constructor(args: DropoutLayerArgs);
    protected getNoiseShape(input: Tensor): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
    dispose(): DisposeResult;
}
export declare interface DenseLayerArgs extends LayerArgs {
    /** Positive integer, dimensionality of the output space. */
    units: number;
    /**
     * Activation function to use.
     *
     * If unspecified, no activation is applied.
     */
    activation?: ActivationIdentifier;
    /** Whether to apply a bias. */
    useBias?: boolean;
    /**
     * Initializer for the dense kernel weights matrix.
     */
    kernelInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the bias vector.
     */
    biasInitializer?: InitializerIdentifier | Initializer;
    /**
     * If specified, defines inputShape as `[inputDim]`.
     */
    inputDim?: number;
    /**
     * Constraint for the kernel weights.
     */
    kernelConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for the bias vector.
     */
    biasConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer function applied to the dense kernel weights matrix.
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
export interface SpatialDropout1DLayerConfig extends LayerConfig {
    /** Float between 0 and 1. Fraction of the input units to drop. */
    rate: number;
    /** An integer to use as random seed. */
    seed?: number;
}
export declare class SpatialDropout1D extends Dropout {
    /** @nocollapse */
    static className: string;
    constructor(args: SpatialDropout1DLayerConfig);
    protected getNoiseShape(input: Tensor): Shape;
}
export declare class Dense extends Layer {
    /** @nocollapse */
    static className: string;
    private units;
    private activation;
    private useBias;
    private kernelInitializer;
    private biasInitializer;
    private kernel;
    private bias;
    readonly DEFAULT_KERNEL_INITIALIZER: InitializerIdentifier;
    readonly DEFAULT_BIAS_INITIALIZER: InitializerIdentifier;
    private readonly kernelConstraint?;
    private readonly biasConstraint?;
    private readonly kernelRegularizer?;
    private readonly biasRegularizer?;
    constructor(args: DenseLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface FlattenLayerArgs extends LayerArgs {
    /** Image data format: channeLast (default) or channelFirst. */
    dataFormat?: DataFormat;
}
export declare class Flatten extends Layer {
    private dataFormat;
    /** @nocollapse */
    static className: string;
    constructor(args?: FlattenLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface ActivationLayerArgs extends LayerArgs {
    /**
     * Name of the activation function to use.
     */
    activation: ActivationIdentifier;
}
export declare class Activation extends Layer {
    /** @nocollapse */
    static className: string;
    activation: ActivationFn;
    constructor(args: ActivationLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface ReshapeLayerArgs extends LayerArgs {
    /** The target shape. Does not include the batch axis. */
    targetShape: Shape;
}
export declare interface RepeatVectorLayerArgs extends LayerArgs {
    /**
     * The integer number of times to repeat the input.
     */
    n: number;
}
export declare class RepeatVector extends Layer {
    /** @nocollapse */
    static className: string;
    readonly n: number;
    constructor(args: RepeatVectorLayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class Reshape extends Layer {
    /** @nocollapse */
    static className: string;
    private targetShape;
    constructor(args: ReshapeLayerArgs);
    private isUnknown;
    /**
     * Finds and replaces a missing dimension in output shape.
     *
     * This is a near direct port of the internal Numpy function
     * `_fix_unknown_dimension` in `numpy/core/src/multiarray/shape.c`.
     *
     * @param inputShape: Original shape of array begin reshape.
     * @param outputShape: Target shape of the array, with at most a single
     * `null` or negative number, which indicates an underdetermined dimension
     * that should be derived from `inputShape` and the known dimensions of
     *   `outputShape`.
     * @returns: The output shape with `null` replaced with its computed value.
     * @throws: ValueError: If `inputShape` and `outputShape` do not match.
     */
    private fixUnknownDimension;
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface PermuteLayerArgs extends LayerArgs {
    /**
     * Array of integers. Permutation pattern. Does not include the
     * sample (batch) dimension. Index starts at 1.
     * For instance, `[2, 1]` permutes the first and second dimensions
     * of the input.
     */
    dims: number[];
}
export declare class Permute extends Layer {
    /** @nocollapse */
    static className: string;
    readonly dims: number[];
    private readonly dimsIncludingBatch;
    constructor(args: PermuteLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare interface MaskingArgs extends LayerArgs {
    /**
     * Masking Value. Defaults to `0.0`.
     */
    maskValue?: number;
}
export declare class Masking extends Layer {
    /** @nocollapse */
    static className: string;
    maskValue: number;
    constructor(args?: MaskingArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    getConfig(): {
        maskValue: number;
    };
    computeMask(inputs: Tensor | Tensor[], mask?: Tensor | Tensor[]): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
