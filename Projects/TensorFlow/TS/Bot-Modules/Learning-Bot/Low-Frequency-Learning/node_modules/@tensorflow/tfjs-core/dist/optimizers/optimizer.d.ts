/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
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
import { Serializable } from '../serialization';
import { Scalar, Variable } from '../tensor';
import { NamedTensor, NamedTensorMap } from '../tensor_types';
/**
 * A variable that belongs to an optimizer.
 *
 * The `originalName` field is required for keeping track of the canonical
 * name of the variable, which is usually the name of the model weight that
 * the variable is related to plus a suffix, e.g., 'dense1/kernel/momentum'.
 * The name of the `Variable` object itself cannot be used directly due to
 * possible deduplication: Every `Variable` must have a unique name but more
 * than one optimizer objects of the same type may be created for the same model
 * or the same `Variable`.
 */
export interface OptimizerVariable {
    originalName: string;
    variable: Variable;
}
/** @doc {heading: 'Training', subheading: 'Classes', namespace: 'train'} */
export declare abstract class Optimizer extends Serializable {
    protected iterations_: number;
    /**
     * Executes `f()` and minimizes the scalar output of `f()` by computing
     * gradients of y with respect to the list of trainable variables provided by
     * `varList`. If no list is provided, it defaults to all trainable variables.
     *
     * @param f The function to execute and whose output to minimize.
     * @param returnCost Whether to return the scalar cost value produced by
     * executing `f()`.
     * @param varList An optional list of variables to update. If specified, only
     * the trainable variables in varList will be updated by minimize. Defaults to
     * all trainable variables.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    minimize(f: () => Scalar, returnCost?: boolean, varList?: Variable[]): Scalar | null;
    /**
     * The number of iterations that this optimizer instance has been invoked for.
     */
    readonly iterations: number;
    protected incrementIterations(): void;
    /**
     * Executes f() and computes the gradient of the scalar output of f() with
     * respect to the list of trainable variables provided by `varList`. If no
     * list is provided, it defaults to all trainable variables.
     *
     * @param f The function to execute and whose output to use for computing
     * gradients with respect to variables.
     * @param varList An optional list of variables to compute gradients with
     * respect to. If specified, only the trainable variables in varList will have
     * gradients computed with respect to. Defaults to all trainable variables.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    computeGradients(f: () => Scalar, varList?: Variable[]): {
        value: Scalar;
        grads: NamedTensorMap;
    };
    /**
     * Updates variables by using the computed gradients.
     *
     * @param variableGradients A mapping of variable name to its gradient value.
     *
     * @doc {heading: 'Training', subheading: 'Optimizers'}
     */
    abstract applyGradients(variableGradients: NamedTensorMap | NamedTensor[]): void;
    /**
     * Dispose the variables (if any) owned by this optimizer instance.
     */
    dispose(): void;
    saveIterations(): Promise<NamedTensor>;
    getWeights(): Promise<NamedTensor[]>;
    setWeights(weightValues: NamedTensor[]): Promise<void>;
    /**
     * Extract the first element of the weight values and set it
     * as the iterations counter variable of this instance of optimizer.
     *
     * @param weightValues
     * @returns Weight values with the first element consumed and excluded.
     */
    protected extractIterations(weightValues: NamedTensor[]): Promise<NamedTensor[]>;
}
