/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { Scalar } from '@tensorflow/tfjs-core';
/**
 * Logs in which values can be either numbers or Tensors (Scalars).
 *
 * Used internally.
 */
export declare type UnresolvedLogs = {
    [key: string]: number | Scalar;
};
/**
 * Turn any Scalar values in a Logs object into actual number values.
 *
 * @param logs The `Logs` object to be resolved in place.
 */
export declare function resolveScalarsInLogs(logs: UnresolvedLogs): Promise<void>;
/**
 * Dispose all Tensors in an UnresolvedLogs object.
 *
 * @param logs An `UnresolvedLogs` object potentially containing `tf.Tensor`s in
 *   places where the values can be `tf.Tensor` or `number`.
 */
export declare function disposeTensorsInLogs(logs: UnresolvedLogs): void;
/**
 * Logs in which values can only be numbers.
 *
 * Used when calling client-provided custom callbacks.
 */
export declare type Logs = {
    [key: string]: number;
};
