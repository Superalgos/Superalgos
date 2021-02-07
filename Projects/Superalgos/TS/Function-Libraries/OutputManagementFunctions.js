
exports.newSuperalgosFunctionLibrariesOutputManagementFunctions = function () {
    /*
    This module helps a bot process to manage it's output files, since it load
    the current state of it's output and allows the bot process to append info 
    to it. It also allows the bot process to save all updated output.
    */
    const MODULE_NAME = "Output Management Functions"

    let thisObject = {
        readFiles: readFiles,
        writeFiles: writeFiles
    }
    return thisObject

    async function readFiles(
        processIndex,
        outputDatasets,
        outputDatasetsMap,
        timeFrameLabel,
        tradingProcessDate,
        fileStorage,
        headOfTheMarket
    ) {
        if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES === true) {
            /*
            For Daily Files, we are going to initialize the outputs at the first execution
            if we are not resuming, but also at every following execution except when 
            we are at the head of the market, because at the head of the market we need to 
            append more data to the same output files that already exists.
            */
            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true && TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === false) {
                await initializeOutputs()
            } else {
                if (headOfTheMarket === true) {
                    await loadFiles()
                } else {
                    await initializeOutputs()
                }
            }
        } else {
            /*
            Form Market Files, we are only going to initialize the outputs at the first run
            and if we are not resuming execution. Subsequent runs means that we are at the 
            head of the market. Remember that backtests finishes the session once the reach
            the final datetime.
            */
            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true && TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING === false) {
                await initializeOutputs()
            } else {
                await loadFiles()
            }
        }

        async function initializeOutputs() {
            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES) {
                await initializeDailyFiles()
            } else {
                await initializeMarketFiles()
            }

            async function initializeDailyFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Daily Files') {
                        outputDatasetsMap.set(dataset.parentNode.config.codeName, [])
                    }
                }
            }

            async function initializeMarketFiles() {
                for (let i = 0; i < outputDatasets.length; i++) {
                    let outputDatasetNode = outputDatasets[i]
                    let dataset = outputDatasetNode.referenceParent

                    if (dataset.config.type === 'Market Files') {
                        outputDatasetsMap.set(dataset.parentNode.config.codeName, [])
                    }
                }
            }
        }

        async function loadFiles() {
            /* 
            This bot have an output of files that it generates. At every call to the bot, it needs to read the previously generated
            files in order to later append more information after the execution is over. Here in this function we are going to
            read those output files and get them ready for appending content during the simulation.
            */
            if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES) {
                await readDailyFiles()
            } else {
                await readMarketFiles()
            }
        }

        async function readMarketFiles() {
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let dataset = outputDatasetNode.referenceParent

                if (dataset.config.type === 'Market Files') {

                    let fileName = 'Data.json'
                    let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/Output/' + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel

                    await readOutputFile(fileName, filePath, dataset.parentNode.config.codeName)
                }
            }
        }

        async function readDailyFiles() {
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let dataset = outputDatasetNode.referenceParent

                if (dataset.config.type === 'Daily Files') {

                    let dateForPath = tradingProcessDate.getUTCFullYear() + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCMonth() + 1, 2) + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCDate(), 2);
                    let fileName = 'Data.json'
                    let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/Output/' + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel + "/" + dateForPath

                    await readOutputFile(fileName, filePath, dataset.parentNode.config.codeName)
                }
            }
        }

        async function readOutputFile(fileName, filePath, productName) {
            filePath += '/' + fileName

            let response = await fileStorage.asyncGetTextFile(filePath, true)

            if (response.err.message === 'File does not exist.') {
                outputDatasetsMap.set(productName, [])
                return
            }
            if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                throw (response.err)
            }
            outputDatasetsMap.set(productName, JSON.parse(response.text))
        }
    }

    async function writeFiles(
        processIndex,
        outputDatasets,
        outputDatasetsMap,
        timeFrameLabel,
        tradingProcessDate,
        fileStorage
    ) {
        /*
        The output of files which were appended with information during the simulation execution, now needs to be saved.
        */
        if (TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).TRADING_PROCESSING_DAILY_FILES) {
            await writeDailyFiles()
        } else {
            await writeMarketFiles()
        }

        async function writeMarketFiles() {
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let dataset = outputDatasetNode.referenceParent

                if (dataset.config.type === 'Market Files') {

                    let fileName = 'Data.json'
                    let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/Output/' + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel

                    await writeOutputFile(fileName, filePath, dataset.parentNode.config.codeName)
                }
            }
        }

        async function writeDailyFiles() {
            for (let i = 0; i < outputDatasets.length; i++) {
                let outputDatasetNode = outputDatasets[i]
                let dataset = outputDatasetNode.referenceParent

                if (dataset.config.type === 'Daily Files') {

                    let dateForPath = tradingProcessDate.getUTCFullYear() + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCMonth() + 1, 2) + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(tradingProcessDate.getUTCDate(), 2);
                    let fileName = 'Data.json'
                    let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/Output/' + TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + '/' + dataset.parentNode.config.codeName + '/' + dataset.config.codeName + '/' + timeFrameLabel + "/" + dateForPath

                    await writeOutputFile(fileName, filePath, dataset.parentNode.config.codeName)
                }
            }
        }

        async function writeOutputFile(fileName, filePath, productName) {
            filePath += '/' + fileName
            let fileContent = JSON.stringify(outputDatasetsMap.get(productName))

            let response = await fileStorage.asyncCreateTextFile(filePath, fileContent)

            if (response.err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                throw (response.err)
            }
        }
    }
}