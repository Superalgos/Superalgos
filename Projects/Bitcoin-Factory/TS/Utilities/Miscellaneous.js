exports.newBitcoinFactoryUtilitiesMiscellaneous = function newBitcoinFacnewBitcoinFactoryUtilitiesMiscellaneoustoryUtilities() {
    /*
    Utilities functions goes here.
    */
    let thisObject = {
        getUserProfileFilesList: getUserProfileFilesList,
        getUserProfileFile: getUserProfileFile,
        getIndicatorFile: getIndicatorFile,
        pad: pad,
        getHHMMSS: getHHMMSS,
        marketTimeFramesArray: undefined,
        marketTimeFramesMap: undefined,
        getExpiration: getExpiration,
        hash: hash,
        loadFile: loadFile,
        initialize: initialize,
        finalize: finalize
    }

    let BOT_CONFIG

    return thisObject

    function initialize() {
        BOT_CONFIG = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config
        /*
        Creat this Array
        */
        thisObject.marketTimeFramesArray =
            '[' +
            '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
            '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
            '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
            '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
            '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
            '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
            '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
            '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

        thisObject.marketTimeFramesArray = JSON.parse(thisObject.marketTimeFramesArray)
        /*
        Create this Map
        */
        thisObject.marketTimeFramesMap = new Map()
        for (let i = 0; i < thisObject.marketTimeFramesArray.length; i++) {
            let timeFrame = thisObject.marketTimeFramesArray[i]
            thisObject.marketTimeFramesMap.set(timeFrame[1], timeFrame[0])
        }
    }

    function finalize() {

    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

    function getHHMMSS(timestamp) {
        let now = (new Date()).valueOf()
        let enlapsed = now - timestamp
        return (new Date(enlapsed).toISOString().substr(11, 8))
    }

    function getExpiration(thisCase) {
        let minTimeFrameValue = thisObject.marketTimeFramesMap.get("24-hs")

        for (let i = 0; i < thisCase.parameters.LIST_OF_TIMEFRAMES.length; i++) {
            let timeFrame = thisCase.parameters.LIST_OF_TIMEFRAMES[i]
            let timeFrameValue = thisObject.marketTimeFramesMap.get(timeFrame)
            if (timeFrameValue < minTimeFrameValue) {
                minTimeFrameValue = timeFrameValue
            }
        }

        let expiration = Math.trunc(((new Date()).valueOf()) / minTimeFrameValue) * minTimeFrameValue + minTimeFrameValue
        return expiration
    }

    function loadFile(fullPath) {
        const fs = require("fs")
        try {
            let fileContent = fs.readFileSync(fullPath)
            return fileContent
        } catch (err) {
            if (err.code === "ENOENT") {
                return
            } else {
                console.log(err.stack)
                throw ('Fatal Exception')
            }
        }
    }

    function hash(stringToHash) {
        let crypto = require('crypto')
        let hash = crypto.createHash('md5').update(stringToHash).digest('hex')
        return hash
    }

    async function getUserProfileFilesList() {

        return new Promise(promiseWork)

        function promiseWork(resolve, reject) {
            let params = {
                method: 'getUserProfileFilesList'
            }

            const axios = require("axios")
            axios
                .post('http://' + BOT_CONFIG.mainSuperalgosHost + ':' + BOT_CONFIG.mainSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        resolve(res.data.userProfileFIleList)
                    } else {
                        reject()
                    }
                })
                .catch(error => {
                    console.log((new Date()).toISOString(), 'Checking with Superalgos...', 'Could not check with Superalgos. Had this error: ' + error)
                    reject()
                })
        }
    }

    async function getUserProfileFile(fileName) {

        return new Promise(promiseWork)

        function promiseWork(resolve, reject) {
            let params = {
                method: 'getUserProfileFile',
                fileName: fileName
            }

            const axios = require("axios")
            axios
                .post('http://' + BOT_CONFIG.mainSuperalgosHost + ':' + BOT_CONFIG.mainSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        resolve(res.data.userProfilePluginFile)
                    } else {
                        reject()
                    }
                })
                .catch(error => {
                    console.log((new Date()).toISOString(), 'Checking with Superalgos...', 'Could not check with Superalgos. Had this error: ' + error)
                    reject()
                })
        }
    }

    async function getIndicatorFile(
        dataMine,
        indicator,
        product,
        exchange,
        baseAsset,
        quotedAsset,
        dataset,
        timeFrameLabel
    ) {

        return new Promise(promiseWork)

        function promiseWork(resolve, reject) {
            let params = {
                method: 'getIndicatorFile',
                dataMine: dataMine,
                indicator: indicator,
                product: product,
                exchange: exchange,
                baseAsset: baseAsset,
                quotedAsset: quotedAsset,
                dataset: dataset,
                timeFrameLabel: timeFrameLabel
            }

            const axios = require("axios")
            axios
                .post('http://' + BOT_CONFIG.mainSuperalgosHost + ':' + BOT_CONFIG.mainSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        resolve(res.data.fileContent)
                    } else {
                        reject()
                    }
                })
                .catch(error => {
                    console.log((new Date()).toISOString(), 'Checking with Superalgos...', 'Could not check with Superalgos. Had this error: ' + error)
                    reject()
                })
        }
    }
}