exports.newDataMiningBotModulesScanDatabase = function (processIndex) {

    const MODULE_NAME = "Scan Database";
    // TODO: set up dynamic folder names from dataset defintion us name of product and dataset node names
    const DATA_FOLDER_NAME = "Scanned-Data/One-Min";
    const RAWDATA_FOLDER_NAME = "Raw-Scanned-Data/One-Min";

    let thisObject = {
        initialize: initialize,
        start: start
    };

    // TODO: move comments to new logger

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies
    
    let thisReport;
    let processIsRunning = false
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let dbPath = undefined
    let dbTable = undefined
    let dbTimestamp = undefined
    let uiStartDate = undefined
    let datasetDef = undefined
    let recordDef = undefined
    let currentNewData = undefined

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies;

            // TODO: handle error in configs with hints
            dbPath = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databasePath
            dbTable = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databaseTableName
            dbTimestamp = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databaseTimestampColumn
            uiStartDate = new Date(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.startDate)
            datasetDef = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[0].referenceParent.processOutput.outputDatasetFolders[0].outputDatasets[0].referenceParent
            recordDef = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[0].referenceParent.processOutput.outputDatasetFolders[0].outputDatasets[0].referenceParent.parentNode.record

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            SA.logger.error(MODULE_NAME + " initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        if (processIsRunning === false) {
            SA.logger.info(MODULE_NAME + " Starting Scanner")
            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  "Starting Scanner") // tell the world we are alive and doing well                                

            processIsRunning = true
            try {

            let mustLoadRawData = false

            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            firstTimeGetDatabaseData = TS.projects.dataMining.functionLibraries.databaseAccess.firstCallToSQLiteDB
            getDatabaseData = TS.projects.dataMining.functionLibraries.databaseAccess.callToSQLiteDB

            SA.logger.info(MODULE_NAME + " Connecting to Database")
            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  "Connecting to Database") // tell the world we are alive and doing well                                
        
            getContextVariables(dbPath, dbTable, firstTimeGetDatabaseData, getDatabaseData)

            function getContextVariables(dbPath, dbTable, callBack, secondCallBack) {
                try {
                    let reportKey = 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "-" + 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "-" + 
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName

                    SA.logger.info(MODULE_NAME +" start -> getContextVariables -> reportKey = " + reportKey)

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        SA.logger.error(MODULE_NAME + " start -> getContextVariables -> Can not continue because dependency Status Report is corrupt. ");
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    //TODO: getDataStart to determine the start of date if the uiStartDate is not specified or inaccurate 
                    /* Check if the uiStartDate is Invalid, if so lets set it to the Epoch and let the getDataStart function later take care of it */
                    if(isNaN(uiStartDate)) {
                        uiStartDate = new Date(0)
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.beginingOfMarket !== undefined) { // This means this is not the first time this process has run.
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket);
                        lastFile = new Date(thisReport.file.lastFile);
                        defineSince()
                        secondCallBack(dbPath, dbTable, dbTimestamp, thisReport.file.lastRun, processAndSaveMessages)

                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        beginingOfMarket = new Date(uiStartDate.valueOf())
                        defineSince()
                        callBack(dbPath, dbTable, dbTimestamp, beginingOfMarket, processAndSaveMessages)
                    }

                    function defineSince() {
                        if (thisReport.file.uiStartDate === undefined) {
                            thisReport.file.uiStartDate = uiStartDate
                        } else {
                            thisReport.file.uiStartDate = new Date(thisReport.file.uiStartDate)
                        }
                        if (uiStartDate.valueOf() !== thisReport.file.uiStartDate.valueOf()) {
                            initialProcessTimestamp = uiStartDate.valueOf()
                            beginingOfMarket = new Date(uiStartDate.valueOf())
                        } else {
                            if (lastFile !== undefined) {
                                initialProcessTimestamp = lastFile.valueOf()
                                if (thisReport.file.mustLoadRawData !== undefined) {
                                    mustLoadRawData = thisReport.file.mustLoadRawData
                                }
                            } else {
                                initialProcessTimestamp = uiStartDate.valueOf()
                            }
                        }
                    }
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    SA.logger.error(MODULE_NAME + " start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        SA.logger.error("[HINT] " + MODULE_NAME + " start -> getContextVariables -> Check the bot Status Dependencies. ");
                        SA.logger.error("[HINT] " + MODULE_NAME + " start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function processAndSaveMessages(dataArray) {
                try {
                    /* 
                    What we are going to do in this function is to save all data  
                    received from the database. We need to partition the batch of data
                    into 1 day files. At the same time we need to take care of the situation
                    that some data may be inconsistent. We have detected some cases
                    where data is sub minute and have multiple values in a minute or does not 
                    begin at second 0 of the minute but are a little bit shifted. We will try 
                    to detect this and fix it as we go aggregating data into descrete one minute chunks.
                    We have the data received from the database as an array of objects corrosponding to each row of data
                    */
                    if (dataArray.length === 0) { 
                        SA.logger.info(MODULE_NAME + ' No new data to save at this time. Waiting for next bot loop.')
                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'No new data to save at this time. Waiting for next bot loop.')                           
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                        processIsRunning = false
                        return 
                    }

                    let rawMinChunksArray = sortData(dataArray)
                    //console.log("sorted data", rawMinChunksArray)

                    let minChunksArray = aggregateMinChunks(rawMinChunksArray)
                    //console.log("aggregated data", minChunksArray)

                    let files = divideIntoDayFiles(minChunksArray)
                    //console.log("files to save", files)

                    saveFiles(files, rawMinChunksArray)

                    /******* MAIN DATA PROCESSING FUNCIONS *******/

                    /**
                     * The function sorts new data into one minute chunks based on timestamps .
                     * @param newDataArray - An array of new data to be sorted into one minute chunks
                     * based on timestamps.
                     * @returns The function `sortData` returns an array of sorted data chunks based on
                     * one minute intervals.
                     */
                    function sortData(newDataArray) { 
                  
                        let currentRawMinChunk = undefined
                        let rawMinChunks = []
                        //console.log("this is our new data", newDataArray)
                        try { 

                            if (mustLoadRawData) { 
                                let startingDate = new Date(initialProcessTimestamp)
                                
                                let firstDataRow = newDataArray[0]
                                let currentTimestamp = validateRawTimestamp(firstDataRow[dbTimestamp])
                                
                                if(checkIfOnSameDay(startingDate, currentTimestamp)) {
                                // Check if the raw chunk associated with the last day file overlaps with the day of our new min chunk
                                
                                    // Check if we can access the old raw minute chunk to load and aggregate with our current data 
                                    let fileName = "Data.json"
                                    let filePath = getFilePath(initialProcessTimestamp, RAWDATA_FOLDER_NAME)
                                    let fullFileName = filePath + '/' + fileName;
                                    let fullFilePath = global.env.PATH_TO_DATA_STORAGE + '/' + fullFileName;
                                    console.log(fullFilePath);

                                    if (SA.nodeModules.fs.existsSync(fullFilePath)) {
                                    // If it does we load it and start the sorting process
                                        SA.logger.info(MODULE_NAME + " processAndSaveMessages - > sortData -> loading saved raw minute chunk from file = " + fullFileName)
                                        currentRawMinChunk = JSON.parse(SA.nodeModules.fs.readFileSync(fullFilePath, 'utf8'))
                                        rawMinChunks = toRawOneMinChunks(newDataArray, currentRawMinChunk)
    
                                    } else {
                                        SA.logger.warn("old saved raw minute chunk not found")
                                        mustLoadRawData = false
                                        rawMinChunks = toRawOneMinChunks(newDataArray, undefined)
                                    }
                                } else {
                                    // if not on the same day we sort for a new day file
                                    mustLoadRawData = false
                                    rawMinChunks = toRawOneMinChunks(newDataArray, undefined)
                                }
                            } else {
                                // if we do not then we sort into chunks without any starting raw chunk
                                rawMinChunks = toRawOneMinChunks(newDataArray, undefined)
                            }

                            /**
                             * The function takes in new data and sorts it into one minute chunks based
                             * on timestamps.
                             * @param newDataArray - An array of new data to be sorted into minute
                             * chunks.
                             * @param oldRawChunk - The previous raw one minute chunk that was being
                             * processed before the new data was added. It is undefined if this is the
                             * first time the function is being called.
                             * @param rawMinChunks - An array that contains the sorted data in one
                             * minute chunks. Each element in the array represents a one minute chunk
                             * and contains an array of data rows that fall within that minute.
                             * @returns an array of sorted data chunks based on one minute intervals.
                             */
                            function toRawOneMinChunks(newDataArray, oldRawChunk) {
                                // We take in new data and sort it according to minute chunks
                                let rawTimestamp
                                let currentTimestamp
                                let currentRawChunk = oldRawChunk
                                let chunksArray = []

                                for (let row of newDataArray) {
                                    // make sure the timestamp is formatted correctly to be accepted by the date object
                                    rawTimestamp = row[dbTimestamp]
                                    currentTimestamp = validateRawTimestamp(rawTimestamp)
                                    currentNewData = row
                                    
                                    /* Reporting we are doing well */
                                    logAndHeartBeat(currentTimestamp, ' Sorting data ', newDataArray, row)

                                    if (currentRawChunk === undefined) {
                                        // This means we have just started the sorting process so we create an new raw one minute chunk and add the incoming data row
                                        currentRawChunk = newRawMinChunk(currentTimestamp, currentNewData)
                                        continue

                                    } else {
                                        // check to see if this timestamp fits in the current raw min chunk or not
                                        let unixTimestamp = currentTimestamp.getTime()
                                        if ( unixTimestamp >= currentRawChunk[0] && unixTimestamp <= currentRawChunk[1]) {
                                            // add to the current raw min chunk
                                            currentRawChunk.push(currentNewData)
                                            continue

                                        } else if (unixTimestamp > currentRawChunk[1]) {
                                            // Add previous raw min chunk to the array before we start a new chunk
                                            chunksArray.push(currentRawChunk)
                                            currentRawChunk = newRawMinChunk(currentTimestamp, currentNewData)
                                            continue

                                        } else {
                                            SA.logger.error("Timestamp is out of order: ", currentTimestamp, " Expected to be after ", currentRawMinChunk)
                                        }
                                    }
                                }

                                chunksArray.push(currentRawChunk)
                                // After the loop has finished push the last raw min chunk to the array
                                return chunksArray
                            }

                            /**
                             * The function creates a new array representing a single minute chunk of data
                             * with a given timestamp and data row.
                             * @param currentTimestamp - A JavaScript Date object representing the
                             * current timestamp.
                             * @param currentNewData - The data row that needs to be added to the
                             * minute chunk.
                             * @returns an array containing the start and end timestamps of a minute
                             * chunk, as well as a data row that fits within that minute chunk.
                             */
                            function newRawMinChunk(currentTimestamp, currentNewData) {
                                let newRawMinChunk =[]
                                
                                let begin = currentTimestamp
                                begin.setSeconds(0, 0)
                                // always put the begin property at the beginning of the minute chunk array
                                newRawMinChunk.splice(0, 0, begin.getTime())

                                let end = currentTimestamp
                                end.setSeconds(0, 0)
                                end.setMinutes(currentTimestamp.getMinutes() + 1)
                                // always put the end property in the second spot of the minute chunk array
                                newRawMinChunk.splice(1, 0, end.getTime())

                                // Add data row that fits within the minute chunk
                                newRawMinChunk.push(currentNewData)
                              
                                return newRawMinChunk
                            }

                        } catch (err) {
                            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            //abort = true
                        } 

                        return rawMinChunks
                    }

                    /**
                     * The function aggregates data using a specified method and returns the processed
                     * chunks.
                     * @param rawMinChunks - an array of raw data chunks to be aggregated.
                     * @returns The function `aggregateMinChunks` returns the processed and aggregated
                     * chunks of data based on the aggregation method specified in the dataset
                     * definition config. The processing can be done synchronously or asynchronously
                     * using child processes.
                     */
                    function aggregateMinChunks(rawMinChunks) {
                        let processedMinChunks 
                        processedMinChunks = processSync(rawMinChunks)

                        return processedMinChunks

                        /**
                         * This function processes raw data chunks using a specified aggregation method
                         * and returns the processed chunks.
                         * @param rawMinChunks - an array of raw data chunks that need to be processed
                         * @returns an array of processed chunks after aggregating the raw data using
                         * either the "Avg" method or a fallback method of simple average if an unknown
                         * aggregation method is defined in the dataset definition config.
                         */
                        function processSync(rawMinChunks) {
                            let rawChunks = rawMinChunks
                            let processedChunks = []
                            let processedChunk

                            //TODO: move this switch within aggregation methods so that aggregation type can be chosen by property again
                            for (let i = 0; i < rawChunks.length; i++) {

                                /* Reporting we are doing well */
                                logAndHeartBeat(new Date(rawChunks[i][0]), ' Aggregating data ', rawChunks, i)

                                switch (datasetDef.config.aggregationMethod) {
                                    case "Avg":
                                        SA.logger.info("Aggrergating data using simple average")
                                        processedChunk = TS.projects.dataMining.functionLibraries.aggregationMethods.average(recordDef.properties, rawMinChunks[i])
                                        processedChunks.push(processedChunk)
                                        break
                                    default: 
                                        SA.logger.warn("Unknown aggregation method defined in dataset defintion config, falling back to simple average")
                                        processedChunk = TS.projects.dataMining.functionLibraries.aggregationMethods.average(recordDef.properties, rawMinChunks)
                                        processedChunks.push(processedChunk)
                                        break
                                }
                            }

                            return processedChunks
                        }

                        /* TODO: Implement asyc processing
                        function processAsyc (rawMinChunks) {
                        
                            const { fork } = require('child_process')
                       
                            processChunksInParallel(rawChunks)
                                .then(result => {
                                console.log("this is our finsihed chunks", result)
                                return result
                            })

                            function processChunksInParallel(rawChunks) {
                            console.log("in processChunksInParallel", rawChunks)

                            return new Promise((resolve, reject) => {
                              let aggregatedChunks = [];
                              let completedCount = 0;
                              let pathToWorker = global.env.PATH_TO_PROJECTS + "/Data-Mining/TS/Bot-Modules/Sensor-Bot/Database-Sensor/aggregationMethods.js" 
                          
                              for (let i = 0; i < rawChunks.length; i++) {
                                const worker = fork(pathToWorker);
                          
                                worker.on('message', (result) => {
                                  aggregatedChunks[i] = result;
                                  completedCount++;
                          
                                  if (completedCount === rawChunks.length) {
                                    resolve(aggregatedChunks);
                                  }
                                });
                          
                                worker.on('error', (error) => {
                                  reject(error);
                                });
                          
                                worker.send(rawChunks[i], aggregationType);
                              }
                            });
                            }
                        }*/
                    }

                    /**
                     * The function divides aggregated minute chunks into day files based on timestamps
                     * and merges them with previously saved day files if necessary.
                     * @param aggregatedMinChunks - An array of one minute chunks (each represented as
                     * an array with at least three elements: start timestamp, end timestamps, and data
                     * values) that need to be sorted into day files.
                     * @returns The function `divideIntoDayFiles` returns an array of day files, where
                     * each day file is an array of minChunks.
                     */
                    function divideIntoDayFiles (aggregatedMinChunks) {
                        try { 
                            // now that we have aggregated min chunks, loop through them placing them into day files 
                            let lastSavedFile
                            let files = [] 
                            let heartBeatCounter = 0                   
                                 
                            // Load data from the last day file if needed
                            if (mustLoadRawData) {
                                mustLoadRawData = false
                                let startingDate = new Date(initialProcessTimestamp)
                                let currentTimestamp = new Date(aggregatedMinChunks[0][0])
                                    
                                // Check if the day of the last day file overlaps with the day of our new min chunk
                                if (checkIfOnSameDay(startingDate, currentTimestamp)) { 
                                    // If it does we load the old day file before adding our new data to it
                                    let fileName = "Data.json"
                                    let filePath = getFilePath(initialProcessTimestamp, DATA_FOLDER_NAME)
                                    let fullFileName = filePath + '/' + fileName;
                                    let fullFilePath = global.env.PATH_TO_DATA_STORAGE + '/' + fullFileName;
                                    console.log(fullFilePath);

                                    if (SA.nodeModules.fs.existsSync(fullFilePath)) {
                                        // If it does we load it and start the sorting process
                                        SA.logger.info(MODULE_NAME + " processAndSaveMessages - > divideIntoDayFiles -> loading last saved file from file = " + fullFileName)
                                        lastSavedFile = JSON.parse(SA.nodeModules.fs.readFileSync(fullFilePath, 'utf8'))
                                        files = sortIntoDays(aggregatedMinChunks, lastSavedFile)
                                        
                                    } else {
                                        // Fall back to sorting into days without the old file data
                                        SA.logger.warn(MODULE_NAME + " processAndSaveMessages -> divideIntoDayFiles -> old file not found continuing without previous data tried to find file = " + fullFileName)
                                        files = sortIntoDays(aggregatedMinChunks, undefined) 
                                    }
                                } else {
                                    // old file not needed to process this data since it is not on the same day
                                    SA.logger.info(MODULE_NAME + " processAndSaveMessages -> divideIntoDayFiles -> starting new day file to save data")
                                    files = sortIntoDays(aggregatedMinChunks, undefined) 
                                }
                            } else {
                                SA.logger.info(MODULE_NAME + " processAndSaveMessages -> divideIntoDayFiles -> starting new day file to save data")
                                files = sortIntoDays(aggregatedMinChunks, undefined)  
                            }

                            return files
                            
                            /**
                             * The function sorts data into day files based on timestamps.
                             * @param newMinChunks - an array of one minute chunks (each represented as an
                             * array with at least three elements: start timestamp, end timestamps, and data values) that need to be
                             * sorted into day files.
                             * @param oldMinChunks - an array of one minute chunks coming from a previously saved day
                             * file
                             * @returns an array of day files, where each day file is an array of
                             * minChunks.
                             */
                            function sortIntoDays(newMinChunks, oldMinChunks) {
                                let currentDay = []
                                let dayFiles = []
                                let chunksToSort = []
                                
                                // TODO: refactor boths side of the main logic switch to use the same core sorting logic via a function
                                // if we have an old day file to start from we first figure out where our new data begins in regards to the old data
                                if (oldMinChunks != undefined) {
                                    // merge the old minChunks with new minChunks to create the most complete day
                                    [currentDay, chunksToSort] = mergeChunks(newMinChunks, oldMinChunks)
                                    dayFiles.push(currentDay)
                                    currentDay = []

                                    SA.logger.info(MODULE_NAME + ' Sorting into Day files. Current file count: ' + dayFiles.length)
                                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Sorting into Day files. Current file count: ' + dayFiles.length)                           
                   
                                    if (chunksToSort != undefined) {
                                        // sort remaining chunks into day files
                                        for (let minChunk of chunksToSort) { 
                                            if (currentDay.length > 0) {
                                                // check if chunk still in current day
                                                let lastChunk = currentDay[currentDay.length - 1]
                                                let lastChunkEnd = new Date(lastChunk[1])
                                                let currentChunkBegin = new Date(minChunk[0])
                                                if (checkIfOnSameDay(lastChunkEnd, currentChunkBegin)) {
                                                    // if so add them to the same day
                                                    currentDay.push(minChunk) 
                                                } else {
                                                    // if not save the current day file and continue to the next
                                                    dayFiles.push(currentDay)
                                                    currentDay = []
                                                    currentDay.push(minChunk)

                                                    SA.logger.info(MODULE_NAME + ' Sorting into Day files. Current file count: ' + dayFiles.length)
                                                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Sorting into Day files. Current file count: ' + dayFiles.length)                          
                                                }
                                            } else {
                                                currentDay.push(minChunk)
                                            }
                                        }

                                        dayFiles.push(currentDay) 

                                        SA.logger.info(MODULE_NAME + ' Sorting into Day files. Current file count: ' + dayFiles.length)
                                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Sorting into Day files. Current file count: ' + dayFiles.length)                          
                                    }

                                    return dayFiles
                                } else {
                                    // Else we need to start fresh and sort into day files
                                    for (let minChunk of newMinChunks) { 
                                        if (currentDay.length > 0) {
                                            // check if chunk still in current day
                                            let lastChunk = currentDay[currentDay.length - 1]
                                            let lastChunkEnd = new Date(lastChunk[1])
                                            let currentChunkBegin = new Date(minChunk[0])
                                            if (checkIfOnSameDay(lastChunkEnd, currentChunkBegin)) {
                                                // if so add them to the same day
                                                currentDay.push(minChunk)
                                            } else {
                                                // if not save the current day file and continue to the next
                                                dayFiles.push(currentDay)
                                                currentDay = []
                                                currentDay.push(minChunk)

                                                SA.logger.info(MODULE_NAME + ' Sorting into Day files. Current file count: ' + dayFiles.length)
                                                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Sorting into Day files. Current file count: ' + dayFiles.length)                          
                                            }
                                        } else {
                                            currentDay.push(minChunk)
                                        }
                                    }

                                    dayFiles.push(currentDay)

                                    SA.logger.info(MODULE_NAME + ' Sorting into Day files. Current file count: ' + dayFiles.length)
                                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Sorting into Day files. Current file count: ' + dayFiles.length)                          
    
                                    return dayFiles
                                }
                            }

                            /**
                             * The function merges new chunks of data with old chunks of data based on
                             * their timestamps.
                             * @param newChunks - An array of new chunks to be merged with the old
                             * chunks.
                             * @param oldChunks - An array of arrays representing one minute time intervals
                             * (chunks). Each inner array has at least three elements: the start
                             * time, end time, and data values of the chunk.
                             * @returns an array with two elements: the first element is the current
                             * day file (an array of chunks), and the second element is either an array
                             * of chunks that come after the current day or undefined if all chunks are
                             * on the same day.
                             */
                            function mergeChunks(newChunks, oldChunks) {
                                let currentDayFile = oldChunks
                                let chunksAfterCurrentDay

                                let lastChunk = oldChunks[oldChunks.length - 1]
                                let lastChunkBegin = new Date(lastChunk[0])
                                let lastChunkEnd = new Date(lastChunk[1])

                                let firstNewChunk = newChunks[0]
                                let firstNewChunkBegin = new Date(firstNewChunk[0]) 
                                let firstNewChunkEnd = new Date(firstNewChunk[1])

                                if (firstNewChunkBegin.getTime() ===  lastChunkBegin.getTime() &&
                                    firstNewChunkEnd.getTime() === lastChunkEnd.getTime()) {
                                        // Replace last min chunk with newly aggregated one
                                        currentDayFile.splice(-1, 1, firstNewChunk)
                                        newChunks.shift()
                                } 

                                for (let i = 0; i < newChunks.length; i++) {
                                    let currentChunk = newChunks[i]
                                    let currentChunkBegin = new Date(currentChunk[0])
                                    if (checkIfOnSameDay(lastChunkEnd, currentChunkBegin)) {
                                        currentDayFile.push(newChunks[i])
                                    } else {
                                        //TODO: test this branch
                                        chunksAfterCurrentDay = newChunks.slice(i)
                                        return [currentDayFile, chunksAfterCurrentDay]
                                    }
                                }

                                //If all chunks are on the same day then we will return the current day file and leave the chunks to sort as undefined
                                return [currentDayFile, undefined] 
                            }

                        } catch (err) {
                            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }  
                    }

                    function saveFiles(files, rawMinChunks) {


                        //TODO: asyncCreateTextFile use instead of callback function for creating files
                        try { 
                            let heartBeatCounter = 0
                            let filesCreated = 0 
                            let filesToCreate = files.length + 1 // add one for raw min chunk file
                            let lastFileDate

                            SA.logger.info(MODULE_NAME + ' Saving Files. Current file count: ' + filesToCreate)
                            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Saving Files...')                          

                            saveLastRawMin(rawMinChunks)

                            for (let file of files) { 
                                saveFile(file)
                            }

                            function saveLastRawMin(rawChunks) {
                                // TODO:can hook this up to add dynamic name from dataset definition
                                let fileName = 'Data.json'
                                let lastRawChunk = rawChunks[rawChunks.length - 1]
                                let fileContent = JSON.stringify(lastRawChunk)
                                let lastTimestamp = lastRawChunk[0]
                                let rawFilePath = getFilePath(lastTimestamp, RAWDATA_FOLDER_NAME) + '/' + fileName
                                console.log("path to new raw min chunk file", rawFilePath)
                                fileStorage.createTextFile(rawFilePath, fileContent + '\n', onFileCreated);

                                mustLoadRawData = true
                            }

                            function saveFile(file) {

                                // TODO:can hook this up to add dynamic name from dataset definition
                                let fileName = 'Data.json'
                                let lastTimestamp = file[0][0]
                                lastFileDate = new Date(lastTimestamp)
                                let fileContent = JSON.stringify(file)
                                let filePath = getFilePath(lastTimestamp, DATA_FOLDER_NAME) + '/' + fileName
                                fileStorage.createTextFile(filePath, fileContent + '\n', onFileCreated);   
                            }

                            function onFileCreated(err) {
                                if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                    error = err // This allows the loop to be broken.
                                    return
                                }
                                filesCreated++
                                lastFile = lastFileDate
                                if (filesCreated === filesToCreate) {
                                    SA.logger.info(MODULE_NAME + ' Saving Compelete!')
                                    TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  'Saving Complete!')                          

                                    writeStatusReport()
                                    return
                                }
                            }

                        } catch (err) {
                            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                        }         
                    }

                    /******* UTILITY FUNCIONS *******/

                    /**
                     * The function validates a raw timestamp and returns a Date object.
                     * @param rawTimestamp - a timestamp value that needs to be validated and converted
                     * to a Date object. It can be either a Unix timestamp (in seconds) or a JavaScript
                     * timestamp (in milliseconds). The function checks the length of the rawTimestamp
                     * parameter to determine which type of timestamp it is. If it is a Unix timestamp
                     * (
                     * @returns the current timestamp in the form of a Date object, based on the input
                     * rawTimestamp. If the input rawTimestamp is not in a supported format, the
                     * function logs a message to the console and does not return anything.
                     */
                    function validateRawTimestamp(rawTimestamp) {
                        let currentTimestamp

                        if (String(rawTimestamp).length === 10) {
                            currentTimestamp = new Date(rawTimestamp)

                        } else if (String(rawTimestamp).length === 13) {
                                    currentTimestamp = new Date()
                                    currentTimestamp.setTime(rawTimestamp)

                        } else {
                            console.log(`This timestamp format: ${rawTimestamp} is not currenly supported. Please raise an issue in the develop groups to get it added!`)
                        }

                        return currentTimestamp
                    }

                    /**
                     * The function checks if a given starting date overlaps with a current timestamp.
                     * @param startingDate - a Date object representing the starting date of an event
                     * @param currentTimestamp - The current date and time, represented as a JavaScript
                     * Date object.
                     * @returns a boolean value (true or false) depending on whether the year, month,
                     * and date of the startingDate parameter matchs the year, month, and date of the
                     * currentTimestamp parameter. If they match, the function returns true, otherwise
                     * it returns false.
                     */
                    function checkIfOnSameDay(startingDate, currentTimestamp) {
                        if ( startingDate.getFullYear() === currentTimestamp.getFullYear() &&
                             startingDate.getMonth() === currentTimestamp.getMonth() &&
                             startingDate.getDate() === currentTimestamp.getDate()) {
                             return true
                        } else {
                             return false
                        }
                    }

                    /**
                     * The function returns a file path based on a timestamp and folder name.
                     * @param timestamp - A Unix timestamp representing a specific date and time.
                     * @param folderName - The name of the folder where the file will be saved.
                     * @returns a file path based on the input timestamp and folder name. The file path
                     * is constructed using the year, month, and date from the timestamp, and is
                     * located in a specific directory defined by the process index and file path root.
                     */
                    function getFilePath(timestamp, folderName) {
                        let datetime = new Date(timestamp)
                        let dateForPath = SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCFullYear(), 2) + '/' +
                                          SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                          SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + '/' + "Output" + '/' + folderName + '/' + dateForPath;                                         
                        return filePath
                    }

                    /**
                     * The function logs and sends a heartbeat message during the process of
                     * sorting data.
                     * @param currentTimestamp - The current timestamp is a variable that holds
                     * the current date and time. It is used in this function to log the
                     * processing date and time and to provide a timestamp for the heartbeat
                     * message.
                     */
                    function logAndHeartBeat(currentTimestamp, processAction, dataArray, index) {
                        /* We need the processing date for logging purposes only */
                        let processingDate = currentTimestamp
                        let dataIndex
                        if (typeof index === 'object') {
                            dataIndex = dataArray.indexOf(index);
                        } else {
                            dataIndex = index
                        }
                        processingDate =
                            processingDate.getUTCFullYear() + '-' +
                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' +
                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
        
                        SA.logger.info(MODULE_NAME + processAction + (dataIndex + 1).toFixed(0) + " / " + dataArray.length + " Data from table - " + dbTable + " @ " + processingDate)
                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex,  processAction + (dataIndex + 1).toFixed(0) + " / " + dataArray.length + " Data from table - " + dbTable + " @ " + processingDate) // tell the world we are alive and doing well                                
                    }

                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> saveMessages -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport() {
                try {
                    if (lastFile === undefined) { return }
                    thisReport.file = {
                        lastFile: lastFile.toUTCString(),
                        beginingOfMarket: beginingOfMarket.toUTCString(),
                        uiStartDate: uiStartDate.toUTCString(),
                        lastRun: (new Date()).toUTCString(),
                        mustLoadRawData: mustLoadRawData
                    };
                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            processIsRunning = false
                            return;
                        }
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                        processIsRunning = false
                    }
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }
            } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
            }
        } else {
            console.log("process already running");
        }
    }
};
