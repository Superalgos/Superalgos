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
 * Interfaces and methods for training models using tf.Tensor objects.
 */
import * as tfc from '@tensorflow/tfjs-core';
import { Tensor, tensor1d, util } from '@tensorflow/tfjs-core';
import { expandDims, gather, sliceAlongFirstAxis } from '../backend/tfjs_backend';
import { configureCallbacks, standardizeCallbacks } from '../base_callbacks';
import { NotImplementedError, ValueError } from '../errors';
import { disposeTensorsInLogs } from '../logs';
import { range } from '../utils/math_utils';
export function checkBatchSize(batchSize) {
    tfc.util.assert(batchSize > 0 && Number.isInteger(batchSize), () => `batchSize is required to be a positive integer, but got ${batchSize}`);
}
/**
 * Slice a Tensor or an Array of Tensors, by start and stop indices.
 *
 * Porting Note: The `_slice_arrays` function in PyKeras is covered by this
 *   function and `sliceArraysByIndices()` together.
 *
 * @param arrays: the input.
 * @param start: the starting index (inclusive).
 * @param stop: the stopping index (exclusive).
 * @returns The result of the slicing. If `arrays` is an `Array` of
 *   `tf.Tensor`s, the slicing will be applied to all elements of the `Array`
 *   in the same way.
 */
export function sliceArrays(arrays, start, stop) {
    if (arrays == null) {
        return [null];
    }
    else if (Array.isArray(arrays)) {
        return arrays.map(array => sliceAlongFirstAxis(array, start, stop - start));
    }
    else { // Tensor.
        return sliceAlongFirstAxis(arrays, start, stop - start);
    }
}
/**
 * Slice a Tensor or an Array of Tensors, by random-order indices.
 *
 * Porting Note: The `_slice_arrays` function in PyKeras is covered by this
 *   function and `sliceArrays()` together.
 *
 * @param arrays The input `tf.Tensor` or `Array` of `tf.Tensor`s to slice.
 *   If an `Array` of `tf.Tensor`s, all `tf.Tensor`s will be sliced in the
 *   same fashion.
 * @param indices The indices to use for slicing along the first (batch)
 *   dimension.
 * @returns Result(s) of the slicing.
 */
export function sliceArraysByIndices(arrays, indices) {
    return tfc.tidy(() => {
        if (arrays == null) {
            return null;
        }
        else if (Array.isArray(arrays)) {
            return arrays.map(array => sliceArraysByIndices(array, indices));
        }
        else {
            // TODO(cais): indices should be a pre-constructed Tensor1D to avoid
            //   tensor1d() calls.
            return gather(arrays, indices.dtype === 'int32' ? indices : indices.toInt());
        }
    });
}
/**
 * Returns a list of batch indices (tuples of indices).
 * @param size: Integer, total size of the data to slice into batches.
 * @param batchSize: Integer, batch size.
 * @returns An Array of [batchStart, batchEnd] tuples. batchStart is
 *   inclusive; batchEnd is exclusive. I.e., each batch consists of indices x
 *   that satisfy batchStart <= x < batchEnd.
 */
export function makeBatches(size, batchSize) {
    const output = [];
    let batchStart = 0;
    let batchEnd = null;
    while (batchStart < size) {
        batchEnd = batchStart + batchSize;
        if (batchEnd >= size) {
            batchEnd = size;
        }
        output.push([batchStart, batchEnd]);
        batchStart = batchEnd;
    }
    return output;
}
/**
 * Abstract fit function for `f(ins)`.
 * @param f A Function returning a list of tensors. For training, this
 *   function is expected to perform the updates to the variables.
 * @param ins List of tensors to be fed to `f`.
 * @param outLabels List of strings, display names of the outputs of `f`.
 * @param batchSize Integer batch size or `== null` if unknown. Default : 32.
 * @param epochs Number of times to iterate over the data. Default : 1.
 * @param verbose Verbosity mode: 0, 1, or 2. Default: 1.
 * @param callbacks List of callbacks to be called during training.
 * @param valF Function to call for validation.
 * @param valIns List of tensors to be fed to `valF`.
 * @param shuffle Whether to shuffle the data at the beginning of every
 * epoch. Default : true.
 * @param callbackMetrics List of strings, the display names of the metrics
 *   passed to the callbacks. They should be the concatenation of the
 *   display names of the outputs of `f` and the list of display names
 *   of the outputs of `valF`.
 * @param initialEpoch Epoch at which to start training (useful for
 *   resuming a previous training run). Default : 0.
 * @param stepsPerEpoch Total number of steps (batches on samples) before
 *   declaring one epoch finished and starting the next epoch. Ignored with
 *   the default value of `undefined` or `null`.
 * @param validationSteps Number of steps to run validation for (only if
 *   doing validation from data tensors). Not applicable for tfjs-layers.
 * @returns A `History` object.
 */
