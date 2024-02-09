exports.newBitcoinFactoryUtilitiesMiscellaneous = function newBitcoinFactoryUtilitiesMiscellaneous() {
    /*
    Utilities functions goes here.
    */
    let thisObject = {
        getParameterName: getParameterName,
        getRecordDefinition: getRecordDefinition,
        getUserProfileFilesList: getUserProfileFilesList,
        getUserProfileFile: getUserProfileFile,
        getIndicatorFile: getIndicatorFile,
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

    function getParameterName(featuresOrLabelsObject) {
        let name =
            featuresOrLabelsObject.dataMine.toUpperCase() + "_" +
            featuresOrLabelsObject.indicator.toUpperCase() + "_" +
            featuresOrLabelsObject.product.toUpperCase() + "_" +
            featuresOrLabelsObject.objectName.toUpperCase() + "_" +
            featuresOrLabelsObject.propertyName.toUpperCase()

        return name
    }

    function getRecordDefinition(dataMine, indicatorName, productName) {
        try {
            for (let i = 0; i < dataMine.indicatorBots.length; i++) {
                let indicatorBot = dataMine.indicatorBots[i]
                let config = JSON.parse(indicatorBot.config)
                if (config.codeName === indicatorName) {
                    for (let j = 0; j < indicatorBot.products.length; j++) {
                        let product = indicatorBot.products[j]
                        let config = JSON.parse(product.config)
                        if (config.codeName === productName) {
                            return product.record.properties
                        }
                    }
                }
            }
            return []
        } catch (err) {
            SA.logger.error(err.stack)
            return []
        }
    }

    function getHHMMSS(timestamp) {
        let now = (new Date()).valueOf()
        let elapsed = now - timestamp
        return (new Date(elapsed).toISOString().substr(11, 8))
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
                SA.logger.error(err.stack)
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
                .post('http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        resolve(res.data.userProfileFIleList)
                    } else {
                        reject()
                    }
                })
                .catch(error => {
                    const errorMessage = 'Could not reach the Superalgos Platform with the configured host and port in order to get the User Profile File List. Please check that Superalgos is running at the specified location.'
                    SA.logger.error('Checking with Superalgos...', 'http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort )
                    SA.logger.error('Could not check with Superalgos. Had this error: ' + error)
                    SA.logger.error(errorMessage)
                    reject(errorMessage)
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
                .post('http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        resolve(res.data.userProfilePluginFile)
                    } else {
                        reject()
                    }
                })
                .catch(error => {
                    SA.logger.error('Checking with Superalgos...', 'Could not check with Superalgos. Had this error: ' + error)
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
            //console.time('getIndicatorFile')
            SA.logger.info('Requesting file to Superalgos...', dataMine, indicator, product, timeFrameLabel)
            const axios = require("axios")
            axios
                .post('http://' + BOT_CONFIG.targetSuperalgosHost + ':' + BOT_CONFIG.targetSuperalgosHttpPort + '/Bitcoin-Factory', params)
                .then(res => {
                    if (res.data.result === 'Ok') {
                        //console.timeEnd('getIndicatorFile')
                        resolve(res.data.fileContent)
                    } else {
                        SA.logger.error('File requested not found. Please verify that you are running the Data Mining operation that includes this indactor and that this file exist on disk.')
                        reject()
                    }
                })
                .catch(error => {
                    SA.logger.error('Error trying to get an indicator file from Superalgos...', ' error: ' + error)
                    reject()
                })
        }
    }
}