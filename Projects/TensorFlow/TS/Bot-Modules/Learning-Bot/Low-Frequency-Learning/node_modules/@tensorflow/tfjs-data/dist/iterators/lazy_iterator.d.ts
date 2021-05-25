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
import * as tf from '@tensorflow/tfjs-core';
import { Container } from '../types';
import { DeepMapResult } from '../util/deep_map';
import { RingBuffer } from '../util/ring_buffer';
/**
 * A nested structure of LazyIterators, used as the input to zip().
 */
export declare type IteratorContainer = Container<LazyIterator<tf.TensorContainer>>;
/**
 * Create a `LazyIterator` from an array of items.
 */
export declare function iteratorFromItems<T>(items: T[]): LazyIterator<T>;
/**
 * Create a `LazyIterator` of incrementing integers.
 */
export declare function iteratorFromIncrementing(start: number): LazyIterator<number>;
/**
 * Create a `LazyIterator` from a function.
 *
 * ```js
 * let i = -1;
 * const func = () =>
 *    ++i < 5 ? {value: i, done: false} : {value: null, done: true};
 * const iter = tf.data.iteratorFromFunction(func);
 * await iter.forEachAsync(e => console.log(e));
 * ```
 *
 * @param func A function that produces data on each call.
 */
export declare function iteratorFromFunction<T>(func: () => IteratorResult<T> | Promise<IteratorResult<T>>): LazyIterator<T>;
/**
 * Create a `LazyIterator` by concatenating underlying streams, which are
 * themselves provided as a stream.
 *
 * This can also be thought of as a "stream flatten" operation.
 *
 * @param baseIterators A stream of streams to be concatenated.
 * @param baseErrorHandler An optional function that can intercept `Error`s
 *   raised during a `next()` call on the base stream.  This function can decide
 *   whether the error should be propagated, whether the error should be
 *   ignored, or whether the base stream should be terminated.
 */
export declare function iteratorFromConcatenated<T>(baseIterators: LazyIterator<LazyIterator<T>>, baseErrorHandler?: (e: Error) => boolean): LazyIterator<T>;
/**
 * Create a `LazyIterator` by concatenating streams produced by calling a
 * stream-generating function a given number of times.
 *
 * Since a `LazyIterator` is read-once, it cannot be repeated, but this
 * function can be used to achieve a similar effect:
 *
 *   LazyIterator.ofConcatenatedFunction(() => new MyIterator(), 6);
 *
 * @param iteratorFunc: A function that produces a new stream on each call.
 * @param count: The number of times to call the function.
 * @param baseErrorHandler An optional function that can intercept `Error`s
 *   raised during a `next()` call on the base stream.  This function can decide
 *   whether the error should be propagated, whether the error should be
 *   ignored, or whether the base stream should be terminated.
 */
export declare function iteratorFromConcatenatedFunction<T>(iteratorFunc: () => IteratorResult<LazyIterator<T>>, count: number, baseErrorHandler?: (e: Error) => boolean): LazyIterator<T>;
/**
 * Create a `LazyIterator` by zipping together an array, dict, or nested
 * structure of `LazyIterator`s (and perhaps additional constants).
 *
 * The underlying streams must provide elements in a consistent order such
 * that they correspond.
 *
 * Typically, the underlying streams should have the same number of
 * elements. If they do not, the behavior is determined by the
 * `mismatchMode` argument.
 *
 * The nested structure of the `iterators` argument determines the
 * structure of elements in the resulting iterator.
 *
 * @param iterators: An array or object containing LazyIterators at the
 * leaves.
 * @param mismatchMode: Determines what to do when one underlying iterator
 * is exhausted before the others.  `ZipMismatchMode.FAIL` (the default)
 * causes an error to be thrown in this case.  `ZipMismatchMode.SHORTEST`
 * causes the zipped iterator to terminate with the furst underlying
 * streams, so elements remaining on the longer streams are ignored.
 * `ZipMismatchMode.LONGEST` causes the zipped stream to continue, filling
 * in nulls for the exhausted streams, until all streams are exhausted.
 */
