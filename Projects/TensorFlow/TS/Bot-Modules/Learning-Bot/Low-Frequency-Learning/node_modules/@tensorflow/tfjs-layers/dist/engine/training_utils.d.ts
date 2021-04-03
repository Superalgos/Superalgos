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
/**
 * For multi-class classification problems, this object is designed to store a
 * mapping from class index to the "weight" of the class, where higher weighted
 * classes have larger impact on loss, accuracy, and other metrics.
 *
 * This is useful for cases in which you want the model to "pay more attention"
 * to examples from an under-represented class, e.g., in unbalanced datasets.
 */
export declare type ClassWeight = {
    [classIndex: number]: number;
};
/**
 * Class weighting for a model with multiple outputs.
 *
 * This object maps each output name to a class-weighting object.
 */
export declare type ClassWeightMap = {
    [outputName: string]: ClassWeight;
};
/**
 * Standardize class weighting objects.
 *
 * This function takes a single class-weighting object, an array of them,
 * or a map from output name to class-weighting object. It compares it to the
 * output name(s) of the model, base on which it outputs an array of
 * class-weighting objects of which the length matches the number of outputs.
 *
 * @param classWeight Input class-weighting object(s).
 * @param outputNames All output name(s) of the model.
 * @return An array of class-weighting objects. The length of the array matches
 *   the model's number of outputs.
 */
export declare function standardizeClassWeights(classWeight: ClassWeight | ClassWeight[] | ClassWeightMap, outputNames: string[]): ClassWeight[];
export declare function standardizeSampleWeights(classWeight: ClassWeight | ClassWeight[] | ClassWeightMap, outputNames: string[]): ClassWeight[];
/**
 * Standardize by-sample and/or by-class weights for training.
 *
 * Note that this function operates on one model output at a time. For a model
 * with multiple outputs, you must call this function multiple times.
 *
 * @param y The target tensor that the by-sample and/or by-class weight is for.
 *     The values of y are assumed to encode the classes, either directly
 *     as an integer index, or as one-hot encoding.
 * @param sampleWeight By-sample weights.
 * @param classWeight By-class weights: an object mapping class indices
 *     (integers) to a weight (float) to apply to the model's loss for the
 *     samples from this class during training. This can be useful to tell the
 *     model to "pay more attention" to samples from an under-represented class.
 * @param sampleWeightMode The mode for the sample weights.
 * @return A Promise of weight tensor, of which the size of the first dimension
 *     matches that of `y`.
 */
export declare function standardizeWeights(y: Tensor, sampleWeight?: Tensor, classWeight?: ClassWeight, sampleWeightMode?: 'temporal'): Promise<Tensor>;
/**
 * Apply per-sample weights on the loss values from a number of samples.
 *
 * @param losses Loss tensor of shape `[batchSize]`.
 * @param sampleWeights Per-sample weight tensor of shape `[batchSize]`.
 * @returns Tensor of the same shape as`losses`.
 */
export declare function computeWeightedLoss(losses: Tensor, sampleWeights: Tensor): Tensor<import("@tensorflow/tfjs-core").Rank>;
