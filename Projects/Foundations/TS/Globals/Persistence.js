/**
 * 
 * @returns {{
*   save: {(path: string, data: string): void},
*   read: {(path: string): string}
* }}
*/
exports.newFoundationsGlobalsPersistence = function newFoundationsGlobalsPersistence() {
   let thisObject = {
       save: save,
       read: read
   }

   return thisObject

   /**
    * 
    * @param {string} path 
    * @param {string} data
    */
   async function save(path, data) {
       createLocationIfNotExists(path)
       SA.nodeModules.fs.writeFile(path, data, {encoding: 'utf8'}, (err => {
           if(err) {
               SA.logger.error("Error saving file " + path)
               SA.logger.error(err)
           }
       }))
   }

   /**
    * 
    * @param {string} path 
    */
   async function read(path) {
       return SA.nodeModules.fs.readFileSync(path, {encoding: 'utf8'})
   }

   /**
    * @param {string} path 
    */
   function createLocationIfNotExists(path) {
       let idx = path.lastIndexOf('/')
       if(idx < 1) {
           /*
            this means only the filename has been given and 
            it should be placed in the root of the data folder
            */
           return
       }
       /*
        trims the file from the path
        */
       let dir = path.substring(0, idx)
       if(!SA.nodeModules.fs.existsSync(dir)) {
           SA.logger.info('creating dir ' + dir)
           SA.nodeModules.fs.mkdirSync(dir, {recursive: true})
       }
   }
}