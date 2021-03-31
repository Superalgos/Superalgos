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
// recapitulate the list, enforcing at compile time that the values are valid
// and that we have the right number of them.
/**
 * A string array of valid Regularizer class names.
 *
 * This is guaranteed to match the `RegularizerClassName` union type.
 */
export const regularizerClassNames = ['L1L2'];
//# sourceMappingURL=regularizer_config.js.map