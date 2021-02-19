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
/**
 * Base class for functions that impose constraints on weight values
 *
 * @doc {
 *   heading: 'Constraints',
 *   subheading: 'Classes',
 *   namespace: 'constraints'
 * }
 */
export declare abstract class Constraint extends serialization.Serializable {
    abstract apply(w: Tensor): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface MaxNormArgs {
    /**
     * Maximum norm for incoming weights
     */
    maxValue?: number;
    /**
     * Axis along which to calculate norms.
     *
     *  For instance, in a `Dense` layer the weight matrix
     *  has shape `[inputDim, outputDim]`,
     *  set `axis` to `0` to constrain each weight vector
     *  of length `[inputDim,]`.
     *  In a `Conv2D` layer with `dataFormat="channels_last"`,
     *  the weight tensor has shape
     *  `[rows, cols, inputDepth, outputDepth]`,
     *  set `axis` to `[0, 1, 2]`
     *  to constrain the weights of each filter tensor of size
     *  `[rows, cols, inputDepth]`.
     */
    axis?: number;
}
export declare class MaxNorm extends Constraint {
    /** @nocollapse */
    static readonly className = "MaxNorm";
    private maxValue;
    private axis;
    private readonly defaultMaxValue;
    private readonly defaultAxis;
    constructor(args: MaxNormArgs);
    apply(w: Tensor): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface UnitNormArgs {
    /**
     * Axis along which to calculate norms.
     *
     * For instance, in a `Dense` layer the weight matrix
     * has shape `[inputDim, outputDim]`,
     * set `axis` to `0` to constrain each weight vector
     * of length `[inputDim,]`.
     * In a `Conv2D` layer with `dataFormat="channels_last"`,
     * the weight tensor has shape
     * [rows, cols, inputDepth, outputDepth]`,
     * set `axis` to `[0, 1, 2]`
     * to constrain the weights of each filter tensor of size
     * `[rows, cols, inputDepth]`.
     */
    axis?: number;
}
export declare class UnitNorm extends Constraint {
    /** @nocollapse */
    static readonly className = "UnitNorm";
    private axis;
    private readonly defaultAxis;
    constructor(args: UnitNormArgs);
    apply(w: Tensor): Tensor;
    getConfig(): serialization.ConfigDict;
}
export declare class NonNeg extends Constraint {
    /** @nocollapse */
    static readonly className = "NonNeg";
    apply(w: Tensor): Tensor;
}
export interface MinMaxNormArgs {
    /**
     * Minimum norm for incoming weights
     */
    minValue?: number;
    /**
     * Maximum norm for incoming weights
     */
    maxValue?: number;
    /**
     * Axis along which to calculate norms.
     * For instance, in a `Dense` layer the weight matrix
     * has shape `[inputDim, outputDim]`,
     * set `axis` to `0` to constrain each weight vector
     * of length `[inputDim,]`.
     * In a `Conv2D` layer with `dataFormat="channels_last"`,
     * the weight tensor has shape
     * `[rows, cols, inputDepth, outputDepth]`,
     * set `axis` to `[0, 1, 2]`
     * to constrain the weights of each filter tensor of size
     * `[rows, cols, inputDepth]`.
     */
    axis?: number;
    /**
     * Rate for enforcing the constraint: weights will be rescaled to yield:
     * `(1 - rate) * norm + rate * norm.clip(minValue, maxValue)`.
     * Effectively, this means that rate=1.0 stands for strict
     * enforcement of the constraint, while rate<1.0 means that
     * weights will be rescaled at each step to slowly move
     * towards a value inside the desired interval.
     */
    rate?: number;
}
export declare class MinMaxNorm extends Constraint {
    /** @nocollapse */
    static readonly className = "MinMaxNorm";
    private minValue;
    private maxValue;
    private rate;
    private axis;
    private readonly defaultMinValue;
    private readonly defaultMaxValue;
    private readonly defaultRate;
    private readonly defaultAxis;
    constructor(args: MinMaxNormArgs);
    apply(w: Tensor): Tensor;
    getConfig(): serialization.ConfigDict;
}
/** @docinline */
export declare type ConstraintIdentifier = 'maxNorm' | 'minMaxNorm' | 'nonNeg' | 'unitNorm' | string;
export declare const CONSTRAINT_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in ConstraintIdentifier]: string;
};
export declare function serializeConstraint(constraint: Constraint): serialization.ConfigDictValue;
export declare function deserializeConstraint(config: serialization.ConfigDict, customObjects?: serialization.ConfigDict): Constraint;
export declare function getConstraint(identifier: ConstraintIdentifier | serialization.ConfigDict | Constraint): Constraint;
