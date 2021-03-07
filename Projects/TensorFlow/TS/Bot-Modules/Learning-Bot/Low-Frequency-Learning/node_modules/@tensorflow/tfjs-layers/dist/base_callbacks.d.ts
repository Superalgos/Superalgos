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
import { Container } from './engine/container';
import { Logs, UnresolvedLogs } from './logs';
/** Verbosity logging level when fitting a model. */
export declare enum ModelLoggingVerbosity {
    SILENT = 0,
    VERBOSE = 1
}
/** How often to yield to the main thread when training (in ms). */
export declare const DEFAULT_YIELD_EVERY_MS = 125;
export declare type Params = {
    [key: string]: number | string | boolean | number[] | string[] | boolean[];
};
export declare type YieldEveryOptions = 'auto' | 'batch' | 'epoch' | 'never' | number;
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
export declare abstract class BaseCallback {
    validationData: Tensor | Tensor[];
    /**
     * Training parameters (eg. verbosity, batch size, number of epochs...).
     */
    params: Params;
    setParams(params: Params): void;
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
    setModel(model: Container): void;
}
/**
 * Container abstracting a list of callbacks.
 */
export declare class CallbackList {
    callbacks: BaseCallback[];
    queueLength: number;
    /**
     * Constructor of CallbackList.
     * @param callbacks Array of `Callback` instances.
     * @param queueLength Queue length for keeping running statistics over
     *   callback execution time.
     */
    constructor(callbacks?: BaseCallback[], queueLength?: number);
    append(callback: BaseCallback): void;
    setParams(params: Params): void;
    setModel(model: Container): void;
    /**
     * Called at the start of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of an epoch.
     * @param epoch Index of epoch.
     * @param logs Dictionary of logs.
     */
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called  right before processing a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of a batch.
     * @param batch Index of batch within the current epoch.
     * @param logs Dictionary of logs.
     */
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the beginning of training.
     * @param logs Dictionary of logs.
     */
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    /**
     * Called at the end of training.
     * @param logs Dictionary of logs.
     */
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
}
/**
 * Callback that accumulates epoch averages of metrics.
 *
 * This callback is automatically applied to every LayersModel.
 */
export declare class BaseLogger extends BaseCallback {
    private seen;
    private totals;
    constructor();
    onEpochBegin(epoch: number): Promise<void>;
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
}
/**
 * Callback that records events into a `History` object. This callback is
 * automatically applied to every TF.js Layers model. The `History` object
 * gets returned by the `fit` method of models.
 */
export declare class History extends BaseCallback {
    epoch: number[];
    history: {
        [key: string]: Array<number | Tensor>;
    };
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    /**
     * Await the values of all losses and metrics.
     */
    syncData(): Promise<void>;
}
export interface CustomCallbackArgs {
    onTrainBegin?: (logs?: Logs) => void | Promise<void>;
    onTrainEnd?: (logs?: Logs) => void | Promise<void>;
    onEpochBegin?: (epoch: number, logs?: Logs) => void | Promise<void>;
    onEpochEnd?: (epoch: number, logs?: Logs) => void | Promise<void>;
    onBatchBegin?: (batch: number, logs?: Logs) => void | Promise<void>;
    onBatchEnd?: (batch: number, logs?: Logs) => void | Promise<void>;
    onYield?: (epoch: number, batch: number, logs: Logs) => void | Promise<void>;
}
/**
 * Custom callback for training.
 */
export declare class CustomCallback extends BaseCallback {
    protected readonly trainBegin: (logs?: Logs) => void | Promise<void>;
    protected readonly trainEnd: (logs?: Logs) => void | Promise<void>;
    protected readonly epochBegin: (epoch: number, logs?: Logs) => void | Promise<void>;
    protected readonly epochEnd: (epoch: number, logs?: Logs) => void | Promise<void>;
    protected readonly batchBegin: (batch: number, logs?: Logs) => void | Promise<void>;
    protected readonly batchEnd: (batch: number, logs?: Logs) => void | Promise<void>;
    protected readonly yield: (epoch: number, batch: number, logs: Logs) => void | Promise<void>;
    private yieldEvery;
    private currentEpoch;
    constructor(args: CustomCallbackArgs, yieldEvery?: YieldEveryOptions);
    maybeWait(epoch: number, batch: number, logs: UnresolvedLogs): Promise<void>;
    onEpochBegin(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onEpochEnd(epoch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchBegin(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onBatchEnd(batch: number, logs?: UnresolvedLogs): Promise<void>;
    onTrainBegin(logs?: UnresolvedLogs): Promise<void>;
    onTrainEnd(logs?: UnresolvedLogs): Promise<void>;
}
/**
 * Standardize callbacks or configurations of them to an Array of callbacks.
 */
export declare function standardizeCallbacks(callbacks: BaseCallback | BaseCallback[] | CustomCallbackArgs | CustomCallbackArgs[], yieldEvery: YieldEveryOptions): BaseCallback[];
export declare type BaseCallbackConstructor = {
    new (): BaseCallback;
};
/**
 * A global registry for callback constructors to be used during
 * LayersModel.fit().
 */
export declare class CallbackConstructorRegistry {
    private static constructors;
    /**
     * Blocks public access to constructor.
     */
    private constructor();
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
    static registerCallbackConstructor(verbosityLevel: number, callbackConstructor: BaseCallbackConstructor): void;
    private static checkForDuplicate;
    /**
     * Clear all registered callback constructors.
     */
    protected static clear(): void;
    /**
     * Create callbacks using the registered callback constructors.
     *
     * Given `verbosityLevel`, all constructors registered at that level or above
     * will be called and the instantiated callbacks will be used.
     *
     * @param verbosityLevel: Level of verbosity.
     */
    static createCallbacks(verbosityLevel: number): BaseCallback[];
}
export declare function configureCallbacks(callbacks: BaseCallback[], verbose: ModelLoggingVerbosity, epochs: number, initialEpoch: number, numTrainSamples: number, stepsPerEpoch: number, batchSize: number, doValidation: boolean, callbackMetrics: string[]): {
    callbackList: CallbackList;
    history: History;
};
