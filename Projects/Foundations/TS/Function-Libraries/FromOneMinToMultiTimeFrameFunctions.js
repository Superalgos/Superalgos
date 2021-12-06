exports.newFoundationsFunctionLibrariesFromOneMinToMultiTimeFrameFunctions = function () {
    /*
    This module contains the functions to aggregate data into elements with
    begin and end properties. It is used by both the One Min to Market
    and One Min to Daily frameworks as a common place to have functions
    used at both of them.
    */
    const MODULE_NAME = "From One Min To Multi Time Frame Functions"

    let thisObject = {
        checkForKnownConstraints: checkForKnownConstraints,
        getContextVariables: getContextVariables,
        advanceTime: advanceTime,
        nextDependencyDailyFile: nextDependencyDailyFile,
        generateOutputFileContent: generateOutputFileContent,
        aggregateFileContent: aggregateFileContent,
        writeStatusReport: writeStatusReport
    }
    return thisObject

    function checkForKnownConstraints(
        dataDependenciesModule,
        node,
        processIndex,
        callBackFunction
    ) {
        /*
        This Framework have a few constraints that we are going to check right here.
        One of them is the fact that it can only accept one data dependency. The 
        reason why is because the purpose of this framework is to produce a transformation
        between one dataset type (One-Min) to another dataset type (Multi-Time-Frame-Market).
        To do that it can only handle one dependency and it will only produce one output.

        If the user has defined more than one data dependency or more than one output, we
        are going to stop right here so that the user gets the message that this framework
        is not to merge information and splitted into multiple outputs.
        */
        if (dataDependenciesModule.curatedDependencyNodeArray.length !== 1) {
            TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                processIndex,
                MODULE_NAME,
                'Dataset Type Standard Converter',
                { errorDetails: "checkForKnownConstraints -> Validation Check Not Passed -> Expecting only one Data Dependency. Found = " + dataDependenciesModule.curatedDependencyNodeArray.length },
                'Only One Data Dependency Expected',
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processDependencies
            )
        } else {
            node.dataDependency = dataDependenciesModule.curatedDependencyNodeArray[0]
        }

        let outputDatasets = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset'
        )

        if (outputDatasets.length !== 1) {
            TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                processIndex,
                MODULE_NAME,
                'Dataset Type Standard Converter',
                { errorDetails: "checkForKnownConstraints -> Validation Check Not Passed -> Expecting only one Output Dataset. Found = " + outputDatasets.length },
                'Only One Output Dataset Expected',
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput
            )
        } else {
            node.outputDataset = outputDatasets[0]
        }

        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
    }

    function getContextVariables(
        statusDependenciesModule,
        contextVariables,
        callbackNotFirstRun,
        callbackFirstRun,
        processIndex,
        callBackFunction
    ) {
        try {
            let thisReport
            let statusReport

            detectWhereTheMarketBegins()
            detectWhereTheMarketEnds()
            getOwnStatusReport()

            function detectWhereTheMarketBegins() {
                /* 
                We look first for Status Report that will tell us when the market starts. 
                */
                statusReport = statusDependenciesModule.reportsByMainUtility.get('Market Starting Point')

                if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the beginning of a month.
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketBegins-> Status Report does not exist. Retrying Later. ")
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    return
                }

                if (statusReport.status === "Status Report is corrupt.") {
                    TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                        processIndex,
                        MODULE_NAME,
                        'Dataset Type Standard Converter',
                        { errorDetails: "getContextVariables -> detectWhereTheMarketBegins -> Can not continue because dependency Status Report is corrupt. " },
                        'Status Report Is Corrupt',
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput
                    )
                }

                thisReport = statusReport.file

                if (thisReport.beginingOfMarket === undefined) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketBegins-> Undefined Last File. ")
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[HINT] getContextVariables -> detectWhereTheMarketBegins-> It is too early too run this process since the trade history of the market is not there yet.")

                    let customOK = {
                        result: TS.projects.foundations.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                        message: "Dependency does not exist."
                    }
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketBegins-> customOK = " + customOK.message)
                    callBackFunction(customOK)
                    return
                }

                contextVariables.datetimeBeginingOfMarketFile = TS.projects.foundations.utilities.dateTimeFunctions.removeTime(new Date(thisReport.beginingOfMarket))
            }

            function detectWhereTheMarketEnds() {
                /* 
                Second, we get the report from Exchange Raw Data, to know when the marted ends. 
                */
                statusReport = statusDependenciesModule.reportsByMainUtility.get('Market Ending Point')

                if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the beginning of a month.
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketEnds-> Status Report does not exist. Retrying Later. ")
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    return
                }

                if (statusReport.status === "Status Report is corrupt.") {
                    TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                        processIndex,
                        MODULE_NAME,
                        'Dataset Type Standard Converter',
                        { errorDetails: "getContextVariables -> detectWhereTheMarketEnds -> Can not continue because dependency Status Report is corrupt. " },
                        'Status Report Is Corrupt',
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput
                    )
                }

                thisReport = statusReport.file

                if (thisReport.lastFile === undefined) {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketEnds-> Undefined Last File.")

                    let customOK = {
                        result: TS.projects.foundations.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                        message: "Dependency not ready."
                    }
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> detectWhereTheMarketEnds-> customOK = " + customOK.message)
                    callBackFunction(customOK)
                    return
                }

                contextVariables.datetimeLastAvailableDependencyFile = new Date(thisReport.lastFile)

            }

            function getOwnStatusReport() {
                /* 
                Finally we get our own Status Report. 
                */
                statusReport = statusDependenciesModule.reportsByMainUtility.get('Self Reference')

                if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the beginning of a month.
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[WARN] getContextVariables -> Status Report does not exist. Retrying Later. ")
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                    return
                }

                if (statusReport.status === "Status Report is corrupt.") {
                    TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                        processIndex,
                        MODULE_NAME,
                        'Dataset Type Standard Converter',
                        { errorDetails: "getContextVariables -> getOwnStatusReport -> Can not continue because dependency Status Report is corrupt. " },
                        'Status Report Is Corrupt',
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput
                    )
                }

                thisReport = statusReport.file
            }

            if (thisReport.lastFile !== undefined) {
                /*
                We get in here when the report already exists, meaning that this process
                has successfully ran before at least once.
                */
                contextVariables.beginingOfMarket = new Date(thisReport.beginingOfMarket)

                if (contextVariables.beginingOfMarket.valueOf() !== contextVariables.datetimeBeginingOfMarketFile.valueOf()) { // Reset Mechanism for Beginning of the Market
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] getContextVariables -> getOwnStatusReport-> Reset Mechanism for Beginning of the Market Activated.")

                    contextVariables.beginingOfMarket = new Date(
                        contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                        (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                        contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                        SA.projects.foundations.globals.timeConstants.GMT_SECONDS)
                    contextVariables.datetimeLastProducedFile = new Date(
                        contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                        (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                        contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                        SA.projects.foundations.globals.timeConstants.GMT_SECONDS)
                    contextVariables.datetimeLastProducedFile = new Date(
                        contextVariables.datetimeLastProducedFile.valueOf() -
                        SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) // Go back one day to start well.

                    callbackFirstRun()
                    return
                }

                contextVariables.datetimeLastProducedFile = new Date(thisReport.lastFile)
                /*
                Here we assume that the last day written might contain incomplete information. 
                This actually happens every time the head of the market is reached.
                For that reason we go back one day, the partial information is discarded and 
                added again with whatever new info is available.
                */
                contextVariables.datetimeLastProducedFile = new Date(contextVariables.datetimeLastProducedFile.valueOf() - SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

                callbackNotFirstRun()
                return
            } else {
                /*
                We get in here when the report does not exist, meaning that this process
                has never ran successfully before at least once.
                */
                contextVariables.beginingOfMarket = new Date(
                    contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                    (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                    contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                    SA.projects.foundations.globals.timeConstants.GMT_SECONDS)
                contextVariables.datetimeLastProducedFile = new Date(
                    contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                    (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                    contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                    SA.projects.foundations.globals.timeConstants.GMT_SECONDS)
                contextVariables.datetimeLastProducedFile = new Date(
                    contextVariables.datetimeLastProducedFile.valueOf() -
                    SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) // Go back one day to start well.

                callbackFirstRun()
                return
            }

        } catch (err) {

            if (err.message === "Cannot read property 'file' of undefined") {
                err.errorDetails = [
                    "[HINT] getContextVariables -> getOwnStatusReport-> Check the bot configuration to see if all of its statusDependencies declarations are correct. ",
                    "[HINT] getContextVariables -> getOwnStatusReport-> Dependencies loaded -> keys = " + JSON.stringify(statusDependenciesModule.keys),
                    "[HINT] getContextVariables -> getOwnStatusReport-> Dependencies loaded -> Double check that you are not running a process that only can be run at noTime mode at a certain month when it is not prepared to do so."
                ]
            }
            TS.projects.foundations.utilities.errorHandlingFunctions.throwHandledException(
                processIndex,
                MODULE_NAME,
                'Dataset Type Standard Converter',
                err,
                'Get Context Variables Failed',
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput
            )
        }
    }

    function advanceTime(
        fromDate,
        lastDate,
        contextVariables,
        nextFunctionToCall,
        processIndex,
        callBackFunction
    ) {
        /*
        We position ourselves on the latest date that was added to the market files
        since we are going to re-process that date, removing first the elements of that 
        date and then adding again all the elements found right now at that date and then
        from there into the future.
        */
        contextVariables.datetimeLastProducedFile = new Date(contextVariables.datetimeLastProducedFile.valueOf() +
            SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[INFO] advanceTime -> New processing time @ " +
            contextVariables.datetimeLastProducedFile.getUTCFullYear() + "/" +
            (contextVariables.datetimeLastProducedFile.getUTCMonth() + 1) + "/" +
            contextVariables.datetimeLastProducedFile.getUTCDate() + ".")

        /* Validation that we are not going past the head of the market. */
        if (contextVariables.datetimeLastProducedFile.valueOf() > contextVariables.datetimeLastAvailableDependencyFile.valueOf()) {

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[INFO] advanceTime -> Head of the market found @ " +
                contextVariables.datetimeLastProducedFile.getUTCFullYear() + "/" +
                (contextVariables.datetimeLastProducedFile.getUTCMonth() + 1) + "/" +
                contextVariables.datetimeLastProducedFile.getUTCDate() + ".")

            /*
            Here is where we finish processing and wait for the bot to run this module again.
            */
            doHeartBeat()
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
            return
        }

        doHeartBeat()

        function doHeartBeat() {
            /*  Telling the world we are alive and doing well */
            let currentDateString =
                contextVariables.datetimeLastProducedFile.getUTCFullYear() + '-' +
                SA.projects.foundations.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCMonth() + 1, 2) + '-' +
                SA.projects.foundations.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCDate(), 2)
            let currentDate = new Date(contextVariables.datetimeLastProducedFile)
            let percentage = TS.projects.foundations.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, currentDateString, percentage)

            if (TS.projects.foundations.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage)
            }
        }

        nextFunctionToCall()
    }

    function nextDependencyDailyFile(
        contextVariables,
        node,
        aggregateAndWriteOutputFile,
        fileStorage,
        processIndex,
        callBackFunction
    ) {
        /*
        Here is where we read Data Dependency's files and add their content to whatever
        we already have in our arrays in-memory. In this way the process will run as 
        many days needed and it should only stop when it reaches
        the head of the market.
        */
        const ONE_MIN_DATASET_TYPE = "One-Min"

        let dateForPath = contextVariables.datetimeLastProducedFile.getUTCFullYear() + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCMonth() + 1, 2) + '/' +
            SA.projects.foundations.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCDate(), 2)

        let fileName = "Data.json"

        let filePathRoot =
            'Project/' +
            TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
            node.dataDependency.referenceParent.parentNode.parentNode.config.codeName + '/' +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
            TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName

        let filePath = filePathRoot + "/Output/" + node.dataDependency.referenceParent.parentNode.config.codeName + '/' + ONE_MIN_DATASET_TYPE + '/' + dateForPath;
        filePath += '/' + fileName

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[INFO] nextDependencyDailyFile -> getting file at dateForPath = " + dateForPath)

        fileStorage.getTextFile(filePath, onFileReceived, true) // Not Retry flag set to true, because we expect some days not to have files if the process was not ran.

        function onFileReceived(err, text) {
            try {
                let dependencyDailyFile

                if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                    try {
                        dependencyDailyFile = JSON.parse(text)
                    } catch (err) {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] nextDependencyDailyFile -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] nextDependencyDailyFile -> onFileReceived -> Assuming this is a temporary situation. Requesting a Retry.")
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
                        return
                    }
                } else {
                    if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {
                        /*
                        When a Dependency Daily File does not exist, we will assume that the process
                        of fetching data was not ran at that day and that day was skipped. In such a situation
                        we will produce an empty array so that this process can continue without getting stuck
                        at this date where a file is missing.
                        */
                        dependencyDailyFile = JSON.parse("[]")
                    } else {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] nextDependencyDailyFile -> onFileReceived -> Error Received -> err = " + err.stack)
                        callBackFunction(err)
                        return
                    }
                }
                aggregateAndWriteOutputFile(dependencyDailyFile)

            } catch (err) {
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[ERROR] nextDependencyDailyFile -> onFileReceived -> err = " + err.stack)
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            }
        }
    }

    function generateOutputFileContent(
        node,
        outputElements
    ) {
        let separator = ""
        let fileContent = ""

        for (let i = 0; i < outputElements.length; i++) {
            let element = outputElements[i]

            fileContent = fileContent + separator + '['
            let propertySeparator = ""

            for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                if (property.config.isString === true) {
                    fileContent = fileContent + propertySeparator + '"' + element[property.config.codeName] + '"'
                } else {
                    fileContent = fileContent + propertySeparator + element[property.config.codeName]
                }
                propertySeparator = ","
            }

            fileContent = fileContent + "]"

            separator = ","
        }

        fileContent = "[" + fileContent + "]"
        return fileContent
    }

    function aggregateFileContent(
        node,
        contextVariables,
        dependencyDailyFile,
        outputElementsArray,
        TIME_FRAME_VALUE
    ) {

        const INPUT_FILE_TIME_FRAME_VALUE = 24 * 60 * 60 * 1000                         // 24 hs
        const TOTAL_OUTPUT_ELEMENTS = INPUT_FILE_TIME_FRAME_VALUE / TIME_FRAME_VALUE
        const STARTING_DATE_VALUE = contextVariables.datetimeLastProducedFile.valueOf()
        /*
        The algorithm that follows is going to aggregate elements of 1 min timeFrame
        read from Data Dependency File, into elements of each timeFrame. 
        */
        for (let i = 0; i < TOTAL_OUTPUT_ELEMENTS; i++) {

            let saveElement = false
            /*
            Initialize the outputElement object. 
            */
            let outputElement = {}                  // This will be the object that we will eventually save.
            let outputElementAverage = {}           // We will use this object to help us aggregate values by calculating an average.
            /*
            Set the output element the default values for each of it's properties.
            */
            for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                let property = node.outputDataset.referenceParent.parentNode.record.properties[j]

                if (property.config.isString === true || property.config.isDate === true) {
                    outputElement[property.config.codeName] = ""            // Default Value
                } else {
                    outputElement[property.config.codeName] = 0             // Default Value
                }
                if (property.config.isBoolean === true) {
                    outputElement[property.config.codeName] = false         // Default Value
                }
            }
            /*
            Setting the begin and end for this element.
            */
            outputElement.begin = STARTING_DATE_VALUE + i * TIME_FRAME_VALUE;
            outputElement.end = STARTING_DATE_VALUE + (i + 1) * TIME_FRAME_VALUE - 1;
            /*
            We will go through all the records of the dependency file. Each record is an
            array of values or the properties defined at the Record Definition node.
            */
            for (let j = 0; j < dependencyDailyFile.length; j++) {
                /*
                The element object it the object inflated out of the values stored at the file with 
                the property names taken from the Record Definition of the Dependency's Product.
                */
                let element = {}
                /*
                The record object is what we use in order to build the element object.It represents
                one record at the dependency file.
                */
                let record = {}
                record.values = dependencyDailyFile[j]
                record.map = new Map()
                /*
                Set up the Data Dependency Record Map and Data Dependency Element Object
                */
                for (let k = 0; k < node.dataDependency.referenceParent.parentNode.record.properties.length; k++) {
                    let property = node.dataDependency.referenceParent.parentNode.record.properties[k]
                    record.map.set(property.config.codeName, record.values[k])
                    element[property.config.codeName] = record.values[k]
                }
                /* 
                Here we discard all the elements out of range based on the begin and end properties of
                the Data Dependency element. 
                */
                if (
                    element.begin !== undefined &&
                    element.end !== undefined &&
                    element.begin >= outputElement.begin &&
                    element.end <= outputElement.end) {
                    aggregateElements()
                }
                /*
                If the Timestamp is not a numeric value, then we will convert it to it.
                */
                if (element.timestamp !== undefined && isNaN(element.timestamp)) {
                    element.timestamp = (new Date(element.timestamp)).valueOf()
                }
                /* 
                Here we discard all the elements out of range based on the timestamp property of
                the Data Dependency element. 
                */
                if (
                    element.timestamp !== undefined &&
                    element.timestamp >= outputElement.begin &&
                    element.timestamp <= outputElement.end) {
                    aggregateElements()
                }

                function aggregateElements() {

                    aggregationMethodFirst()
                    aggregationMethodLast()
                    aggregationMethodMin()
                    aggregationMethodMax()
                    aggregationMethodSum()
                    aggregationMethodAvg()

                    saveElement = true

                    function aggregationMethodFirst() {
                        /*
                        Here we process the FIRST type of aggregation.
                        */
                        if (saveElement === false) {

                            for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                                let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                                if (property.config.aggregationMethod === 'First') {
                                    outputElement[property.config.codeName] = record.map.get(property.config.codeName)
                                }
                            }
                        }
                    }

                    function aggregationMethodLast() {
                        /* 
                        This is the LAST type of aggregation.
 
                        Everything that follows will be set for each element overriding the previous
                        ones, so only the last values will survive. 
                        */
                        for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                            let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                            if (property.config.aggregationMethod === 'Last') {
                                outputElement[property.config.codeName] = record.map.get(property.config.codeName)
                            }
                        }
                    }

                    function aggregationMethodMin() {
                        /* 
                        This is the MIN type of aggregation.
 
                        Note that to be able to calculate the minimum, we will be assigning to all properties the first 
                        element values, so as to have a baseline from where to compare later on.
                        */
                        for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                            let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                            if (property.config.aggregationMethod === 'Min' || saveElement === false) {
                                if (outputElement[property.config.codeName] === 0) { // Set initial value if default value is present
                                    outputElement[property.config.codeName] = record.map.get(property.config.codeName)
                                } else if (record.map.get(property.config.codeName) < outputElement[property.config.codeName]) {
                                    outputElement[property.config.codeName] = record.map.get(property.config.codeName)
                                }
                            }
                        }
                    }

                    function aggregationMethodMax() {
                        /* 
                        This is the MAX type of aggregation.
                        */
                        for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                            let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                            if (property.config.aggregationMethod === 'Max') {
                                if (record.map.get(property.config.codeName) > outputElement[property.config.codeName]) {
                                    outputElement[property.config.codeName] = record.map.get(property.config.codeName)
                                }
                            }
                        }
                    }

                    function aggregationMethodSum() {
                        /* 
                        This is the SUM type of aggregation.
                        */
                        for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                            let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                            if (property.config.aggregationMethod === 'Sum') {
                                outputElement[property.config.codeName] = outputElement[property.config.codeName] + record.map.get(property.config.codeName)
                            }
                        }
                    }

                    function aggregationMethodAvg() {
                        /* 
                        This is the AVG type of aggregation.
                        */
                        for (let j = 0; j < node.outputDataset.referenceParent.parentNode.record.properties.length; j++) {
                            let property = node.outputDataset.referenceParent.parentNode.record.properties[j]
                            if (property.config.aggregationMethod === 'Avg') {

                                if (outputElementAverage[property.config.codeName] === undefined) {
                                    outputElementAverage[property.config.codeName] = {}
                                    outputElementAverage[property.config.codeName].sum = 0
                                    outputElementAverage[property.config.codeName].count = 0
                                }

                                outputElementAverage[property.config.codeName].sum = outputElementAverage[property.config.codeName].sum + record.map.get(property.config.codeName)
                                outputElementAverage[property.config.codeName].count = outputElementAverage[property.config.codeName].count + 1

                                outputElement[property.config.codeName] = outputElementAverage[property.config.codeName].sum / outputElementAverage[property.config.codeName].count
                            }
                        }
                    }
                }
            }
            if (saveElement === true) {      // then we have a valid element, otherwise it means there were no elements to fill this one in its time range.
                outputElementsArray.push(outputElement)
            }
        }
    }

    function writeStatusReport(
        statusDependenciesModule,
        contextVariables,
        lastFileDate,
        callBack,
        processIndex,
        callBackFunction
    ) {
        try {
            let thisReport = statusDependenciesModule.reportsByMainUtility.get('Self Reference')

            thisReport.file.lastExecution = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME
            thisReport.file.lastFile = lastFileDate
            thisReport.file.beginingOfMarket = contextVariables.beginingOfMarket.toUTCString()
            thisReport.save(callBack)
        }
        catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] writeStatusReport -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}