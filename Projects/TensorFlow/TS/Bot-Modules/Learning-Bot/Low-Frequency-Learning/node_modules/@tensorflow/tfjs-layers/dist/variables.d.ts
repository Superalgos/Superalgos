/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import * as tfc from '@tensorflow/tfjs-core';
import { DataType, Tensor } from '@tensorflow/tfjs-core';
import { Constraint } from './constraints';
import { Shape } from './keras_format/common';
/**
 * A `tf.layers.LayerVariable` is similar to a `tf.Tensor` in that it has a
 * dtype and shape, but its value is mutable.  The value is itself represented
 * as a`tf.Tensor`, and can be read with the `read()` method and updated with
 * the `write()` method.
 */
export declare class LayerVariable {
    readonly dtype: DataType;
    readonly shape: Shape;
    readonly id: number;
    readonly name: string;
    readonly originalName: string;
    private trainable_;
    protected readonly val: tfc.Variable;
    readonly constraint: Constraint;
    /**
     * Construct Variable from a `tf.Tensor`.
     *
     * If not explicitly named, the Variable will be given a name with the
     * prefix 'Variable'. Variable names are unique. In the case of name
     * collision, suffixies '_<num>' will be added to the name.
     *
     * @param val Initial value of the Variable.
     * @param name Name of the variable. If `null` or `undefined` is provided, it
     *   will default a name with the prefix 'Variable'.
     * @param constraint Optional, projection function to be applied to the
     * variable after optimize updates
     * @throws ValueError if `name` is `null` or `undefined`.
     */
    constructor(val: Tensor, dtype?: DataType, name?: string, trainable?: boolean, constraint?: Constraint);
    /**
     * Get a snapshot of the Variable's value.
     *
     * The returned value is a snapshot of the Variable's value at the time of
     * the invocation. Future mutations in the value of the tensor will only
     * be reflected by future calls to this method.
     */
    read(): Tensor;
    /**
     * Update the value of the Variable.
     *
     * @param newVal: The new value to update to. Must be consistent with the
     *   dtype and shape of the Variable.
     * @return This Variable.
     */
    write(newVal: Tensor): this;
    /**
     * Dispose this LayersVariable instance from memory.
     */
    dispose(): void;
    protected assertNotDisposed(): void;
    trainable: boolean;
}
/**
 * Create a Variable.
 * @param x The initial value of the `Variable`.
 * @param dtype optional, the type of the variable.
 * @param name optional, the name of the variable, default provided by
 * Variable.
 * @param constraint optional, a constraint to be applied after every update.
 * @return The newly instantiated `Variable`.
 */
export declare function variable(x: Tensor, dtype?: DataType, name?: string, constraint?: Constraint): LayerVariable;
/**
 * Instantiates an all-zeros Variable and returns it.
 *
 * @param shape Shape of the tensor.
 * @param dtype DType of the tensor.
 * @param name Name of the tensor.
 * @return An all-zero Variable.
 */
export declare function zerosVariable(shape: Shape, dtype?: DataType, name?: string): LayerVariable;
/**
 * Instantiates an all-zeros tensor of the same shape as another tensor.
 *
 * @param x The other tensor.
 * @param dtype DType of the tensor.
 * @param name Name of the tensor.
 * @return A newly instantiated Variable.
 */
export declare function zerosLike(x: Tensor, dtype?: DataType, name?: string): LayerVariable;
/**
 * Instantiates an all-ones tensor and returns it.
 *
 * @param shape Shape of the tensor.
 * @param dtype DType of the tensor.
 * @param name Name of the tensor.
 * @return An all-ones Variable.
 */
export declare function onesVariable(shape: Shape, dtype?: DataType, name?: string): LayerVariable;
/**
 * Instantiates an all-ones tensor of the same shape as another tensor.
 *
 * @param x The other tensor.
 * @param dtype DType of the tensor.
 * @param name Name of the tensor.
 * @return A newly instantiated Variable.
 */
export declare function onesLike(x: Tensor, dtype?: DataType, name?: string): LayerVariable;
/**
 * Instantiate an identity matrix and returns it, as a Variable
 *
 * @param size Number of rows/columns.
 * @param dtype Data type of returned Variable.
 * @param name Name of returned Variable.
 * @return A Variable, an identity matrix.
 */
export declare function eyeVariable(size: number, dtype?: DataType, name?: string): LayerVariable;
/**
 * Get a Variable with uniform distribution of values.
 * @param shape Shape of the tensor.
 * @param minval Lower bound of the uniform distribution.
 * @param maxval Upper bound of the uniform distribution.
 * @param dtype
 * @param seed
 * @param name Optional name.
 * @return The uniform-random Variable.
 */
export declare function randomUniformVariable(shape: Shape, minval: number, maxval: number, dtype?: DataType, seed?: number, name?: string): LayerVariable;
/**
 * Get a Variable with truncated-normal distribution of values.
 * @param shape Shape of the tensor.
 * @param mean mean value of the normal distribution.
 * @param stddev standard deviation of the normal distribution.
 * @param dtype
 * @param seed
 * @param name Optional name.
 * @return The truncated-normal-random Variable.
 */
export declare function truncatedNormalVariable(shape: Shape, mean?: number, stddev?: number, dtype?: DataType, seed?: number, name?: string): LayerVariable;
/**
 * Get a Variable with normal distribution of values.
 * @param shape Shape of the tensor.
 * @param mean mean value of the normal distribution.
 * @param stddev standard deviation of the normal distribution.
 * @param dtype
 * @param seed
 * @param name Optional name.
 * @return The truncated-normal-random Variable.
 */
export declare function randomNormalVariable(shape: Shape, mean?: number, stddev?: number, dtype?: DataType, seed?: number, name?: string): LayerVariable;
/**
 * Update the value of a Variable.
 * @param x The Variable to be updated.
 * @param xNew The new value to update to.
 * @return The Variable updated.
 */
export declare function update(x: LayerVariable, xNew: Tensor): LayerVariable;
/**
 * Update the value of a Variable by adding an increment.
 * @param x The Variable to be updated.
 * @param increment The incrment to add to `x`.
 * @return The Variable updated.
 */
export declare function updateAdd(x: LayerVariable, increment: Tensor): LayerVariable;
/**
 * Update the value of a Variable by subtracting a decrement.
 * @param x The Variable to be updated.
 * @param decrement The decrement to subtract from `x`.
 * @return The Variable updated.
 */
export declare function updateSub(x: LayerVariable, decrement: Tensor): LayerVariable;
/**
 * Get the values of an array of Variables.
 *
 * @param tensors An `Array` of `Variable`s to get the values of.
 * @return The values of the inputs, as an `Array` of`tf.Tensor`s.
 */
export declare function batchGetValue(xs: LayerVariable[]): Tensor[];
/**
 * Update the value of multiple Variables at once.
 *
 * @param variablesAndValues An `Array`, each element is of type
 *   [Variable, Tensor]. The first item is the
 *   `Variable` of which the value is to be updated. The second item
 *   carries the new value.
 */
export declare function batchSetValue(variablesAndValues: Array<[LayerVariable, Tensor]>): void;
/**
 * Returns the gradients of `variables` w.r.t. the return value of `lossFn`.
 * @param lossFn A function which returns a Scalar to be used as the function
 *   value (i.e., numerator) for differentiation.
 * @param variables List of variables to be used as the independent variables
 *   (i.e., denominator) for differentiation.
 * @returns An Array of gradients tensors.
 */
export declare function gradients(lossFn: () => tfc.Scalar, variables: LayerVariable[]): Tensor[];