async function fitLoop(
// Type `model` as `any` here to avoid circular dependency w/ training.ts.
// tslint:disable-next-line:no-any
model, f, ins, outLabels, batchSize, epochs, verbose, callbacks, valF, valIns, shuffle, callbackMetrics, initialEpoch, stepsPerEpoch, validationSteps) {
    if (batchSize == null) {
        batchSize = 32;
    }
    if (epochs == null) {
        epochs = 1;
    }
    if (shuffle == null) {
        shuffle = true;
    }
    if (initialEpoch == null) {
        initialEpoch = 0;
    }
    // TODO(cais): Change const to let below when implementing validation.
    let doValidation = false;
    if (valF != null && valIns != null) {
        doValidation = true;
        // TODO(cais): verbose message.
    }
    if (validationSteps != null) {
        doValidation = true;
        if (stepsPerEpoch == null) {
            throw new ValueError('Can only use `validationSteps` when doing step-wise training, ' +
                'i.e., `stepsPerEpoch` must be set.');
        }
    }
    const numTrainSamples = model.checkNumSamples(ins, batchSize, stepsPerEpoch, 'steps_per_epoch');
    let indexArray;
    if (numTrainSamples != null) {
        indexArray = range(0, numTrainSamples);
    }
    if (verbose == null) {
        verbose = 1;
    }
    const { callbackList, history } = configureCallbacks(callbacks, verbose, epochs, initialEpoch, numTrainSamples, stepsPerEpoch, batchSize, doValidation, callbackMetrics);
    callbackList.setModel(model);
    model.history = history;
    await callbackList.onTrainBegin();
    model.stopTraining_ = false;
    // TODO(cais): Take care of callbacks.validation_data as in PyKeras.
    // TODO(cais): Pre-convert feeds for performance as in PyKeras.
    for (let epoch = initialEpoch; epoch < epochs; ++epoch) {
        await callbackList.onEpochBegin(epoch);
        const epochLogs = {};
        if (stepsPerEpoch != null) {
            throw new NotImplementedError('stepsPerEpoch mode is not implemented yet.');
        }
        else {
            if (shuffle === 'batch') {
                throw new NotImplementedError('batch shuffling is not implemneted yet');
            }
            else if (shuffle) {
                util.shuffle(indexArray);
            }
            // Convert the potentially shuffled indices to Tensor1D, to avoid the
            // cost of repeated creation of Array1Ds later on.
            const epochIndexArray1D = tensor1d(indexArray);
            const batches = makeBatches(numTrainSamples, batchSize);
            for (let batchIndex = 0; batchIndex < batches.length; ++batchIndex) {
                const batchLogs = {};
                await callbackList.onBatchBegin(batchIndex, batchLogs);
                tfc.tidy(() => {
                    const batchStart = batches[batchIndex][0];
                    const batchEnd = batches[batchIndex][1];
                    const batchIds = sliceAlongFirstAxis(epochIndexArray1D, batchStart, batchEnd - batchStart);
                    batchLogs['batch'] = batchIndex;
                    batchLogs['size'] = batchEnd - batchStart;
                    // TODO(cais): In ins, train flag can be a number, instead of an
                    //   Tensor? Do we need to handle this in tfjs-layers?
                    const insBatch = sliceArraysByIndices(ins, batchIds);
                    const outs = f(insBatch);
                    for (let i = 0; i < outLabels.length; ++i) {
                        const label = outLabels[i];
                        const out = outs[i];
                        batchLogs[label] = out;
                        tfc.keep(out);
                        // TODO(cais): Use scope() to avoid ownership.
                    }
                    if (batchIndex === batches.length - 1) { // Last batch.
                        if (doValidation) {
                            const valOuts = model.testLoop(valF, valIns, batchSize);
                            // Porting Notes: In tfjs-layers, valOuts is always an Array.
                            for (let i = 0; i < outLabels.length; ++i) {
                                const label = outLabels[i];
                                const out = valOuts[i];
                                tfc.keep(out);
                                // TODO(cais): Use scope() to avoid ownership.
                                epochLogs['val_' + label] = out;
                            }
                        }
                    }
                });
                await callbackList.onBatchEnd(batchIndex, batchLogs);
                disposeTensorsInLogs(batchLogs);
                if (model.stopTraining_) {
                    break;
                }
                // TODO(cais): return outs as list of Tensor.
            }
            epochIndexArray1D.dispose();
        }
        // TODO(cais): Run validation at the end of the epoch.
        await callbackList.onEpochEnd(epoch, epochLogs);
        if (model.stopTraining_) {
            break;
        }
    }
    await callbackList.onTrainEnd();
    await model.history.syncData();
    return model.history;
}
export async function fitTensors(
// Type `model` as `any` here to avoid circular dependency w/ training.ts.
// tslint:disable-next-line:no-any
model, x, y, args = {}) {
    if (model.isTraining) {
        throw new Error('Cannot start training because another fit() call is ongoing.');
    }
    model.isTraining = true;
    let inputs;
    let targets;
    let inputValX;
    let inputValY;
    let valX;
    let valY;
    let sampleWeights;
    try {
        const batchSize = args.batchSize == null ? 32 : args.batchSize;
        checkBatchSize(batchSize);
        // Validate user data.
        // TODO(cais): Support sampleWeight.
        const checkBatchAxis = false;
        const standardizedOuts = await model.standardizeUserData(x, y, args.sampleWeight, args.classWeight, checkBatchAxis, batchSize);
        inputs = standardizedOuts[0];
        targets = standardizedOuts[1];
        sampleWeights = standardizedOuts[2];
        // Prepare validation data.
        let doValidation = false;
        let valIns;
        if (args.validationData != null && args.validationData.length > 0) {
            doValidation = true;
            if (args.validationData.length === 2) {
                // config.validationData consists of valX and valY.
                inputValX = args.validationData[0];
                inputValY = args.validationData[1];
            }
            else if (args.validationData.length === 3) {
                throw new NotImplementedError('validationData including sample weights is not supported yet.');
            }
            else {
                throw new ValueError(`When passing validation data, it must contain 2 (valX, valY) ` +
                    `or 3 (valX, valY, valSampleWeight) items; ` +
                    `${args.validationData} is invalid.`);
            }
            const checkBatchAxis = true;
            const valStandardized = await model.standardizeUserData(inputValX, inputValY, null, /** Unused sample weights. */ null, /** Unused class weights. */ checkBatchAxis, batchSize);
            valX = valStandardized[0];
            valY = valStandardized[1];
            valIns = valX.concat(valY);
            // TODO(cais): Add useLearningPhase data properly.
        }
        else if (args.validationSplit != null && args.validationSplit > 0 &&
            args.validationSplit < 1) {
            doValidation = true;
            // Porting Note: In tfjs-layers, inputs[0] is always a Tensor.
            const splitAt = Math.floor(inputs[0].shape[0] * (1 - args.validationSplit));
            const originalBatchSize = inputs[0].shape[0];
            valX = sliceArrays(inputs, splitAt, originalBatchSize);
            inputs = sliceArrays(inputs, 0, splitAt);
            valY = sliceArrays(targets, splitAt, originalBatchSize);
            targets = sliceArrays(targets, 0, splitAt);
            // TODO(cais): Once sampleWeights becomes available, slice it to get
            //   valSampleWeights.
            valIns = valX.concat(valY);
            // TODO(cais): Add useLearningPhase data properly.
        }
        else if (args.validationSteps != null) {
            doValidation = true;
            // TODO(cais): Add useLearningPhase.
        }
        const ins = inputs.concat(targets).concat(sampleWeights);
        model.checkTrainableWeightsConsistency();
        // TODO(cais): Handle use_learning_phase and learning_phase?
        // Porting Note: Here we see a key deviation of tfjs-layers from
        // Keras.
        //  Due to the imperative nature of tfjs-layers' backend (tfjs-core),
        //  we do not construct symbolic computation graphs to embody the
        //  training process. Instead, we define a function that performs the
        //  training action. In PyKeras, the data (inputs and targets) are fed
        //  through graph placeholders. In tfjs-layers, the data are fed as
        //  function arguments. Since the function are defined below in the
        //  scope, we don't have equivalents of PyKeras's
        //  `_make_train_funciton`.
        const trainFunction = model.makeTrainFunction();
        const outLabels = model.getDedupedMetricsNames();
        let valFunction;
        let callbackMetrics;
        if (doValidation) {
            model.makeTestFunction();
            valFunction = model.testFunction;
            callbackMetrics =
                outLabels.slice().concat(outLabels.map(n => 'val_' + n));
        }
        else {
            valFunction = null;
            valIns = [];
            callbackMetrics = outLabels.slice();
        }
        const callbacks = standardizeCallbacks(args.callbacks, args.yieldEvery);
        const out = await fitLoop(model, trainFunction, ins, outLabels, batchSize, args.epochs, args.verbose, callbacks, valFunction, valIns, args.shuffle, callbackMetrics, args.initialEpoch, null, null);
        return out;
    }
    finally {
        model.isTraining = false;
        // Memory clean up.
        disposeNewTensors(inputs, x);
        disposeNewTensors(targets, y);
        disposeNewTensors(valX, inputValX);
        disposeNewTensors(valY, inputValY);
        if (sampleWeights != null) {
            tfc.dispose(sampleWeights);
        }
    }
    // TODO(cais): Add value to outLabels.
}
/**
 * Ensure tensors all have a rank of at least 2.
 *
 * If a tensor has a rank of 1, it is dimension-expanded to rank 2.
 * If any tensor has a rank of 0 (i.e., is a scalar), an error will be thrown.
 */
