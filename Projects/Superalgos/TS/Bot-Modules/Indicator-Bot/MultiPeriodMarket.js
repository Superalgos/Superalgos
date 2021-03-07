exports.newSuperalgosBotModulesMultiPeriodMarket = function (processIndex) {
    const MODULE_NAME = "Multi Period Market";
    thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependencies
    let dataDependenciesModule
    let dataFiles = new Map()
    let indicatorOutputModule

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, callBackFunction) {

        statusDependencies = pStatusDependencies;
        dataDependenciesModule = pDataDependencies;

        indicatorOutputModule = TS.projects.superalgos.botModules.indicatorOutput.newSuperalgosBotModulesIndicatorOutput(processIndex)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        fileStorage = undefined
        dataFiles = undefined
        statusDependencies = undefined
        dataDependenciesModule = undefined
        indicatorOutputModule = undefined
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
            processTimeFrames()

            function processTimeFrames() {
                let n;
                timeFramesLoop()

                function timeFramesLoop() {
                    /* We will iterate through all posible timeFrames.*/
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody()
                }

                function timeFramesLoopBody() {
                    const timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0]
                    const timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames.includes(timeFrameLabel) === false) {
                                /* We are not going to process this Time Frame */
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
                        let datasetModule = dataDependenciesModule.dataSetsModulesArray[dependencyIndex]

                        getFile()

                        function getFile() {
                            let fileName = "Data.json";
                            let filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel;
                            datasetModule.getTextFile(filePath, fileName, onFileReceived)

                            function onFileReceived(err, text) {
                                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(err)
                                    return;
                                }

                                let dataFile = JSON.parse(text)
                                dataFiles.set(dependency.id, dataFile)

                                dependencyControlLoop()
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
                                if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
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
                    if (n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                        timeFramesLoopBody()
                    } else {
                        writeTimeFramesFiles(onTimeFrameFilesWritten)
                        function onTimeFrameFilesWritten() {
                            writeStatusReport(callBackFunction)
                        }
                    }
                }
            }

            function writeTimeFramesFiles(callBack) {
                let outputDatasets =
                    TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeTimeFramesFile(productCodeName, controlLoop)
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

            function writeTimeFramesFile(productCodeName, callBack) {

                let timeFramesArray = []
                for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; n++) {
                    let timeFrameLabel = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                            if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames.includes(timeFrameLabel) === true) {
                                timeFramesArray.push(timeFrameLabel)
                            }
                        } else {
                            timeFramesArray.push(timeFrameLabel)
                        }
                    } else {
                        timeFramesArray.push(timeFrameLabel)
                    }
                }

                let fileContent = JSON.stringify(timeFramesArray)
                let fileName = '/Time.Frames.json';
                let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productCodeName + "/" +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> writeTimeFramesFile -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    callBack()
                }
            }

            function writeStatusReport(callBack) {
                let reportKey = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + "Multi-Period-Market"
                let thisReport = statusDependencies.statusReports.get(reportKey)

                thisReport.file.lastExecution = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME;
                if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                    if (TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                        thisReport.file.timeFrames = TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames
                    }
                }
                thisReport.save(callBack)

                if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME, new Date()) === false) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME)
                }

                /*  Telling the world we are alive and doing well */
                let currentDateString = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCFullYear() + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCMonth() + 1, 2) + '-' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME.getUTCDate(), 2)
                let currentDate = new Date(TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME)
                TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(
                    processIndex, 
                    currentDateString, 
                    TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(currentDate, currentDate, currentDate)
                    )
            }
        }
        catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack)
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}
