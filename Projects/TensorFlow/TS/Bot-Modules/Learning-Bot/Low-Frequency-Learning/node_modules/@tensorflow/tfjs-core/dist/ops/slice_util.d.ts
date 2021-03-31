/**
 * @license
 * Copyright 2017 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
import { TensorInfo } from '../kernel_registry';
export declare type SliceInfo = {
    nonStrided: boolean;
    $begin: number[];
    $end: number[];
    $strides: number[];
    size: number[];
    newShape: number[];
    outShape: number[];
};
export declare function assertParamsValid(input: TensorInfo, begin: number[], size: number[]): void;
/** Converts a binary mask to an array of axes. Used in stridedSlice(). */
export declare function maskToAxes(mask: number): number[];
/** Computes the output shape given the strided slice params. */
export declare function computeOutShape(begin: number[], end: number[], strides: number[]): number[];
export declare function stridesWithElidedDims(strides: number[], ellipsisInsertionIndex: number, numElidedAxes: number, inputShape: number[]): number[];
export declare function getNormalizedAxes(inputShape: number[], ellipsisAxes: number[], numInterpolatedAxes: number, begin: number[], end: number[], strides: number[], beginMask: number, endMask: number, ellipsisMask: number): {
    begin: number[];
    end: number[];
    strides: number[];
};
export declare function startIndicesWithElidedDims(beginMask: number, ellipsisInsertionIndex: number, numElidedAxes: number, originalBegin: number[], inputShape: number[]): number[];
export declare function stopIndicesWithElidedDims(endMask: number, ellipsisInsertionIndex: number, numElidedAxes: number, originalEnd: number[], inputShape: number[]): number[];
export declare function stridesForAxis(strides: number[], axis: number, ellipsisMask: number): number;
export declare function startForAxis(beginMask: number, startIndices: number[], strides: number[], inputShape: number[], axis: number, ellipsisMask: number): number;
export declare function stopForAxis(endMask: number, stopIndices: number[], strides: number[], inputShape: number[], axis: number, ellipsisMask: number): number;
/**
 * Returns true if the slice occupies a continous set of elements in the
 * 'flat' space.
 */
export declare function isSliceContinous(shape: number[], begin: number[], size: number[]): boolean;
export declare function computeFlatOffset(begin: number[], strides: number[]): number;
export declare function parseSliceParams(x: TensorInfo, begin: number | number[], size?: number | number[]): number[][];
export declare function sliceInfo(xShape: number[], begin: number[], end: number[], strides: number[], beginMask: number, endMask: number, ellipsisMask: number, newAxisMask: number, shrinkAxisMask: number): SliceInfo;
