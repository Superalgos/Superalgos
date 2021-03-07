/**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
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
 * =============================================================================
 */
import { DataType, Tensor } from '@tensorflow/tfjs-core';
/**
 * Hashtable contains a set of tensors, which can be accessed by key.
 */
export declare class HashTable {
    readonly keyDType: DataType;
    readonly valueDType: DataType;
    readonly handle: Tensor;
    private tensorMap;
    readonly id: number;
    /**
     * Constructor of HashTable. Creates a hash table.
     *
     * @param keyDType `dtype` of the table keys.
     * @param valueDType `dtype` of the table values.
     */
    constructor(keyDType: DataType, valueDType: DataType);
    /**
     * Dispose the tensors and handle and clear the hashtable.
     */
    clearAndClose(): void;
    /**
     * The number of items in the hash table.
     */
    size(): number;
    /**
     * Replaces the contents of the table with the specified keys and values.
     * @param keys Keys to store in the hashtable.
     * @param values Values to store in the hashtable.
     */
    import(keys: Tensor, values: Tensor): Promise<Tensor>;
    /**
     * Looks up keys in a hash table, outputs the corresponding values.
     *
     * Performs batch lookups, for every element in the key tensor, `find`
     * stacks the corresponding value into the return tensor.
     *
     * If an element is not present in the table, the given `defaultValue` is
     * used.
     *
     * @param keys Keys to look up. Must have the same type as the keys of the
     *     table.
     * @param defaultValue The scalar `defaultValue` is the value output for keys
     *     not present in the table. It must also be of the same type as the
     *     table values.
     */
    find(keys: Tensor, defaultValue: Tensor): Promise<Tensor>;
    private findWithDefault;
    private checkKeyAndValueTensor;
}
