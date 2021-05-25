/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
export declare type ArrayTypes = Uint8Array | Int32Array | Float32Array;
/**
 * Determine if a number is an integer.
 */
export declare function isInteger(x: number): boolean;
/**
 * Calculate the product of an array of numbers.
 * @param array The array to calculate the product over.
 * @param begin Beginning index, inclusive.
 * @param end Ending index, exclusive.
 * @return The product.
 */
export declare function arrayProd(array: number[] | ArrayTypes, begin?: number, end?: number): number;
/**
 * Compute minimum value.
 * @param array
 * @return minimum value.
 */
export declare function min(array: number[] | Float32Array): number;
/**
 * Compute maximum value.
 * @param array
 * @return maximum value
 */
export declare function max(array: number[] | Float32Array): number;
/**
 * Compute sum of array.
 * @param array
 * @return The sum.
 */
export declare function sum(array: number[] | Float32Array): number;
/**
 * Compute mean of array.
 * @param array
 * @return The mean.
 */
export declare function mean(array: number[] | Float32Array): number;
/**
 * Compute variance of array.
 * @param array
 * @return The variance.
 */
export declare function variance(array: number[] | Float32Array): number;
/**
 * Compute median of array.
 * @param array
 * @return The median value.
 */
export declare function median(array: number[] | Float32Array): number;
/**
 * Generate an array of integers in [begin, end).
 * @param begin Beginning integer, inclusive.
 * @param end Ending integer, exclusive.
 * @returns Range array.
 * @throws ValueError, iff `end` < `begin`.
 */
export declare function range(begin: number, end: number): number[];
