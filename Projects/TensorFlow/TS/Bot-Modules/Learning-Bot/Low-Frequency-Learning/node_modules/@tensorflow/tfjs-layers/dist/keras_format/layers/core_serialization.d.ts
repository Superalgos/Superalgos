/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { ActivationSerialization } from '../activation_config';
import { Shape } from '../common';
import { ConstraintSerialization } from '../constraint_config';
import { InitializerSerialization } from '../initializer_config';
import { RegularizerSerialization } from '../regularizer_config';
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
export interface DropoutLayerConfig extends LayerConfig {
    rate: number;
    noise_shape?: number[];
    seed?: number;
}
export declare type DropoutLayerSerialization = BaseLayerSerialization<'Dropout', DropoutLayerConfig>;
export interface DenseLayerConfig extends LayerConfig {
    units: number;
    activation?: ActivationSerialization;
    use_bias?: boolean;
    input_dim?: number;
    kernel_initializer?: InitializerSerialization;
    bias_initializer?: InitializerSerialization;
    kernel_constraint?: ConstraintSerialization;
    bias_constraint?: ConstraintSerialization;
    kernel_regularizer?: RegularizerSerialization;
    bias_regularizer?: RegularizerSerialization;
    activity_regularizer?: RegularizerSerialization;
}
export declare type DenseLayerSerialization = BaseLayerSerialization<'Dense', DenseLayerConfig>;
export declare type FlattenLayerSerialization = BaseLayerSerialization<'Flatten', LayerConfig>;
export interface ActivationLayerConfig extends LayerConfig {
    activation: ActivationSerialization;
}
export declare type ActivationLayerSerialization = BaseLayerSerialization<'Activation', ActivationLayerConfig>;
export interface RepeatVectorLayerConfig extends LayerConfig {
    n: number;
}
export declare type RepeatVectorLayerSerialization = BaseLayerSerialization<'RepeatVector', RepeatVectorLayerConfig>;
export interface ReshapeLayerConfig extends LayerConfig {
    target_shape: Shape;
}
export declare type ReshapeLayerSerialization = BaseLayerSerialization<'Reshape', ReshapeLayerConfig>;
export interface PermuteLayerConfig extends LayerConfig {
    dims: number[];
}
export declare type PermuteLayerSerialization = BaseLayerSerialization<'Permute', PermuteLayerConfig>;
export interface MaskingLayerConfig extends LayerConfig {
    maskValue: number;
}
export declare type MaskingLayerSerialization = BaseLayerSerialization<'Masking', MaskingLayerConfig>;
export declare type CoreLayerSerialization = DropoutLayerSerialization | DenseLayerSerialization | FlattenLayerSerialization | ActivationLayerSerialization | RepeatVectorLayerSerialization | ReshapeLayerSerialization | PermuteLayerSerialization | MaskingLayerSerialization;
export declare type CoreLayerClassName = CoreLayerSerialization['class_name'];
/**
 * A string array of valid CoreLayer class names.
 *
 * This is guaranteed to match the `CoreLayerClassName` union type.
 */
export declare const coreLayerClassNames: CoreLayerClassName[];
