/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
export const VALID_FAN_MODE_VALUES = ['fanIn', 'fanOut', 'fanAvg'];
export const VALID_DISTRIBUTION_VALUES = ['normal', 'uniform', 'truncatedNormal'];
// We can't easily extract a string[] from the string union type, but we can
// recapitulate the list, enforcing at compile time that the values are valid
// and that we have the right number of them.
/**
 * A string array of valid Initializer class names.
 *
 * This is guaranteed to match the `InitializerClassName` union type.
 */
export const initializerClassNames = [
    'Zeros', 'Ones', 'Constant', 'RandomNormal', 'RandomUniform',
    'TruncatedNormal', 'VarianceScaling', 'Orthogonal', 'Identity'
];
//# sourceMappingURL=initializer_config.js.map