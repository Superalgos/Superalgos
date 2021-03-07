/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization, Tensor, Tensor5D } from '@tensorflow/tfjs-core';
import { Layer, LayerArgs } from '../engine/topology';
import { DataFormat, PaddingMode, PoolMode, Shape } from '../keras_format/common';
import { Kwargs } from '../types';
/**
 * 2D pooling.
 * @param x
 * @param poolSize
 * @param stridesdes strides. Defaults to [1, 1].
 * @param padding padding. Defaults to 'valid'.
 * @param dataFormat data format. Defaults to 'channelsLast'.
 * @param poolMode Mode of pooling. Defaults to 'max'.
 * @returns Result of the 2D pooling.
 */
export declare function pool2d(x: Tensor, poolSize: [number, number], strides?: [number, number], padding?: PaddingMode, dataFormat?: DataFormat, poolMode?: PoolMode): Tensor;
/**
 * 3D pooling.
 * @param x
 * @param poolSize. Default to [1, 1, 1].
 * @param strides strides. Defaults to [1, 1, 1].
 * @param padding padding. Defaults to 'valid'.
 * @param dataFormat data format. Defaults to 'channelsLast'.
 * @param poolMode Mode of pooling. Defaults to 'max'.
 * @returns Result of the 3D pooling.
 */
export declare function pool3d(x: Tensor5D, poolSize: [number, number, number], strides?: [number, number, number], padding?: PaddingMode, dataFormat?: DataFormat, poolMode?: PoolMode): Tensor;
export declare interface Pooling1DLayerArgs extends LayerArgs {
    /**
     * Size of the window to pool over, should be an integer.
     */
    poolSize?: number | [number];
    /**
     * Period at which to sample the pooled values.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number];
    /** How to fill in data that's not an integer multiple of poolSize. */
    padding?: PaddingMode;
}
/**
 * Abstract class for different pooling 1D layers.
 */
export declare abstract class Pooling1D extends Layer {
    protected readonly poolSize: [number];
    protected readonly strides: [number];
    protected readonly padding: PaddingMode;
    /**
     *
     * @param args Parameters for the Pooling layer.
     *
     * config.poolSize defaults to 2.
     */
    constructor(args: Pooling1DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class MaxPooling1D extends Pooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling1DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare class AveragePooling1D extends Pooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling1DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare interface Pooling2DLayerArgs extends LayerArgs {
    /**
     * Factors by which to downscale in each dimension [vertical, horizontal].
     * Expects an integer or an array of 2 integers.
     *
     * For example, `[2, 2]` will halve the input in both spatial dimension.
     * If only one integer is specified, the same window length
     * will be used for both dimensions.
     */
    poolSize?: number | [number, number];
    /**
     * The size of the stride in each dimension of the pooling window. Expects
     * an integer or an array of 2 integers. Integer, tuple of 2 integers, or
     * None.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number, number];
    /** The padding type to use for the pooling layer. */
    padding?: PaddingMode;
    /** The data format to use for the pooling layer. */
    dataFormat?: DataFormat;
}
/**
 * Abstract class for different pooling 2D layers.
 */
export declare abstract class Pooling2D extends Layer {
    protected readonly poolSize: [number, number];
    protected readonly strides: [number, number];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    constructor(args: Pooling2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class MaxPooling2D extends Pooling2D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling2DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare class AveragePooling2D extends Pooling2D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling2DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number], strides: [number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare interface Pooling3DLayerArgs extends LayerArgs {
    /**
     * Factors by which to downscale in each dimension [depth, height, width].
     * Expects an integer or an array of 3 integers.
     *
     * For example, `[2, 2, 2]` will halve the input in three dimensions.
     * If only one integer is specified, the same window length
     * will be used for all dimensions.
     */
    poolSize?: number | [number, number, number];
    /**
     * The size of the stride in each dimension of the pooling window. Expects
     * an integer or an array of 3 integers. Integer, tuple of 3 integers, or
     * None.
     *
     * If `null`, defaults to `poolSize`.
     */
    strides?: number | [number, number, number];
    /** The padding type to use for the pooling layer. */
    padding?: PaddingMode;
    /** The data format to use for the pooling layer. */
    dataFormat?: DataFormat;
}
/**
 * Abstract class for different pooling 3D layers.
 */
export declare abstract class Pooling3D extends Layer {
    protected readonly poolSize: [number, number, number];
    protected readonly strides: [number, number, number];
    protected readonly padding: PaddingMode;
    protected readonly dataFormat: DataFormat;
    constructor(args: Pooling3DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    protected abstract poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class MaxPooling3D extends Pooling3D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling3DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
export declare class AveragePooling3D extends Pooling3D {
    /** @nocollapse */
    static className: string;
    constructor(args: Pooling3DLayerArgs);
    protected poolingFunction(inputs: Tensor, poolSize: [number, number, number], strides: [number, number, number], padding: PaddingMode, dataFormat: DataFormat): Tensor;
}
/**
 * Abstract class for different global pooling 1D layers.
 */
export declare abstract class GlobalPooling1D extends Layer {
    constructor(args: LayerArgs);
    computeOutputShape(inputShape: Shape): Shape;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare class GlobalAveragePooling1D extends GlobalPooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args?: LayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare class GlobalMaxPooling1D extends GlobalPooling1D {
    /** @nocollapse */
    static className: string;
    constructor(args: LayerArgs);
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare interface GlobalPooling2DLayerArgs extends LayerArgs {
    /**
     * One of `CHANNEL_LAST` (default) or `CHANNEL_FIRST`.
     *
     * The ordering of the dimensions in the inputs. `CHANNEL_LAST` corresponds
     * to inputs with shape `[batch, height, width, channels[` while
     * `CHANNEL_FIRST` corresponds to inputs with shape
     * `[batch, channels, height, width]`.
     */
    dataFormat?: DataFormat;
}
/**
 * Abstract class for different global pooling 2D layers.
 */
export declare abstract class GlobalPooling2D extends Layer {
    protected dataFormat: DataFormat;
    constructor(args: GlobalPooling2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
export declare class GlobalAveragePooling2D extends GlobalPooling2D {
    /** @nocollapse */
    static className: string;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
export declare class GlobalMaxPooling2D extends GlobalPooling2D {
    /** @nocollapse */
    static className: string;
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
}
