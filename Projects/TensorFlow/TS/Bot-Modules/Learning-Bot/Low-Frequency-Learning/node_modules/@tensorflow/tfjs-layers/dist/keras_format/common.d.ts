/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/** @docalias (null | number)[] */
export declare type Shape = Array<null | number>;
export declare type DataType = 'float32' | 'int32' | 'bool' | 'complex64' | 'string';
/** @docinline */
export declare type DataFormat = 'channelsFirst' | 'channelsLast';
export declare const VALID_DATA_FORMAT_VALUES: string[];
export declare type InterpolationFormat = 'nearest' | 'bilinear';
export declare const VALID_INTERPOLATION_FORMAT_VALUES: string[];
export declare type DataFormatSerialization = 'channels_first' | 'channels_last';
/** @docinline */
export declare type PaddingMode = 'valid' | 'same' | 'causal';
export declare const VALID_PADDING_MODE_VALUES: string[];
/** @docinline */
export declare type PoolMode = 'max' | 'avg';
export declare const VALID_POOL_MODE_VALUES: string[];
/** @docinline */
export declare type BidirectionalMergeMode = 'sum' | 'mul' | 'concat' | 'ave';
export declare const VALID_BIDIRECTIONAL_MERGE_MODES: string[];
/** @docinline */
export declare type SampleWeightMode = 'temporal';
export declare const VALID_SAMPLE_WEIGHT_MODES: string[];
