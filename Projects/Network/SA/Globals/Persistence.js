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
* }} NetworkPersistenceModel
*/

/**
* Returns a function the creates a new persistence store matching the storeType
* (file, mongodb) with the name being either 
* the file path for files or database name for a database
* @returns {{
*   newPersistenceStore: (storeType: string, name: string) => NetworkPersistenceModel
* }}
*/
exports.newNetworkGlobalsPersistence = function newNetworkGlobalsPersistence() {
   const thisObject = {
       newPersistenceStore: newPersistenceStore
   }

   return thisObject

   /**
    * Returns a new implementation of the chosen data store, 
    * if the storeType does not match any of the current 
    * implementations then an error is thrown.
    * 
    * @param {string} storeType 
    * @param {string} name 
    */
   function newPersistenceStore(storeType, name) {
       switch(storeType) {
           case 'file': 
               return require('./Stores/FileStore').newNetworkGlobalsStoresFileStore(name)
           case 'mongodb': 
               return require('./Stores/MongoDbStore').newNetworkGlobalsStoresMongoDBStore(name)
           default: throw new Error('The store type ' + storeType + ' is not implemented, why not create it yourself.')
       }
   }
}