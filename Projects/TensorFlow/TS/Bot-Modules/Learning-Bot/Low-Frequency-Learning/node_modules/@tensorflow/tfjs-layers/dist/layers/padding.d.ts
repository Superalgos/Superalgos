/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { serialization, Tensor } from '@tensorflow/tfjs-core';
import { Layer, LayerArgs } from '../engine/topology';
import { DataFormat, Shape } from '../keras_format/common';
import { Kwargs } from '../types';
/**
 * Pads the middle dimension of a 3D tensor.
 *
 * @param x Input `tf.Tensor` to be padded.
 * @param padding `Array` of 2 integers, how many zeros to add at the start and
 *   end of the middle dimension (i.e., dimension 1).
 * @return A padded 3D `tf.Tensor`.
 */
export declare function temporalPadding(x: Tensor, padding?: [number, number]): Tensor;
/**
 * Pads the 2nd and 3rd dimensions of a 4D tensor.
 *
 * @param x Input `tf.Tensor` to be padded.
 * @param padding `Array` of two `Array`s, each of which is an `Array` of two
 *   integers. The amount of padding at the beginning and end of the 2nd and 3rd
 *   dimensions, respectively.
 * @param dataFormat 'channelsLast' (default) or 'channelsFirst'.
 * @return Padded 4D `tf.Tensor`.
 */
export declare function spatial2dPadding(x: Tensor, padding?: [[number, number], [number, number]], dataFormat?: DataFormat): Tensor;
export declare interface ZeroPadding2DLayerArgs extends LayerArgs {
    /**
     * Integer, or `Array` of 2 integers, or `Array` of 2 `Array`s, each of
     * which is an `Array` of 2 integers.
     * - If integer, the same symmetric padding is applied to width and height.
     * - If Array` of 2 integers, interpreted as two different symmetric values
     *   for height and width:
     *   `[symmetricHeightPad, symmetricWidthPad]`.
     * - If `Array` of 2 `Array`s, interpreted as:
     *   `[[topPad, bottomPad], [leftPad, rightPad]]`.
     */
    padding?: number | [number, number] | [[number, number], [number, number]];
    /**
     * One of `'channelsLast'` (default) and `'channelsFirst'`.
     *
     * The ordering of the dimensions in the inputs.
     * `channelsLast` corresponds to inputs with shape
     * `[batch, height, width, channels]` while `channelsFirst`
     * corresponds to inputs with shape
     * `[batch, channels, height, width]`.
     */
    dataFormat?: DataFormat;
}
export declare class ZeroPadding2D extends Layer {
    /** @nocollapse */
    static className: string;
    readonly dataFormat: DataFormat;
    readonly padding: [[number, number], [number, number]];
    constructor(args?: ZeroPadding2DLayerArgs);
    computeOutputShape(inputShape: Shape | Shape[]): Shape | Shape[];
    call(inputs: Tensor | Tensor[], kwargs: Kwargs): Tensor | Tensor[];
    getConfig(): serialization.ConfigDict;
}
