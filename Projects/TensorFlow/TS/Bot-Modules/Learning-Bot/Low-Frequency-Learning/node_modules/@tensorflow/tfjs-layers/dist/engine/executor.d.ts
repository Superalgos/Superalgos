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
 * Executor: Evaluates SymbolicTensor based on feeds.
 */
import { Tensor } from '@tensorflow/tfjs-core';
import { Kwargs } from '../types';
import { SymbolicTensor } from './topology';
/**
 * A concrete Tensor value for a symbolic tensor as the key.
 */
export interface Feed {
    key: SymbolicTensor;
    value: Tensor;
}
/**
 * FeedDict: A mapping from unique SymbolicTensors to feed values for them.
 * A feed value is a concrete value represented as an `Tensor`.
 */
export declare class FeedDict {
    private id2Value;
    private id2Mask;
    private name2Id;
    /**
     * Constructor, optionally does copy-construction.
     * @param feeds An Array of `Feed`s, or another `FeedDict`, in which case
     *   copy-construction will be performed.
     */
    constructor(feeds?: Feed[] | FeedDict);
    /**
     * Add a key-value pair to the FeedDict.
     *
     * @param key The key of the feed.
     * @param value The value of the tensor feed.
     * @param mask The value of the mask feed (optional).
     * @returns This `FeedDict`.
     * @throws ValueError: If the key `SymbolicTensor` already exists in the
     *   `FeedDict`.
     */
    add(key: SymbolicTensor, value: Tensor, mask?: Tensor): FeedDict;
    /**
     * Add a Feed to the FeedDict.
     * @param feed The new `Feed` to add.
     * @returns This `FeedDict`.
     */
    addFeed(feed: Feed): void;
    /**
     * Probe whether a key already exists in the FeedDict.
     * @param key
     */
    hasKey(key: SymbolicTensor): boolean;
    /**
     * Get all the SymbolicTensor available in this FeedDict.
     */
    names(): string[];
    /**
     * Get the feed value for given key.
     * @param key The SymbolicTensor, or its name (as a string), of which the
     *     value is sought.
     * @returns If `key` exists, the corresponding feed value.
     * @throws ValueError: If `key` does not exist in this `FeedDict`.
     */
    getValue(key: SymbolicTensor | string): Tensor;
    /**
     * Get the feed mask for given key.
     * @param key The SymbolicTensor, or its name (as a string), of which the
     *     value is sought.
     * @returns If `key` exists, the corresponding feed mask.
     * @throws ValueError: If `key` does not exist in this `FeedDict`.
     */
    getMask(key: SymbolicTensor | string): Tensor;
    /** Dispose all mask Tensors held by this object. */
    disposeMasks(): void;
}
/**
 * Interface for the optional object used for probing the memory
 * usage and other statistics during execution.
 */
export interface ExecutionProbe {
    /**
     * Maximum number of tensors that exist during all steps of the
     * execution. Tensor counts are measured at the beginning of every
     * step.
     */
    maxNumTensors?: number;
    /**
     * Minimum number of tensors that exist during all steps of the
     * execution. Tensor counts are measured at the beginning of every
     * step.
     */
    minNumTensors?: number;
}
/**
 * Execute a SymbolicTensor by using concrete feed values.
 *
 * A `SymbolicTensor` object is a node in a computation graph of TF.js
 * Layers. The object is backed by a source layer and input
 * `SymbolicTensor`s to the source layer. This method evaluates
 * the `call()` method of the source layer, using concrete values of the
 * inputs obtained from either
 * * `feedDict`, if the input key exists in `feedDict`, or else,
 * * a recursive call to `execute()` itself.
 *
 * @param x: The `SymbolicTensor` to execute.
 * @param feedDict: The feed values, as base condition of the recursion.
 *   execution.
 * @param kwargs: Optional keyword arguments.
 * @param probe: A probe object (of interface `ExecutionProbe`) used for
 *   testing memory footprint of `execute` calls.
 * @returns Result of the execution.
 * @throws ValueError: If any `SymbolicTensor`s from `InputLayer`s
 *   encountered during the execution lacks a feed value in `feedDict`.
 */
export declare function execute(fetches: SymbolicTensor | SymbolicTensor[], feedDict: FeedDict, kwargs?: Kwargs, probe?: ExecutionProbe): Tensor | Tensor[] | [Tensor | Tensor[]];
export declare type RecipientMap = {
    [fetchName: string]: Set<string>;
};
/**
 * Sort the `SymbolicTensor`s topologically, for a single fetch.
 *
 * This helper function processes the upstream SymbolicTensors of a single
 * fetch.
 *
 * @param fetch The single fetch requested.
 * @param feedDict The dictionary of fed values.
 * @returns sorted: Topologically-sorted array of SymbolicTensors.
 *   recipientMap: Recipient names for all SymbolicTensors in `sorted`.
 */
export declare function getTopologicalSortAndRecipientCountsForOneFetch(fetch: SymbolicTensor, feedDict: FeedDict): {
    sorted: SymbolicTensor[];
    recipientMap: RecipientMap;
};
