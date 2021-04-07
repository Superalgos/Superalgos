/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { Constraint, MaxNormArgs, MinMaxNormArgs, UnitNormArgs } from './constraints';
/**
 * MaxNorm weight constraint.
 *
 * Constrains the weights incident to each hidden unit
 * to have a norm less than or equal to a desired value.
 *
 * References
 *       - [Dropout: A Simple Way to Prevent Neural Networks from Overfitting
 * Srivastava, Hinton, et al.
 * 2014](http://www.cs.toronto.edu/~rsalakhu/papers/srivastava14a.pdf)
 *
 * @doc {heading: 'Constraints',namespace: 'constraints'}
 */
export declare function maxNorm(args: MaxNormArgs): Constraint;
/**
 * Constrains the weights incident to each hidden unit to have unit norm.
 *
 * @doc {heading: 'Constraints', namespace: 'constraints'}
 */
export declare function unitNorm(args: UnitNormArgs): Constraint;
/**
 * Constains the weight to be non-negative.
 *
 * @doc {heading: 'Constraints', namespace: 'constraints'}
 */
export declare function nonNeg(): Constraint;
/** @doc {heading: 'Constraints', namespace: 'constraints'} */
export declare function minMaxNorm(config: MinMaxNormArgs): Constraint;
