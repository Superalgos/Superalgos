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
import { HashTable } from '../../executor/hash_table';
import { getParamValue } from './utils';
export const executeOp = async (node, tensorMap, context, resourceManager) => {
    switch (node.op) {
        case 'HashTable':
        case 'HashTableV2': {
            const keyDType = getParamValue('keyDType', node, tensorMap, context);
            const valueDType = getParamValue('valueDType', node, tensorMap, context);
            const hashTable = new HashTable(keyDType, valueDType);
            resourceManager.addHashTable(node.name, hashTable);
            return [hashTable.handle];
        }
        case 'LookupTableImport':
        case 'LookupTableImportV2': {
            const handle = getParamValue('tableHandle', node, tensorMap, context, resourceManager);
            const keys = getParamValue('keys', node, tensorMap, context);
            const values = getParamValue('values', node, tensorMap, context);
            const hashTable = resourceManager.getHashTableById(handle.id);
            return [await hashTable.import(keys, values)];
        }
        case 'LookupTableFind':
        case 'LookupTableFindV2': {
            const handle = getParamValue('tableHandle', node, tensorMap, context, resourceManager);
            const keys = getParamValue('keys', node, tensorMap, context);
            const defaultValue = getParamValue('defaultValue', node, tensorMap, context);
            const hashTable = resourceManager.getHashTableById(handle.id);
            return [await hashTable.find(keys, defaultValue)];
        }
        default:
            throw TypeError(`Node type ${node.op} is not implemented`);
    }
};
export const CATEGORY = 'hash_table';
//# sourceMappingURL=hash_table_executor.js.map