export declare function iteratorFromZipped<O extends tf.TensorContainer>(iterators: IteratorContainer, mismatchMode?: ZipMismatchMode): LazyIterator<O>;
/**
 * An asynchronous iterator, providing lazy access to a potentially
 * unbounded stream of elements.
 *
 * Iterator can be obtained from a dataset:
 * `const iter = await dataset.iterator();`
 */
export declare abstract class LazyIterator<T> {
    abstract summary(): string;
    /**
     * Returns a `Promise` for the next element in the stream.
     *
     * When an item can be provided successfully, the return value is
     * `{value:T, done:false}`.
     *
     * Calling next() on a closed stream returns `{value:null, done:true}`.
     */
    abstract next(): Promise<IteratorResult<T>>;
    /**
     * Collect all remaining elements of a bounded stream into an array.
     * Obviously this will succeed only for small streams that fit in memory.
     * Useful for testing.
     *
     * @returns A Promise for an array of stream elements, which will resolve
     *   when the stream is exhausted.
     */
    toArray(): Promise<T[]>;
    /**
     * Collect all elements of this dataset into an array with prefetching 100
     * elements. This is useful for testing, because the prefetch changes the
     * order in which the Promises are resolved along the processing pipeline.
     * This may help expose bugs where results are dependent on the order of
     * Promise resolution rather than on the logical order of the stream (i.e.,
     * due to hidden mutable state).
     *
     * @returns A Promise for an array of stream elements, which will resolve
     *   when the stream is exhausted.
     */
    toArrayForTest(): Promise<T[]>;
    /**
     * Draw items from the stream until it is exhausted.
     *
     * This can be useful when the stream has side effects but no output.  In
     * that case, calling this function guarantees that the stream will be
     * fully processed.
     */
    resolveFully(): Promise<void>;
    /**
     * Draw items from the stream until it is exhausted, or a predicate fails.
     *
     * This can be useful when the stream has side effects but no output.  In
     * that case, calling this function guarantees that the stream will be
     * fully processed.
     */
    resolveWhile(predicate: (r: T) => boolean): Promise<void>;
    /**
     * Handles errors thrown on this stream using a provided handler function.
     *
     * @param handler A function that handles any `Error` thrown during a `next()`
     *   call and returns true if the stream should continue (dropping the failed
     *   call) or false if the stream should quietly terminate.  If the handler
     *   itself throws (or rethrows) an `Error`, that will be propagated.
     *
     * @returns A `LazyIterator` of elements passed through from upstream,
     *   possibly filtering or terminating on upstream `next()` calls that
     *   throw an `Error`.
     */
    handleErrors(handler: (error: Error) => boolean): LazyIterator<T>;
    /**
     * Filters this stream according to `predicate`.
     *
     * @param predicate A function mapping a stream element to a boolean or a
     * `Promise` for one.
     *
     * @returns A `LazyIterator` of elements for which the predicate was true.
     */
    filter(predicate: (value: T) => boolean): LazyIterator<T>;
    /**
     * Maps this stream through a 1-to-1 transform.
     *
     * @param transform A function mapping a stream element to a transformed
     *   element.
     *
     * @returns A `LazyIterator` of transformed elements.
     */
    map<O>(transform: (value: T) => O): LazyIterator<O>;
    /**
     * Maps this stream through an async 1-to-1 transform.
     *
     * @param transform A function mapping a stream element to a `Promise` for a
     *   transformed stream element.
     *
     * @returns A `LazyIterator` of transformed elements.
     */
    mapAsync<O>(transform: (value: T) => Promise<O>): LazyIterator<O>;
    /**
     * Maps this stream through a 1-to-1 transform, forcing serial execution.
     *
     * @param transform A function mapping a stream element to a transformed
     *   element.
     *
     * @returns A `LazyIterator` of transformed elements.
     */
    serialMapAsync<O>(transform: (value: T) => Promise<O>): LazyIterator<O>;
    /**
     * Maps this stream through a 1-to-many transform.
     *
     * @param transform A function mapping a stream element to an array of
     *   transformed elements.
     *
     * @returns A `DataStream` of transformed elements.
     */
    flatmap<O>(transform: (value: T) => O[]): LazyIterator<O>;
    /**
     * Apply a function to every element of the stream.
     *
     * @param f A function to apply to each stream element.
     */
    forEachAsync(f: (value: T) => void): Promise<void>;
    /**
     * Apply a function to every element of the stream, forcing serial execution.
     *
     * @param f A function to apply to each stream element.  Should return 'true'
     *   to indicate that the stream should continue, or 'false' to cause it to
     *   terminate.
     */
    serialForEach(f: (value: T) => Promise<boolean>): Promise<void>;
    /**
     * Groups elements into batches, represented as arrays of elements.
     *
     * We can think of the elements of this iterator as 'rows' (even if they are
     * nested structures).  By the same token, consecutive values for a given
     * key within the elements form a 'column'.  This matches the usual sense of
     * 'row' and 'column' when processing tabular data (e.g., parsing a CSV).
     *
     * Thus, "Row-major" means that the resulting batch is simply a collection of
     * rows: `[row1, row2, row3, ...]`.  This is contrast to the column-major
     * form, which is needed for vectorized computation.
     *
     * @param batchSize The number of elements desired per batch.
     * @param smallLastBatch Whether to emit the final batch when it has fewer
     *   than batchSize elements. Default true.
     * @returns A `LazyIterator` of batches of elements, represented as arrays
     *   of the original element type.
     */
    rowMajorBatch(batchSize: number, smallLastBatch?: boolean): LazyIterator<T[]>;
    /**
     * Groups elements into batches, represented in column-major form.
     *
     * We can think of the elements of this iterator as 'rows' (even if they are
     * nested structures).  By the same token, consecutive values for a given
     * key within the elements form a 'column'.  This matches the usual sense of
     * 'row' and 'column' when processing tabular data (e.g., parsing a CSV).
     *
     * Thus, "column-major" means that the resulting batch is a (potentially
     * nested) structure representing the columns.  Each column entry, then,
     * contains a collection of the values found in that column for a range of
     * input elements.  This representation allows for vectorized computation, in
     * contrast to the row-major form.
     *
     * The inputs should all have the same nested structure (i.e., of arrays and
     * dicts).  The result is a single object with the same nested structure,
     * where the leaves are arrays collecting the values of the inputs at that
     * location (or, optionally, the result of a custom function applied to those
     * arrays).
     *
     * @param batchSize The number of elements desired per batch.
     * @param smallLastBatch Whether to emit the final batch when it has fewer
     *   than batchSize elements. Default true.
     * @param zipFn: (optional) A function that expects an array of elements at a
     *   single node of the object tree, and returns a `DeepMapResult`.  The
     *   `DeepMapResult` either provides a result value for that node (i.e.,
     *   representing the subtree), or indicates that the node should be processed
     *   recursively.  The default zipFn recurses as far as possible and places
     *   arrays at the leaves.
     * @returns A `LazyIterator` of batches of elements, represented as an object
     *   with collections at the leaves.
     */
    columnMajorBatch(batchSize: number, smallLastBatch?: boolean, zipFn?: (xs: any[]) => DeepMapResult): LazyIterator<tf.TensorContainer>;
    /**
     * Concatenate this `LazyIterator` with another.
     *
     * @param iterator A `LazyIterator` to be concatenated onto this one.
     * @param baseErrorHandler An optional function that can intercept `Error`s
     *   raised during a `next()` call on the base stream.  This function can
     *   decide whether the error should be propagated, whether the error should
     *   be ignored, or whether the base stream should be terminated.
     * @returns A `LazyIterator`.
     */
    concatenate(iterator: LazyIterator<T>, baseErrorHandler?: (e: Error) => boolean): LazyIterator<T>;
    /**
     * Limits this stream to return at most `count` items.
     *
     * @param count The maximum number of items to provide from the stream. If
     * a negative or undefined value is given, the entire stream is returned
     *   unaltered.
     */
    take(count: number): LazyIterator<T>;
    /**
     * Skips the first `count` items in this stream.
     *
     * @param count The number of items to skip.  If a negative or undefined
     * value is given, the entire stream is returned unaltered.
     */
    skip(count: number): LazyIterator<T>;
    /**
     * Prefetch the first `bufferSize` items in this stream.
     *
     * Note this prefetches Promises, but makes no guarantees about when those
     * Promises resolve.
     *
     * @param bufferSize: An integer specifying the number of elements to be
     *   prefetched.
     */
    prefetch(bufferSize: number): LazyIterator<T>;
    /**
     * Randomly shuffles the elements of this stream.
     *
     * @param bufferSize: An integer specifying the number of elements from
     * this stream from which the new stream will sample.
     * @param seed: (Optional.) An integer specifying the random seed that
     * will be used to create the distribution.
     */
    shuffle(windowSize: number, seed?: string): LazyIterator<T>;
    /**
     * Force an iterator to execute serially: each next() call will await the
     * prior one, so that they cannot execute concurrently.
     */
    serial(): LazyIterator<T>;
}
/**
 * A base class for transforming streams that operate by maintaining an
 * output queue of elements that are ready to return via next().  This is
 * commonly required when the transformation is 1-to-many:  A call to next()
 * may trigger a call to the underlying stream, which will produce many
 * mapped elements of this stream-- of which we need to return only one, so
 * we have to queue the rest.
 */
