/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/** Defines allowable data types for tensors. */
import { NamedTensorMap, Scalar, Tensor } from '@tensorflow/tfjs-core';
import { Shape } from './keras_format/common';
export interface NamedTensor {
    name: string;
    tensor: Tensor;
}
export declare type HasShape = {
    shape: Shape;
};
/**
 * Type for loss a metric function.
 *
 * Takes a true value and a predicted value, and returns a loss or metric value.
 */
export declare type LossOrMetricFn = (yTrue: Tensor, yPred: Tensor) => Tensor;
/**
 * Type for a regularizer function.
 */
export declare type RegularizerFn = () => Scalar;
export declare type RnnStepFunction = (inputs: Tensor, states: Tensor[]) => [Tensor, Tensor[]];
/**
 * A single Tensor or a non-nested collection of Tensors.
 *
 * An object of this type can always be reduced to `Tensor[]`.  A single
 * 'Tensor' becomes `[Tensor]`.  A `Tensor[]` is unchanged.  A `NamedTensorMap`
 * can be converted with the help of a list of names, providing the order in
 * which the Tensors should appear in the resulting array.
 */
export declare type TensorOrArrayOrMap = Tensor | Tensor[] | NamedTensorMap;
/**
 * Type representing a loosely-typed bundle of keyword arguments.
 *
 * This is a looser type than PyJsonDict/serialization.ConfigDict as it
 * can contain arbitrary objects as its values.  It is most appropriate
 * for functions that pass through keyword arguments to other functions
 * without knowledge of the structure.  If the function can place type
 * restrictions on the keyword arguments, it should via the Config
 * interface convention used throughout.
 */
export declare type Kwargs = {
    [key: string]: any;
};
