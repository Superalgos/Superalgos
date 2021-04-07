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
 * A string array of valid Constraint class names.
 *
 * This is guaranteed to match the `ConstraintClassName` union type.
 */
export const constraintClassNames = ['MaxNorm', 'UnitNorm', 'NonNeg', 'MinMaxNorm'];
//# sourceMappingURL=constraint_config.js.map