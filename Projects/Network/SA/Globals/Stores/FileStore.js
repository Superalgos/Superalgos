/**
 * @param {string} filename 
 * @returns {import('../Persistence').NetworkPersistenceModel}
 */
exports.newNetworkGlobalsStoresFileStore = function newNetworkGlobalsStoresFileStore(filename) {
    const thisObject = {
        initialize: initialize,
        finalize: finalize,
        saveItem: saveItem,
        saveAll: saveAll,
        deleteItem: deleteItem,
        deleteAll: deleteAll,
        findItem: findItem,
        findMany: findMany,
    }
    
    return thisObject

    /**
     * Checks that the directory exists and creates an initial file for storage
     */
    function initialize() {
        const pathSeparator = SA.nodeModules.path.sep
        const dir = filename.split(pathSeparator)
        if(dir.length > 1) {
            dir.pop()
        }
        const dirPath = dir.join(pathSeparator)
        if(!SA.nodeModules.fs.existsSync(dirPath)) {
            SA.nodeModules.fs.mkdirSync(dirPath, {recursive: true})
        }
        writeFile([])
    }

    /**
     * does nothing in this class
     */
    function finalize() {
    }

    /**
     * @param {{id: number|string}} item 
     * @returns {Promise<void>}
     */
    async function saveItem(item) {
        const contents = await readFile()
        const idx = contents.findIndex(x => x.id == item.id)
        if(idx > -1) {
            contents.splice(idx, 1)
        }
        contents.push(item)
        return await writeFile(contents)
    }
    /**
     * @param {[]} items 
     * @returns {Promise<void>}
     */
    async function saveAll(items) {
        return await writeFile(items)
    }

    /**
     * @param {number|string} itemId
     * @returns {Promise<void>}
     */
    async function deleteItem(itemId) {
        const contents = await readFile()
        const idx = contents.findIndex(x => x.id == itemId)
        contents.splice(idx, 1)
        return await writeFile(contents)
    }

    /**
     * @returns {Promise<void>}
     */
    async function deleteAll() {
        return await writeFile([])
    }

    /**
     * @param {number|string} item 
     */
    async function findItem(itemId) {
        // SA.logger.debug('file storage -> find item -> searching for item id' + itemId)
        const contents = await readFile()
        const idx = contents.findIndex(x => x.id == itemId)
        // SA.logger.debug('file storage -> find item -> found item index -> ' + idx)
        return idx > -1 ? contents[idx] : undefined
    }

    /**
     * @param {(number|string)[]} itemIds
     */
    async function findMany(itemIds) {
        const contents = await readFile()
        return contents.filter(x => itemIds.indexOf(x.id) > -1)
    }

    /**
     * @returns {Promise<[]>}
     */
    async function readFile() {
        return await new Promise((res, rej) => SA.nodeModules.fs.readFile(filename, (err, data) => {
            if(err) {
                rej(err)
                return
            }
            res(JSON.parse(data))
            return
        }))
    }

    /**
     * @param {[]} data 
     * @returns {Promise<void>}
     */
    async function writeFile(data) {
        return await new Promise((res,rej) => SA.nodeModules.fs.writeFile(filename, JSON.stringify(data), (err) => {
            if(err) {
                rej(err)
                return
            }
            res()
            return
        }))
    }
}