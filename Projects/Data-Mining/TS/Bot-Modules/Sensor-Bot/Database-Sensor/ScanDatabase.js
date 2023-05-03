
exports.newDataMiningBotModulesScanDatabase = function (processIndex) {

    const MODULE_NAME = "Scan Database";
    const FOLDER_NAME = "Database-Files";
    const sqlite3 = require('sqlite3').verbose() 

    let thisObject = {
        initialize: initialize,
        start: start
    };

    // TODO: move comments to new logger

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies
    let lastDataChunkOfTheDay
    let uiStartDate = new Date(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.startDate)
    let firstTimeThisProcessRun = false
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let dbPath = undefined
    let dbName = undefined
    let dbTimestamp = undefined

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies;

            // TODO: handle error in configs with hints
            dbPath = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databasePath
            dbName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databaseTableName
            dbTimestamp = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databaseTimestampColumn

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            SA.logger.error(MODULE_NAME + "initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            let mustLoadRawData = false

            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            getContextVariables(dbPath, dbName, firstTimeGetDatabaseData, getDatabaseData)

            function getContextVariables(dbPath, dbName, callBack, secondCallBack) {
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

                    /* Check if the uiStartDate is Invalid, if so lets set it to the Epoch and let the getMarketStart function later take care of it */
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
                        secondCallBack(dbPath, dbName, saveMessages)

                        function defineSince() {
                            if (thisReport.file.uiStartDate === undefined) {
                                thisReport.file.uiStartDate = uiStartDate
                            } else {
                                thisReport.file.uiStartDate = new Date(thisReport.file.uiStartDate)
                            }
                            if (uiStartDate.valueOf() !== thisReport.file.uiStartDate.valueOf()) {
                                since = uiStartDate.valueOf()
                                initialProcessTimestamp = since
                                firstTimeThisProcessRun = true
                                beginingOfMarket = new Date(uiStartDate.valueOf())
                            } else {
                                if (lastFile !== undefined) {
                                    since = lastFile.valueOf()
                                    initialProcessTimestamp = lastFile.valueOf()
                                    if (thisReport.file.mustLoadRawData !== undefined) {
                                        mustLoadRawData = thisReport.file.mustLoadRawData
                                    }
                                } else {
                                    since = uiStartDate.valueOf()
                                    initialProcessTimestamp = uiStartDate.valueOf()
                                }
                            }
                            if (mustLoadRawData) {  // there is raw data to load
                                getRawDataArray()   // so fetch it from the file where it was saved on the last run of this process
                            }
                            function getRawDataArray() {
                                mustLoadRawData = false
                                let fileName = "Data.json"
                                let datetime = new Date(lastFile.valueOf())
                                let dateForPath = datetime.getUTCFullYear() + '/' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                    SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                                let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + OHLCVS_FOLDER_NAME + '/' + dateForPath;
                                let fullFileName = filePath + '/' + fileName
                                fileStorage.getTextFile(fullFileName, onFileReceived)
    
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[INFO] start -> getRawDataArray -> from file = " + fullFileName)
    
                                function onFileReceived(err, text) {
                                    try {
                                        if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                rawDataArray = JSON.parse(text);
                                                let dataLength = rawDataArray.length
                                                if (dataLength > 1) {
                                                    since = rawDataArray[dataLength - 2][0]  // set the beginning of the fetch back to the start of the second last ohlcv received
                                                    rawDataArray.pop()  // ditch the last ohlcv received since it may be incomplete
                                                } else {
                                                    rawDataArrayFile = []  // we got less than two ohlcvs so we might as well start again from the beginning of the day
                                                }
                                            } catch (err) {
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> getRawDataArray -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> getRawDataArray -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                                return
                                            }
                                        } else {
                                            if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> getRawDataArray -> onFileReceived -> File not found -> err = " + err.stack)
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[WARN] start -> getRawDataArray -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                                return
                                            } else {
                                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                    "[ERROR] start -> getRawDataArray -> onFileReceived -> Error Received -> err = " + err.stack)
                                                callBackFunction(err);
                                                return
                                            }
                                        }
                                    } catch (err) {
                                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                            "[ERROR] start -> getRawDataArray -> onFileReceived -> err = " + err.stack);
                                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }

                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        firstTimeThisProcessRun = true
                        beginingOfMarket = new Date(uiStartDate.valueOf())
                        callBack(dbPath, dbName, saveMessages)
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

            function firstTimeGetDatabaseData(dbPath, dbName, callBack){
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
            
                    // TODO: make two queries, one for inital load, another for addtional loops
                    // TODO: get query values from task node configs 
                    database.serialize(() => {
                        // Gather all Data from Table
                        database.all(`SELECT * FROM ${dbName}`, (error, data) => {
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
                    callBack(data)
                })
            }

            function getDatabaseData(dbPath, dbName, callBack){
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
                        database.all(`SELECT * FROM ${dbName} WHERE ${dbTimestamp} >= ${unixTimestamp}`, (error, data) => {
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
                    callBack(data)
                })
            }

            function saveMessages(data) {
                try {
                    save(data)

                    function save(rawDataArray) {
                        /* 
                        What we are going to do in this function is to save all data  
                        received from the database. We need to partition the batch of data
                        into 1 day files. At the same time we need to take care of the situation
                        that some data may be inconsistent. We have detected some cases
                        where data is sub minute or does not begin at second 0 of the minute but are a little
                        bit shifted. We will try to detect this and fix it as we go. 
        
                        We have the data received from the database at the array data
                        */
                        console.log(rawDataArray)
                        try { 
                            let fileContent = '['

                            let needSeparator = false
                            let error
                            let separator
                            let heartBeatCounter = 0
                            let savingProcedureFinished = false
                            let endOfDataArrayReached = false
                            let currentDay = Math.trunc((initialProcessTimestamp - SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) / SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
    
                        let lastDataChunk = {
                            begin: 0,
                            end: 0,
                            dataValues: []
                        }
    
                        let dataArrayIndex = 0
                        lastId = undefined
    
                        if (lastDataChunkOfTheDay !== undefined) {
                            lastDataChunk = JSON.parse(JSON.stringify(lastDataChunkOfTheDay))
                        }
    
                            /* 
                            At a macro level, we will be creating one file per day, so we will
                            run into a loop that each run will represent one day.
                            */
                            controlLoop()

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
                                if (dataArrayIndex >= rawDataArray.length - 1) {
                                    writeStatusReport()
                                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                        "[INFO] start -> saveOHLCVs -> controlLoop -> Exiting because I reached the end of the rawDataArray array. ")
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
                                     We initialize here the dataValues object. These initial 
                                     values should be overridden unless there is no data
                                     fetched that matches with this minute. We need the 
                                     timestamp in order to calculate dataValueMinute.
                                    */
                                    let dataValue = {
                                        timestamp: (new Date()).valueOf() + SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS,
                                        open: 0,
                                        hight: 0,
                                        low: 0,
                                        close: 0,
                                        volume: 0
                                    }
        
                                    let record = rawDataArray[dataArrayIndex]
        
                                    /* 
                                    We will check that we can have a record to 
                                    analyze. It might happen that we don't have one
                                    in the situation that we could not get a single
                                    record from the exchange. We still want to be
                                    here so that everything is properly logged.
                                    */
                                    if (record !== undefined) {
                                        dataValue = {
                                            timestamp: record[0],
                                            open: record[1],
                                            hight: record[2],
                                            low: record[3],
                                            close: record[4],
                                            volume: record[5]
                                        }
                                    }
        
                                    let dataMinute = Math.trunc(dataChunk.begin / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                                    let dataValueMinute
                                    /*
                                    Some data sources will return inconsistent data. It is not guaranteed 
                                    that each chunk will have a timeStamp exactly at the beginning of an
                                    UTC minute. It is also not guaranteed that the distance
                                    between timestamps will be the same. To fix this, we will do this.
                                    */
        
                                    dataValueMinute = Math.trunc(dataValue.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
        
                                    /*
                                    If the minute of the record item received from the exchange is
                                    less than the minute of the current minute in our loop, 
                                    that means that we need to reposition the inded at the rawDataArray 
                                    array, moving it one record forward, and that is what we are
                                    doing here. 
                                    */
                                    while (dataValueMinute < dataMinute) {
        
                                        /* Move forward at the rawDataArray array. */
                                        dataArrayIndex++
        
                                        /* Check that we have not passed the end of the array */
                                        if (dataArrayIndex > rawDataArray.length - 1) {
                                            /* 
                                            We run out of OHLCVs, we can not move to the next OHLCV, 
                                            we need to leave this loop. 
                                            */
                                            break
                                        }
        
                                        record = rawDataArray[dataArrayIndex]
        
                                        /*
                                        Once this loop is broken, this is the dataValue that needs 
                                        to be considered. All the ones in the past are ignored.
                                        */
                                        dataValue = {
                                            timestamp: record[0],
                                            open: record[1],
                                            hight: record[2],
                                            low: record[3],
                                            close: record[4],
                                            volume: record[5],
                                            id: record[6]
                                        }
        
                                        /* Recalculate this to see if we need to break the loop*/
                                        dataValueMinute = Math.trunc(dataValue.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                                    }
        
                                    /*
                                    If the dataMinute and the dataValueMinute matches, then
                                    we transfer the properties of the dataValue into the 
                                    data object. Two things to 
                                    consider here:
        
                                    1. If they do not match, at this point it could only means
                                    that the dataValueMinute is in the future, in which case the
                                    data object will keep their initialization values
                                    which in turn are equal to the latest chunk of data.
                                    
                                    2. They might be equal even though the dataValue timestamp
                                    did not match exactly the UTC minute, but since we are 
                                    comparing truncated values, then we force the matching
                                    and we correct the shifting in time that sometimes happens.
                                    */
                                    if (dataMinute === dataValueMinute) {
                                        candle.open = dataValue.open
                                        candle.close = dataValue.close
                                        candle.min = dataValue.low
                                        candle.max = dataValue.hight
                                        
        
                                        /* 
                                        Since we extracted this OHLCV value, we move 
                                        forward our array index.
                                        */
                                        if (dataArrayIndex < rawDataArray.length - 1) {
                                            dataArrayIndex++
                                        } else {
                                            endOfTheOHLCVArrayReached = true
                                        }
        
                                        lastId = dataValue.id
                                    }
        
                                    /*
                                    Here we remember the last candle and volume, in case
                                    we need it.
                                    */
                                    lastDataChunk = dataChunk
        
                                    if (needSeparator === false) {
                                        needSeparator = true;
                                        separator = '';
                                    } else {
                                        separator = ',';
                                    }
        
                                    /* Add the candle to the file content.*/
                                    candlesFileContent = candlesFileContent + separator + '[' + candle.min + "," + candle.max + "," + candle.open + "," + candle.close + "," + candle.begin + "," + candle.end + "]";
        
                                    /* We store the last candle of the day in order to have a previous candles during next execution. */
                                    if (minuteOfTheDay === 1440 - 1) {
                                        lastDataChunkOfTheDay = JSON.parse(JSON.stringify(candle))
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
                                            "[INFO] start -> saveOHLCVs -> Before Fetch -> Saving OHLCVs  @ " + processingDate + " -> dataArrayIndex = " + dataArrayIndex + " -> total = " + rawDataArray.length)
                                        TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, "Saving " + (dataArrayIndex + 1).toFixed(0) + " / " + rawDataArray.length + " OHLCVs from " + TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name + " " + symbol + " @ " + processingDate) // tell the world we are alive and doing well                                
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
        
                                function saveFile(day) {
                                    candlesFileContent = candlesFileContent + ']'
                                    volumesFileContent = volumesFileContent + ']'
                                    ohlcvsFileContent = getRawDataToSave(day)
        
                                    let fileName = 'Data.json'
        
                                    filesToCreate++
                                    fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, CANDLES_FOLDER_NAME) + '/' + fileName, candlesFileContent + '\n', onFileCreated);
        
                                    filesToCreate++
                                    fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, VOLUMES_FOLDER_NAME) + '/' + fileName, volumesFileContent + '\n', onFileCreated);
        
                                    if (ohlcvsFileContent !== undefined) {
                                        filesToCreate++
                                        fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, OHLCVS_FOLDER_NAME) + '/' + fileName, ohlcvsFileContent + '\n', onFileCreated);
                                        mustLoadRawData = true
                                    } else {
                                        mustLoadRawData = false
                                    }
        
                                    candlesFileContent = '['
                                    volumesFileContent = '['
                                    needSeparator = false
                                }
        
                                function getRawDataToSave(day) {
                                    /*
                                    What we are doing here is determining whether the currently accumulated raw OHCLV's should be saved or not,
                                    so that the next time the bot process runs, it must continue from where the raw OHLCV's ended.
                                    If the current end of the array contains elements beyond the day being processed, it means that the full
                                    day has been successfully downloaded, so it is not necessary to save this data.
                                    */
                                    let rawDataFileData
                                    let dataLength = rawDataArray.length
                                    if (dataLength > 0) {
                                        // first get the start of the day after this day we are checking
                                        let timestamp = (day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) +
                                            SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                        if (rawDataArray[dataLength - 1][0] < timestamp) {
                                            // there is no data for the next day, so now trim this day's data to remove anything before it
                                            timestamp -= SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                            let dataIndex = 0
                                            while (dataIndex < dataLength - 1) {
                                                if (rawDataArray[dataIndex][0] < timestamp) {  // this data is from a previous day
                                                    dataIndex++
                                                } else {
                                                    break  // found the beginning of this day's data
                                                }
                                            }
                                            if (dataIndex > 0) {
                                                rawDataArray = rawDataArray.slice(dataIndex, dataLength)  // remove data from previous days
                                                dataLength = rawDataArray.length
                                            }
                                            if (dataLength > 0) {
                                                rawDataFileData = JSON.stringify(rawDataArray)  // finally we have what we need to save
                                            }
                                        }
                                    }
                                    return rawDataFileData
                                }
        
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
        
                                function getFilePath(timestamp, folderName) {
                                    let datetime = new Date(timestamp)
                                    let dateForPath = datetime.getUTCFullYear() + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                        SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                                    let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + folderName + '/' + dateForPath;
                                    return filePath
                                }
                            }

                        } catch (err) {
                            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                "[ERROR] start -> saveOHLCVs -> err = " + err.stack);
                            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            //abort = true
                        }   

                        // TODO: code after this will most likely be depricated 
                       /* if (fileContent !== undefined) {
                            // TODO: Need logic to splite and package data into one min files here
                            fileContent.append(JSON.stringify(data))
                        } else {
                            // we are going to save the current messages.
                            fileContent = JSON.stringify(data)
                        }

                        let fileName = 'Data.json'
                        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                        fileStorage.createTextFile(filePath + '/' + fileName, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {
                            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> saveMessages -> onResponse -> onEnd -> onFileCreated -> Could not save file. ->  filePath = " + filePath + "/" + fileName);
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            } else {
                                writeStatusReport()
                            }
                        }*/
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
                    thisReport.file = {
                        lastRun: (new Date()).toISOString(),
                        uiStartDate: uiStartDate.toUTCString(),
                        beginingOfMarket: {
                            year: beginingOfMarket.getUTCFullYear(),
                            month: (beginingOfMarket.getUTCMonth() + 1),
                            days: beginingOfMarket.getUTCDate(),
                            hours: beginingOfMarket.getUTCHours(),
                            minutes: beginingOfMarket.getUTCMinutes()
                        },
                        uiStartDate: uiStartDate.toUTCString(),
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
    }
};
