exports.newFoundationsUtilitiesMiscellaneousFunctions = function() {

    let thisObject = {
        truncateToThisPrecision: truncateToThisPrecision,
        asyncGetDatasetFile: asyncGetDatasetFile
    }

    return thisObject

    function truncateToThisPrecision(floatNumber, precision) {
        if (floatNumber == null) {
            floatNumber = 0
        }
        if (isNaN(floatNumber)) {
            floatNumber = 0
        }
        if (floatNumber === undefined) {
            floatNumber = 0
        }
        return parseFloat(floatNumber.toFixed(precision))
    }

    async function asyncGetDatasetFile(datasetModule, filePath, fileName) {
        /*
        This function helps a caller to use await syntax while the called
        function uses callbacks, specifically for retrieving files.
        Updated to use storage abstraction for SQLite compatibility.
        */
        let promise = new Promise((resolve, reject) => {
            
            // Try storage abstraction first (for SQLite), fallback to old system
            try {
                const StorageFactory = require('../../../../lib/StorageFactory')
                let storage = StorageFactory.createStorage()
                let fullPath = filePath + '/' + fileName
                
                storage.readFile(fullPath)
                    .then(text => {
                        let response = {
                            err: TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE,
                            text: text
                        }
                        resolve(response)
                    })
                    .catch(() => {
                        // Fallback to old system
                        datasetModule.getTextFile(filePath, fileName, onFileReceived)
                        
                        function onFileReceived(err, text) {
                            let response = {
                                err: err,
                                text: text
                            }
                            resolve(response)
                        }
                    })
            } catch (err) {
                // If StorageFactory fails to load, use old system
                datasetModule.getTextFile(filePath, fileName, onFileReceived)
                
                function onFileReceived(err, text) {
                    let response = {
                        err: err,
                        text: text
                    }
                    resolve(response)
                }
            }
        })

        return promise
    }
}