/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { BaseSerialization } from './types';
/** @docinline */
export declare type FanMode = 'fanIn' | 'fanOut' | 'fanAvg';
export declare const VALID_FAN_MODE_VALUES: string[];
export declare type FanModeSerialization = 'fan_in' | 'fan_out' | 'fan_avg';
/** @docinline */
export declare type Distribution = 'normal' | 'uniform' | 'truncatedNormal';
export declare const VALID_DISTRIBUTION_VALUES: string[];
export declare type DistributionSerialization = 'normal' | 'uniform' | 'truncated_normal';
export declare type ZerosSerialization = BaseSerialization<'Zeros', {}>;
export declare type OnesSerialization = BaseSerialization<'Ones', {}>;
export declare type ConstantConfig = {
    value: number;
};
export declare type ConstantSerialization = BaseSerialization<'Constant', ConstantConfig>;
export declare type RandomNormalConfig = {
    mean?: number;
    stddev?: number;
    seed?: number;
};
export declare type RandomNormalSerialization = BaseSerialization<'RandomNormal', RandomNormalConfig>;
export declare type RandomUniformConfig = {
    minval?: number;
    maxval?: number;
    seed?: number;
};
export declare type RandomUniformSerialization = BaseSerialization<'RandomUniform', RandomUniformConfig>;
export declare type TruncatedNormalConfig = {
    mean?: number;
    stddev?: number;
    seed?: number;
};
export declare type TruncatedNormalSerialization = BaseSerialization<'TruncatedNormal', TruncatedNormalConfig>;
export declare type VarianceScalingConfig = {
    scale?: number;
    mode?: FanModeSerialization;
    distribution?: DistributionSerialization;
    seed?: number;
};
export declare type VarianceScalingSerialization = BaseSerialization<'VarianceScaling', VarianceScalingConfig>;
export declare type OrthogonalConfig = {
    seed?: number;
    gain?: number;
};
export declare type OrthogonalSerialization = BaseSerialization<'Orthogonal', OrthogonalConfig>;
export declare type IdentityConfig = {
    gain?: number;
};
export declare type IdentitySerialization = BaseSerialization<'Identity', IdentityConfig>;
export declare type InitializerSerialization = ZerosSerialization | OnesSerialization | ConstantSerialization | RandomUniformSerialization | RandomNormalSerialization | TruncatedNormalSerialization | IdentitySerialization | VarianceScalingSerialization | OrthogonalSerialization;
export declare type InitializerClassName = InitializerSerialization['class_name'];
/**
 * A string array of valid Initializer class names.
 *
 * This is guaranteed to match the `InitializerClassName` union type.
 */
export declare const initializerClassNames: InitializerClassName[];
