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
/**
 * Returns true if the axis specifies the inner most dimensions of the
 * array.
 */
export declare function axesAreInnerMostDims(axes: number[], rank: number): boolean;
export declare function combineLocations(outputLoc: number[], reduceLoc: number[], axes: number[]): number[];
export declare function computeOutAndReduceShapes(aShape: number[], axes: number[]): [number[], number[]];
export declare function expandShapeToKeepDim(shape: number[], axes: number[]): number[];
export declare function assertAxesAreInnerMostDims(msg: string, axes: number[], rank: number): void;
/**
 * Returns the axes permutation to be used with `tf.transpose`, if such
 * permutation is necessary. Otherwise it returns null. This method is used by
 * operations that operate only on inner-most axes.
 */
export declare function getAxesPermutation(axes: number[], rank: number): number[] | null;
/** Returns the axes permutation that undoes the original permutation. */
export declare function getUndoAxesPermutation(axes: number[]): number[];
export declare function getInnerMostAxes(numAxes: number, rank: number): number[];