export function ensureTensorsRank2OrHigher(tensors) {
    const outs = [];
    if (tensors instanceof Tensor) {
        tensors = [tensors];
    }
    // Make Tensors at least 2D.
    for (let i = 0; i < tensors.length; ++i) {
        const tensor = tensors[i];
        if (tensor.rank === 1) {
            outs.push(expandDims(tensor, 1));
        }
        else if (tensor.rank === 0) {
            throw new Error('Expected tensor to be at least 1D, but received a 0D tensor ' +
                '(scalar).');
        }
        else {
            outs.push(tensor);
        }
    }
    return outs;
}
/**
 * Compare a set of tensors with a reference (old) set, discard the ones
 * in the new set that are not present in the reference set.
 *
 * This method is used for memory clenaup during calls such as
 * LayersModel.fit().
 *
 * @param tensors New set which may contain Tensors not present in
 *   `refTensors`.
 * @param refTensors Reference Tensor set.
 */
// TODO(cais, kangyizhang): Deduplicate with tfjs-data.
export function disposeNewTensors(tensors, refTensors) {
    if (tensors == null) {
        return;
    }
    const oldTensorIds = [];
    if (refTensors instanceof Tensor) {
        oldTensorIds.push(refTensors.id);
    }
    else if (Array.isArray(refTensors)) {
        refTensors.forEach(t => oldTensorIds.push(t.id));
    }
    else if (refTensors != null) {
        // `oldTensors` is a map from string name to Tensor.
        for (const name in refTensors) {
            const oldTensor = refTensors[name];
            oldTensorIds.push(oldTensor.id);
        }
    }
    const tensorsToDispose = [];
    if (tensors instanceof Tensor) {
        if (oldTensorIds.indexOf(tensors.id) === -1) {
            tensorsToDispose.push(tensors);
        }
    }
    else if (Array.isArray(tensors)) {
        tensors.forEach(t => {
            if (oldTensorIds.indexOf(t.id) === -1) {
                tensorsToDispose.push(t);
            }
        });
    }
    else if (tensors != null) {
        // `oldTensors` is a map from string name to Tensor.
        for (const name in tensors) {
            const tensor = tensors[name];
            if (oldTensorIds.indexOf(tensor.id) === -1) {
                tensorsToDispose.push(tensor);
            }
        }
    }
    tensorsToDispose.forEach(t => {
        if (!t.isDisposed) {
            t.dispose();
        }
    });
}
//# sourceMappingURL=training_tensors.js.map