export declare abstract class OneToManyIterator<T> extends LazyIterator<T> {
    private lastRead;
    protected outputQueue: RingBuffer<T>;
    constructor();
    next(): Promise<IteratorResult<T>>;
    /**
     * Read one or more chunks from upstream and process them, possibly
     * reading or writing a carryover, and adding processed items to the
     * output queue.  Note it's possible that no items are added to the queue
     * on a given pump() call, even if the upstream stream is not closed
     * (e.g., because items are filtered).
     *
     * @return `true` if any action was taken, i.e. fetching items from the
     *   upstream source OR adding items to the output queue.  `false` if the
     *   upstream source is exhausted AND nothing was added to the queue
     * (i.e., any remaining carryover).
     */
    protected abstract pump(): Promise<boolean>;
    serialNext(): Promise<IteratorResult<T>>;
}
/**
 * Provides a `LazyIterator` that concatenates a stream of underlying
 * streams.
 *
 * Doing this in a concurrency-safe way requires some trickery.  In
 * particular, we want this stream to return the elements from the
 * underlying streams in the correct order according to when next() was
 * called, even if the resulting Promises resolve in a different order.
 */
export declare class ChainedIterator<T> extends LazyIterator<T> {
    private readonly baseErrorHandler?;
    private lastRead;
    private iterator;
    private moreIterators;
    constructor(iterators: LazyIterator<LazyIterator<T>>, baseErrorHandler?: (e: Error) => boolean);
    summary(): string;
    next(): Promise<IteratorResult<T>>;
    private readFromChain;
}
export declare enum ZipMismatchMode {
    FAIL = 0,
    SHORTEST = 1,
    LONGEST = 2
}
/**
 * A stream that prefetches a given number of items from an upstream source,
 * returning them in FIFO order.
 *
 * Note this prefetches Promises, but makes no guarantees about when those
 * Promises resolve.
 */
export declare class PrefetchIterator<T> extends LazyIterator<T> {
    protected upstream: LazyIterator<T>;
    protected bufferSize: number;
    protected buffer: RingBuffer<Promise<IteratorResult<T>>>;
    constructor(upstream: LazyIterator<T>, bufferSize: number);
    summary(): string;
    /**
     * Refill the prefetch buffer.  Returns only after the buffer is full, or
     * the upstream source is exhausted.
     */
    protected refill(): void;
    next(): Promise<IteratorResult<T>>;
}
/**
 * A stream that performs a sliding-window random shuffle on an upstream
 * source. This is like a `PrefetchIterator` except that the items are
 * returned in randomized order.  Mixing naturally improves as the buffer
 * size increases.
 */
export declare class ShuffleIterator<T> extends PrefetchIterator<T> {
    protected upstream: LazyIterator<T>;
    protected windowSize: number;
    private readonly random;
    private lastRead;
    private upstreamExhausted;
    constructor(upstream: LazyIterator<T>, windowSize: number, seed?: string);
    next(): Promise<IteratorResult<T>>;
    private randomInt;
    protected chooseIndex(): number;
    serialNext(): Promise<IteratorResult<T>>;
}
