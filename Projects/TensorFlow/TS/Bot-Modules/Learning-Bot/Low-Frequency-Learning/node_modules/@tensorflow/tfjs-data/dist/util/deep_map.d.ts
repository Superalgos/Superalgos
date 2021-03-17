/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * =============================================================================
 */
/**
 * A return value for a mapping function that can be applied via deepMap.
 *
 * If recurse is true, the value should be empty, and iteration will continue
 * into the object or array.
 */
export declare type DeepMapResult = {
    value: any;
    recurse: boolean;
};
/**
 * Apply a mapping function to a nested structure in a recursive manner.
 *
 * The result of the mapping is an object with the same nested structure (i.e.,
 * of arrays and dicts) as the input, except that some subtrees are replaced,
 * according to the results of the mapping function.
 *
 * Mappings are memoized.  Thus, if the nested structure contains the same
 * object in multiple positions, the output will contain the same mapped object
 * in those positions.  Cycles are not supported, however.
 *
 * @param input: The object to which to apply the mapping function.
 * @param mapFn: A function that expects a single node of the object tree, and
 *   returns a `DeepMapResult`.  The `DeepMapResult` either provides a
 *   replacement value for that node (i.e., replacing the subtree), or indicates
 *   that the node should be processed recursively.
 */
export declare function deepMap(input: any, mapFn: (x: any) => DeepMapResult): any | any[];
/**
 * Zip nested structures together in a recursive manner.
 *
 * This has the effect of transposing or pivoting data, e.g. converting it from
 * a row-major representation to a column-major representation.
 *
 * For example, `deepZip([{a: 1, b: 2}, {a: 3, b: 4}])` returns
 * `{a: [1, 3], b: [2, 4]}`.
 *
 * The inputs should all have the same nested structure (i.e., of arrays and
 * dicts).  The result is a single object with the same nested structure, where
 * the leaves are arrays collecting the values of the inputs at that location
 * (or, optionally, the result of a custom function applied to those arrays).
 *
 * @param inputs: An array of the objects to zip together.
 * @param zipFn: (optional) A function that expects an array of elements at a
 *   single node of the object tree, and returns a `DeepMapResult`.  The
 *   `DeepMapResult` either provides a result value for that node (i.e.,
 *   representing the subtree), or indicates that the node should be processed
 *   recursively.  The default zipFn recurses as far as possible and places
 *   arrays at the leaves.
 */
export declare function deepZip(inputs: any[], zipFn?: (xs: any[]) => DeepMapResult): any | any[];
export declare function zipToList(x: any[]): DeepMapResult;
/**
 * A return value for an async map function for use with deepMapAndAwaitAll.
 *
 * If recurse is true, the value should be empty, and iteration will continue
 * into the object or array.
 */
export declare type DeepMapAsyncResult = {
    value: Promise<any>;
    recurse: boolean;
};
/**
 * Apply an async mapping function to a nested structure in a recursive manner.
 *
 * This first creates a nested structure of Promises, and then awaits all of
 * those, resulting in a single Promise for a resolved nested structure.
 *
 * The result of the mapping is an object with the same nested structure (i.e.,
 * of arrays and dicts) as the input, except that some subtrees are replaced,
 * according to the results of the mapping function.
 *
 * Mappings are memoized.  Thus, if the nested structure contains the same
 * object in multiple positions, the output will contain the same mapped object
 * in those positions.  Cycles are not supported, however.
 *
 * @param input: The object to which to apply the mapping function.
 * @param mapFn: A function that expects a single node of the object tree, and
 *   returns a `DeepMapAsyncResult`.  The `DeepMapAsyncResult` either provides
 *   a `Promise` for a replacement value for that node (i.e., replacing the
 *   subtree), or indicates that the node should be processed recursively.  Note
 *   that the decision whether or not to recurse must be made immediately; only
 *   the mapped value may be promised.
 */
export declare function deepMapAndAwaitAll(input: any, mapFn: (x: any) => DeepMapAsyncResult): Promise<any | any[]>;
/**
 * Determine whether the argument is iterable.
 *
 * @returns true if the argument is an array or any non-Tensor object.
 */
export declare function isIterable(obj: any): boolean;
/**
 * Determine whether the argument can be converted to Tensor.
 *
 * Tensors, primitives, arrays, and TypedArrays all qualify; anything else does
 * not.
 *
 * @returns true if the argument can be converted to Tensor.
 */
export declare function canTensorify(obj: any): boolean;
