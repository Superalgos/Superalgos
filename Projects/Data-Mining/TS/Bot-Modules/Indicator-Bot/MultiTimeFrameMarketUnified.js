exports.newDataMiningIndicatorMultiTimeFrameMarketUnified = function (processIndex) {
    const MODULE_NAME = "Multi Time Frame Market Unified"
    console.log("[FORCE DEBUG] MultiTimeFrameMarketUnified module loaded for process", processIndex)
    
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let storage
    let statusDependenciesModule
    let dataDependenciesModule
    let dataFiles = new Map()
    let indicatorOutputModule

    return thisObject;

    function initialize(pStatusDependencies, pDataDependenciesModule, callBackFunction) {
        statusDependenciesModule = pStatusDependencies
        dataDependenciesModule = pDataDependenciesModule

        // Initialize storage based on configuration
        const StorageFactory = require('../../../../../lib/StorageFactory')
        const storageConfig = require('../../../../../config/storage')
        storage = StorageFactory.create(storageConfig)
        
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[INFO] initialize -> Using " + storage.constructor.name + " storage")

        indicatorOutputModule = TS.projects.dataMining.botModules.indicatorOutput.newDataMiningBotModulesIndicatorOutput(processIndex)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        storage = undefined
        dataFiles = undefined
        statusDependenciesModule = undefined
        dataDependenciesModule = undefined
        indicatorOutputModule = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[DEBUG] start -> Bot starting with " + storage.constructor.name + " storage")
            processTimeFrames()

            function processTimeFrames() {
                let n;
                timeFramesLoop()

                function timeFramesLoop() {
                    n = 0
                    timeFramesLoopBody()
                }

                function timeFramesLoopBody() {
                    const timeFrame = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][0]
                    const timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames.includes(timeFrameLabel) === false) {
                                timeFramesControlLoop()
                                return
                            }
                        }
                    }

                    let dependencyIndex = 0;
                    dataFiles = new Map;

                    dependencyLoopBody()

                    function dependencyLoopBody() {
                        let dependency = dataDependenciesModule.curatedDependencyNodeArray[dependencyIndex]

                        getFile()

                        async function getFile() {
                            let fileName = "Data.json";
                            let filePath

                            if (dependency.referenceParent.config.codeName === "Single-File") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + '/' + fileName
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel + '/' + fileName
                            }

                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] getFile -> Attempting to read: " + filePath + " using " + storage.constructor.name)

                            try {
                                // Use unified storage interface
                                const dataFile = await storage.readFile(filePath)
                                const dataLength = dataFile ? JSON.parse(dataFile).length : 0
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] getFile -> Successfully read " + filePath + " -> " + dataLength + " records")
                                dataFiles.set(dependency.id, dataFile)
                                dependencyControlLoop()
                            } catch (err) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] getFile -> Failed to read " + filePath + " -> " + (err.message || err.toString()))
                                callBackFunction(err)
                                return;
                            }
                        }
                    }

                    function dependencyControlLoop() {
                        dependencyIndex++;
                        if (dependencyIndex < dataDependenciesModule.curatedDependencyNodeArray.length) {
                            dependencyLoopBody()
                        } else {
                            generateOutput()
                        }

                        function generateOutput() {
                            indicatorOutputModule.start(
                                dataFiles,
                                timeFrame,
                                timeFrameLabel,
                                undefined,
                                undefined,
                                onOutputGenerated)

                            function onOutputGenerated(err) {
                                if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    callBackFunction(err)
                                    return;
                                }
                                timeFramesControlLoop()
                            }
                        }
                    }
                }

                function timeFramesControlLoop() {
                    n++;
                    if (n < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length) {
                        timeFramesLoopBody()
                    } else {
                        writeTimeFramesFiles(onTimeFrameFilesWritten)
                        function onTimeFrameFilesWritten() {
                            writeStatusReport(callBackFunction)
                        }
                    }
                }
            }

            async function writeTimeFramesFiles(callBack) {
                let outputDatasets =
                    SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                async function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    await writeTimeFramesFile(productCodeName)
                    controlLoop()
                }

                function controlLoop() {
                    outputDatasetIndex++
                    if (outputDatasetIndex < outputDatasets.length) {
                        productLoopBody()
                    } else {
                        callBack()
                    }
                }
            }

            async function writeTimeFramesFile(productCodeName) {
                let timeFramesArray = []
                for (let n = 0; n < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; n++) {
                    let timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]

                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames.includes(timeFrameLabel) === true) {
                                timeFramesArray.push(timeFrameLabel)
                            }
                        } else {
                            timeFramesArray.push(timeFrameLabel)
                        }
                    } else {
                        timeFramesArray.push(timeFrameLabel)
                    }
                }

                let filePath = "Output/" + productCodeName + "/" +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/Time.Frames.json";

                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] writeTimeFramesFile -> Writing " + filePath + " with " + timeFramesArray.length + " timeframes")
                
                try {
                    await storage.writeFile(filePath, timeFramesArray)
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] writeTimeFramesFile -> Successfully wrote " + filePath)
                } catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] writeTimeFramesFile -> Failed to write " + filePath + " -> " + (err.message || err.toString()))
                    throw err
                }
            }

            function writeStatusReport(callBack) {
                let thisReport = statusDependenciesModule.reportsByMainUtility.get('Self Reference')

                thisReport.file.lastExecution = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME;
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                        thisReport.file.timeFrames = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames
                    }
                }
                thisReport.save(callBack)

                if (TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME, new Date()) === false) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME)
                }

                let currentDateString = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCFullYear() + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCMonth() + 1, 2) + '-' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCDate(), 2)
                let currentDate = new Date(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME)
                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(
                    processIndex,
                    currentDateString,
                    TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(currentDate, currentDate, currentDate)
                )
            }
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}