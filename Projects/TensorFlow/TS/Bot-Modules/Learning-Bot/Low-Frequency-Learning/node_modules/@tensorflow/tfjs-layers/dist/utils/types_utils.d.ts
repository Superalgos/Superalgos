/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { Tensor } from '@tensorflow/tfjs-core';
import { Shape } from '../keras_format/common';
/**
 * Determine whether the input is an Array of Shapes.
 */
export declare function isArrayOfShapes(x: Shape | Shape[]): boolean;
/**
 * Special case of normalizing shapes to lists.
 *
 * @param x A shape or list of shapes to normalize into a list of Shapes.
 * @return A list of Shapes.
 */
export declare function normalizeShapeList(x: Shape | Shape[]): Shape[];
/**
 * Helper function to obtain exactly one Tensor.
 * @param xs: A single `tf.Tensor` or an `Array` of `tf.Tensor`s.
 * @return A single `tf.Tensor`. If `xs` is an `Array`, return the first one.
 * @throws ValueError: If `xs` is an `Array` and its length is not 1.
 */
export declare function getExactlyOneTensor(xs: Tensor | Tensor[]): Tensor;
/**
 * Helper function to obtain exactly on instance of Shape.
 *
 * @param shapes Input single `Shape` or Array of `Shape`s.
 * @returns If input is a single `Shape`, return it unchanged. If the input is
 *   an `Array` containing exactly one instance of `Shape`, return the instance.
 *   Otherwise, throw a `ValueError`.
 * @throws ValueError: If input is an `Array` of `Shape`s, and its length is not
 *   1.
 */
export declare function getExactlyOneShape(shapes: Shape | Shape[]): Shape;
