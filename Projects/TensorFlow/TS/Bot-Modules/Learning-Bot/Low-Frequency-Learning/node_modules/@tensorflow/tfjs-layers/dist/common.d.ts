/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 * =============================================================================
 */
export declare function checkDataFormat(value?: string): void;
export declare function checkInterpolationFormat(value?: string): void;
export declare function checkPaddingMode(value?: string): void;
export declare function checkPoolMode(value?: string): void;
/**
 * Enter namescope, which can be nested.
 */
export declare function nameScope<T>(name: string, fn: () => T): T;
/**
 * Get the name a Tensor (or Variable) would have if not uniqueified.
 * @param tensorName
 * @return Scoped name string.
 */
export declare function getScopedTensorName(tensorName: string): string;
/**
 * Get unique names for Tensors and Variables.
 * @param scopedName The fully-qualified name of the Tensor, i.e. as produced by
 *  `getScopedTensorName()`.
 * @return A unique version of the given fully scoped name.
 *   If this is the first time that the scoped name is seen in this session,
 *   then the given `scopedName` is returned unaltered.  If the same name is
 *   seen again (producing a collision), an incrementing suffix is added to the
 *   end of the name, so it takes the form 'scope/name_1', 'scope/name_2', etc.
 */
export declare function getUniqueTensorName(scopedName: string): string;
/**
 * Determine whether a string is a valid tensor name.
 * @param name
 * @returns A Boolean indicating whether `name` is a valid tensor name.
 */
export declare function isValidTensorName(name: string): boolean;
