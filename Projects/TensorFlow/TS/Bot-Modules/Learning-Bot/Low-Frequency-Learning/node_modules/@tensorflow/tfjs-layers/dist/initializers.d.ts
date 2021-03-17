/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { DataType, serialization, Tensor } from '@tensorflow/tfjs-core';
import { Shape } from './keras_format/common';
import { Distribution, FanMode } from './keras_format/initializer_config';
export declare function checkFanMode(value?: string): void;
export declare function checkDistribution(value?: string): void;
/**
 * Initializer base class.
 *
 * @doc {
 *   heading: 'Initializers', subheading: 'Classes', namespace: 'initializers'}
 */
export declare abstract class Initializer extends serialization.Serializable {
    fromConfigUsesCustomObjects(): boolean;
    /**
     * Generate an initial value.
     * @param shape
     * @param dtype
     * @return The init value.
     */
    abstract apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export declare class Zeros extends Initializer {
    /** @nocollapse */
    static className: string;
    apply(shape: Shape, dtype?: DataType): Tensor;
}
export declare class Ones extends Initializer {
    /** @nocollapse */
    static className: string;
    apply(shape: Shape, dtype?: DataType): Tensor;
}
export interface ConstantArgs {
    /** The value for each element in the variable. */
    value: number;
}
export declare class Constant extends Initializer {
    /** @nocollapse */
    static className: string;
    private value;
    constructor(args: ConstantArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface RandomUniformArgs {
    /** Lower bound of the range of random values to generate. */
    minval?: number;
    /** Upper bound of the range of random values to generate. */
    maxval?: number;
    /** Used to seed the random generator. */
    seed?: number;
}
export declare class RandomUniform extends Initializer {
    /** @nocollapse */
    static className: string;
    readonly DEFAULT_MINVAL = -0.05;
    readonly DEFAULT_MAXVAL = 0.05;
    private minval;
    private maxval;
    private seed;
    constructor(args: RandomUniformArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface RandomNormalArgs {
    /** Mean of the random values to generate. */
    mean?: number;
    /** Standard deviation of the random values to generate. */
    stddev?: number;
    /** Used to seed the random generator. */
    seed?: number;
}
export declare class RandomNormal extends Initializer {
    /** @nocollapse */
    static className: string;
    readonly DEFAULT_MEAN = 0;
    readonly DEFAULT_STDDEV = 0.05;
    private mean;
    private stddev;
    private seed;
    constructor(args: RandomNormalArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface TruncatedNormalArgs {
    /** Mean of the random values to generate. */
    mean?: number;
    /** Standard deviation of the random values to generate. */
    stddev?: number;
    /** Used to seed the random generator. */
    seed?: number;
}
export declare class TruncatedNormal extends Initializer {
    /** @nocollapse */
    static className: string;
    readonly DEFAULT_MEAN = 0;
    readonly DEFAULT_STDDEV = 0.05;
    private mean;
    private stddev;
    private seed;
    constructor(args: TruncatedNormalArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface IdentityArgs {
    /**
     * Multiplicative factor to apply to the identity matrix.
     */
    gain?: number;
}
export declare class Identity extends Initializer {
    /** @nocollapse */
    static className: string;
    private gain;
    constructor(args: IdentityArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface VarianceScalingArgs {
    /** Scaling factor (positive float). */
    scale?: number;
    /** Fanning mode for inputs and outputs. */
    mode?: FanMode;
    /** Probabilistic distribution of the values. */
    distribution?: Distribution;
    /** Random number generator seed. */
    seed?: number;
}
export declare class VarianceScaling extends Initializer {
    /** @nocollapse */
    static className: string;
    private scale;
    private mode;
    private distribution;
    private seed;
    /**
     * Constructor of VarianceScaling.
     * @throws ValueError for invalid value in scale.
     */
    constructor(args: VarianceScalingArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
export interface SeedOnlyInitializerArgs {
    /** Random number generator seed. */
    seed?: number;
}
export declare class GlorotUniform extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    /**
     * Constructor of GlorotUniform
     * @param scale
     * @param mode
     * @param distribution
     * @param seed
     */
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export declare class GlorotNormal extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    /**
     * Constructor of GlorotNormal.
     * @param scale
     * @param mode
     * @param distribution
     * @param seed
     */
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export declare class HeNormal extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export declare class HeUniform extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export declare class LeCunNormal extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export declare class LeCunUniform extends VarianceScaling {
    /** @nocollapse */
    static className: string;
    constructor(args?: SeedOnlyInitializerArgs);
    getClassName(): string;
}
export interface OrthogonalArgs extends SeedOnlyInitializerArgs {
    /**
     * Multiplicative factor to apply to the orthogonal matrix. Defaults to 1.
     */
    gain?: number;
}
export declare class Orthogonal extends Initializer {
    /** @nocollapse */
    static className: string;
    readonly DEFAULT_GAIN = 1;
    protected readonly gain: number;
    protected readonly seed: number;
    constructor(args?: OrthogonalArgs);
    apply(shape: Shape, dtype?: DataType): Tensor;
    getConfig(): serialization.ConfigDict;
}
/** @docinline */
export declare type InitializerIdentifier = 'constant' | 'glorotNormal' | 'glorotUniform' | 'heNormal' | 'heUniform' | 'identity' | 'leCunNormal' | 'leCunUniform' | 'ones' | 'orthogonal' | 'randomNormal' | 'randomUniform' | 'truncatedNormal' | 'varianceScaling' | 'zeros' | string;
export declare const INITIALIZER_IDENTIFIER_REGISTRY_SYMBOL_MAP: {
    [identifier in InitializerIdentifier]: string;
};
export declare function serializeInitializer(initializer: Initializer): serialization.ConfigDictValue;
export declare function getInitializer(identifier: InitializerIdentifier | Initializer | serialization.ConfigDict): Initializer;
