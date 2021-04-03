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
import { categoricalCrossentropy as categoricalCrossentropyLoss, cosineProximity, meanAbsoluteError, meanAbsolutePercentageError, meanSquaredError, sparseCategoricalCrossentropy as sparseCategoricalCrossentropyLoss } from './losses';
import { LossOrMetricFn } from './types';
export declare function binaryAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function categoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function precision(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function recall(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function binaryCrossentropy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function sparseCategoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function topKCategoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare function sparseTopKCategoricalAccuracy(yTrue: Tensor, yPred: Tensor): Tensor;
export declare const mse: typeof meanSquaredError;
export declare const MSE: typeof meanSquaredError;
export declare const mae: typeof meanAbsoluteError;
export declare const MAE: typeof meanAbsoluteError;
export declare const mape: typeof meanAbsolutePercentageError;
export declare const MAPE: typeof meanAbsolutePercentageError;
export declare const categoricalCrossentropy: typeof categoricalCrossentropyLoss;
export declare const cosine: typeof cosineProximity;
export declare const sparseCategoricalCrossentropy: typeof sparseCategoricalCrossentropyLoss;
export declare const metricsMap: {
    [functionName: string]: LossOrMetricFn;
};
export declare function get(identifier: string | LossOrMetricFn): LossOrMetricFn;
/**
 * Get the shortcut function name.
 *
 * If the fn name is a string,
 *   directly return the string name.
 * If the function is included in metricsMap or lossesMap,
 *   return key of the map.
 *   - If the function relative to multiple keys,
 *     return the first found key as the function name.
 *   - If the function exists in both lossesMap and metricsMap,
 *     search lossesMap first.
 * If the function is not included in metricsMap or lossesMap,
 *   return the function name.
 *
 * @param fn loss function, metric function, or short cut name.
 * @returns Loss or Metric name in string.
 */
export declare function getLossOrMetricName(fn: string | LossOrMetricFn): string;
