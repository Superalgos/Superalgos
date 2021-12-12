exports.newDataMiningBotModulesMultiTimeFrameMarket = function (processIndex) {
    const MODULE_NAME = "Multi Time Frame Market"
    /*
    This module deals with Market Files, that are data files for Time Frames of 1 hour and above.
    It also assumes that the data dependencies are in Market Files, one file for each Time Frame.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    };

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependenciesModule
    let dataDependenciesModule
    let dataFiles = new Map()
    let indicatorOutputModule

    return thisObject;

    function initialize(pStatusDependencies, pStatusDependenciesModule, callBackFunction) {

        statusDependenciesModule = pStatusDependencies
        dataDependenciesModule = pStatusDependenciesModule

        indicatorOutputModule = TS.projects.dataMining.botModules.indicatorOutput.newDataMiningBotModulesIndicatorOutput(processIndex)
        indicatorOutputModule.initialize(callBackFunction)
    }

    function finalize() {
        fileStorage = undefined
        dataFiles = undefined
        statusDependenciesModule = undefined
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
                    /* We will iterate through all possible timeFrames.*/
                    n = 0   // loop Variable representing each possible period as defined at the timeFrames array.
                    timeFramesLoopBody()
                }

                function timeFramesLoopBody() {
                    const timeFrame = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][0]
                    const timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]

                    /* Check Time Frames Filter */
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames !== undefined) {
                            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.marketTimeFrames.includes(timeFrameLabel) === false) {
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
                            let filePath

                            /*
                            For datasets that are not dependent on a Time Frame we will build the file path without the timeFrameLabel
                            */
                            if (dependency.referenceParent.config.codeName === "Single-File") {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName
                            } else {
                                filePath = dependency.referenceParent.parentNode.config.codeName + '/' + dependency.referenceParent.config.codeName + "/" + timeFrameLabel
                            }

                            datasetModule.getTextFile(filePath, fileName, onFileReceived)

                            function onFileReceived(err, text) {
                                if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> processTimeFrames -> timeFramesLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + JSON.stringify(err))
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

            function writeTimeFramesFiles(callBack) {
                let outputDatasets =
                    SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
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
                for (let n = 0; n < TS.projects.foundations.globals.timeFrames.marketTimeFramesArray().length; n++) {
                    let timeFrameLabel = TS.projects.foundations.globals.timeFrames.marketTimeFramesArray()[n][1]

                    /* Check Time Frames Filter */
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

                let fileContent = JSON.stringify(timeFramesArray)
                let fileName = '/Time.Frames.json';
                let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productCodeName + "/" +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + fileName;

                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                function onFileCreated(err) {
                    if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> writeTimeFramesFile -> onFileCreated -> err = " + err.stack)
                        callBack(err)
                        return
                    }
                    callBack()
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

                /*  Telling the world we are alive and doing well */
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
