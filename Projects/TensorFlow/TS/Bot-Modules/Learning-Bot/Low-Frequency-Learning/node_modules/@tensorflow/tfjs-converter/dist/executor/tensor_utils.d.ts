/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
 * This differs from util.assertShapesMatch in that it allows values of
 * negative one, an undefined size of a dimensinon, in a shape to match
 * anything.
 */
import { Tensor } from '@tensorflow/tfjs-core';
/**
 * Used by TensorList and TensorArray to verify if elementShape matches, support
 * negative value as the dim shape.
 * @param shapeA
 * @param shapeB
 * @param errorMessagePrefix
 */
export declare function assertShapesMatchAllowUndefinedSize(shapeA: number | number[], shapeB: number | number[], errorMessagePrefix?: string): void;
export declare function fullDefinedShape(elementShape: number | number[]): boolean;
/**
 * Generate the output element shape from the list elementShape, list tensors
 * and input param.
 * @param listElementShape
 * @param tensors
 * @param elementShape
 */
export declare function inferElementShape(listElementShape: number | number[], tensors: Tensor[], elementShape: number | number[]): number[];
export declare function mergeElementShape(elementShapeA: number | number[], elementShapeB: number | number[]): number | number[];
