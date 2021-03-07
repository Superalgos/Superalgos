exports.newSuperalgosUtilitiesMiscellaneousFunctions = function () {

    let thisObject = {
        genereteUniqueId: genereteUniqueId,
        truncateToThisPrecision: truncateToThisPrecision,
        pad: pad,
        asyncGetDatasetFile: asyncGetDatasetFile
    }

    return thisObject

    function genereteUniqueId () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    function truncateToThisPrecision(floatNumber, precision) {
        return parseFloat(floatNumber.toFixed(precision))
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
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