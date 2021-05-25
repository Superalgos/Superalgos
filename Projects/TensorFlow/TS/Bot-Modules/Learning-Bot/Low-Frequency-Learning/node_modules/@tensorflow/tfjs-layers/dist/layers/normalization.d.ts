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
import { Layer, LayerArgs } from '../engine/topology';
import { Initializer, InitializerIdentifier } from '../initializers';
import { Shape } from '../keras_format/common';
import { Regularizer, RegularizerIdentifier } from '../regularizers';
import { Kwargs } from '../types';
/**
 * Applies batch normalization on x given mean, var, beta and gamma.
 *
 * I.e. returns:
 *   `output = (x - mean) / (sqrt(var) + epsilon) * gamma + beta`
 *
 * @param x Input tensor.
 * @param mean Mean of batch.
 * @param variance Variance of batch.
 * @param beta Tensor with which to center the input.
 * @param gamma Tensor by which to scale the input.
 * @param epsilon Fuzz factor.
 * @returns The result of the batch normalization.
 */
export declare function batchNormalization(x: Tensor, mean: Tensor, variance: Tensor, beta?: Tensor, gamma?: Tensor, epsilon?: number): Tensor;
/**
 * Batch normalization for use in training (not inference).
 *
 * @param x Input tensor to be normalized.
 * @param gamma Tensor by which to scale the input.
 * @param beta Tensor by which to center the input.
 * @param reductionAxes Axes over which to normalize.
 * @param epsilon Fuzz factor.
 * @returns An `Array` of three `Tensors`:
 *   [normalized tensor, mean of input, variance of input].
 */
export declare function normalizeBatchInTraining(x: Tensor, gamma: Tensor, beta: Tensor, reductionAxes: number[], epsilon?: number): [Tensor, Tensor, Tensor];
export declare interface BatchNormalizationLayerArgs extends LayerArgs {
    /**
     * The integer axis that should be normalized (typically the features axis).
     * Defaults to -1.
     *
     * For instance, after a `Conv2D` layer with `data_format="channels_first"`,
     * set `axis=1` in `batchNormalization`.
     */
    axis?: number;
    /**
     * Momentum of the moving average. Defaults to 0.99.
     */
    momentum?: number;
    /**
     * Small float added to the variance to avoid dividing by zero. Defaults to
     * 1e-3.
     */
    epsilon?: number;
    /**
     * If `true`, add offset of `beta` to normalized tensor.
     * If `false`, `beta` is ignored.
     * Defaults to `true`.
     */
    center?: boolean;
    /**
     * If `true`, multiply by `gamma`.
     * If `false`, `gamma` is not used.
     * When the next layer is linear (also e.g. `nn.relu`),
     * this can be disabled since the scaling will be done by the next layer.
     * Defaults to `true`.
     */
    scale?: boolean;
    /**
     * Initializer for the beta weight.
     *  Defaults to 'zeros'.
     */
    betaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the gamma weight.
     *  Defaults to `ones`.
     */
    gammaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the moving mean.
     * Defaults to `zeros`
     */
    movingMeanInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the moving variance.
     *  Defaults to 'Ones'.
     */
    movingVarianceInitializer?: InitializerIdentifier | Initializer;
    /**
     * Constraint for the beta weight.
     */
    betaConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Constraint for gamma weight.
     */
    gammaConstraint?: ConstraintIdentifier | Constraint;
    /**
     * Regularizer for the beta weight.
     */
    betaRegularizer?: RegularizerIdentifier | Regularizer;
    /**
     * Regularizer for the gamma weight.
     */
    gammaRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare class BatchNormalization extends Layer {
    /** @nocollapse */
    static className: string;
    private readonly axis;
    private readonly momentum;
    private readonly epsilon;
    private readonly center;
    private readonly scale;
    private readonly betaInitializer;
    private readonly gammaInitializer;
    private readonly movingMeanInitializer;
    private readonly movingVarianceInitializer;
    private readonly betaConstraint;
    private readonly gammaConstraint;
    private readonly betaRegularizer;
    private readonly gammaRegularizer;
    private gamma;
    private beta;
    private movingMean;
    private movingVariance;
    constructor(args?: BatchNormalizationLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export interface LayerNormalizationLayerArgs extends LayerArgs {
    /**
     * The axis or axes that should be normalized (typically, the feature axis.)
     * Defaults to -1 (the last axis.)
     */
    axis?: number | number[];
    /**
     * A small positive float added to variance to avoid divison by zero.
     * Defaults to 1e-3.
     */
    epsilon?: number;
    /**
     * If `true`, add offset of `beta` to normalized tensor.
     * If `false`, `beta` is ignored.
     * Default: `true`.
     */
    center?: boolean;
    /**
     * If `true`, multiply output by `gamma`.
     * If `false`, `gamma` is not used.
     * When the next layer is linear, this can be disabled since scaling will
     * be done by the next layer.
     * Default: `true`.
     */
    scale?: boolean;
    /**
     * Initializer for the beta weight.
     * Default: `'zeros'`.
     */
    betaInitializer?: InitializerIdentifier | Initializer;
    /**
     * Initializer for the gamma weight.
     * Default: `'ones'`.
     */
    gammaInitializer?: InitializerIdentifier | Initializer;
    /** Regularizer for the beta weight. */
    betaRegularizer?: RegularizerIdentifier | Regularizer;
    /** Regularizer for the gamma weight. */
    gammaRegularizer?: RegularizerIdentifier | Regularizer;
}
export declare class LayerNormalization extends Layer {
    /** @nocollapse */
    static className: string;
    private axis;
    readonly epsilon: number;
    readonly center: boolean;
    readonly scale: boolean;
    readonly betaInitializer: Initializer;
    readonly gammaInitializer: Initializer;
    readonly betaRegularizer: Regularizer;
    readonly gammaRegularizer: Regularizer;
    private gamma;
    private beta;
    constructor(args?: LayerNormalizationLayerArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
