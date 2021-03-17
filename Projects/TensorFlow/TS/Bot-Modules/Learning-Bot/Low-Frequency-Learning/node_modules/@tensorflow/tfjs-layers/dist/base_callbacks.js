/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/* Original source: keras/callbacks.py */
import { add, div, keep, mul, nextFrame, tidy, util } from '@tensorflow/tfjs-core';
import { ValueError } from './errors';
import { resolveScalarsInLogs } from './logs';
import * as generic_utils from './utils/generic_utils';
/** Verbosity logging level when fitting a model. */
export var ModelLoggingVerbosity;
(function (ModelLoggingVerbosity) {
    ModelLoggingVerbosity[ModelLoggingVerbosity["SILENT"] = 0] = "SILENT";
    ModelLoggingVerbosity[ModelLoggingVerbosity["VERBOSE"] = 1] = "VERBOSE";
})(ModelLoggingVerbosity || (ModelLoggingVerbosity = {}));
/** How often to yield to the main thread when training (in ms). */
export const DEFAULT_YIELD_EVERY_MS = 125;
/**
 * Abstract base class used to build new callbacks.
 *
 * The `logs` dictionary that callback methods take as argument will contain
 * keys for quantities relevant to the current batch or epoch.
 *
 * Currently, the `.fit()` method of the `Sequential` model class
 * will include the following quantities in the `logs` that
 * it passes to its callbacks:
 *
 * onEpochEnd: Logs include `acc` and `loss`, and optionally include `valLoss`
 *   (if validation is enabled in `fit`), and `valAcc` (if validation and
 *   accuracy monitoring are enabled).
 * onBatchBegin: Logs include `size`, the number of samples in the current
 *   batch.
 * onBatchEnd: Logs include `loss`, and optionally `acc` (if accuracy monitoring
 *   is enabled).
 */
export class BaseCallback {
    constructor() {
        // TODO(michaelterry): This type is a best guess.
        this.validationData = null;
    }
    setParams(params) {
        this.params = params;
    }
    async onEpochBegin(epoch, logs) { }
    async onEpochEnd(epoch, logs) { }
    async onBatchBegin(batch, logs) { }
    async onBatchEnd(batch, logs) { }
    async onTrainBegin(logs) { }
    async onTrainEnd(logs) { }
    // LayersModel needs to call Callback.setModel(), but cannot actually depend
    // on Callback because that creates a cyclic dependency.  Providing this no-op
    // method on BaseCallback breaks the cycle: this way LayersModel can depend on
    // BaseCallback but not on Callback.  The argument is typed as `Container`
    // (the superclass of LayersModel) to avoid recapitulating the cycle. Callback
    // overrides this method and enforces that the argument is really a
    // LayersModel.
    setModel(model) {
        // Do nothing. Use Callback instead of BaseCallback to track the model.
    }
}
/**
 * Container abstracting a list of callbacks.
 */
export class CallbackList {
    // TODO(cais): When the need arises, uncomment the following lines and
    // implement the queue for time values.
    // private deltaTBatch: number;
    // private deltaTsBatchBegin: Array<number>;
    // private deltaTsBatchEnd: Array<number>;
    /**
     * Constructor of CallbackList.
     * @param callbacks Array of `Callback` instances.
     * @param queueLength Queue length for keeping running statistics over
     *   callback execution time.
     */
    constructor(callbacks, queueLength = 10) {
        // TODO(cais): Make use of queueLength when implementing the queue for time
        // values.
        if (callbacks == null) {
            callbacks = [];
        }
        this.callbacks = callbacks;
        this.queueLength = queueLength;
    }
    append(callback) {
        this.callbacks.push(callback);
    }
    setParams(params) {
        for (const callback of this.callbacks) {
            callback.setParams(params);
        }
    }
    setModel(model) {
        for (const callback of this.callbacks) {
            callback.setModel(model);
        }
    }
    /**
     * Called at the start of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    async onEpochBegin(epoch, logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onEpochBegin(epoch, logs);
        }
    }
    /**
     * Called at the end of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    async onEpochEnd(epoch, logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onEpochEnd(epoch, logs);
        }
    }
    /**
     * Called  right before processing a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    async onBatchBegin(batch, logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onBatchBegin(batch, logs);
        }
    }
    /**
     * Called at the end of a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    async onBatchEnd(batch, logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onBatchEnd(batch, logs);
        }
    }
    /**
     * Called at the beginning of training.
     * @param logs Dictionary of logs.
     */
    async onTrainBegin(logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onTrainBegin(logs);
        }
    }
    /**
     * Called at the end of training.
     * @param logs Dictionary of logs.
     */
    async onTrainEnd(logs) {
        if (logs == null) {
            logs = {};
        }
        for (const callback of this.callbacks) {
            await callback.onTrainEnd(logs);
        }
    }
}
/**
 * Callback that accumulates epoch averages of metrics.
 *
 * This callback is automatically applied to every LayersModel.
 */
