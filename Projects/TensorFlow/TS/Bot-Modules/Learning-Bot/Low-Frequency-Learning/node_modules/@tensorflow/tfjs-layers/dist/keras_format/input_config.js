/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
// We can't easily extract a string[] from the string union type, but we can
// recapitulate the list, enforcing at compile time that the values are valid.
/**
 * A string array of valid InputLayer class names.
 *
 * This is guaranteed to match the `InputLayerClassName` union type.
 */
export const inputLayerClassNames = [
    'InputLayer',
];
//# sourceMappingURL=input_config.js.map