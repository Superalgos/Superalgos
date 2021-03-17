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
 * Interfaces and methods for training models using TensorFlow.js datasets.
 */
import * as tfc from '@tensorflow/tfjs-core';
import { BaseCallback, CustomCallbackArgs, History, ModelLoggingVerbosity, YieldEveryOptions } from '../base_callbacks';
import { TensorOrArrayOrMap } from '../types';
import { Dataset, LazyIterator } from './dataset_stub';
import { ClassWeight, ClassWeightMap } from './training_utils';
/**
 * Interface for configuring model training based on a dataset object.
 */
export interface ModelFitDatasetArgs<T> {
    /**
     * (Optional) Total number of steps (batches of samples) before
     * declaring one epoch finished and starting the next epoch. It should
     * typically be equal to the number of samples of your dataset divided by
     * the batch size, so that `fitDataset`() call can utilize the entire dataset.
     * If it is not provided, use `done` return value in `iterator.next()` as
     * signal to finish an epoch.
     */
    batchesPerEpoch?: number;
    /**
     * Integer number of times to iterate over the training dataset.
     */
    epochs: number;
    /**
     * Verbosity level.
     *
     * Expected to be 0, 1, or 2. Default: 1.
     *
     * 0 - No printed message during fit() call.
     * 1 - In Node.js (tfjs-node), prints the progress bar, together with
     *     real-time updates of loss and metric values and training speed.
     *     In the browser: no action. This is the default.
     * 2 - Not implemented yet.
     */
    verbose?: ModelLoggingVerbosity;
    /**
     * List of callbacks to be called during training.
     * Can have one or more of the following callbacks:
     *   - `onTrainBegin(logs)`: called when training starts.
     *   - `onTrainEnd(logs)`: called when training ends.
     *   - `onEpochBegin(epoch, logs)`: called at the start of every epoch.
     *   - `onEpochEnd(epoch, logs)`: called at the end of every epoch.
     *   - `onBatchBegin(batch, logs)`: called at the start of every batch.
     *   - `onBatchEnd(batch, logs)`: called at the end of every batch.
     *   - `onYield(epoch, batch, logs)`: called every `yieldEvery` milliseconds
     *      with the current epoch, batch and logs. The logs are the same
     *      as in `onBatchEnd()`. Note that `onYield` can skip batches or
     *      epochs. See also docs for `yieldEvery` below.
     */
    callbacks?: BaseCallback[] | CustomCallbackArgs | CustomCallbackArgs[];
    /**
     * Data on which to evaluate the loss and any model
     * metrics at the end of each epoch. The model will not be trained on this
     * data. This could be any of the following:
     *
     *   - An array `[xVal, yVal]`, where the two values may be `tf.Tensor`,
     *     an array of Tensors, or a map of string to Tensor.
     *   - Similarly, an array ` [xVal, yVal, valSampleWeights]`
     *     (not implemented yet).
     *   - a `Dataset` object with elements of the form `{xs: xVal, ys: yVal}`,
     *     where `xs` and `ys` are the feature and label tensors, respectively.
     *
     * If `validationData` is an Array of Tensor objects, each `tf.Tensor` will be
     * sliced into batches during validation, using the parameter
     * `validationBatchSize` (which defaults to 32). The entirety of the
     * `tf.Tensor` objects will be used in the validation.
     *
     * If `validationData` is a dataset object, and the `validationBatches`
     * parameter is specified, the validation will use `validationBatches` batches
     * drawn from the dataset object. If `validationBatches` parameter is not
     * specified, the validation will stop when the dataset is exhausted.
     *
     * The model will not be trained on this data.
     */
    validationData?: [TensorOrArrayOrMap, TensorOrArrayOrMap] | [TensorOrArrayOrMap, TensorOrArrayOrMap, TensorOrArrayOrMap] | Dataset<T>;
    /**
     * Optional batch size for validation.
     *
     * Used only if `validationData` is an array of `tf.Tensor` objects, i.e., not
     * a dataset object.
     *
     * If not specified, its value defaults to 32.
     */
    validationBatchSize?: number;
    /**
     * (Optional) Only relevant if `validationData` is specified and is a dataset
     * object.
     *
     * Total number of batches of samples to draw from `validationData` for
     * validation purpose before stopping at the end of every epoch. If not
     * specified, `evaluateDataset` will use `iterator.next().done` as signal to
     * stop validation.
     */
    validationBatches?: number;
    /**
     * Configures the frequency of yielding the main thread to other tasks.
     *
     * In the browser environment, yielding the main thread can improve the
     * responsiveness of the page during training. In the Node.js environment,
     * it can ensure tasks queued in the event loop can be handled in a timely
     * manner.
     *
     * The value can be one of the following:
     *   - `'auto'`: The yielding happens at a certain frame rate (currently set
     *               at 125ms). This is the default.
     *   - `'batch'`: yield every batch.
     *   - `'epoch'`: yield every epoch.
     *   - a `number`: Will yield every `number` milliseconds.
     *   - `'never'`: never yield. (But yielding can still happen through `await
     *      nextFrame()` calls in custom callbacks.)
     */
    yieldEvery?: YieldEveryOptions;
    /**
     * Epoch at which to start training (useful for resuming a previous training
     * run). When this is used, `epochs` is the index of the "final epoch".
     * The model is not trained for a number of iterations given by `epochs`,
     * but merely until the epoch of index `epochs` is reached.
     */
    initialEpoch?: number;
    /**
     * Optional object mapping class indices (integers) to
     * a weight (float) to apply to the model's loss for the samples from this
     * class during training. This can be useful to tell the model to "pay more
     * attention" to samples from an under-represented class.
     *
     * If the model has multiple outputs, a class weight can be specified for
     * each of the outputs by setting this field an array of weight object
     * or a object that maps model output names (e.g., `model.outputNames[0]`)
     * to weight objects.
     */
    classWeight?: ClassWeight | ClassWeight[] | ClassWeightMap;
}
export interface FitDatasetElement {
    xs: TensorOrArrayOrMap;
    ys: TensorOrArrayOrMap;
}
/**
 * Interface for configuring model evaluation based on a dataset object.
 */
export interface ModelEvaluateDatasetArgs {
    /**
     * Number of batches to draw from the dataset object before ending the
     * evaluation.
     */
    batches?: number;
    /**
     * Verbosity mode.
     */
    verbose?: ModelLoggingVerbosity;
}
export declare function fitDataset<T>(model: any, dataset: Dataset<T>, args: ModelFitDatasetArgs<T>): Promise<History>;
export declare function evaluateDataset<T>(model: any, dataset: Dataset<T> | LazyIterator<T>, args: ModelEvaluateDatasetArgs): Promise<tfc.Scalar | tfc.Scalar[]>;
