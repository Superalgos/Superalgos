/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { DataType } from '@tensorflow/tfjs-core';
import { Shape } from './common';
import { BaseLayerSerialization } from './topology_config';
export declare type InputLayerConfig = {
    name?: string;
    input_shape?: Shape;
    batch_size?: number;
    batch_input_shape?: Shape;
    dtype?: DataType;
    sparse?: boolean;
};
export declare type InputLayerSerialization = BaseLayerSerialization<'InputLayer', InputLayerConfig>;
export declare type InputLayerClassName = InputLayerSerialization['class_name'];
/**
 * A string array of valid InputLayer class names.
 *
 * This is guaranteed to match the `InputLayerClassName` union type.
 */
export declare const inputLayerClassNames: InputLayerClassName[];
