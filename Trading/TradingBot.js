exports.newTradingBot = function newTradingBot(bot, logger, UTILITIES, FILE_STORAGE) {
    const FULL_LOG = true
    const MODULE_NAME = 'Trading Bot'

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    let utilities = UTILITIES.newCloudUtilities(logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger)

    const COMMONS = require('../Commons.js')
    let commons = COMMONS.newCommons(bot, logger, UTILITIES, FILE_STORAGE)

    let exchangeAPI

    return thisObject

    function finalize() {
        thisObject = undefined
        utilities = undefined
        fileStorage = undefined
        commons = undefined
    }

    function initialize(pExchangeAPI, callBackFunction) {
        try {
            logger.fileName = MODULE_NAME
            logger.initialize()

            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] initialize -> Entering function.') }

            exchangeAPI = pExchangeAPI
            callBackFunction(global.DEFAULT_OK_RESPONSE)
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] initialize -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }

    function start(multiPeriodDataFiles, timeFrame, timeFrameLabel, currentDay, simulationState, callBackFunction) {
        try {

            bot.processingDailyFiles
            if (timeFrame > global.dailyFilePeriods[0][0]) {
                bot.processingDailyFiles = false
            } else {
                bot.processingDailyFiles = true
            }
            let chart = {}
            let mainDependency = {}

            /* The first phase here is about checking that we have everything we need at the definition level. */
            let dataDependencies = bot.processNode.referenceParent.processDependencies.dataDependencies
            if (commons.validateDataDependencies(dataDependencies, callBackFunction) !== true) { return }

            let outputDatasets = bot.processNode.referenceParent.processOutput.outputDatasets
            if (commons.validateOutputDatasets(outputDatasets, callBackFunction) !== true) { return }

            /* The second phase is about transforming the inputs into a format that can be used to apply the user defined code. */
            for (let j = 0; j < global.marketFilesPeriods.length; j++) {
                let timeFrameLabel = marketFilesPeriods[j][1]
                let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                let products = {}

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> Inflating Data Files for timeFrame = ' + timeFrameLabel) }

                if (dataFiles !== undefined) {
                    commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                    let propertyName = 'at' + timeFrameLabel.replace('-', '')
                    chart[propertyName] = products
                }
            }

            for (let j = 0; j < global.dailyFilePeriods.length; j++) {
                let timeFrameLabel = global.dailyFilePeriods[j][1]
                let dataFiles = multiPeriodDataFiles.get(timeFrameLabel)
                let products = {}

                if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> Inflating Data Files for timeFrame = ' + timeFrameLabel) }

                if (dataFiles !== undefined) {
                    commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                    let propertyName = 'at' + timeFrameLabel.replace('-', '')
                    chart[propertyName] = products
                }
            }

            /* Single Files */
            let dataFiles = multiPeriodDataFiles.get('Single Files')
            let products = {}

            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> Inflating Data Files from Single Files.') }

            if (dataFiles !== undefined) {
                commons.inflateDatafiles(dataFiles, dataDependencies, products, mainDependency, timeFrame)

                let propertyName = 'atAnyTimeFrame'
                chart[propertyName] = products
            }

            /* Simulation */
            const SNAPSHOTS_FOLDER_NAME = 'Snapshots'
            const TRADING_SIMULATION = require('./TradingSimulation.js')
            let tradingSimulation = TRADING_SIMULATION.newTradingSimulation(bot, logger, UTILITIES)
            let market = bot.market
            let totalFilesRead = 0
            let totalFilesWritten = 0
            let outputDatasetsMap = new Map()

            let snapshotHeaders
            let triggerOnSnapshot
            let takePositionSnapshot

            let tradingSystem = {}

            if (bot.RESUME !== true) {
                simulationState.tradingEngine = bot.SESSION.tradingEngine
                simulationState.tradingSystem = bot.SESSION.tradingSystem
            }
            readFiles()
            return

            function readFiles() {
                /* 
                This bot have an output of files that it generates. At every call to the bot, it needs to read the previously generated
                files in order to later append more information after the execution is over. Here in this function we are going to
                read those output files and get them ready for appending content during the simulation.
                */
                if (bot.processingDailyFiles) {
                    readDailyFiles()
                } else {
                    readMarketFiles()
                }
            }

            function readMarketFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Market Files') {

                        let fileName = 'Data.json'
                        let filePath = bot.filePathRoot + '/Output/' + bot.SESSION.folderName + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel

                        readOutputFile(fileName, filePath, dataset.parentNode.config.pluralVariableName)
                    }
                }
            }

            function readDailyFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Daily Files') {

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = 'Data.json'
                        let filePath = bot.filePathRoot + '/Output/' + bot.SESSION.folderName + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel + "/" + dateForPath

                        readOutputFile(fileName, filePath, dataset.parentNode.config.pluralVariableName)
                    }
                }
            }

            function readOutputFile(fileName, filePath, productName) {

                filePath += '/' + fileName

                fileStorage.getTextFile(filePath, onFileRead, true)

                function onFileRead(err, text) {
                    try {

                        if (err.message === 'File does not exist.') {
                            outputDatasetsMap.set(productName, [])
                            anotherFileRead()
                            return
                        }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> err = ' + err.stack)
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> filePath = ' + filePath)
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> market = ' + market.baseAsset + '_' + market.quotedAsset)

                            callBackFunction(err)
                            return
                        }

                        outputDatasetsMap.set(productName, JSON.parse(text))
                        anotherFileRead()
                    } catch (err) {
                        logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> err = ' + err.stack)
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                    }
                }
            }

            function anotherFileRead() {
                totalFilesRead++
                if (totalFilesRead === outputDatasets.length) {
                    runSimulation()
                }
            }

            function runSimulation() {
                tradingSimulation.runSimulation(
                    chart,
                    dataDependencies,
                    simulationState,
                    exchangeAPI,
                    outputDatasets,
                    outputDatasetsMap,
                    writeFiles,
                    callBackFunction)
            }

            function writeFiles() {
                /*
                The output of files which were appended with information during the simulation execution, now needs to be saved.
                */
                if (bot.processingDailyFiles) {
                    writeDailyFiles()
                } else {
                    writeMarketFiles()
                }
            }

            function writeMarketFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Market Files') {

                        let fileName = 'Data.json'
                        let filePath = bot.filePathRoot + '/Output/' + bot.SESSION.folderName + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel

                        writeOutputFile(fileName, filePath, dataset.parentNode.config.pluralVariableName)
                    }
                }
            }

            function writeDailyFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Daily Files') {

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = 'Data.json'
                        let filePath = bot.filePathRoot + '/Output/' + bot.SESSION.folderName + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel + "/" + dateForPath

                        writeOutputFile(fileName, filePath, dataset.parentNode.config.pluralVariableName)
                    }
                }
            }

            function writeOutputFile(fileName, filePath, productName) {

                filePath += '/' + fileName
                let fileContent = JSON.stringify(outputDatasetsMap.get(productName))

                fileStorage.createTextFile(filePath, fileContent, onFileCreated)

                function onFileCreated(err) {
                    try {
                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> err = ' + err.stack)
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> filePath = ' + filePath)
                            logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> market = ' + market.baseAsset + '_' + market.quotedAsset)

                            callBackFunction(err)
                            return
                        }

                        anotherFileWritten()
                    } catch (err) {
                        logger.write(MODULE_NAME, '[ERROR] start -> readMarketFiles -> readOutputFile -> onFileRead -> err = ' + err.stack)
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                    }
                }
            }

            function anotherFileWritten() {
                totalFilesWritten++
                if (totalFilesWritten === outputDatasets.length) {
                    callBackFunction(global.DEFAULT_OK_RESPONSE)
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] start -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
}

