/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
export declare type AddLayerSerialization = BaseLayerSerialization<'Add', LayerConfig>;
export declare type MultiplyLayerSerialization = BaseLayerSerialization<'Multiply', LayerConfig>;
export declare type AverageLayerSerialization = BaseLayerSerialization<'Average', LayerConfig>;
export declare type MaximumLayerSerialization = BaseLayerSerialization<'Maximum', LayerConfig>;
export declare type MinimumLayerSerialization = BaseLayerSerialization<'Minimum', LayerConfig>;
export interface ConcatenateLayerConfig extends LayerConfig {
    axis?: number;
}
export declare type ConcatenateLayerSerialization = BaseLayerSerialization<'Concatenate', ConcatenateLayerConfig>;
export interface DotLayerConfig extends LayerConfig {
    axes: number | [number, number];
    normalize?: boolean;
}
export declare type DotLayerSerialization = BaseLayerSerialization<'Dot', DotLayerConfig>;
export declare type MergeLayerSerialization = AddLayerSerialization | MultiplyLayerSerialization | AverageLayerSerialization | MaximumLayerSerialization | MinimumLayerSerialization | ConcatenateLayerSerialization | DotLayerSerialization;
export declare type MergeLayerClassName = MergeLayerSerialization['class_name'];
/**
 * A string array of valid MergeLayer class names.
 *
 * This is guaranteed to match the `MergeLayerClassName` union type.
 */
export declare const mergeLayerClassNames: MergeLayerClassName[];
