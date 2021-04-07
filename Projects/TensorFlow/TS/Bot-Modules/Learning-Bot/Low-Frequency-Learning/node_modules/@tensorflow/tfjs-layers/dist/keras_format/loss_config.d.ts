/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * List of all known loss names.
 */
export declare const lossOptions: ("mean_squared_error" | "mean_absolute_error" | "mean_absolute_percentage_error" | "mean_squared_logarithmic_error" | "squared_hinge" | "hinge" | "categorical_hinge" | "logcosh" | "categorical_crossentropy" | "sparse_categorical_crossentropy" | "kullback_leibler_divergence" | "poisson" | "cosine_proximity")[];
/**
 * A type representing the strings that are valid loss names.
 */
export declare type LossIdentifier = typeof lossOptions[number];
