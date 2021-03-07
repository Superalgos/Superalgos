/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * Padding Layers.
 */
// Porting Note: In Python Keras, the padding layers are in convolutional.py,
//   but we decided to put them in a separate file (padding.ts) for clarity.
import * as tfc from '@tensorflow/tfjs-core';
import { serialization, tidy } from '@tensorflow/tfjs-core';
import { imageDataFormat } from '../backend/common';
import { InputSpec, Layer } from '../engine/topology';
import { ValueError } from '../errors';
import { getExactlyOneShape, getExactlyOneTensor } from '../utils/types_utils';
/**
 * Pads the middle dimension of a 3D tensor.
 *
 * @param x Input `tf.Tensor` to be padded.
 * @param padding `Array` of 2 integers, how many zeros to add at the start and
 *   end of the middle dimension (i.e., dimension 1).
 * @return A padded 3D `tf.Tensor`.
 */
export function temporalPadding(x, padding) {
    return tidy(() => {
        if (x.rank !== 3) {
            throw new ValueError(`temporalPadding expects input tensor to be 3-D, but received a ` +
                `${x.rank}-D tensor.`);
        }
        if (padding == null) {
            padding = [1, 1];
        }
        if (padding.length !== 2) {
            throw new ValueError(`temporalPadding expects input padding pattern to be a length-2 ` +
                `array, but received a length-${padding.length} array.`);
        }
        const pattern = [[0, 0], padding, [0, 0]];
        return tfc.pad(x, pattern);
    });
}
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
export function spatial2dPadding(x, padding, dataFormat) {
    return tidy(() => {
        if (x.rank !== 4) {
            throw new ValueError(`temporalPadding expects input tensor to be 4-D, but received a ` +
                `${x.rank}-D tensor.`);
        }
        if (padding == null) {
            padding = [[1, 1], [1, 1]];
        }
        if (padding.length !== 2 || padding[0].length !== 2 ||
            padding[1].length !== 2) {
            throw new ValueError('spatial2dPadding expects `padding` to be an Array of two Arrays, ' +
                'each of which is an Array of two integers.');
        }
        if (dataFormat == null) {
            dataFormat = imageDataFormat();
        }
        if (dataFormat !== 'channelsLast' && dataFormat !== 'channelsFirst') {
            throw new ValueError(`Unknown data format: ${dataFormat}. ` +
                `Supported data formats are 'channelsLast' and 'channelsFirst.`);
        }
        let pattern;
        if (dataFormat === 'channelsFirst') {
            pattern = [[0, 0], [0, 0], padding[0], padding[1]];
        }
        else {
            pattern = [[0, 0], padding[0], padding[1], [0, 0]];
        }
        return tfc.pad(x, pattern);
    });
}
export class ZeroPadding2D extends Layer {
    constructor(args) {
        if (args == null) {
            args = {};
        }
        super(args);
        this.dataFormat =
            args.dataFormat == null ? imageDataFormat() : args.dataFormat;
        // TODO(cais): Maybe refactor the following logic surrounding `padding`
        //   into a helper method.
        if (args.padding == null) {
            this.padding = [[1, 1], [1, 1]];
        }
        else if (typeof args.padding === 'number') {
            this.padding =
                [[args.padding, args.padding], [args.padding, args.padding]];
        }
        else {
            args.padding = args.padding;
            if (args.padding.length !== 2) {
                throw new ValueError(`ZeroPadding2D expects padding to be a length-2 array, but ` +
                    `received a length-${args.padding.length} array.`);
            }
            let heightPadding;
            let widthPadding;
            if (typeof args.padding[0] === 'number') {
                heightPadding = [args.padding[0], args.padding[0]];
                widthPadding = [args.padding[1], args.padding[1]];
            }
            else {
                args.padding = args.padding;
                if (args.padding[0].length !== 2) {
                    throw new ValueError(`ZeroPadding2D expects height padding to be a length-2 array, ` +
                        `but received a length-${args.padding[0].length} array.`);
                }
                heightPadding = args.padding[0];
                if (args.padding[1].length !== 2) {
                    throw new ValueError(`ZeroPadding2D expects width padding to be a length-2 array, ` +
                        `but received a length-${args.padding[1].length} array.`);
                }
                widthPadding = args.padding[1];
            }
            this.padding = [heightPadding, widthPadding];
        }
        this.inputSpec = [new InputSpec({ ndim: 4 })];
    }
    computeOutputShape(inputShape) {
        inputShape = getExactlyOneShape(inputShape);
        let rows;
        let cols;
        if (this.dataFormat === 'channelsFirst') {
            if (inputShape[2] != null && inputShape[2] >= 0) {
                rows = inputShape[2] + this.padding[0][0] + this.padding[0][1];
            }
            else {
                rows = null;
            }
            if (inputShape[3] != null && inputShape[3] >= 0) {
                cols = inputShape[3] + this.padding[1][0] + this.padding[1][1];
            }
            else {
                cols = null;
            }
            return [inputShape[0], inputShape[1], rows, cols];
        }
        else {
            if (inputShape[1] != null && inputShape[1] >= 0) {
                rows = inputShape[1] + this.padding[0][0] + this.padding[0][1];
            }
            else {
                rows = null;
            }
            if (inputShape[2] != null && inputShape[2] >= 0) {
                cols = inputShape[2] + this.padding[1][0] + this.padding[1][1];
            }
            else {
                cols = null;
            }
            return [inputShape[0], rows, cols, inputShape[3]];
        }
    }
    call(inputs, kwargs) {
        return tidy(() => spatial2dPadding(getExactlyOneTensor(inputs), this.padding, this.dataFormat));
    }
    getConfig() {
        const config = {
            padding: this.padding,
            dataFormat: this.dataFormat,
        };
        const baseConfig = super.getConfig();
        Object.assign(config, baseConfig);
        return config;
    }
}
/** @nocollapse */
ZeroPadding2D.className = 'ZeroPadding2D';
serialization.registerClass(ZeroPadding2D);
//# sourceMappingURL=padding.js.map