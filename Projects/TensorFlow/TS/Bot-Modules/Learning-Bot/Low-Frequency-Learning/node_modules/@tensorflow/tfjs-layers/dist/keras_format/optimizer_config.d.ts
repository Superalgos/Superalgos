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
export declare type AdadeltaOptimizerConfig = {
    learning_rate: number;
    rho: number;
    epsilon: number;
};
export declare type AdadeltaSerialization = BaseSerialization<'Adadelta', AdadeltaOptimizerConfig>;
export declare type AdagradOptimizerConfig = {
    learning_rate: number;
    initial_accumulator_value?: number;
};
export declare type AdagradSerialization = BaseSerialization<'Adagrad', AdagradOptimizerConfig>;
export declare type AdamOptimizerConfig = {
    learning_rate: number;
    beta1: number;
    beta2: number;
    epsilon?: number;
};
export declare type AdamSerialization = BaseSerialization<'Adam', AdamOptimizerConfig>;
export declare type AdamaxOptimizerConfig = {
    learning_rate: number;
    beta1: number;
    beta2: number;
    epsilon?: number;
    decay?: number;
};
export declare type AdamaxSerialization = BaseSerialization<'Adamax', AdamaxOptimizerConfig>;
export declare type MomentumOptimizerConfig = {
    learning_rate: number;
    momentum: number;
    use_nesterov?: boolean;
};
export declare type MomentumSerialization = BaseSerialization<'Momentum', MomentumOptimizerConfig>;
export declare type RMSPropOptimizerConfig = {
    learning_rate: number;
    decay?: number;
    momentum?: number;
    epsilon?: number;
    centered?: boolean;
};
export declare type RMSPropSerialization = BaseSerialization<'RMSProp', RMSPropOptimizerConfig>;
export declare type SGDOptimizerConfig = {
    learning_rate: number;
};
export declare type SGDSerialization = BaseSerialization<'SGD', SGDOptimizerConfig>;
export declare type OptimizerSerialization = AdadeltaSerialization | AdagradSerialization | AdamSerialization | AdamaxSerialization | MomentumSerialization | RMSPropSerialization | SGDSerialization;
export declare type OptimizerClassName = OptimizerSerialization['class_name'];
/**
 * A string array of valid Optimizer class names.
 *
 * This is guaranteed to match the `OptimizerClassName` union type.
 */
export declare const optimizerClassNames: OptimizerClassName[];
