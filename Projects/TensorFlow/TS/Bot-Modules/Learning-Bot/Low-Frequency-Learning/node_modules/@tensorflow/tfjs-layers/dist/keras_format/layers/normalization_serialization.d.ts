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
export interface BatchNormalizationLayerConfig extends LayerConfig {
    axis?: number;
    momentum?: number;
    epsilon?: number;
    center?: boolean;
    scale?: boolean;
    beta_initializer?: InitializerSerialization;
    gamma_initializer?: InitializerSerialization;
    moving_mean_initializer?: InitializerSerialization;
    moving_variance_initializer?: InitializerSerialization;
    beta_constraint?: ConstraintSerialization;
    gamma_constraint?: ConstraintSerialization;
    beta_regularizer?: RegularizerSerialization;
    gamma_regularizer?: RegularizerSerialization;
}
export declare type BatchNormalizationLayerSerialization = BaseLayerSerialization<'BatchNormalization', BatchNormalizationLayerConfig>;
export declare type NormalizationLayerSerialization = BatchNormalizationLayerSerialization;
export declare type NormalizationLayerClassName = NormalizationLayerSerialization['class_name'];
/**
 * A string array of valid NormalizationLayer class names.
 *
 * This is guaranteed to match the `NormalizationLayerClassName` union
 * type.
 */
export declare const normalizationLayerClassNames: NormalizationLayerClassName[];