export class BaseLogger extends BaseCallback {
    constructor() {
        super();
    }
    async onEpochBegin(epoch) {
        this.seen = 0;
        this.totals = {};
    }
    async onBatchEnd(batch, logs) {
        if (logs == null) {
            logs = {};
        }
        const batchSize = logs['size'] == null ? 0 : logs['size'];
        this.seen += batchSize;
        for (const key in logs) {
            const value = logs[key];
            if (typeof value === 'number') {
                if (!this.totals.hasOwnProperty(key)) {
                    this.totals[key] = 0;
                }
                this.totals[key] = this.totals[key] + value * batchSize;
            }
            else {
                let oldTotalsToDispose;
                if (key in this.totals) {
                    oldTotalsToDispose = this.totals[key];
                }
                else {
                    this.totals[key] = 0;
                }
                const total = tidy(() => add((this.totals[key]), mul(value, batchSize)));
                this.totals[key] = total;
                if (oldTotalsToDispose != null) {
                    oldTotalsToDispose.dispose();
                }
            }
        }
    }
    async onEpochEnd(epoch, logs) {
        if (logs != null) {
            for (const key of this.params['metrics']) {
                if (this.totals[key] == null) {
                    continue;
                }
                if (typeof this.totals[key] === 'number') {
                    logs[key] = this.totals[key] / this.seen;
                }
                else {
                    tidy(() => {
                        const log = mul(div(1, this.seen), this.totals[key]);
                        logs[key] = log;
                        this.totals[key].dispose();
                        keep(logs[key]);
                    });
                }
            }
        }
    }
}
/**
 * Callback that records events into a `History` object. This callback is
 * automatically applied to every TF.js Layers model. The `History` object
 * gets returned by the `fit` method of models.
 */
export class History extends BaseCallback {
    async onTrainBegin(logs) {
        this.epoch = [];
        this.history = {};
    }
    async onEpochEnd(epoch, logs) {
        if (logs == null) {
            logs = {};
        }
        this.epoch.push(epoch);
        for (const key in logs) {
            if (this.history[key] == null) {
                this.history[key] = [];
            }
            this.history[key].push(logs[key]);
        }
    }
    /**
     * Await the values of all losses and metrics.
     */
    async syncData() {
        const promises = [];
        const keys = [];
        const indices = [];
        for (const key in this.history) {
            const valueArray = this.history[key];
            for (let i = 0; i < valueArray.length; ++i) {
                if (typeof valueArray[i] !== 'number') {
                    const valueScalar = valueArray[i];
                    promises.push(valueScalar.data());
                    keys.push(key);
                    indices.push(i);
                }
            }
        }
        const values = await Promise.all(promises);
        for (let n = 0; n < values.length; ++n) {
            const tensorToDispose = this.history[keys[n]][indices[n]];
            tensorToDispose.dispose();
            this.history[keys[n]][indices[n]] = values[n][0];
        }
    }
}
/**
 * Custom callback for training.
 */
export class CustomCallback extends BaseCallback {
    constructor(args, yieldEvery) {
        super();
        this.currentEpoch = 0;
        this.yieldEvery = yieldEvery || 'auto';
        if (this.yieldEvery === 'auto') {
            this.yieldEvery = DEFAULT_YIELD_EVERY_MS;
        }
        if (this.yieldEvery === 'never' && args.onYield != null) {
            throw new Error('yieldEvery is `never` but you provided an `onYield` callback. ' +
                'Either change `yieldEvery` or remove the callback');
        }
        if (util.isNumber(this.yieldEvery)) {
            // Decorate `maybeWait` so it will be called at most once every
            // `yieldEvery` ms.
            this.maybeWait = generic_utils.debounce(this.maybeWait.bind(this), this.yieldEvery);
        }
        this.trainBegin = args.onTrainBegin;
        this.trainEnd = args.onTrainEnd;
        this.epochBegin = args.onEpochBegin;
        this.epochEnd = args.onEpochEnd;
        this.batchBegin = args.onBatchBegin;
        this.batchEnd = args.onBatchEnd;
        this.yield = args.onYield;
    }
    async maybeWait(epoch, batch, logs) {
        const ps = [];
        if (this.yield != null) {
            await resolveScalarsInLogs(logs);
            ps.push(this.yield(epoch, batch, logs));
        }
        ps.push(nextFrame());
        await Promise.all(ps);
    }
    async onEpochBegin(epoch, logs) {
        this.currentEpoch = epoch;
        if (this.epochBegin != null) {
            await resolveScalarsInLogs(logs);
            await this.epochBegin(epoch, logs);
        }
    }
    async onEpochEnd(epoch, logs) {
        const ps = [];
        if (this.epochEnd != null) {
            await resolveScalarsInLogs(logs);
            ps.push(this.epochEnd(epoch, logs));
        }
        if (this.yieldEvery === 'epoch') {
            ps.push(nextFrame());
        }
        await Promise.all(ps);
    }
    async onBatchBegin(batch, logs) {
        if (this.batchBegin != null) {
            await resolveScalarsInLogs(logs);
            await this.batchBegin(batch, logs);
        }
    }
    async onBatchEnd(batch, logs) {
        const ps = [];
        if (this.batchEnd != null) {
            await resolveScalarsInLogs(logs);
            ps.push(this.batchEnd(batch, logs));
        }
        if (this.yieldEvery === 'batch') {
            ps.push(nextFrame());
        }
        else if (util.isNumber(this.yieldEvery)) {
            ps.push(this.maybeWait(this.currentEpoch, batch, logs));
        }
        await Promise.all(ps);
    }
    async onTrainBegin(logs) {
        if (this.trainBegin != null) {
            await resolveScalarsInLogs(logs);
            await this.trainBegin(logs);
        }
    }
    async onTrainEnd(logs) {
        if (this.trainEnd != null) {
            await resolveScalarsInLogs(logs);
            await this.trainEnd(logs);
        }
    }
}
/**
 * Standardize callbacks or configurations of them to an Array of callbacks.
 */
