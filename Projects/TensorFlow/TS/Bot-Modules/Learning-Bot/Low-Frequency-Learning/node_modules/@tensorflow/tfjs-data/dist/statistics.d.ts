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
 *
 * =============================================================================
 */
import * as tf from '@tensorflow/tfjs-core';
import { Dataset } from './dataset';
/**
 * The value associated with a given key for a single element.
 *
 * Such a value may not have a batch dimension.  A value may be a scalar or an
 * n-dimensional array.
 */
export declare type ElementArray = number | number[] | tf.Tensor | string;
/**
 * A map from string keys (aka column names) to values for a single element.
 */
export declare type TabularRecord = {
    [key: string]: ElementArray;
};
/** An interface representing numeric statistics of a column. */
export interface NumericColumnStatistics {
    min: number;
    max: number;
    mean: number;
    variance: number;
    stddev: number;
    length: number;
}
/**
 * An interface representing column level NumericColumnStatistics for a
 * Dataset.
 */
export interface DatasetStatistics {
    [key: string]: NumericColumnStatistics;
}
/**
 * Provides a function that scales numeric values into the [0, 1] interval.
 *
 * @param min the lower bound of the inputs, which should be mapped to 0.
 * @param max the upper bound of the inputs, which should be mapped to 1,
 * @return A function that maps an input ElementArray to a scaled ElementArray.
 */
export declare function scaleTo01(min: number, max: number): (value: ElementArray) => ElementArray;
/**
 * Provides a function that calculates column level statistics, i.e. min, max,
 * variance, stddev.
 *
 * @param dataset The Dataset object whose statistics will be calculated.
 * @param sampleSize (Optional) If set, statistics will only be calculated
 *     against a subset of the whole data.
 * @param shuffleWindowSize (Optional) If set, shuffle provided dataset before
 *     calculating statistics.
 * @return A DatasetStatistics object that contains NumericColumnStatistics of
 *     each column.
 */
export declare function computeDatasetStatistics(dataset: Dataset<TabularRecord>, sampleSize?: number, shuffleWindowSize?: number): Promise<DatasetStatistics>;
