/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { inputLayerClassNames } from '../input_config';
import { advancedActivationLayerClassNames } from './advanced_activation_serialization';
import { convolutionalDepthwiseLayerClassNames } from './convolutional_depthwise_serialization';
import { convolutionalLayerClassNames } from './convolutional_serialization';
import { coreLayerClassNames } from './core_serialization';
import { embeddingLayerClassNames } from './embeddings_serialization';
import { mergeLayerClassNames } from './merge_serialization';
import { normalizationLayerClassNames } from './normalization_serialization';
import { paddingLayerClassNames } from './padding_serialization';
import { poolingLayerClassNames } from './pooling_serialization';
import { recurrentLayerClassNames } from './recurrent_serialization';
/**
 * A string array of valid Layer class names.
 *
 * This is guaranteed to match the `LayerClassName` union type.
 */
export const layerClassNames = [
    ...advancedActivationLayerClassNames,
    ...convolutionalDepthwiseLayerClassNames, ...convolutionalLayerClassNames,
    ...coreLayerClassNames, ...embeddingLayerClassNames, ...mergeLayerClassNames,
    ...normalizationLayerClassNames, ...paddingLayerClassNames,
    ...poolingLayerClassNames, ...recurrentLayerClassNames,
    ...inputLayerClassNames
];
//# sourceMappingURL=layer_serialization.js.map