/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { DataFormatSerialization } from '../common';
import { BaseLayerSerialization, LayerConfig } from '../topology_config';
export interface ZeroPadding2DLayerConfig extends LayerConfig {
    padding?: number | [number, number] | [[number, number], [number, number]];
    data_format?: DataFormatSerialization;
}
export declare type ZeroPadding2DLayerSerialization = BaseLayerSerialization<'ZeroPadding2D', ZeroPadding2DLayerConfig>;
export declare type PaddingLayerSerialization = ZeroPadding2DLayerSerialization;
export declare type PaddingLayerClassName = PaddingLayerSerialization['class_name'];
/**
 * A string array of valid PaddingLayer class names.
 *
 * This is guaranteed to match the `PaddingLayerClassName` union type.
 */
export declare const paddingLayerClassNames: PaddingLayerClassName[];
