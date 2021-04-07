/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { BidirectionalMergeMode } from '../common';
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
import { LayerSerialization } from './layer_serialization';
import { RecurrentLayerSerialization } from './recurrent_serialization';
export declare type TimeDistributedLayerSerialization = BaseLayerSerialization<'TimeDistributed', TimeDistributedLayerConfig>;
export interface TimeDistributedLayerConfig extends LayerConfig {
    layer: LayerSerialization;
}
export declare type BidirectionalLayerSerialization = BaseLayerSerialization<'Bidirectional', BidirectionalLayerConfig>;
export interface BidirectionalLayerConfig extends LayerConfig {
    layer: RecurrentLayerSerialization;
    merge_mode?: BidirectionalMergeMode;
}
export declare type WrapperLayerSerialization = TimeDistributedLayerSerialization | BidirectionalLayerSerialization;
export declare type WrapperLayerClassName = WrapperLayerSerialization['class_name'];
/**
 * A string array of valid WrapperLayer class names.
 *
 * This is guaranteed to match the `WrapperLayerClassName` union type.
 */
export declare const wrapperLayerClassNames: WrapperLayerClassName[];
