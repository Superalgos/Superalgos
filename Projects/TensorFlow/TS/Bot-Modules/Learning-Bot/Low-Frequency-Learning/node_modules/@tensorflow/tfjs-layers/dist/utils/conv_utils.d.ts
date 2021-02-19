/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { PaddingMode } from '../keras_format/common';
/**
 * Transforms a single number of array of numbers into an array of numbers.
 * @param value
 * @param n: The size of the tuple to be returned.
 * @param name: Name of the parameter, used for generating error messages.
 * @returns An array of numbers.
 */
export declare function normalizeArray(value: number | number[], n: number, name: string): number[];
/**
 * Determines output length of a convolution given input length.
 * @param inputLength
 * @param filterSize
 * @param padding
 * @param stride
 * @param dilation: dilation rate.
 */
export declare function convOutputLength(inputLength: number, filterSize: number, padding: PaddingMode, stride: number, dilation?: number): number;
export declare function deconvLength(dimSize: number, strideSize: number, kernelSize: number, padding: PaddingMode): number;
