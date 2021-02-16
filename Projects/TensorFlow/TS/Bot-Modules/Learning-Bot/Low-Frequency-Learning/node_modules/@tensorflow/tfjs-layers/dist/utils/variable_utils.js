/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
/**
 * Count the elements in an Array of LayerVariables.
 *
 * @param weights: The LayerVariables of which the constituent numbers are to
 *   be counted.
 * @returns A count of the elements in all the LayerVariables
 */
export function countParamsInWeights(weights) {
    let count = 0;
    for (const weight of weights) {
        if (weight.shape.length === 0) {
            count += 1;
        }
        else {
            count += weight.shape.reduce((a, b) => a * b);
        }
    }
    return count;
}
//# sourceMappingURL=variable_utils.js.map