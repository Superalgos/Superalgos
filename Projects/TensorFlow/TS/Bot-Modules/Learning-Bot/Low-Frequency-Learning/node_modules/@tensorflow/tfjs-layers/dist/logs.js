/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { dispose } from '@tensorflow/tfjs-core';
/**
 * Turn any Scalar values in a Logs object into actual number values.
 *
 * @param logs The `Logs` object to be resolved in place.
 */
export async function resolveScalarsInLogs(logs) {
    if (logs == null) {
        return;
    }
    const promises = [];
    const keys = [];
    const scalarsToDispose = [];
    for (const key in logs) {
        const value = logs[key];
        if (typeof value !== 'number') {
            const valueScalar = value;
            promises.push(valueScalar.data());
            keys.push(key);
            scalarsToDispose.push(valueScalar);
        }
    }
    if (promises.length > 0) {
        const values = await Promise.all(promises);
        for (let i = 0; i < values.length; ++i) {
            logs[keys[i]] = values[i][0];
        }
        // Dispose the original scalar tensors.
        dispose(scalarsToDispose);
    }
}
/**
 * Dispose all Tensors in an UnresolvedLogs object.
 *
 * @param logs An `UnresolvedLogs` object potentially containing `tf.Tensor`s in
 *   places where the values can be `tf.Tensor` or `number`.
 */
export function disposeTensorsInLogs(logs) {
    if (logs == null) {
        return;
    }
    for (const key in logs) {
        const value = logs[key];
        if (typeof value !== 'number') {
            value.dispose();
        }
    }
}
//# sourceMappingURL=logs.js.map