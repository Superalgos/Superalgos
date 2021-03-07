/**
 * Contains global resources of a model.
 */
export class ResourceManager {
    constructor(hashTableNameToHandle = {}, hashTableMap = {}) {
        this.hashTableNameToHandle = hashTableNameToHandle;
        this.hashTableMap = hashTableMap;
    }
    /**
     * Register a `HashTable` in the resource manager.
     *
     * The `HashTable` can be retrieved by `resourceManager.getHashTableById`,
     * where id is the table handle tensor's id.
     *
     * @param name Op node name that creates the `HashTable`.
     * @param hashTable The `HashTable` to be added to resource manager.
     */
    addHashTable(name, hashTable) {
        this.hashTableNameToHandle[name] = hashTable.handle;
        this.hashTableMap[hashTable.id] = hashTable;
    }
    /**
     * Get the table handle by node name.
     * @param name Op node name that creates the `HashTable`. This name is also
     *     used in the inputs list of lookup and import `HashTable` ops.
     */
    getHashTableHandleByName(name) {
        return this.hashTableNameToHandle[name];
    }
    /**
     * Get the actual `HashTable` by its handle tensor's id.
     * @param id The id of the handle tensor.
     */
    getHashTableById(id) {
        return this.hashTableMap[id];
    }
    /**
     * Dispose `ResourceManager`, including its hashTables and tensors in them.
     */
    dispose() {
        for (const key in this.hashTableMap) {
            this.hashTableMap[key].clearAndClose();
            delete this.hashTableMap[key];
        }
        for (const name in this.hashTableNameToHandle) {
            this.hashTableNameToHandle[name].dispose();
            delete this.hashTableNameToHandle[name];
        }
    }
}
//# sourceMappingURL=resource_manager.js.map