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
import { HashTableMap, NamedTensorMap } from '../data/types';
import { HashTable } from './hash_table';
/**
 * Contains global resources of a model.
 */
export declare class ResourceManager {
    readonly hashTableNameToHandle: NamedTensorMap;
    readonly hashTableMap: HashTableMap;
    constructor(hashTableNameToHandle?: NamedTensorMap, hashTableMap?: HashTableMap);
    /**
     * Register a `HashTable` in the resource manager.
     *
     * The `HashTable` can be retrieved by `resourceManager.getHashTableById`,
     * where id is the table handle tensor's id.
     *
     * @param name Op node name that creates the `HashTable`.
     * @param hashTable The `HashTable` to be added to resource manager.
     */
    addHashTable(name: string, hashTable: HashTable): void;
    /**
     * Get the table handle by node name.
     * @param name Op node name that creates the `HashTable`. This name is also
     *     used in the inputs list of lookup and import `HashTable` ops.
     */
    getHashTableHandleByName(name: string): import("@tensorflow/tfjs-core").Tensor<import("@tensorflow/tfjs-core").Rank>;
    /**
     * Get the actual `HashTable` by its handle tensor's id.
     * @param id The id of the handle tensor.
     */
    getHashTableById(id: number): HashTable;
    /**
     * Dispose `ResourceManager`, including its hashTables and tensors in them.
     */
    dispose(): void;
}
