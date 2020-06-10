exports.newTradingOutput = function newTradingOutput(bot, logger, UTILITIES, FILE_STORAGE) {
    const FULL_LOG = true
    const MODULE_NAME = 'Trading Bot'

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    let utilities = UTILITIES.newCloudUtilities(logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger)

    return thisObject

    function finalize() {
        thisObject = undefined
        utilities = undefined
        fileStorage = undefined
        commons = undefined
    }

    function initialize(callBackFunction) {
        try {
            logger.fileName = MODULE_NAME
            logger.initialize()

            callBackFunction(global.DEFAULT_OK_RESPONSE)
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] initialize -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }

    function start(chart, timeFrame, timeFrameLabel, currentDay, simulationState, callBackFunction) {
        try {
            bot.processingDailyFiles
            if (timeFrame > global.dailyFilePeriods[0][0]) {
                bot.processingDailyFiles = false
            } else {
                bot.processingDailyFiles = true
            }

            /* Preparing everything for the Simulation */
            const TRADING_SIMULATION = require('./TradingSimulation.js')
            let tradingSimulation = TRADING_SIMULATION.newTradingSimulation(bot, logger, UTILITIES)

            let market = bot.market
            let totalFilesRead = 0
            let totalFilesWritten = 0
            let outputDatasetsMap = new Map()

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

