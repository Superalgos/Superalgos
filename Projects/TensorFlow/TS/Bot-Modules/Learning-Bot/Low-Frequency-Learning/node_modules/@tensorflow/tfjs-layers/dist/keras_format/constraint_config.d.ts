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
export declare type MaxNormConfig = {
    max_value?: number;
    axis?: number;
};
export declare type MaxNormSerialization = BaseSerialization<'MaxNorm', MaxNormConfig>;
export declare type UnitNormConfig = {
    axis?: number;
};
export declare type UnitNormSerialization = BaseSerialization<'UnitNorm', UnitNormConfig>;
export declare type NonNegSerialization = BaseSerialization<'NonNeg', null>;
export declare type MinMaxNormConfig = {
    min_value?: number;
    max_value?: number;
    axis?: number;
    rate?: number;
};
export declare type MinMaxNormSerialization = BaseSerialization<'MinMaxNorm', MinMaxNormConfig>;
export declare type ConstraintSerialization = MaxNormSerialization | NonNegSerialization | UnitNormSerialization | MinMaxNormSerialization;
export declare type ConstraintClassName = ConstraintSerialization['class_name'];
/**
 * A string array of valid Constraint class names.
 *
 * This is guaranteed to match the `ConstraintClassName` union type.
 */
export declare const constraintClassNames: ConstraintClassName[];
