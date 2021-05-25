/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
import { constraintClassNames } from './constraint_config';
import { initializerClassNames } from './initializer_config';
import { layerClassNames } from './layers/layer_serialization';
import { optimizerClassNames } from './optimizer_config';
import { regularizerClassNames } from './regularizer_config';
export const kerasClassNames = [
    ...layerClassNames, ...constraintClassNames, ...initializerClassNames,
    ...regularizerClassNames, ...optimizerClassNames
];
//# sourceMappingURL=keras_class_names.js.map