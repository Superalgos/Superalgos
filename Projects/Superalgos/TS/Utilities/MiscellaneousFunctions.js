exports.newSuperalgosUtilitiesMiscellaneousFunctions = function () {

    let thisObject = {
        genereteUniqueId: genereteUniqueId,
        truncateToThisPrecision: truncateToThisPrecision,
        pad: pad,
        asyncGetDatasetFile: asyncGetDatasetFile,
        mkDirByPathSync: mkDirByPathSync
    }

    return thisObject

    function genereteUniqueId() {
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

    /* Function to create folders of missing folders at any path. */
    function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
        const path = require('path')
        
        targetDir = targetDir.substring(0, targetDir.lastIndexOf('/') + 1);

        const sep = '/';
        const initDir = path.isAbsolute(targetDir) ? sep : '';
        const baseDir = isRelativeToScript ? __dirname : '.';

        return targetDir.split(sep).reduce((parentDir, childDir) => {
            const curDir = path.resolve(baseDir, parentDir, childDir);
            try {
                const fs = require('fs')
                fs.mkdirSync(curDir);
            } catch (err) {
                if (err.code === 'EEXIST') { // curDir already exists!
                    return curDir;
                }

                // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
                if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
                    throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
                }

                const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
                if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
                    throw err; // Throw if it's just the last created dir.
                }
            }

            return curDir;
        }, initDir);
    }
}