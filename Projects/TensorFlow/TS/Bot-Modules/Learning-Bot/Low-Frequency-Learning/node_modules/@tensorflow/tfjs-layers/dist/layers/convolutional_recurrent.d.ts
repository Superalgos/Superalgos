/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import * as tfc from '@tensorflow/tfjs-core';
import { Tensor } from '@tensorflow/tfjs-core';
import { Activation } from '../activations';
import { Constraint } from '../constraints';
import { Initializer } from '../initializers';
import { DataFormat, PaddingMode, Shape } from '../keras_format/common';
import { Regularizer } from '../regularizers';
import { Kwargs } from '../types';
import { BaseRNNLayerArgs, LSTMCell, LSTMCellLayerArgs, LSTMLayerArgs, RNN, RNNCell, SimpleRNNCellLayerArgs } from './recurrent';
declare interface ConvRNN2DCellArgs extends Omit<SimpleRNNCellLayerArgs, 'units'> {
    /**
     * The dimensionality of the output space (i.e. the number of filters in the
     * convolution).
     */
    filters: number;
    /**
     * The dimensions of the convolution window. If kernelSize is a number, the
     * convolutional window will be square.
     */
    kernelSize: number | number[];
    /**
     * The strides of the convolution in each dimension. If strides is a number,
     * strides in both dimensions are equal.
     *
     * Specifying any stride value != 1 is incompatible with specifying any
     * `dilationRate` value != 1.
     */
    strides?: number | number[];
    /**
     * Padding mode.
     */
    padding?: PaddingMode;
    /**
     * Format of the data, which determines the ordering of the dimensions in
     * the inputs.
     *
     * `channels_last` corresponds to inputs with shape
     *   `(batch, ..., channels)`
     *
     *  `channels_first` corresponds to inputs with shape `(batch, channels,
     * ...)`.
     *
     * Defaults to `channels_last`.
     */
    dataFormat?: DataFormat;
    /**
     * The dilation rate to use for the dilated convolution in each dimension.
     * Should be an integer or array of two or three integers.
     *
     * Currently, specifying any `dilationRate` value != 1 is incompatible with
     * specifying any `strides` value != 1.
     */
    dilationRate?: number | [number] | [number, number];
}
declare abstract class ConvRNN2DCell extends RNNCell {
    readonly filters: number;
    readonly kernelSize: number[];
    readonly strides: number[];
    readonly padding: PaddingMode;
    readonly dataFormat: DataFormat;
    readonly dilationRate: number[];
    readonly activation: Activation;
    readonly useBias: boolean;
    readonly kernelInitializer: Initializer;
    readonly recurrentInitializer: Initializer;
    readonly biasInitializer: Initializer;
    readonly kernelConstraint: Constraint;
    readonly recurrentConstraint: Constraint;
    readonly biasConstraint: Constraint;
    readonly kernelRegularizer: Regularizer;
    readonly recurrentRegularizer: Regularizer;
    readonly biasRegularizer: Regularizer;
    readonly dropout: number;
    readonly recurrentDropout: number;
}
declare interface ConvRNN2DLayerArgs extends BaseRNNLayerArgs, ConvRNN2DCellArgs {
}
/**
 * Base class for convolutional-recurrent layers.
 */
declare class ConvRNN2D extends RNN {
    /** @nocollapse */
    static className: string;
    readonly cell: ConvRNN2DCell;
    constructor(args: ConvRNN2DLayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    computeOutputShape(inputShape: Shape): Shape | Shape[];
    getInitialState(inputs: tfc.Tensor): tfc.Tensor[];
    resetStates(states?: Tensor | Tensor[], training?: boolean): void;
    protected computeSingleOutputShape(inputShape: Shape): Shape;
}
export declare interface ConvLSTM2DCellArgs extends Omit<LSTMCellLayerArgs, 'units'>, ConvRNN2DCellArgs {
}
export declare class ConvLSTM2DCell extends LSTMCell implements ConvRNN2DCell {
    /** @nocollapse */
    static className: string;
    readonly filters: number;
    readonly kernelSize: number[];
    readonly strides: number[];
    readonly padding: PaddingMode;
    readonly dataFormat: DataFormat;
    readonly dilationRate: number[];
    constructor(args: ConvLSTM2DCellArgs);
    build(inputShape: Shape | Shape[]): void;
    call(inputs: tfc.Tensor[], kwargs: Kwargs): tfc.Tensor[];
    getConfig(): tfc.serialization.ConfigDict;
    inputConv(x: Tensor, w: Tensor, b?: Tensor, padding?: PaddingMode): tfc.Tensor<tfc.Rank.R3>;
    recurrentConv(x: Tensor, w: Tensor): tfc.Tensor<tfc.Rank.R3>;
}
export declare interface ConvLSTM2DArgs extends Omit<LSTMLayerArgs, 'units' | 'cell'>, ConvRNN2DLayerArgs {
}
export declare class ConvLSTM2D extends ConvRNN2D {
    /** @nocollapse */
    static className: string;
    constructor(args: ConvLSTM2DArgs);
    /** @nocollapse */
    static fromConfig<T extends tfc.serialization.Serializable>(cls: tfc.serialization.SerializableConstructor<T>, config: tfc.serialization.ConfigDict): T;
}
export {};
