exports.newSuperalgosBotModulesFromOneMinToMultiPeriodMarket = function (processIndex) {
    /*
        This process is going to do the following:
    
        Read the elements (elements, volumens, bolllinger bands, news, asset metrics, etc.) from a
        One-Min dataset (a dataset that is organized with elements spanning one min, like one min elements,
        or elements with a timestamp captured approximatelly one minute from each other), and the dataset itself
        organized in Daily Files.
        
        It is going to output a Market Files dataset for every Market Time Frame, aggregating the 
        input information into elements with a begin and end property. 
        
        Everytime this process run, is be able to resume its job and process everything pending until 
        reaching the head of the market. To achieve that it will follow this strategy:
    
        1. First it will read the last file written by this same process, and load all the information into 
        in-memory arrays. 
        
        2. Then it will append to these arrays the new information it gets from the data dependency.
    
        3. It knows from it's status report which was the last DAY it processed. Since that day might not have been 
        full of that (maybe it was at the head of the market). The process will have to be carefull not to append elements 
        that are already there. To take care of that, it will discard all elements of the last processed day, 
        and then it will process that full day again adding all the elements found at the current run.
    */
    const MODULE_NAME = "From One Min To Multi Period Market"
    const ONE_MIN_DATASET_TYPE = "One-Min"

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start
    }

    let fileStorage = TS.projects.superalgos.taskModules.fileStorage.newFileStorage(processIndex)

    let statusDependencies
    let dataDependenciesModule
    let beginingOfMarket
    let dataDependencyNode 
    let outputDatasetNode

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, callBackFunction) {

        statusDependencies = pStatusDependencies
        dataDependenciesModule = pDataDependencies
        /*
        This Framework have a few contraints that we are going to check right here.
        One of them is the fact that it can only accept one data dependency. The 
        reason why is because the purpose of this framwork is to produce a transformation
        between one dataset type (One-Min) to another dataset type (Multi-Period-Market).
        To do that it can only handle one dependency and it will only produce one output.

        If the user has defined more than one data dependency or more than one output, we
        are going to stop right here so that the user gets the message that this framework
        is not to merge information and splitted into multiple outputs.
        */
        if (dataDependenciesModule.curatedDependencyNodeArray.length > 0) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> Validation Check Not Passed -> Expecting only one Data Dependency. Found = " + dataDependenciesModule.curatedDependencyNodeArray.length);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            return
        } else {
            dataDependencyNode = dataDependenciesModule.curatedDependencyNodeArray[0]
        }

        let outputDatasets = TS.projects.superalgos.utilities.nodeFunctions.nodeBranchToArray(
            TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.processOutput, 'Output Dataset'
        )

        if (outputDatasets.length > 0) {
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> Validation Check Not Passed -> Expecting only one Output Dataset. Found = " + outputDatasets.length);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
            return
        } else {
            outputDatasetNode = outputDatasets[0]
        }

        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE)
    }

    function finalize() {
        fileStorage = undefined
        statusDependencies = undefined
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
                datetimeLastAvailableDependencyFile: undefined              // Datetime of the last file available to be used as an input of this process.
            };

            getContextVariables();

            function getContextVariables() {
                try {
                    let thisReport
                    let reportKey
                    let statusReport

                    detectWhereTheMarketBegins()
                    detectWhereTheMarketBegins()
                    getOwnStatusReport()

                    function detectWhereTheMarketBegins() {
                        /* 
                        We look first for Status Report that will tell us when the market starts. 
                        */
                        statusReport = statusDependencies.reportsByMainUtility.get('Market Starting Point');

                        if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                            return
                        }

                        if (statusReport.status === "Status Report is corrupt.") {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                            return
                        }

                        thisReport = statusDependencies.statusReports.get(reportKey).file;

                        if (thisReport.beginingOfMarket === undefined) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                            let customOK = {
                                result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                                message: "Dependency does not exist."
                            }
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK)
                            return
                        }

                        contextVariables.datetimeBeginingOfMarketFile = new Date(
                            thisReport.beginingOfMarket.year + "-" +
                            thisReport.beginingOfMarket.month + "-" +
                            thisReport.beginingOfMarket.days + " " +
                            thisReport.beginingOfMarket.hours + ":" +
                            thisReport.beginingOfMarket.minutes +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)
                    }

                    function detectWhereTheMarketBegins() {
                        /* 
                        Second, we get the report from Exchange Raw Data, to know when the marted ends. 
                        */
                        statusReport = statusDependencies.reportsByMainUtility.get('Market Ending Point')

                        if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                            return;
                        }

                        if (statusReport.status === "Status Report is corrupt.") {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                            return;
                        }

                        thisReport = statusDependencies.statusReports.get(reportKey).file;

                        if (thisReport.lastFile === undefined) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                            let customOK = {
                                result: TS.projects.superalgos.globals.standardResponses.CUSTOM_OK_RESPONSE.result,
                                message: "Dependency not ready."
                            }
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                            callBackFunction(customOK);
                            return;
                        }

                        contextVariables.datetimeLastAvailableDependencyFile = new Date(
                            thisReport.lastFile.year + "-" +
                            thisReport.lastFile.month + "-" +
                            thisReport.lastFile.days + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS)
                    }

                    function getOwnStatusReport() {
                        /* 
                        Finally we get our own Status Report. 
                        */
                        statusReport = statusDependencies.reportsByMainUtility.get('Self Reference')

                        if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                            return
                        }

                        if (statusReport.status === "Status Report is corrupt.") {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            return
                        }

                        thisReport = statusDependencies.statusReports.get(reportKey).file
                    }

                    if (thisReport.lastFile !== undefined) {
                        /*
                        We get in here when the report already exists, meaning that this process
                        has succesfully ran before at least once.
                        */
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Process Running not for the very first time. -> reportKey = " + reportKey);

                        beginingOfMarket = new Date(thisReport.beginingOfMarket);

                        if (beginingOfMarket.valueOf() !== contextVariables.datetimeBeginingOfMarketFile.valueOf()) { // Reset Mechanism for Begining of the Market
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> getContextVariables -> Reset Mechanism for Begining of the Market Activated. -> reportKey = " + reportKey);

                            beginingOfMarket = new Date(
                                contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                                (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                                contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                                TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                            contextVariables.datetimeLastProducedFile = new Date(
                                contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                                (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                                contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                                TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                            contextVariables.datetimeLastProducedFile = new Date(
                                contextVariables.datetimeLastProducedFile.valueOf() -
                                TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                            buildOutput()
                            return
                        }

                        contextVariables.datetimeLastProducedFile = new Date(thisReport.lastFile);

                        /*
                        Here we assume that the last day written might contain incomplete information. 
                        This actually happens every time the head of the market is reached.
                        For that reason we go back one day, the partial information is discarded and 
                        added again with whatever new info is available.
                        */
                        contextVariables.datetimeLastProducedFile = new Date(contextVariables.datetimeLastProducedFile.valueOf() - TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                        loadExistingFiles()
                        return
                    } else {
                        /*
                        We get in here when the report does not exist, meaning that this process
                        has never ran succesfully before at least once.
                        */
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> getContextVariables -> Process Running for the very first time. -> reportKey = " + reportKey);

                        beginingOfMarket = new Date(
                            contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                            (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                            contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                        contextVariables.datetimeLastProducedFile = new Date(
                            contextVariables.datetimeBeginingOfMarketFile.getUTCFullYear() + "-" +
                            (contextVariables.datetimeBeginingOfMarketFile.getUTCMonth() + 1) + "-" +
                            contextVariables.datetimeBeginingOfMarketFile.getUTCDate() + " " + "00:00" +
                            TS.projects.superalgos.globals.timeConstants.GMT_SECONDS);
                        contextVariables.datetimeLastProducedFile = new Date(
                            contextVariables.datetimeLastProducedFile.valueOf() -
                            TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                        buildOutput()
                        return
                    }

                } catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> Double check that you are not running a process that only can be run at noTime mode at a certain month when it is not prepared to do so.");
                    }
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function loadExistingFiles() {
                /*
                This is where we read the current files we have produced at previous runs 
                of this same process. We just read all the content and organize it
                in arrays and keep them in memory.
                */
                try {
                    let n = 0                       // loop Variable representing each possible time frame as defined at the time frames array.
                    let allPreviousElements = []    // Each item of this array is an array of elements for a certain time frame

                    loopBody()

                    function loopBody() {
                        let timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> loadExistingFiles -> loopBody -> timeFrame = " + timeFrame)

                        let previousElements

                        readExistingFile()

                        function readExistingFile() {
                            let fileName = 'Data.json';
                            let filePath =
                                TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                                "/Output/" +
                                outputDatasetNode.referenceParent.parentNode.config.codeName + "/" + // Product Name
                                TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                                timeFrame;
                            filePath += '/' + fileName

                            fileStorage.getTextFile(filePath, onFileReceived);

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> loadExistingFiles -> loopBody -> readExistingFile -> getting file.");

                            function onFileReceived(err, text) {
                                let dailyFile

                                if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    try {
                                        dailyFile = JSON.parse(text);
                                        previousElements = dailyFile;
                                        allPreviousElements.push(previousElements);

                                        controlLoop()

                                    } catch (err) {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> fileName = " + fileName);
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> filePath = " + filePath);
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = " + err.stack);
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                    }
                                } else {
                                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> loadExistingFiles -> loopBody -> readExistingFile -> onFileReceived -> err = " + err.stack);
                                    callBackFunction(err);
                                }
                            }
                        }
                    }

                    function controlLoop() {
                        n++
                        if (n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                            loopBody()
                        } else {
                            buildOutput(allPreviousElements);
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> loadExistingFiles -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildOutput(allPreviousElements) {

                try {
                    let fromDate = new Date(contextVariables.datetimeLastProducedFile.valueOf())
                    let lastDate = TS.projects.superalgos.utilities.dateTimeFunctions.removeTime(new Date())
                    /*
                    Firstly we prepere the arrays that will accumulate all the information for each output file.
                    */
                    let outputElements = [];

                    for (let n = 0; n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length; n++) {
                        const emptyArray1 = [];
                        const emptyArray2 = [];
                        outputElements.push(emptyArray1);
                    }

                    advanceTime()

                    function advanceTime() {
                        /*
                        We position ourselves on the latest date that was added to the market files
                        since we are going to re-process that date, removing first the elements of that 
                        date and then adding again all the elements found right now at that date and then
                        from there into the future.
                        */
                        contextVariables.datetimeLastProducedFile = new Date(contextVariables.datetimeLastProducedFile.valueOf() + TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS);

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> buildOutput -> advanceTime -> New processing time @ " + contextVariables.datetimeLastProducedFile.getUTCFullYear() + "/" + (contextVariables.datetimeLastProducedFile.getUTCMonth() + 1) + "/" + contextVariables.datetimeLastProducedFile.getUTCDate() + ".")

                        /* Validation that we are not going past the head of the market. */
                        if (contextVariables.datetimeLastProducedFile.valueOf() > contextVariables.datetimeLastAvailableDependencyFile.valueOf()) {

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> buildOutput -> advanceTime -> Head of the market found @ " + contextVariables.datetimeLastProducedFile.getUTCFullYear() + "/" + (contextVariables.datetimeLastProducedFile.getUTCMonth() + 1) + "/" + contextVariables.datetimeLastProducedFile.getUTCDate() + ".")

                            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE); // Here is where we finish processing and wait for the platform to run this module again.
                            return
                        }

                        /*  Telling the world we are alive and doing well */
                        let currentDateString =
                            contextVariables.datetimeLastProducedFile.getUTCFullYear() + '-' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCMonth() + 1, 2) + '-' +
                            TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCDate(), 2);
                        let currentDate = new Date(contextVariables.datetimeLastProducedFile)
                        let percentage = TS.projects.superalgos.utilities.dateTimeFunctions.getPercentage(fromDate, currentDate, lastDate)
                        TS.projects.superalgos.functionLibraries.processFunctions.processHeartBeat(processIndex, currentDateString, percentage)

                        if (TS.projects.superalgos.utilities.dateTimeFunctions.areTheseDatesEqual(currentDate, new Date()) === false) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.newInternalLoop(currentDate, percentage);
                        }
                        timeframesLoop()
                    }

                    function timeframesLoop() {
                        /*
                        We will iterate through all posible time frames.
                        */
                        let n = 0   // loop Variable representing each possible period as defined at the periods array.

                        loopBody()

                        function loopBody() {
                            let previousElements // This is an array with all the elements already existing for a certain time frame.

                            if (allPreviousElements !== undefined) {
                                previousElements = allPreviousElements[n];
                            }

                            const outputPeriod = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][0];
                            const timeFrame = TS.projects.superalgos.globals.timeFrames.marketFilesPeriods()[n][1];
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
                                    let element = {
                                        open: previousElements[i][2],
                                        close: previousElements[i][3],
                                        min: previousElements[i][0],
                                        max: previousElements[i][1],
                                        begin: previousElements[i][4],
                                        end: previousElements[i][5]
                                    }

                                    if (element.end < contextVariables.datetimeLastProducedFile.valueOf()) {
                                        outputElements[n].push(element);
                                    } else {
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[INFO] start -> buildOutput -> timeframesLoop -> loopBody -> Element # " + i + " @ " + timeFrame + " discarded for closing past the current process time.")
                                    }
                                }
                                allPreviousElements[n] = [] // erasing these so as not to duplicate them.
                            }
                            /*
                            From here on is where every iteration of the loop fully runs. Here is where we 
                            read Exchange Raw Data's files and add their content to whatever
                            we already have in our arrays in-memory. In this way the process will run as 
                            many days needed and it should only stop when it reaches
                            the head of the market.
                            */
                            nextDailyFile();

                            function nextDailyFile() {
                                let dateForPath = contextVariables.datetimeLastProducedFile.getUTCFullYear() + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCMonth() + 1, 2) + '/' + TS.projects.superalgos.utilities.miscellaneousFunctions.pad(contextVariables.datetimeLastProducedFile.getUTCDate(), 2);
                                let fileName = "Data.json"

                                let filePathRoot =
                                    'Project/' +
                                    TS.projects.superalgos.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.type.replace(' ', '-') + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "/" +
                                    "Exchange-Raw-Data" + '/' + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName + "/" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "-" +
                                    TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
                                let filePath = filePathRoot + "/Output/" + dataDependencyNode.referenceParent.parentNode.config.codeName + '/' + ONE_MIN_DATASET_TYPE + '/' + dateForPath;
                                filePath += '/' + fileName

                                fileStorage.getTextFile(filePath, onFileReceived);

                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> getting file at dateForPath = " + dateForPath);

                                function onFileReceived(err, text) {
                                    try {
                                        let dailyFile

                                        if (err.result === TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                dailyFile = JSON.parse(text);
                                            } catch (err) {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> Error Parsing JSON -> err = " + err.stack);
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                                return
                                            }
                                        } else {

                                            if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {

                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> Dependency Not Ready -> err = " + JSON.stringify(err));
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                                                return

                                            } else {
                                                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> Error Received -> err = " + err.stack);
                                                callBackFunction(err)
                                                return
                                            }
                                        }

                                        const inputElementPerdiod = 60 * 1000;              // 1 min
                                        const inputFilePeriod = 24 * 60 * 60 * 1000;        // 24 hs
                                        let totaloutputElements = inputFilePeriod / outputPeriod; // this should be 2 in this case.
                                        let beginingOutputTime = contextVariables.datetimeLastProducedFile.valueOf();
                                        /*
                                        The algorithm that follows is going to agregate elements of 1 min timeFrame read from Exchange Raw Data, into elements of each timeFrame
                                        that Candles Volumes generates. For market files those timePediods goes from 1h to 24hs.
                                        */
                                        for (let i = 0; i < totaloutputElements; i++) {

                                            let outputElement = {
                                                open: 0,
                                                close: 0,
                                                min: 0,
                                                max: 0,
                                                begin: 0,
                                                end: 0
                                            };

                                            let saveElement = false;
                                            outputElement.begin = beginingOutputTime + i * outputPeriod;
                                            outputElement.end = beginingOutputTime + (i + 1) * outputPeriod - 1;

                                            for (let j = 0; j < dailyFile.length; j++) {
                                                let element = {
                                                    open: dailyFile[j][2],
                                                    close: dailyFile[j][3],
                                                    min: dailyFile[j][0],
                                                    max: dailyFile[j][1],
                                                    begin: dailyFile[j][4],
                                                    end: dailyFile[j][5]
                                                }
                                                /* Here we discard all the elements out of range.  */
                                                if (element.begin >= outputElement.begin && element.end <= outputElement.end) {

                                                    if (saveElement === false) { // this will set the value only once.
                                                        outputElement.open = element.open;
                                                        outputElement.min = element.min;
                                                        outputElement.max = element.max;
                                                    }

                                                    saveElement = true;
                                                    outputElement.close = element.close;      // only the last one will be saved
                                                    if (element.min < outputElement.min) {
                                                        outputElement.min = element.min;
                                                    }
                                                    if (element.max > outputElement.max) {
                                                        outputElement.max = element.max;
                                                    }
                                                }
                                            }
                                            if (saveElement === true) {      // then we have a valid element, otherwise it means there were no elements to fill this one in its time range.
                                                outputElements[n].push(outputElement);
                                            }
                                        }
                                        writeFile(outputElements[n], timeFrame, controlLoop);

                                    } catch (err) {
                                        TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> buildOutput -> timeframesLoop -> loopBody -> nextDailyFile -> onFileReceived -> err = " + err.stack);
                                        callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }

                        function controlLoop() {

                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[INFO] start -> buildOutput -> timeframesLoop -> controlLoop -> Entering function.")
                            n++
                            if (n < TS.projects.superalgos.globals.timeFrames.marketFilesPeriods().length) {
                                loopBody()
                            } else {
                                writeStatusReport(contextVariables.datetimeLastProducedFile, advanceTime);
                            }
                        }
                    }
                }
                catch (err) {
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> buildOutput -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFile(elements, timeFrame, callBack) {

                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] start -> writeFile -> Entering function.")
                /*
                Here we will write the contents of the file to disk.
                */
                try {

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> writeFile -> Entering function.")

                    let separator = ""
                    let fileRecordCounter = 0
                    let fileContent = ""

                    for (let i = 0; i < elements.length; i++) {
                        let element = elements[i];
                        fileContent = fileContent + separator + '[' + elements[i].min + "," + elements[i].max + "," + elements[i].open + "," + elements[i].close + "," + elements[i].begin + "," + elements[i].end + "]";
                        if (separator === "") { separator = ","; }
                        fileRecordCounter++
                    }

                    fileContent = "[" + fileContent + "]";

                    let fileName = 'Data.json';
                    let filePath = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT +
                        "/Output/" +
                        outputDatasetNode.referenceParent.parentNode.config.codeName + "/" +
                        TS.projects.superalgos.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName + "/" +
                        timeFrame
                    filePath += '/' + fileName

                    fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);

                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> writeFile -> creating file at filePath = " + filePath);

                    function onFileCreated(err) {
                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[INFO] start -> writeFile -> onFileCreated -> Entering function.")

                        if (err.result !== TS.projects.superalgos.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeFile -> onFileCreated -> err = " + err.stack)
                            callBackFunction(err)
                            return
                        }

                        TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[WARN] start -> writeFile -> onFileCreated ->  Finished with File @ " + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName + "_" + TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName)
                        callBack()
                    }

                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeFile -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, callBack) {
                TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                    "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate)

                try {
                    let reportKey = "Masters" + "-" + "Candles-Volumes" + "-" + "Multi-Period-Market"
                    let thisReport = statusDependencies.statusReports.get(reportKey)

                    thisReport.file.lastExecution = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_DATETIME
                    thisReport.file.lastFile = lastFileDate
                    thisReport.file.beginingOfMarket = beginingOfMarket.toUTCString()
                    thisReport.save(callBack)
                }
                catch (err) {
                    TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
                }
            }
        }
        catch (err) {
            TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.superalgos.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.superalgos.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }
}
