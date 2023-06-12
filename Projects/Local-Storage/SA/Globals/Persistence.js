/**
 * @typedef {{
*     initialize: initialize,
*     finalize: finalize,
*     saveItem: saveItem,
*     saveAll: saveAll,
*     deleteItem: deleteItem,
*     deleteAll: deleteAll,
*     findItem: findItem,
*     findMany: findMany,
* }} PersistenceModel
*/

/**
* Returns a function the creates a new persistence store matching the storeType
* (file, mongodb) with the name being either 
* the file path for files or database name for a database
* @returns {{
*   newPersistenceStore: (storeType: string, name: string) => Promise<PersistenceModel>
* }}
*/
exports.newLocalStorageGlobalsPersistence = function newLocalStorageGlobalsPersistence() {
    const thisObject = {
        newPersistenceStore: newPersistenceStore
    }

    let databaseRepositories = undefined

    return thisObject

    /**
     * Returns a new implementation of the chosen data store, 
     * if the storeType does not match any of the current 
     * implementations then an error is thrown.
     * 
     * @param {string} storeType 
     * @param {string} name 
     */
    async function newPersistenceStore(storeType, name) {
        SA.logger.info('Using ' + storeType + ' for local storage')
        switch (storeType) {
            case 'file':
                return require('../Internal/FileStore').newFileStore(name)
            case 'database':
                return await getDatabaseRepositories().getRepository(name)
            default: throw new Error('The store type ' + storeType + ' is not implemented, why not create it yourself.')
        }
    }

    function getDatabaseRepositories() {
        if(databaseRepositories === undefined) {
            databaseRepositories = SA.projects.internalStorage.modules.databaseRepositories()
        }
        return databaseRepositories
    }
}