exports.newDataMiningBotModulesFromOneMinToMultiTimeFrameDaily = function (processIndex) {
    /*
        This module is about converting a One-Min Daily type of data set into a Multi Time Frame Daily type.

        The process to do so involves:
    
        Reading the elements (elements, volumens, bolllinger bands, news, asset metrics, etc.) from a
        One-Min Dataset (a dataset that is organized with elements spanning one min, like one min begin-end-elements,
        or elements with a timestamp captured approximatelly one minute from each other)
        organized in Daily Files.
        
        It is going to output a Daily Files dataset for every Daily Time Frame, aggregating the 
        input information into elements with a begin and end property. 
        
        Everytime this process runs, it will be able to resume its job and process everything pending until 
        reaching the head of the market.         
    */
    const MODULE_NAME = "From One Min To Multi Time Frame Daily"

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependenciesModule
    let dataDependenciesModule
    let node = {}               // Usefull nodes for this module will be stored here.

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, callBackFunction) {

        statusDependenciesModule = pStatusDependencies
        dataDependenciesModule = pDataDependencies
        TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.checkForKnownConstraints(
            dataDependenciesModule,
            node,
            processIndex,
            callBackFunction
        )
    }

    function finalize() {
        fileStorage = undefined
        statusDependenciesModule = undefined
        dataDependenciesModule = undefined
        thisObject = undefined
        node = undefined
    }

    function start(callBackFunction) {

        try {
            /* Context Variables */
            let contextVariables = {
                datetimeLastProducedFile: undefined,                        // Datetime of the last file files successfully produced by this process.
                datetimeBeginingOfMarketFile: undefined,                    // Datetime of the first trade file in the whole market history.
                datetimeLastAvailableDependencyFile: undefined,             // Datetime of the last file available to be used as an input of this process.
                beginingOfMarket: undefined                                 // Datetime of the begining of the market.
            }

            TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.getContextVariables(
                statusDependenciesModule,
                contextVariables,
                buildOutput,
                buildOutput,
                processIndex,
                callBackFunction
            )

            function buildOutput(allPreviousElements) {

                try {
                    let fromDate = new Date(contextVariables.datetimeLastProducedFile.valueOf())
                    let lastDate = TS.projects.foundations.utilities.dateTimeFunctions.removeTime(new Date())
                    /*
                    Firstly we prepere the arrays that will accumulate all the information for each output file.
                    */
                    let outputElements = []

                    for (let timeFrameArrayIndex = 0; timeFrameArrayIndex < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; timeFrameArrayIndex++) {
                        const emptyArray = []
                        outputElements.push(emptyArray)
                    }
                    moveToNextDay()

                    function moveToNextDay() {
                        TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.advanceTime(
                            fromDate,
                            lastDate,
                            contextVariables,
                            timeframesLoop,
                            processIndex,
                            callBackFunction
                        )
                        checkStopTaskGracefully
                    }
                    // If we are ready to stop, stop gracefully.
                    function checkStopTaskGracefully() {
                        /* Validation that we dont need to stop. */
                        if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                            return
                        } else {
                            timeFramesLoop
                        }
                        
                    }

                    function timeframesLoop() {
                        /*
                        We will iterate through all posible time frames.
                        */
                        let timeFrameArrayIndex = 0   // loop Variable representing each possible period as defined at the Time Frame Array.

                        loopBody()

                        function loopBody() {

                            const TIME_FRAME_VALUE = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[timeFrameArrayIndex][0]
                            const TIME_FRAME_LABEL = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[timeFrameArrayIndex][1]
                            /*
                            Here we are inside a Loop that is going to advance 1 day at the time, 
                            at each pass, we will read one of Exchange Raw Data's daily files and
                            add all its elements to our in memory arrays. 
                            */
                            TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.nextDependencyDailyFile(
                                contextVariables,
                                node,
                                aggregateAndWriteOutputFile,
                                fileStorage,
                                processIndex,
                                callBackFunction
                            )

                            function aggregateAndWriteOutputFile(dependencyDailyFile) {
                                /*
                                Here we call the function that will aggregate all the information 
                                at the dependency file into standarized begin-end-elements. 
                                */
                                TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.aggregateFileContent(
                                    node,
                                    contextVariables,
                                    dependencyDailyFile,
                                    outputElements[timeFrameArrayIndex],
                                    TIME_FRAME_VALUE
                                )

                                writeOutputFile(outputElements[timeFrameArrayIndex], TIME_FRAME_LABEL, controlLoop)

                                function writeOutputFile(outputElementsCurrentTimeFrame, TIME_FRAME_LABEL, callBack) {
                                    /*
                                    Here we will write the contents of the file to disk.
                                    */
                                    try {
                                        let fileContent = TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.generateOutputFileContent(
                                            node,
                                            outputElementsCurrentTimeFrame
                                        )
                                        /*
                                        Once the file content is generated, we need to reset this array.
                                        */
                                        outputElementsCurrentTimeFrame = []
                                        /*
                                        Daily files are saved to disk inside a folder for each year / month / day
                                        */
                                        let file = { date: new Date(contextVariables.datetimeLastProducedFile.valueOf()) }
                                        file.year = file.date.getUTCFullYear()
                                        file.month = file.date.getUTCMonth() + 1
                                        file.day = file.date.getUTCDate()
                                        let dateForPath = file.year + '/' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.month, 2) + '/' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(file.day, 2)

                                        let fileName = 'Data.json'
                                        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                            "/Output/" +
                                            node.outputDataset.referenceParent.parentNode.config.codeName + "/" +
                                            node.outputDataset.referenceParent.config.codeName + "/" +
                                            TIME_FRAME_LABEL + "/" +
                                            dateForPath

                                        filePath += '/' + fileName

                                        if (fileContent !== '[]') {

                                            fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[INFO] start -> writeOutputFile -> creating file at filePath = " + filePath)
                                        } else {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[INFO] start -> writeOutputFile -> No Data to save for File @ " +
                                                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" +
                                                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " +
                                                " filePath = " + filePath)
                                            callBack()
                                        }

                                        function onFileCreated(err) {
                                            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> writeOutputFile -> onFileCreated -> err = " + err.stack)
                                                callBackFunction(err)
                                                return
                                            }

                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[INFO] start -> writeOutputFile -> onFileCreated ->  Finished with File @ " +
                                                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" +
                                                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " +
                                                " filePath = " + filePath + "/" + fileName)
                                            callBack()
                                        }
                                    }
                                    catch (err) {
                                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> writeOutputFile -> err = " + err.stack)
                                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                                    }
                                }
                            }
                        }

                        function controlLoop() {
                            timeFrameArrayIndex++
                            if (timeFrameArrayIndex < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length) {
                                loopBody()
                            } else {
                                timeFrameArrayIndex = 0;
                                writeDataRanges()

                                TS.projects.foundations.functionLibraries.fromOneMinToMultiTimeFrameFunctions.writeStatusReport(
                                    statusDependenciesModule,
                                    contextVariables,
                                    contextVariables.datetimeLastProducedFile,
                                    moveToNextDay,
                                    processIndex,
                                    callBackFunction
                                )
                            }
                        }
                    }
                }
                catch (err) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildOutput -> err = " + err.stack)
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            function writeDataRanges() {
                let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset')
                let outputDatasetIndex = -1;
                controlLoop()

                function productLoopBody() {
                    let productCodeName = outputDatasets[outputDatasetIndex].referenceParent.parentNode.config.codeName;
                    writeDataRange(
                        contextVariables.datetimeBeginingOfMarketFile,
                        contextVariables.datetimeLastProducedFile,
                        productCodeName,
                        controlLoop
                    )
                }

                function controlLoop() {
                    outputDatasetIndex++
                    if (outputDatasetIndex < outputDatasets.length) {
                        productLoopBody()
                    } else {
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                    }
                }


            }

            function writeDataRange(pBegin, pEnd, productCodeName, callBack) {
                let dataRange = {
                    begin: pBegin.valueOf(),
                    end: pEnd.valueOf() + SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                };
                let fileContent = JSON.stringify(dataRange)
                let fileName = '/Data.Range.json';
        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + productCodeName + "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + fileName;

        fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

        function onFileCreated(err) {
            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.stack)
                callBack(err)
                return
            }
            let key = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + productCodeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "-" +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + '/' +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            let event = {
                dateRange: dataRange
            }

            TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Data Range Updated', event)
            writeTimeFramesFile(productCodeName, callBack)
        }
            }

            function writeTimeFramesFile(productCodeName, callBack) {

                let timeFramesArray = []
            for (let n = 0; n < TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray().length; n++) {
            let timeFrameLabel = TS.projects.foundations.globals.timeFrames.dailyTimeFramesArray()[n][1]

            /* Check Time Frames Filter */
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter !== undefined) {
                if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames !== undefined) {
                    if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.timeFramesFilter.config.dailyTimeFrames.includes(timeFrameLabel) === true) {
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
                    "[ERROR] start -> writeTimeFramesFiles -> onFileCreated -> err = " + err.stack)
                callBack(err)
                return
            }
            //callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        }
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
