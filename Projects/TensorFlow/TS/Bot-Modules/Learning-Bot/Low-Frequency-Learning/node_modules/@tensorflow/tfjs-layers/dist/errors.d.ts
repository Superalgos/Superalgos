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
 * Explicit error types.
 *
 * See the following link for more information about why the code includes
 * calls to setPrototypeOf:
 *
 * https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
 */
/**
 * Equivalent of Python's AttributeError.
 */
export declare class AttributeError extends Error {
    constructor(message?: string);
}
/**
 * Equivalent of Python's RuntimeError.
 */
export declare class RuntimeError extends Error {
    constructor(message?: string);
}
/**
 * Equivalent of Python's ValueError.
 */
export declare class ValueError extends Error {
    constructor(message?: string);
}
/**
 * Equivalent of Python's NotImplementedError.
 */
export declare class NotImplementedError extends Error {
    constructor(message?: string);
}
/**
 * Equivalent of Python's AssertionError.
 */
export declare class AssertionError extends Error {
    constructor(message?: string);
}
/**
 * Equivalent of Python's IndexError.
 */
export declare class IndexError extends Error {
    constructor(message?: string);
}
