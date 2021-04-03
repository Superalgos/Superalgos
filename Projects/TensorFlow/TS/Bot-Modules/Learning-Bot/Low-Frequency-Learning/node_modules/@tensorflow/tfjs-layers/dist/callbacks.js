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
import { BaseCallback } from './base_callbacks';
import { LayersModel } from './engine/training';
import { NotImplementedError } from './errors';
import { resolveScalarsInLogs } from './logs';
export class Callback extends BaseCallback {
    constructor() {
        super(...arguments);
        /** Instance of `keras.models.Model`. Reference of the model being trained. */
        this.model = null;
    }
    setModel(model) {
        if (!(model instanceof LayersModel)) {
            throw new Error('model must be a LayersModel, not some other Container');
        }
        this.model = model;
    }
}
function less(currVal, prevVal) {
    return currVal < prevVal;
}
function greater(currVal, prevVal) {
    return currVal > prevVal;
}
/**
 * A Callback that stops training when a monitored quantity has stopped
 * improving.
 */
export class EarlyStopping extends Callback {
    constructor(args) {
        super();
        if (args == null) {
            args = {};
        }
        if (args.restoreBestWeights) {
            throw new NotImplementedError('restoreBestWeights = True is not implemented in EarlyStopping yet.');
        }
        this.monitor = args.monitor || 'val_loss';
        this.minDelta = Math.abs(args.minDelta || 0);
        this.patience = args.patience || 0;
        this.verbose = args.verbose || 0;
        this.mode = args.mode || 'auto';
        this.baseline = args.baseline;
        if (['auto', 'min', 'max'].indexOf(this.mode) === -1) {
            console.warn(`EarlyStopping mode '${this.mode}' is invalid. ` +
                `Falling back to mode 'auto'.`);
            this.mode = 'auto';
        }
        if (this.mode === 'min') {
            this.monitorFunc = less;
        }
        else if (this.mode === 'max') {
            this.monitorFunc = greater;
        }
        else {
            // For mode === 'auto'.
            if (this.monitor.indexOf('acc') !== -1) {
                this.monitorFunc = greater;
            }
            else {
                this.monitorFunc = less;
            }
        }
        if (this.monitorFunc === less) {
            this.minDelta *= -1;
        }
    }
    async onTrainBegin(logs) {
        this.wait = 0;
        this.stoppedEpoch = 0;
        if (this.baseline != null) {
            this.best = this.baseline;
        }
        else {
            this.best = this.monitorFunc === less ? Infinity : -Infinity;
        }
    }
    async onEpochEnd(epoch, logs) {
        await resolveScalarsInLogs(logs);
        const current = this.getMonitorValue(logs);
        if (current == null) {
            return;
        }
        if (this.monitorFunc(current - this.minDelta, this.best)) {
            this.best = current;
            this.wait = 0;
            // TODO(cais): Logic for restoreBestWeights.
        }
        else {
            this.wait++;
            if (this.wait >= this.patience) {
                this.stoppedEpoch = epoch;
                this.model.stopTraining = true;
            }
            // TODO(cais): Logic for restoreBestWeights.
        }
    }
    async onTrainEnd(logs) {
        if (this.stoppedEpoch > 0 && this.verbose) {
            console.log(`Epoch ${this.stoppedEpoch}: early stopping.`);
        }
    }
    getMonitorValue(logs) {
        if (logs == null) {
            logs = {};
        }
        const monitorValue = logs[this.monitor];
        if (monitorValue == null) {
            console.warn(`Metric for EarlyStopping ${this.monitor} is not available. ` +
                `Available metrics are: ${Object.keys(logs)}`);
        }
        return monitorValue;
    }
}
/**
 * Factory function for a Callback that stops training when a monitored
 * quantity has stopped improving.
 *
 * Early stopping is a type of regularization, and protects model against
 * overfitting.
 *
 * The following example based on fake data illustrates how this callback
 * can be used during `tf.LayersModel.fit()`:
 *
 * ```js
 * const model = tf.sequential();
 * model.add(tf.layers.dense({
 *   units: 3,
 *   activation: 'softmax',
 *   kernelInitializer: 'ones',
 *   inputShape: [2]
 * }));
 * const xs = tf.tensor2d([1, 2, 3, 4], [2, 2]);
 * const ys = tf.tensor2d([[1, 0, 0], [0, 1, 0]], [2, 3]);
 * const xsVal = tf.tensor2d([4, 3, 2, 1], [2, 2]);
 * const ysVal = tf.tensor2d([[0, 0, 1], [0, 1, 0]], [2, 3]);
 * model.compile(
 *     {loss: 'categoricalCrossentropy', optimizer: 'sgd', metrics: ['acc']});
 *
 * // Without the EarlyStopping callback, the val_acc value would be:
 * //   0.5, 0.5, 0.5, 0.5, ...
 * // With val_acc being monitored, training should stop after the 2nd epoch.
 * const history = await model.fit(xs, ys, {
 *   epochs: 10,
 *   validationData: [xsVal, ysVal],
 *   callbacks: tf.callbacks.earlyStopping({monitor: 'val_acc'})
 * });
 *
 * // Expect to see a length-2 array.
 * console.log(history.history.val_acc);
 * ```
 *
 * @doc {
 *   heading: 'Callbacks',
 *   namespace: 'callbacks'
 * }
 */
export function earlyStopping(args) {
    return new EarlyStopping(args);
}
export const callbacks = { earlyStopping };
//# sourceMappingURL=callbacks.js.map