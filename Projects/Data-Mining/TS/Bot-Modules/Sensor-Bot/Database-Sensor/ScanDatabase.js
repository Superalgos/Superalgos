const { roleMention } = require('discord.js');

exports.newDataMiningBotModulesScanDatabase = function (processIndex) {

    const MODULE_NAME = "Scan Database";
    // TODO: set up dynamic folder names from dataset defintion us name of product and dataset node names
    const DATA_FOLDER_NAME = "Scanned-Data/One-Min";
    const RAWDATA_FOLDER_NAME = "Raw-Scanned-Data/One-Min";
    const sqlite3 = require('sqlite3').verbose() 

    let thisObject = {
        initialize: initialize,
        start: start
    };

    // TODO: move comments to new logger

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies
    
    let lastId
    let firstId
    let thisReport;
    let processIsRunning = false
    let since
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

    // Here the pair is passed to ccxt using the full codeName of the Market under Exchnage Markets
    const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.config.codeName

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
            SA.logger.error(MODULE_NAME + "initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        if (processIsRunning === false) {
            console.log("process running")
            processIsRunning = true
            try {

            let mustLoadRawData = false

            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

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
                        beginingOfMarket = new Date(thisReport.file.beginingOfMarket.year + "-" + thisReport.file.beginingOfMarket.month + "-" + thisReport.file.beginingOfMarket.days + " " + thisReport.file.beginingOfMarket.hours + ":" + thisReport.file.beginingOfMarket.minutes + SA.projects.foundations.globals.timeConstants.GMT_SECONDS);
                        lastFile = new Date(thisReport.file.lastFile.year + "-" + thisReport.file.lastFile.month + "-" + thisReport.file.lastFile.days + " " + thisReport.file.lastFile.hours + ":" + thisReport.file.lastFile.minutes + SA.projects.foundations.globals.timeConstants.GMT_SECONDS);
                        lastId = thisReport.file.lastId
                        //lastCandleOfTheDay = thisReport.file.lastCandleOfTheDay
                        defineSince()
                        secondCallBack(dbPath, dbTable, processAndSaveMessages)

                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        beginingOfMarket = new Date(uiStartDate.valueOf())
                        defineSince()
                        callBack(dbPath, dbTable, processAndSaveMessages)
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

            function firstTimeGetDatabaseData(dbPath, dbTable, callBack){
                // Function to load the whole database on first run
                return new Promise((resolve, reject) => {
                    // Create connection to database
                    
                    const database = new sqlite3.Database(
                        dbPath, 
                        sqlite3.OPEN_READWRITE, 
                        (error) => {
                            if (error) {
                                console.error("Error connecting to database", error.message)
                                reject(error)
                            }
                        // TODO: Make comments formated correctly 
                        console.log("Connected to database")
                        }
                    )
            
                    // TODO: get query values from task node configs 
                    database.serialize(() => {
                        // Gather all Data from Table
                        
                        database.all(`SELECT * FROM ${dbTable} WHERE ${dbTimestamp} >= ${beginingOfMarket.getTime()}`, (error, data) => {
                            console.log('Loading data from table')
            
                            if (error) {
                                console.error("Error executing query", error)
                                reject(error)
                            }
            
                            database.close((error) => {
                                if (error) {
                                    console.error("Error closing connection", error.message)
                                    reject(error)
                                } else {
                                    console.log('Returning data and closing connection')
                                    resolve(data)
                                }
                            })
                        })          
                    })
                }).then(data => {
                    // Convert data object to data array with timestamp as first entry  
                    let dataArray = data
                    /*let dataInfo = []
                    let dataValues = []
                    let dataRow = []
                    const rows = Object.entries(data);
                    for (const [key, row] of rows) {
                        dataInfo = []
                        dataValues = []
                        dataRow = []
                        let columnData = Object.entries(row);
                        for (let [key, value] of columnData) {
                            if (key === dbTimestamp) {
                                dataInfo.unshift(value)
                            } else if (key === "ID") {
                                dataInfo.push(value)
                            } else {
                                dataValues.push(value)
                            }
                            dataRow = dataInfo.concat(dataValues)
                        }
                        dataArray.push(dataRow)
                    }*/

                    callBack(dataArray)
                })
            }

            function getDatabaseData(dbPath, dbTable, callBack){
                // Function to get new database rows
                return new Promise((resolve, reject) => {
                    // Create connection to database
                    
                    const database = new sqlite3.Database(
                        dbPath, 
                        sqlite3.OPEN_READWRITE, 
                        (error) => {
                            if (error) {
                                console.error("Error connecting to database", error.message)
                                reject(error)
                            }
                        // TODO: Make comments formated correctly 
                        console.log("Connected to database")
                        }
                    )

                    database.serialize(() => {
                        // Gather Data based on second query from Table
                        unixTimestamp = Date.parse(thisReport.file.lastRun);
                        database.all(`SELECT * FROM ${dbTable} WHERE ${dbTimestamp} >= ${unixTimestamp}`, (error, data) => {
                            console.log('Loading new data from table')
            
                            if (error) {
                                console.error("Error executing query", error)
                                reject(error)
                            }
            
                            database.close((error) => {
                                if (error) {
                                    console.error("Error closing connection", error.message)
                                    reject(error)
                                } else {
                                    console.log('Returning new data and closing connection')
                                    resolve(data)
                                }
                            })
                        })          
                    })
                }).then(data => {
                    // Convert data object to data array with timestamp as first entry  
                    let dataArray = []
                    let dataInfo = []
                    let dataValues = []
                    let dataRow = []
                    const rows = Object.entries(data);
                    for (const [key, row] of rows) {
                        dataInfo = []
                        dataValues = []
                        dataRow = []
                        let columnData = Object.entries(row);
                        for (let [key, value] of columnData) {
                            if (key === dbTimestamp) {
                                dataInfo.unshift(value)
                            } else if (key === "ID") {
                                dataInfo.push(value)
                            } else {
                                dataValues.push(value)
                            }
                            dataRow = dataInfo.concat(dataValues)
                        }
                        dataArray.push(dataRow)
                    }

                    callBack(dataArray)
                })
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

                    let rawMinChunksArray = sortData(dataArray)
                    console.log("sorted data", JSON.stringify(rawMinChunksArray))

                    let minChunksArray = aggregateMinChunks(rawMinChunksArray)
                    console.log("aggregated data", JSON.stringify(minChunksArray))
                    let files = divideIntoDayFiles(minChunksArray)
                    console.log("files to save", JSON.stringify(files))

                    saveFiles(files)

                    /******* MAIN DATA PROCESSING FUNCIONS *******/

                    /**
                     * The function sorts new data into one minute chunks based on timestamps .
                     * @param newDataArray - An array of new data to be sorted into one minute chunks
                     * based on timestamps.
                     * @returns The function `sortData` returns an array of sorted data chunks based on
                     * one minute intervals.
                     */
                    function sortData(newDataArray) { 
                  
                        let startingDate
                        let currentRawMinChunk = undefined
                        let rawMinChunks = []
                        console.log("this is our new data", newDataArray)
                        try { 

                            if (mustLoadRawData) { 
                                startingDate = new Date(initialProcessTimestamp)
                                
                                let firstDataRow = newDataArray[0]
                                let currentTimestamp = validateRawTimestamp(firstDataRow[dbTimestamp])
                                
                                if(checkIfOnSameDay(startingDate, currentTimestamp)) {
                                // Check if the raw chunk associated with the last day file overlaps with the day of our new min chunk
                                
                                    // Check if we can access the old raw minute chunk to load and aggregate with our current data 
                                    let fileName = "Data.json"
                                    let dateForPath = startingDate.getUTCFullYear() + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCMonth() + 1, 2) + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCDate(), 2)
                                    let filePath = SA.nodeModules.path.join(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT, "Output", RAWDATA_FOLDER_NAME, dateForPath);
                                    let fullFileName = SA.nodeModules.path.join(filePath, fileName);
                                    let fullFilePath = SA.nodeModules.path.join(global.env.PATH_TO_DATA_STORAGE, fullFileName);
                                    console.log(fullFilePath);

                                    if (SA.nodeModules.fs.existsSync(fullFilePath)) {
                                    // If it does we load it and start the sorting process
                                        SA.logger.info(MODULE_NAME + " processAndSaveMessages - > sortData -> loading saved raw minute chunk from file = " + fullFileName)
                                        currentRawMinChunk = fs.readFileSync(fullFilePath, 'utf8')
                                        rawMinChunks = toRawOneMinChunks(newDataArray, currentRawMinChunk, rawMinChunks)
    
                                    } else {
                                        SA.logger.warn("old saved raw minute chunk not found")
                                        currentRawMinChunk = undefined
                                        rawMinChunks = toRawOneMinChunks(newDataArray, currentRawMinChunk, rawMinChunks)
                                    }
                                }
                            } else {
                                // if we do not then we sort into chunks without any starting raw chunk
                                rawMinChunks = toRawOneMinChunks(newDataArray, currentRawMinChunk, rawMinChunks)
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
                            function toRawOneMinChunks(newDataArray, oldRawChunk, rawMinChunks) {
                                // We take in new data and sort it according to minute chunks
                                let rawTimestamp
                                let currentTimestamp
                                let currentRawChunk = oldRawChunk
                                let chunksArray = rawMinChunks

                                for (row of newDataArray) {
                                    // make sure the timestamp is formatted correctly to be accepted by the date object
                                    rawTimestamp = row[dbTimestamp]
                                    currentNewData = row

                                    if (String(rawTimestamp).length === 10) {
                                        currentTimestamp = new Date(rawTimestamp)
    
                                    } else if (String(rawTimestamp).length === 13) {
                                        currentTimestamp = new Date()
                                        currentTimestamp.setTime(rawTimestamp)
    
                                    } else {
                                        console.log(`This timestamp format: ${rawTimestamp} is not currenly supported. Please raise an issue in the develop groups to get it added!`)
                                    }
                                    
                                    /* Reporting we are doing well */
                                    logAndHeartBeat(currentTimestamp)
    
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

                                        } else if (unixTimestamp > currentRawMinChunk[1]) {
                                            // Add previous raw min chunk to the array before we start a new chunk
                                            chunksArray.push(currentRawChunk)
                                            currentRawChunk = newRawMinChunk(currentTimestamp, currentNewData)
                                            continue

                                        } else {
                                            SA.logger.error("Timestamp is out of order: ", currentTimestamp, " Expected to be after ", currentRawMinChunk)
                                        }
                                        console.log("currentRawChunk", currentRawChunk)
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

                            /**
                             * The function logs and sends a heartbeat message during the process of
                             * sorting data.
                             * @param currentTimestamp - The current timestamp is a variable that holds
                             * the current date and time. It is used in this function to log the
                             * processing date and time and to provide a timestamp for the heartbeat
                             * message.
                             */
                            function logAndHeartBeat(currentTimestamp) {
                                /* We need the processing date for logging purposes only */
                                        let processingDate = currentTimestamp
                                        let dataIndex = newDataArray.indexOf(row);
                                        processingDate =
                                            processingDate.getUTCFullYear() + '-' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
        
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[INFO] start -> saveOHLCVs -> Before Fetch -> Saving OHLCVs  @ " + processingDate + " -> dataArrayIndex = " + dataIndex + " -> total = " + newDataArray.length)
                                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + (dataIndex + 1).toFixed(0) + " / " + newDataArray.length + " Data from " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well                                
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

                            for (let i = 0; i < rawChunks.length; i++) {
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

                        function processAsyc (rawMinChunks) {
                        
                            const { fork } = require('child_process')
                       
                            /* processChunksInParallel(rawChunks)
                                .then(result => {
                                console.log("this is our finsihed chunks", result)
                                return result
                            })*/

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
                        }
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
                                let currentTimestamp = new Date(minChunk[0])
                                    
                                // Check if the day of the last day file overlaps with the day of our new min chunk
                                if (checkIfOnSameDay(startingDate, currentTimestamp)) { 
                                    // If it does we load the old day file before adding our new data to it
                                    let fileName = "Data.json"
                                    let dateForPath = startingDate.getUTCFullYear() + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCMonth() + 1, 2) + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCDate(), 2)
                                    let filePath = SA.nodeModules.path.join(TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT, "Output", DATA_FOLDER_NAME, dateForPath);
                                    let fullFileName = SA.nodeModules.path.join(filePath, fileName);
                                    let fullFilePath = SA.nodeModules.path.join(global.env.PATH_TO_DATA_STORAGE, fullFileName);
                                    console.log(fullFilePath);

                                    if (SA.nodeModules.fs.existsSync(fullFilePath)) {
                                        // If it does we load it and start the sorting process
                                        SA.logger.info(MODULE_NAME + " processAndSaveMessages - > divideIntoDayFiles -> loading last saved file from file = " + fullFileName)
                                        lastSavedFile = fs.readFileSync(fullFilePath, 'utf8')
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
                                
                                // if we have an old day file to start from we first figure out where our new data begins in regards to the old data
                                if (oldMinChunks != undefined) {
                                    // merge the old minChunks with new minChunks to create the most complete day
                                    [currentDay, chunksToSort] = mergeChunks(newMinChunks, oldMinChunks)
                                    dayFiles.push(currentDay)
                                    currentDay = []

                                    if (chunksToSort != undefined) {
                                        // sort remaining chunks into day files
                                        for (let minChunk of chunksToSort) { 
                                            if (currentDay.length > 0) {
                                                // check if chunk still in current day
                                                let lastChunk = currentDay[currentDay.length - 1]
                                                let lastChunkEnd = new Date(lastChunk[1])
                                                let currentChunkBegin = new Date(minChunk[0])                                     //TODO: logic to get timestamps for current Day and minChunk
                                                if (checkIfOnSameDay(lastChunkEnd, currentChunkBegin)) {
                                                    // if so add them to the same day
                                                    currentDay.push(minChunk)
                                                    console.log("adding to current day as ", currentDay)
                                                } else {
                                                    // if not save the current day file and continue to the next
                                                    dayFiles.push(currentDay)
                                                    currentDay = []
                                                    currentDay.push(minChunk)
                                                }
                                            } else {
                                                currentDay.push(minChunk)
                                                console.log("starting current day as ", currentDay)
                                            }
                                        }

                                        dayFiles.push(currentDay) 
                                    }

                                    return dayFiles
                                } else {
                                    // Else we need to start fresh and sort into day files
                                    for (let minChunk of newMinChunks) { 
                                        if (currentDay.length > 0) {
                                            // check if chunk still in current day
                                            let lastChunk = currentDay[currentDay.length - 1]
                                            let lastChunkEnd = new Date(lastChunk[1])
                                            let currentChunkBegin = new Date(minChunk[0])                                     //TODO: logic to get timestamps for current Day and minChunk
                                            if (checkIfOnSameDay(lastChunkEnd, currentChunkBegin)) {
                                                // if so add them to the same day
                                                currentDay.push(minChunk)
                                                console.log("adding to current day as ", currentDay)
                                            } else {
                                                // if not save the current day file and continue to the next
                                                dayFiles.push(currentDay)
                                                currentDay = []
                                                currentDay.push(minChunk)
                                            }
                                        } else {
                                            currentDay.push(minChunk)
                                            console.log("starting current day as ", currentDay)
                                        }
                                    }

                                    dayFiles.push(currentDay)
    
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

                    function saveFiles(files) {

                        //TODO: asyncCreateTextFile use instead of callback function for creating files
                        //TODO: make sure lastFile is updated during save process
                        function saveFile() {

                            // TODO:can hook this up to add dynamic name from dataset definition
                            let fileName = 'Data.json'

                            fileStorage.createTextFile(getFilePath(lastTimestamp.getDate() * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, DATA_FOLDER_NAME) + '/' + fileName, fileContent + '\n', onFileCreated);
                        
                            fileStorage.createTextFile(getFilePath(lastTimestamp.getDate() * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, OHLCVS_FOLDER_NAME) + '/' + fileName, currentRawMinChunk + '\n', onFileCreated);
                            console.log("saving current raw min chunk", currentRawMinChunk)
                            
                            mustLoadRawData = true
                            fileContent = []
                            return
                        }

                        // TODO: possibly need this function to generate path for saving day file     
                        /**
                         * The function returns a file path based on a timestamp and folder name.
                         * @param timestamp - A Unix timestamp representing a specific date and time.
                         * @param folderName - The name of the folder where the file will be saved.
                         * @returns a file path string that includes the root file path, the folder name, and a date string
                         * based on the timestamp input.
                         */
                        function getFilePath(timestamp, folderName) {
                            let datetime = new Date(timestamp)
                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + folderName + '/' + dateForPath;
                            return filePath
                        }

                                                        /*
                            It might have happened that the User is stopping the Task. If that
                            is the case, we need to stop this processing here.
                            */
                            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                                return
                            }
    
                            /* 
                            If we had any problem saving the latest file, we will also abort 
                            this process here, so that we can record our progress until it stopped
                            working.
                            */
                            if (error) {
                                callBackFunction(error);
                                return;
                            }
                        
                        try { 

                            let startingDate
                            let rawTimestamp
                            let currentTimestamp
                            let lastTimestamp = undefined

                            let currentRawMinChunk = undefined
                            let rawMinChunkArray = []
                            let fileContent = []
                            let heartBeatCounter = 0



                            function onFileReceived(err, text) {
                                try {
                                    if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        try {
                                            fileContent = JSON.parse(text);
                                            aggregatingAndChunkingNewDayData(minChunk)

                                        } catch (err) {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR]  saveMessage -> save -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> Falling back to default start with empty fileContent.");
                                                chunkingNewDayData(minChunk)
                                            return
                                        }
                                    } else {
                                        if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> File not found -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> Falling back to default start with empty fileContent.");
                                                chunkingNewDayData(minChunk)
                                            return
                                        } else {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR]  saveMessage -> save -> onFileReceived -> Error Received -> err = " + err.stack)
                                            callBackFunction(err);
                                            return
                                        }
                                    }
                                } catch (err) {
                                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[ERROR] saveMessage -> save  -> onFileReceived -> err = " + err.stack);
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function saveFile() {

                                // TODO:can hook this up to add dynamic name from dataset definition
                                let fileName = 'Data.json'
    
                                fileStorage.createTextFile(getFilePath(lastTimestamp.getDate() * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, DATA_FOLDER_NAME) + '/' + fileName, fileContent + '\n', onFileCreated);
                            
                                fileStorage.createTextFile(getFilePath(lastTimestamp.getDate() * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, OHLCVS_FOLDER_NAME) + '/' + fileName, currentRawMinChunk + '\n', onFileCreated);
                                console.log("saving current raw min chunk", currentRawMinChunk)
                                
                                mustLoadRawData = true
                                fileContent = []
                                return
                            }

                            // TODO: possibly need this function to generate path for saving day file     
/**
 * The function returns a file path based on a timestamp and folder name.
 * @param timestamp - A Unix timestamp representing a specific date and time.
 * @param folderName - The name of the folder where the file will be saved.
 * @returns a file path string that includes the root file path, the folder name, and a date string
 * based on the timestamp input.
 */
                            function getFilePath(timestamp, folderName) {
                                let datetime = new Date(timestamp)
                                let dateForPath = datetime.getUTCFullYear() + '/' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                                let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + folderName + '/' + dateForPath;
                                return filePath
                            }
    
                            /* 
                            At a macro level, we will be creating one file per day, so we will
                            run into a loop that each run will represent one day.
                            */
                            function controlLoop() {
                                /* 
                                This loop advances one day, and if it does not need to stop
                                for any reason, it will execute the loop function so as to process
                                the next day. 
                                */
                                currentDay++
        
                                /*
                                It might have happened that the User is stopping the Task. If that
                                is the case, we need to stop this processing here.
                                */
                                if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                                    return
                                }
        
                                /* 
                                If we had any problem saving the latest file, we will also abort 
                                this process here, so that we can record our progress until it stopped
                                working.
                                */
                                if (error) {
                                    callBackFunction(error);
                                    return;
                                }
        
                                /*
                                One possible exit is when we reached the amount of data downloaded. 
                                This does not necessarily happen at the end of the day
                                if the process was canceled for any reason at the middle, 
                                or the data stops mid day.
                                */
                                if (dataArrayIndex >= newDataArray.length - 1) {
                                    writeStatusReport()
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[INFO] start -> saveOHLCVs -> controlLoop -> Exiting because I reached the end of the newDataArray array. ")
                                    return
                                }
        
                                /* 
                                The most common exit is at the end of the market. There is 
                                nothing else to save, so we finish here. 
                                */
                                if (savingProcedureFinished === true) {
                                    writeStatusReport()
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[INFO] start -> saveOHLCVs -> controlLoop -> Exit because we reached the end of the market. ")
                                    return
                                }
        
                                /*
                                If there is no reason to exit, we will process the next day.
                                */
                                setImmediate(loop)
                            }

                            function loop() {
                                /*
                                Here we will try to match the data received with each possible
                                minute of a single day.
                                */
        
                                let filesToCreate = 0
                                let filesCreated = 0
        
                                /* 
                                We will loop around all the possible 1 minute chunks that have been found
                                on a single day. For each minute of the day, we will try to find
                                the matching data. This would be an easy task if we assumed all data was 
                                in one minute chunks but we also want to account for inconsistent and 
                                sub-minute data. Sometimes, some data is missing. We have also seen data 
                                that does not start at an UTC minute, they are shifted in time some seconds. 
                                In order to address all these inconsistencies the process gets a little 
                                bit complicated.
                                */
                                for (let minuteOfTheDay = 0; minuteOfTheDay < 60 * 24; minuteOfTheDay++) {
        
                                    /* 
                                    We initialize our data objects positioning them
                                    at the current minute of the day of the current day. We also
                                    initialize them with the last data chunk property values.
                                    The reason we do this last thing is because we don't know if 
                                    we are going to find or not a matching chunk of data for this minute. If we do find one
                                    these property values will be overwritten, and if not, they will 
                                    hold at least the last know value.
                                    */
                                    let dataChunk = {
                                        begin: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay,
                                        end: currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS * minuteOfTheDay + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS - 1,
                                        dataValues: lastDataChunk.dataValues,
                                    }
        
                                    /* 
                                    Here we will check that the current chunk is not going into the future.
                                    Remember we are looping around all possible minutes of a day, and when 
                                    that day is the current actual day, and the current minute is in the future,
                                    it makes no sense to continue inside this loop since we are not going
                                    to find more data chunks that will match.
        
                                    At the same time, we are going to check that we haven't processed the whole
                                    raw data array. Once we reached the end of it, it makes no sense to continue
                                    inside this loop.
                                    */
                                    if (
                                        dataChunk.begin > (new Date()).valueOf() ||
                                        endOfDataArrayReached === true
                                    ) {
                                        /* We stop when the current chunk is pointing to a time in the future.*/
                                        savingProcedureFinished = true
                                        /* 
                                        This will be our last file saved.
                                        */
                                        saveFile(currentDay)
        
                                        /*
                                        We will produce our last log and heartbeat, since we have just 
                                        reached the head of the data.
                                        */
                                        logAndHeartBeat()
        
                                        /* We exit the loop and we ain't coming back*/
                                        return
                                    }
        
                                    /* 
                                     We initialize here the loadedData object. These initial 
                                     values should be overridden unless there is no data
                                     fetched that matches with this minute. We need the 
                                     timestamp in order to calculate dataValueMinute.
                                    */
                                    let loadedData = {
                                        timestamp: (new Date()).valueOf() + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS,
                                        dataValues: []
                                    }
        
                                    let record = newDataArray[dataArrayIndex]
        
                                    /* 
                                    We will check that we can have a record to 
                                    analyze. It might happen that we don't have one
                                    in the situation that we could not get a single
                                    record from the exchange. We still want to be
                                    here so that everything is properly logged.

                                    Slice off first two elements in the array for loaded data values.
                                    */
                                    
                                    if (record !== undefined) {
                                        let loadedValues = [...record.slice(2)];
                                        loadedData = {
                                            timestamp: record[0],
                                            id: record[1],
                                            dataValues: loadedValues
                                        }
                                    }
        
                                    let dataChunkMinute = Math.trunc(dataChunk.begin / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                                    let loadedDataMinute
                                    /*
                                    Some data sources will return inconsistent data. It is not guaranteed 
                                    that each chunk will have a timeStamp exactly at the beginning of an
                                    UTC minute. It is also not guaranteed that the distance
                                    between timestamps will be the same. To fix this, we will do this.
                                    */
        
                                    loadedDataMinute = Math.trunc(loadedData.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
        
                                    /*
                                    If the minute of the record item received from the exchange is
                                    less than the minute of the current minute in our loop, 
                                    that means that we need to reposition the index at the newDataArray 
                                    array, moving it one record forward, and that is what we are
                                    doing here. 
                                    */
                                    while (loadedDataMinute < dataChunkMinute) {
        
                                        /* Move forward at the newDataArray array. */
                                        dataArrayIndex++
        
                                        /* Check that we have not passed the end of the array */
                                        if (dataArrayIndex > newDataArray.length - 1) {
                                            /* 
                                            We run out of loaded data, we can not move to the next chunk, 
                                            we need to leave this loop. 
                                            */
                                            break
                                        }
        
                                        record = newDataArray[dataArrayIndex]
        
                                        /*
                                        Once this loop is broken, this is the loadedData that needs 
                                        to be considered. All the ones in the past are ignored. 

                                        Slice off first two elements in the array for loaded data values.
                                        */

                                        loadedValues = [...record.slice(2)];
                                    
                                        loadedData = {
                                            timestamp: record[0],
                                            id: record[1],
                                            dataValues: loadedValues
                                        }
        
                                        /* Recalculate this to see if we need to break the loop*/
                                        loadedDataMinute = Math.trunc(loadedData.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                                    }
        
                                    /*
                                    If the dataChunkMinute and the loadedDataMinute matches, then
                                    we transfer the properties of the loadedData into the 
                                    data object. Two things to 
                                    consider here:
        
                                    1. If they do not match, at this point it could only means
                                    that the loadedDataMinute is in the future, in which case the
                                    data object will keep their initialization values
                                    which in turn are equal to the latest chunk of data.
                                    
                                    2. They might be equal even though the loadedData timestamp
                                    did not match exactly the UTC minute, but since we are 
                                    comparing truncated values, then we force the matching
                                    and we correct the shifting in time that sometimes happens.
                                    */
                                    if (dataChunkMinute === loadedDataMinute) {
                                        dataChunk.dataValues = loadedData.dataValues
        
                                        /* 
                                        Since we extracted this data chunk's value, we move 
                                        forward our array index.
                                        */
                                        if (dataArrayIndex < newDataArray.length - 1) {
                                            dataArrayIndex++
                                        } else {
                                            endOfDataArrayReached = true
                                        }
        
                                        lastId = loadedData.id
                                    }
        
                                    /*
                                    Here we remember the last data chunk, in case
                                    we need it.
                                    */
                                    lastDataChunk = dataChunk
        
                                    if (needSeparator === false) {
                                        needSeparator = true;
                                        separator = '';
                                    } else {
                                        separator = ',';
                                    }
        
                                    /* Add the dataChunk to the file content.*/
                                    fileContent = fileContent + separator + '[' + JSON.stringify(dataChunk.dataValues) + "," + dataChunk.begin + "," + dataChunk.end + "]";
        
                                    /* We store the last candle of the day in order to have a previous candles during next execution. */
                                    if (minuteOfTheDay === 1440 - 1) {
                                        lastDataChunkOfTheDay = JSON.parse(JSON.stringify(dataChunk))
                                    }
        
                                    /* Reporting we are doing well */
                                    heartBeatCounter--
                                    if (heartBeatCounter <= 0) {
                                        heartBeatCounter = 1440
                                        logAndHeartBeat()
                                    }
        
                                    function logAndHeartBeat() {
                                        /* We need the processing date for logging purposes only */
                                        let processingDate = new Date(dataChunk.begin)
                                        processingDate =
                                            processingDate.getUTCFullYear() + '-' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCMonth() + 1, 2) + '-' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(processingDate.getUTCDate(), 2);
        
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[INFO] start -> saveOHLCVs -> Before Fetch -> Saving OHLCVs  @ " + processingDate + " -> dataArrayIndex = " + dataArrayIndex + " -> total = " + newDataArray.length)
                                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + (dataArrayIndex + 1).toFixed(0) + " / " + newDataArray.length + " Data from " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well                                
                                    }
                                }
        
                                /* 
                                When the bot is processing historical information, it
                                happens that during the whole processing of one day
                                it did not reach either the head of the market (a future time)
                                nor the end of the Raw Data Array. In this situation
                                we still need to save the full day of content, and 
                                we do it only if at least one candle has been processed.
                                */
                                if (dataArrayIndex > 0) {
                                    saveFile(currentDay)
                                    return
                                }
        
                                controlLoop()
        

        

        
                                function onFileCreated(err) {
                                    if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> OHLCVsReadyToBeSaved -> onFileBCreated -> err = " + JSON.stringify(err));
                                        error = err // This allows the loop to be broken.
                                        return;
                                    }
                                    filesCreated++
                                    lastFile = new Date((currentDay * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS))
                                    if (filesCreated === filesToCreate) {
                                        controlLoop()
                                    }
                                }

                            }

                        } catch (err) {
                            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            //abort = true
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
                        lastFile: {
                            year: lastFile.getUTCFullYear(),
                            month: (lastFile.getUTCMonth() + 1),
                            days: lastFile.getUTCDate(),
                            hours: lastFile.getUTCHours(),
                            minutes: lastFile.getUTCMinutes()
                        },
                        beginingOfMarket: {
                            year: beginingOfMarket.getUTCFullYear(),
                            month: (beginingOfMarket.getUTCMonth() + 1),
                            days: beginingOfMarket.getUTCDate(),
                            hours: beginingOfMarket.getUTCHours(),
                            minutes: beginingOfMarket.getUTCMinutes()
                        },
                        uiStartDate: uiStartDate.toUTCString(),
                        lastRun: (new Date()).toISOString(),
                        mustLoadRawData: mustLoadRawData
                    };
                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
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
            processIsRunning = false
        } else {
            console.log("process already running");
        }
    }
};
