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
        */
        let promise = new Promise((resolve, reject) => {

            datasetModule.getTextFile(filePath, fileName, onFileReceived)

            function onFileReceived(err, text) {

                let response = {
                    err: err,
                    text: text
                }
                resolve(response)
            }
        })

        return promise
    }
}