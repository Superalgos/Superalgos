exports.newFoundationsFunctionLibrariesProcessFilesFunctions = function () {
    /*
    This module contains the functions that will allow you to load the 
    process context variables before you do your work, and to save the 
    process files once you are done.
    */
    const MODULE_NAME = "Process Files Functions"

    let thisObject = {
        getContextVariables: getContextVariables,
        writeProcessFiles: writeProcessFiles
    }
    return thisObject

    function getContextVariables(processIndex, contextVariables, statusDependencies, initialDatetime, callBackFunction) {
        try {
            let thisReport
            let statusReport

            /* We are going to use the start date as beginning of market date. */
            contextVariables.dateBeginOfMarket = TS.projects.foundations.utilities.dateTimeFunctions.removeTime(initialDatetime)
            /*
            Here we get the status report from the bot who knows which is the end of the market.
            */
            statusReport = statusDependencies.reportsByMainUtility.get("Market Ending Point")

            if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the beginning of a month.
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return false
            }

            if (statusReport.status === "Status Report is corrupt.") {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return false
            }

            thisReport = statusReport.file

            if (thisReport.lastFile === undefined) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[WARN] start -> getContextVariables -> Undefined Last File. -> thisReport = " + JSON.stringify(thisReport))

                let customOK = {
                    result: TS.projects.foundations.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                    message: "Dependency not ready."
                }
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[WARN] start -> getContextVariables -> customOK = " + customOK.message)
                callBackFunction(customOK)
                return false
            }

            contextVariables.dateEndOfMarket = new Date(thisReport.lastFile.valueOf())

            /* Finally we get our own Status Report. */
            statusReport = statusDependencies.reportsByMainUtility.get("Self Reference")

            if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the beginning of a month.
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                return false
            }

            if (statusReport.status === "Status Report is corrupt.") {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                return false
            }

            thisReport = statusReport.file
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE = thisReport.simulationState
            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE === undefined) { TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE = {} } // This should happen only when there is no status report

            if (thisReport.lastFile !== undefined) {
                if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_RESUMING !== true) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> Starting from the begining because bot has just started and resume execution was true.")
                    startFromBegining()
                    return true
                }
                contextVariables.lastFile = new Date(thisReport.lastFile)
                return true

            } else {
                /*
                We are here because either:
                1. There is no status report
                2. There is no Last File (this happens on Market Files)
                */
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] start -> getContextVariables -> Starting from the begining of the market because own status report not found or lastFile was undefined.")
                startFromBegining()
                return true
            }

            function startFromBegining() {
                contextVariables.lastFile = new Date(contextVariables.dateBeginOfMarket.getUTCFullYear() + "-" + (contextVariables.dateBeginOfMarket.getUTCMonth() + 1) + "-" + contextVariables.dateBeginOfMarket.getUTCDate() + " " + "00:00" + SA.projects.foundations.globals.timeConstants.GMT_SECONDS)

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] start -> getContextVariables -> startFromBegining -> contextVariables.lastFile = " + contextVariables.lastFile)
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> getContextVariables -> err = " + err.stack)
            if (err.message === "Cannot read property 'file' of undefined") {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ")
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys))
            }
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    async function writeProcessFiles(processIndex, contextVariables, currentTimeFrame, processDate, statusDependencies) {

        let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex)
        let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')

        await writeTimeFramesFiles()
        await writeDataRanges()

        if (currentTimeFrame.value > TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[0][0]) {
            await writeMarketStatusReport()
        } else {
            await writeDailyStatusReport()
        }

        async function writeDataRanges() {
            for (
                let outputDatasetIndex = 0;
                outputDatasetIndex < outputDatasets.length;
                outputDatasetIndex++
            ) {
                let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName
                await writeDataRange(productCodeName)
            }

            async function writeDataRange(productCodeName) {
                let dataRange = {
                    begin: contextVariables.dateBeginOfMarket.valueOf(),
                    end: processDate.valueOf() + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                }

                let fileContent = JSON.stringify(dataRange)
                let fileName = '/Data.Range.json'
                let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + 'Multi-Time-Frame-Daily' + fileName

                let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')

                if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                    throw (response.err)
                }

                /* 
                Raise the event that the Data Range was Updated.
                */
                let key = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + productCodeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                let event = {
                    dateRange: dataRange
                }

                TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Data Range Updated', event)
            }
        }

        async function writeTimeFramesFiles() {

            for (
                let outputDatasetIndex = 0;
                outputDatasetIndex < outputDatasets.length;
                outputDatasetIndex++
            ) {
                let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName
                await writeTimeFramesFile(productCodeName, 'Multi-Time-Frame-Daily')
                await writeTimeFramesFile(productCodeName, 'Multi-Time-Frame-Market')

                async function writeTimeFramesFile(productCodeName, processType) {

                    let timeFramesArray = []
                    timeFramesArray.push(currentTimeFrame.label)

                    let fileContent = JSON.stringify(timeFramesArray)
                    let fileName = '/Time.Frames.json'

                    let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_FOLDER_NAME + "/" + productCodeName + "/" + processType + fileName

                    let response = await fileStorage.asyncCreateTextFile(filePath, fileContent + '\n')
                    if (response.err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        throw (response.err)
                    }
                }
            }
        }

        async function writeDailyStatusReport() {
            let reportKey = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
            let thisReport = statusDependencies.statusReports.get(reportKey)

            thisReport.file.lastFile = processDate
            thisReport.file.simulationState = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE
            thisReport.file.timeFrames = currentTimeFrame.label
            await thisReport.asyncSave()
        }

        async function writeMarketStatusReport() {
            let reportKey = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName
            let thisReport = statusDependencies.statusReports.get(reportKey)

            thisReport.file.lastExecution = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME
            thisReport.file.simulationState = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE
            thisReport.file.timeFrames = currentTimeFrame.label

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(processDate)
            await thisReport.asyncSave()
        }
    }
}