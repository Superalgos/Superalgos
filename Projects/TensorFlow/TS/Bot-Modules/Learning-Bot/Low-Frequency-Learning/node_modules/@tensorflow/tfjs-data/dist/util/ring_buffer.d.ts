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
 * A ring buffer, providing O(1) FIFO, LIFO, and related operations.
 */
export declare class RingBuffer<T> {
    capacity: number;
    protected begin: number;
    protected end: number;
    protected doubledCapacity: number;
    protected data: T[];
    /**
     * Constructs a `RingBuffer`.
     * @param capacity The number of items that the buffer can accomodate.
     */
    constructor(capacity: number);
    /**
     * Map any index into the range 0 <= index < 2*capacity.
     */
    protected wrap(index: number): number;
    protected get(index: number): T;
    protected set(index: number, value: T): void;
    /**
     * Returns the current number of items in the buffer.
     */
    length(): number;
    /**
     * Reports whether the buffer is full.
     * @returns true if the number of items in the buffer equals its capacity, and
     *   false otherwise.
     */
    isFull(): boolean;
    /**
     * Reports whether the buffer is empty.
     * @returns true if the number of items in the buffer equals zero, and
     *   false otherwise.
     */
    isEmpty(): boolean;
    /**
     * Adds an item to the end of the buffer.
     */
    push(value: T): void;
    /**
     * Adds many items to the end of the buffer, in order.
     */
    pushAll(values: T[]): void;
    /**
     * Removes and returns the last item in the buffer.
     */
    pop(): T;
    /**
     * Adds an item to the beginning of the buffer.
     */
    unshift(value: T): void;
    /**
     * Removes and returns the first item in the buffer.
     */
    shift(): T;
    /**
     * Removes and returns a specific item in the buffer, and moves the last item
     * to the vacated slot.  This is useful for implementing a shuffling stream.
     * Note that this operation necessarily scrambles the original order.
     *
     * @param relativeIndex: the index of the item to remove, relative to the
     *   first item in the buffer (e.g., hiding the ring nature of the underlying
     *   storage).
     */
    shuffleExcise(relativeIndex: number): T;
}
