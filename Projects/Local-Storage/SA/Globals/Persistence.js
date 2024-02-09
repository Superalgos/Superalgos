/**
 * @typedef {Object} PersistenceModel
 * @property {() => Promise<void>} initialize
 * @property {() => Promise<void>} finalize
 * @property {(item: any) => Promise<string>} saveItem
 * @property {(items: []) => Promise<string[]>} saveAll
 * @property {(item: any) => Promise<void>} deleteItem
 * @property {() => Promise<void>} deleteAll
 * @property {(item: any) => Promise<any>} findItem
 * @property {(items: any) => Promise<[]>} findMany
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
     * @returns {Promise<PersistenceModel>}
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
            databaseRepositories = SA.projects.localStorage.modules.databaseRepositories.newDatabaseRepositories()
        }
        return databaseRepositories
    }
}