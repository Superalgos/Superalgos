/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { InputLayerSerialization } from '../input_config';
import { AdvancedActivationLayerSerialization } from './advanced_activation_serialization';
import { ConvolutionalDepthwiseLayerSerialization } from './convolutional_depthwise_serialization';
import { ConvolutionalLayerSerialization } from './convolutional_serialization';
import { CoreLayerSerialization } from './core_serialization';
import { EmbeddingLayerSerialization } from './embeddings_serialization';
import { MergeLayerSerialization } from './merge_serialization';
import { NormalizationLayerSerialization } from './normalization_serialization';
import { PaddingLayerSerialization } from './padding_serialization';
import { PoolingLayerSerialization } from './pooling_serialization';
import { RecurrentLayerSerialization } from './recurrent_serialization';
export declare type LayerSerialization = AdvancedActivationLayerSerialization | ConvolutionalDepthwiseLayerSerialization | ConvolutionalLayerSerialization | CoreLayerSerialization | EmbeddingLayerSerialization | MergeLayerSerialization | NormalizationLayerSerialization | PaddingLayerSerialization | PoolingLayerSerialization | RecurrentLayerSerialization | InputLayerSerialization;
export declare type LayerClassName = LayerSerialization['class_name'];
/**
 * A string array of valid Layer class names.
 *
 * This is guaranteed to match the `LayerClassName` union type.
 */
export declare const layerClassNames: LayerClassName[];
