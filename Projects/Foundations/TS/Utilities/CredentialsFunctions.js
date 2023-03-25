exports.newFoundationsUtilitiesCredentialsFunctions = function newFoundationsUtilitiesCredentialsFunctions() {
    let thisObject = {
        getCredentialValue: getCredentialValue
    }
    return thisObject

    /**
     * Checks if the provided value is a file, 
     * if true it returns the file content, 
     * else returns the key
     * 
     * @param {string} key 
     * @returns {string}
     */
    function getCredentialValue(key) {
        try {
            const fs = SA.nodeModules.fs
            fs.accessSync(key, fs.constants.F_OK)
            return fs.readFileSync(key, {encoding: 'utf8'})
        }
        catch(error) {
            return key
        }
    }
}