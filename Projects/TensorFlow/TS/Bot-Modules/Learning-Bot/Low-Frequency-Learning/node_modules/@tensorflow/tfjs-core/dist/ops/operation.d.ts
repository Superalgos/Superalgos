export declare const OP_SCOPE_SUFFIX = "__op";
/**
 * Used for wrapping functions that perform math operations on
 * Tensors. The function will be wrapped in a named scope that cleans all
 * memory usage after the function is done.
 */
export declare function op<T extends Function>(f: {
    [name: string]: T;
}): T;
