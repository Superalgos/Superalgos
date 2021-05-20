exports.newSuperalgosBotModulesFromOneMinToMultiPeriodMarket = function (processIndex) {
    /*
        This process is going to do the following:
    
        Read the elements (elements, volumens, bolllinger bands, news, asset metrics, etc.) from a
        One-Min dataset (a dataset that is organized with elements spanning one min, like one min begin-end-elements,
        or elements with a timestamp captured approximatelly one minute from each other)
        organized in Daily Files.
        
        It is going to output a Market Files dataset for every Market Time Frame, aggregating the 
        input information into elements with a begin and end property. 
        
        Everytime this process runs, it will be able to resume its job and process everything pending until 
        reaching the head of the market. To achieve that it will follow this strategy:
    
        1. First it will read the last file written by this same process, and load all the information into 
        in-memory arrays (one array for each time frame). 
        
        2. Then it will append to these arrays the new information it gets from the data dependency file.
    
        3. It knows from it's status report which was the last DAY it processed. Since that day might not have been 
        completed (maybe it was at the head of the market). The process will have to be carefull not to append elements 
        that are already belonging to the first day to process. To take care of that, it will discard all elements 
        of the last processed day, and then it will process that full day again adding all the elements found at the current run.
    */
    const MODULE_NAME = "From One Min To Multi Period Market"
    const ONE_MIN_DATASET_TYPE = "One-Min"

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependenciesModule
    let dataDependenciesModule
    let dataDependencyNode
    let outputDatasetNode

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, callBackFunction) {

        statusDependenciesModule = pStatusDependencies
        dataDependenciesModule = pDataDependencies
        TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.checkForKnownConstraints(
            dataDependenciesModule,
            processIndex,
            callBackFunction
        )
    }

    function finalize() {
        fileStorage = undefined
        statusDependenciesModule = undefined
        dataDependenciesModule = undefined
        thisObject = undefined
        dataDependencyNode = undefined
        outputDatasetNode = undefined
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

            TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.getContextVariables(
                contextVariables,
                loadExistingFiles,
                buildOutput,
                processIndex,
                callBackFunction
            )

            function loadExistingFiles() {
                /*
                This is where we read the current files we have produced at previous runs 
                of this same process. We just read all the content and organize it
                in arrays and keep them in memory.
                */
                try {
                    let timeFrameArrayIndex = 0                         // loop Variable representing each possible time frame as defined at the time frames array.
                    let allPreviousElements = []                        // Each item of this array is an array of elements for a certain time frame

                    loopBody()

                    function loopBody() {
                        const TIME_FRAME_LABEL = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[timeFrameArrayIndex][1];

                        let previousElements

                        readExistingFile()

                        function readExistingFile() {
                            let fileName = 'Data.json';
                            let filePath =
                                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                "/Output/" +
                                outputDatasetNode.referenceParent.parentNode.config.codeName + "/" + // Product Name
                                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                                TIME_FRAME_LABEL;
                            filePath += '/' + fileName

                            fileStorage.getTextFile(filePath, onFileReceived)

                            function onFileReceived(err, text) {
                                let dependencyDailyFile

                                if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    try {
                                        dependencyDailyFile = JSON.parse(text)
                                        previousElements = dependencyDailyFile;
                                        allPreviousElements.push(previousElements)

                                        controlLoop()

                                    } catch (err) {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> fileName = " + fileName)
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> filePath = " + filePath)
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = " + err.stack)
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.")
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                                    }
                                } else {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = " + err.stack)
                                    callBackFunction(err)
                                }
                            }
                        }
                    }

                    function controlLoop() {
                        timeFrameArrayIndex++
                        if (timeFrameArrayIndex < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                            loopBody()
                        } else {
                            buildOutput(allPreviousElements)
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> loadExistingFiles -> err = " + err.stack)
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }

            function buildOutput(allPreviousElements) {

                try {
                    let fromDate = new Date(contextVariables.datetimeLastProducedFile.valueOf())
                    let lastDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(new Date())
                    /*
                    Firstly we prepere the arrays that will accumulate all the information for each output file.
                    */
                    let outputElements = []

                    for (let timeFrameArrayIndex = 0; timeFrameArrayIndex < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; timeFrameArrayIndex++) {
                        const emptyArray = []
                        outputElements.push(emptyArray)
                    }
                    moveToNextDay()

                    function moveToNextDay() {
                        TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.advanceTime(
                            contextVariables,
                            timeframesLoop,
                            processIndex,
                            callBackFunction
                        )
                    }

                    function timeframesLoop() {
                        /*
                        We will iterate through all posible time frames.
                        */
                        let timeFrameArrayIndex = 0   // loop Variable representing each possible period as defined at the periods array.

                        loopBody()

                        function loopBody() {
                            let previousElements // This is an array with all the elements already existing for a certain time frame.

                            if (allPreviousElements !== undefined) {
                                previousElements = allPreviousElements[timeFrameArrayIndex];
                            }

                            const TIME_FRAME_VALUE = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[timeFrameArrayIndex][0]
                            const TIME_FRAME_LABEL = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[timeFrameArrayIndex][1]
                            /*
                            Here we are inside a Loop that is going to advance 1 day at the time, 
                            at each pass, we will read one of Exchange Raw Data's daily files and
                            add all its elements to our in memory arrays. 
                            
                            At the first iteration of this loop, we will add the elements that we are carrying
                            from our previous run, the ones we already have in-memory. 

                            You can see below how we discard the elements that
                            belong to the first day we are processing at this run, 
                            that it is exactly the same as the last day processed the previous
                            run. By discarding these elements, we are ready to run after that standard 
                            function that will just add ALL the elements found each day at Exchange Raw Data.
                            */
                            if (previousElements !== undefined && previousElements.length !== 0) {
                                for (let i = 0; i < previousElements.length; i++) {
                                    let element = {}

                                    for (let j = 0; j < outputDatasetNode.referenceParent.parentNode.record.properties.length; j++) {
                                        let property = outputDatasetNode.referenceParent.parentNode.record.properties[j]
                                        element[property.config.codeName] = record[j]
                                    }

                                    if (element.end < contextVariables.datetimeLastProducedFile.valueOf()) {
                                        outputElements[timeFrameArrayIndex].push(element)
                                    } else {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[INFO] start -> buildOutput -> timeframesLoop -> loopBody -> Element # " + i + " @ " + TIME_FRAME_LABEL + " discarded for closing past the current process time.")
                                    }
                                }
                                allPreviousElements[timeFrameArrayIndex] = [] // erasing these so as not to duplicate them.
                            }

                            TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.nextDependencyDailyFile(
                                contextVariables,
                                dataDependencyNode,
                                aggregateAndWriteOutputFile,
                                processIndex,
                                callBackFunction
                            )

                            function aggregateAndWriteOutputFile(dependencyDailyFile) {
                                /*
                                Here we call the function that will aggregate all the information 
                                at the dependency file into standarized begin-end-elements. 
                                */
                                TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.aggregateFileContent(
                                    outputDatasetNode,
                                    dataDependencyNode,
                                    dependencyDailyFile,
                                    outputElements[timeFrameArrayIndex],
                                    TIME_FRAME_VALUE
                                )

                                writeOutputFile(outputElements[timeFrameArrayIndex], TIME_FRAME_LABEL, controlLoop)

                                function writeOutputFile(outputElements, TIME_FRAME_LABEL, callBack) {
                                    /*
                                    Here we will write the contents of the file to disk.
                                    */
                                    try {
                                        let fileContent = TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.generateOutputFileContent(
                                            outputDatasetNode,
                                            outputElements
                                        )

                                        let fileName = 'Data.json';
                                        let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                            "/Output/" +
                                            outputDatasetNode.referenceParent.parentNode.config.codeName + "/" +
                                            outputDatasetNode.referenceParent.config.codeName + "/" +
                                            TIME_FRAME_LABEL
                                        filePath += '/' + fileName

                                        fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated)

                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[INFO] start -> writeOutputFile -> creating file at filePath = " + filePath)

                                        function onFileCreated(err) {
                                            if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> writeOutputFile -> onFileCreated -> err = " + err.stack)
                                                callBackFunction(err)
                                                return
                                            }

                                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN] start -> writeOutputFile -> onFileCreated ->  Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName)
                                            callBack()
                                        }

                                    }
                                    catch (err) {
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> writeOutputFile -> err = " + err.stack)
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                                    }
                                }
                            }
                        }

                        function controlLoop() {
                            timeFrameArrayIndex++
                            if (timeFrameArrayIndex < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                                loopBody()
                            } else {
                                TS.projects.superalgos.functionLibraries.TS.projects.superalgos.functionLibraries.dataAggregationFunctions.writeStatusReport(
                                    statusDependenciesModule,
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
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildOutput -> err = " + err.stack)
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
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
