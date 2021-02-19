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
import { LossOrMetricFn } from './types';
/**
 * Normalizes a tensor wrt the L2 norm alongside the specified axis.
 * @param x
 * @param axis Axis along which to perform normalization.
 */
export declare function l2Normalize(x: Tensor, axis?: number): Tensor;
export declare function meanSquaredError(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function meanAbsoluteError(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function meanAbsolutePercentageError(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function meanSquaredLogarithmicError(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function squaredHinge(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function hinge(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function categoricalHinge(yTrue: Tensor, yPred: Tensor): Tensor;
/**
 * Logarithm of the hyperbolic cosine of the prediction error.
 *
 * `log(cosh(x))` is approximately equal to `(x ** 2) / 2` for small `x` and
 * to `abs(x) - log(2)` for large `x`. This means that 'logcosh' works mostly
 * like the mean squared error, but will not be so strongly affected by the
 * occasional wildly incorrect prediction.
 */
export declare function logcosh(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function categoricalCrossentropy(target: Tensor, output: Tensor, fromLogits?: boolean): Tensor;
/**
 * Categorical crossentropy with integer targets.
 *
 * @param target An integer tensor.
 * @param output A tensor resulting from a softmax (unless `fromLogits` is
 *  `true`, in which case `output` is expected to be the logits).
 * @param fromLogits Boolean, whether `output` is the result of a softmax, or is
 *   a tensor of logits.
 */
export declare function sparseCategoricalCrossentropy(target: Tensor, output: Tensor, fromLogits?: boolean): Tensor;
/**
 * From TensorFlow's implementation in nn_impl.py:
 *
 * For brevity, let `x = logits`, `z = labels`.  The logistic loss is
 *      z * -log(sigmoid(x)) + (1 - z) * -log(1 - sigmoid(x))
 *    = z * -log(1 / (1 + exp(-x))) + (1 - z) * -log(exp(-x) / (1 + exp(-x)))
 *    = z * log(1 + exp(-x)) + (1 - z) * (-log(exp(-x)) + log(1 + exp(-x)))
 *    = z * log(1 + exp(-x)) + (1 - z) * (x + log(1 + exp(-x))
 *    = (1 - z) * x + log(1 + exp(-x))
 *    = x - x * z + log(1 + exp(-x))
 * For x < 0, to avoid overflow in exp(-x), we reformulate the above
 *      x - x * z + log(1 + exp(-x))
 *    = log(exp(x)) - x * z + log(1 + exp(-x))
 *    = - x * z + log(1 + exp(x))
 * Hence, to ensure stability and avoid overflow, the implementation uses this
 * equivalent formulation
 *    max(x, 0) - x * z + log(1 + exp(-abs(x)))
 *
 * @param labels The labels.
 * @param logits The logits.
 */
export declare function sigmoidCrossEntropyWithLogits(labels: Tensor, logits: Tensor): Tensor;
export declare function binaryCrossentropy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function kullbackLeiblerDivergence(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function poisson(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function cosineProximity(yTrue: Tensor, yPred: Tensor): Tensor;
export declare const mse: typeof meanSquaredError;
export declare const MSE: typeof meanSquaredError;
export declare const mae: typeof meanAbsoluteError;
export declare const MAE: typeof meanAbsoluteError;
export declare const mape: typeof meanAbsolutePercentageError;
export declare const MAPE: typeof meanAbsolutePercentageError;
export declare const msle: typeof meanSquaredLogarithmicError;
export declare const MSLE: typeof meanSquaredLogarithmicError;
export declare const kld: typeof kullbackLeiblerDivergence;
export declare const KLD: typeof kullbackLeiblerDivergence;
export declare const cosine: typeof cosineProximity;
export declare const lossesMap: {
    [functionName: string]: LossOrMetricFn;
};
export declare function get(identifierOrFn: string | LossOrMetricFn): LossOrMetricFn;
