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
import { ConstraintSerialization } from '../constraint_config';
import { InitializerSerialization } from '../initializer_config';
import { RegularizerSerialization } from '../regularizer_config';
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
import { BaseSerialization } from '../types';
export interface BaseRNNLayerConfig extends LayerConfig {
    cell?: RNNCellSerialization | RNNCellSerialization[];
    return_sequences?: boolean;
    return_state?: boolean;
    go_backwards?: boolean;
    stateful?: boolean;
    unroll?: boolean;
    input_dim?: number;
    input_length?: number;
}
export interface SimpleRNNCellConfig extends LayerConfig {
    units: number;
    activation?: ActivationSerialization;
    use_bias?: boolean;
    kernel_initializer?: InitializerSerialization;
    recurrent_initializer?: InitializerSerialization;
    bias_initializer?: InitializerSerialization;
    kernel_regularizer?: RegularizerSerialization;
    recurrent_regularizer?: RegularizerSerialization;
    bias_regularizer?: RegularizerSerialization;
    kernel_constraint?: ConstraintSerialization;
    recurrent_constraint?: ConstraintSerialization;
    bias_constraint?: ConstraintSerialization;
    dropout?: number;
    recurrent_dropout?: number;
}
export declare type SimpleRNNCellSerialization = BaseSerialization<'SimpleRNNCell', SimpleRNNCellConfig>;
export interface SimpleRNNLayerConfig extends BaseRNNLayerConfig {
    units: number;
    activation?: ActivationSerialization;
    use_bias?: boolean;
    kernel_initializer?: InitializerSerialization;
    recurrent_initializer?: InitializerSerialization;
    bias_initializer?: InitializerSerialization;
    kernel_regularizer?: RegularizerSerialization;
    recurrent_regularizer?: RegularizerSerialization;
    bias_regularizer?: RegularizerSerialization;
    kernel_constraint?: ConstraintSerialization;
    recurrent_constraint?: ConstraintSerialization;
    bias_constraint?: ConstraintSerialization;
    dropout?: number;
    recurrent_dropout?: number;
}
export declare type SimpleRNNLayerSerialization = BaseLayerSerialization<'SimpleRNN', SimpleRNNLayerConfig>;
export interface GRUCellConfig extends SimpleRNNCellConfig {
    recurrent_activation?: string;
    implementation?: number;
}
export declare type GRUCellSerialization = BaseSerialization<'GRUCell', GRUCellConfig>;
export interface GRULayerConfig extends SimpleRNNLayerConfig {
    recurrent_activation?: ActivationSerialization;
    implementation?: number;
}
export declare type GRULayerSerialization = BaseLayerSerialization<'GRU', GRULayerConfig>;
export interface LSTMCellConfig extends SimpleRNNCellConfig {
    recurrent_activation?: ActivationSerialization;
    unit_forget_bias?: boolean;
    implementation?: number;
}
export declare type LSTMCellSerialization = BaseSerialization<'LSTMCell', LSTMCellConfig>;
export interface LSTMLayerConfig extends SimpleRNNLayerConfig {
    recurrent_activation?: ActivationSerialization;
    unit_forget_bias?: boolean;
    implementation?: number;
}
export declare type LSTMLayerSerialization = BaseLayerSerialization<'LSTM', LSTMLayerConfig>;
export interface StackedRNNCellsConfig extends LayerConfig {
    cells: RNNCellSerialization[];
}
export declare type StackedRNNCellsSerialization = BaseSerialization<'StackedRNNCells', StackedRNNCellsConfig>;
export declare type RNNCellSerialization = SimpleRNNCellSerialization | GRUCellSerialization | LSTMCellSerialization | StackedRNNCellsSerialization;
export declare type RecurrentLayerSerialization = SimpleRNNLayerSerialization | LSTMLayerSerialization | GRULayerSerialization;
export declare type RecurrentLayerClassName = RecurrentLayerSerialization['class_name'];
/**
 * A string array of valid RecurrentLayer class names.
 *
 * This is guaranteed to match the `RecurrentLayerClassName` union type.
 */
export declare const recurrentLayerClassNames: RecurrentLayerClassName[];