export function standardizeCallbacks(callbacks, yieldEvery) {
    if (callbacks == null) {
        callbacks = {};
    }
    if (callbacks instanceof BaseCallback) {
        return [callbacks];
    }
    if (Array.isArray(callbacks) && callbacks[0] instanceof BaseCallback) {
        return callbacks;
    }
    // Convert custom callback configs to custom callback objects.
    const callbackConfigs = generic_utils.toList(callbacks);
    return callbackConfigs.map(callbackConfig => new CustomCallback(callbackConfig, yieldEvery));
}
/**
 * A global registry for callback constructors to be used during
 * LayersModel.fit().
 */
export class CallbackConstructorRegistry {
    /**
     * Blocks public access to constructor.
     */
    constructor() { }
    /**
     * Register a tf.LayersModel.fit() callback constructor.
     *
     * The registered callback constructor will be used to instantiate
     * callbacks for every tf.LayersModel.fit() call afterwards.
     *
     * @param verbosityLevel Level of verbosity at which the `callbackConstructor`
     *   is to be reigstered.
     * @param callbackConstructor A no-arg constructor for `tf.Callback`.
     * @throws Error, if the same callbackConstructor has been registered before,
     *   either at the same or a different `verbosityLevel`.
     */
    static registerCallbackConstructor(verbosityLevel, callbackConstructor) {
        util.assert(verbosityLevel >= 0 && Number.isInteger(verbosityLevel), () => `Verbosity level is expected to be an integer >= 0, ` +
            `but got ${verbosityLevel}`);
        CallbackConstructorRegistry.checkForDuplicate(callbackConstructor);
        if (CallbackConstructorRegistry.constructors[verbosityLevel] == null) {
            CallbackConstructorRegistry.constructors[verbosityLevel] = [];
        }
        CallbackConstructorRegistry.constructors[verbosityLevel].push(callbackConstructor);
    }
    static checkForDuplicate(callbackConstructor) {
        for (const levelName in CallbackConstructorRegistry.constructors) {
            const constructors = CallbackConstructorRegistry.constructors[+levelName];
            constructors.forEach(ctor => {
                if (ctor === callbackConstructor) {
                    throw new ValueError('Duplicate callback constructor.');
                }
            });
        }
    }
    /**
     * Clear all registered callback constructors.
     */
    static clear() {
        CallbackConstructorRegistry.constructors = {};
    }
    /**
     * Create callbacks using the registered callback constructors.
     *
     * Given `verbosityLevel`, all constructors registered at that level or above
     * will be called and the instantiated callbacks will be used.
     *
     * @param verbosityLevel: Level of verbosity.
     */
    static createCallbacks(verbosityLevel) {
        const constructors = [];
        for (const levelName in CallbackConstructorRegistry.constructors) {
            const level = +levelName;
            if (verbosityLevel >= level) {
                constructors.push(...CallbackConstructorRegistry.constructors[level]);
            }
        }
        return constructors.map(ctor => new ctor());
    }
}
CallbackConstructorRegistry.constructors = {};
export function configureCallbacks(callbacks, verbose, epochs, initialEpoch, numTrainSamples, stepsPerEpoch, batchSize, doValidation, callbackMetrics) {
    const history = new History();
    const actualCallbacks = [
        new BaseLogger(), ...CallbackConstructorRegistry.createCallbacks(verbose)
    ];
    if (callbacks != null) {
        actualCallbacks.push(...callbacks);
    }
    actualCallbacks.push(history);
    const callbackList = new CallbackList(actualCallbacks);
    // TODO(cais): Figure out when this LayersModel instance can have a
    // dynamically
    //   set property called 'callback_model' as in PyKeras.
    callbackList.setParams({
        epochs,
        initialEpoch,
        samples: numTrainSamples,
        steps: stepsPerEpoch,
        batchSize,
        verbose,
        doValidation,
        metrics: callbackMetrics,
    });
    return { callbackList, history };
}
//# sourceMappingURL=base_callbacks.js.map