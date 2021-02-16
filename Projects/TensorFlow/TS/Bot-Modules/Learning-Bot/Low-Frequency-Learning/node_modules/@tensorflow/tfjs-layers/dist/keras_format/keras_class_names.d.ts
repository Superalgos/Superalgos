/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { ConstraintSerialization } from './constraint_config';
import { InitializerSerialization } from './initializer_config';
import { LayerSerialization } from './layers/layer_serialization';
import { OptimizerSerialization } from './optimizer_config';
import { RegularizerSerialization } from './regularizer_config';
/**
 * A type representing all possible Serializations of Keras objects, including
 * Layers, Constraints, Optimizers, etc.
 */
export declare type KerasSerialization = LayerSerialization | ConstraintSerialization | InitializerSerialization | RegularizerSerialization | OptimizerSerialization;
/**
 * A type representing all valid values of `class_name` in a Keras JSON file
 * (regardless of context, which will naturally further restrict the valid
 * values).
 */
export declare type KerasClassName = KerasSerialization['class_name'];
export declare const kerasClassNames: KerasClassName[];
