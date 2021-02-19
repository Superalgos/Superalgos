/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { ConstraintSerialization } from '../constraint_config';
import { InitializerSerialization } from '../initializer_config';
import { RegularizerSerialization } from '../regularizer_config';
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
export interface ReLULayerConfig extends LayerConfig {
    max_value?: number;
}
export declare type ReLULayerSerialization = BaseLayerSerialization<'ReLU', ReLULayerConfig>;
export interface LeakyReLULayerConfig extends LayerConfig {
    alpha?: number;
}
export declare type LeakyReLULayerSerialization = BaseLayerSerialization<'LeakyReLU', LeakyReLULayerConfig>;
export interface PReLULayerConfig extends LayerConfig {
    alpha_initializer?: InitializerSerialization;
    alpha_regularizer?: RegularizerSerialization;
    alpha_constraint?: ConstraintSerialization;
    shared_axes?: number | number[];
}
export declare type PReLULayerSerialization = BaseLayerSerialization<'PReLU', PReLULayerConfig>;
export interface ELULayerConfig extends LayerConfig {
    alpha?: number;
}
export declare type ELULayerSerialization = BaseLayerSerialization<'ELU', ELULayerConfig>;
export interface ThresholdedReLULayerConfig extends LayerConfig {
    theta?: number;
}
export declare type ThresholdedReLULayerSerialization = BaseLayerSerialization<'ThresholdedReLU', ThresholdedReLULayerConfig>;
export interface SoftmaxLayerConfig extends LayerConfig {
    axis?: number;
}
export declare type SoftmaxLayerSerialization = BaseLayerSerialization<'Softmax', SoftmaxLayerConfig>;
export declare type AdvancedActivationLayerSerialization = ReLULayerSerialization | LeakyReLULayerSerialization | PReLULayerSerialization | ELULayerSerialization | ThresholdedReLULayerSerialization | SoftmaxLayerSerialization;
export declare type AdvancedActivationLayerClassName = AdvancedActivationLayerSerialization['class_name'];
/**
 * A string array of valid AdvancedActivationLayer class names.
 *
 * This is guaranteed to match the `AdvancedActivationLayerClassName` union
 * type.
 */
export declare const advancedActivationLayerClassNames: AdvancedActivationLayerClassName[];
