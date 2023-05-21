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
    let lastDataChunkOfTheDay
    let lastId
    let firstId
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let dbPath = undefined
    let dbName = undefined
    let dbTimestamp = undefined
    let uiStartDate = undefined
    let datasetDef = undefined
    let recordDef = undefined
    let rawDataArray

    // Here the pair is passed to ccxt using the full codeName of the Market under Exchnage Markets
    const symbol = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.config.codeName

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies;

            // TODO: handle error in configs with hints
            dbPath = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databasePath
            dbName = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.databaseTableName
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
                        secondCallBack(dbPath, dbName, saveMessages)

                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        beginingOfMarket = new Date(uiStartDate.valueOf())
                        defineSince()
                        callBack(dbPath, dbName, saveMessages)
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
            
                    // TODO: get query values from task node configs 
                    database.serialize(() => {
                        // Gather all Data from Table
                        
                        database.all(`SELECT * FROM ${dbName} WHERE ${dbTimestamp} >= ${beginingOfMarket.getTime()}`, (error, data) => {
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

            function saveMessages(dataArray) {
                try {
                    save(dataArray)

                    function save(newDataArray) {
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
                        console.log("this is our new data", newDataArray)
                        
                        try { 

                            let startingDate
                            let rawTimestamp
                            let currentTimestamp
                            let lastTimestamp = undefined
                            let currentDay
                            let fileContent = []
                            let heartBeatCounter = 0

                            //TODO: Inital time checks only need to be run on first iteration but check if we are on the right day still each loop
                            for (row of newDataArray) {
                                // make sure the timestamp is formatted correctly to be accepted by the date object
                                rawTimestamp = row[dbTimestamp]
                                currentTimestamp
                                if (String(rawTimestamp).length === 10) {
                                    currentTimestamp = new Date(rawTimestamp)

                                } else if (String(rawTimestamp).length === 13) {
                                    currentTimestamp = new Date()
                                    currentTimestamp.setTime(rawTimestamp)

                                } else {
                                    console.log(`This timestamp format: ${rawTimestamp} is not currenly supported. Please raise an issue in the develop groups to get it added!`)
                                }
                    
                                // Check to see if we have old data to account for or not
                                if (mustLoadRawData) {
                                    mustLoadRawData = false
                                    startingDate = new Date(initialProcessTimestamp)

                                    // Check if the day of the old data overlaps with the day of our new data
                                    if ( startingDate.getFullYear() === currentTimestamp.getFullYear() &&
                                         startingDate.getMonth() === currentTimestamp.getMonth() &&
                                         startingDate.getDate() === currentTimestamp.getDate()) {
                                            
                                            // If it does we load the old data before aggregating it with the new data
                                            let fileName = "Data.json"
                                            let datetime = new Date(lastFile.valueOf())
                                            let dateForPath = datetime.getUTCFullYear() + '/' +
                                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCMonth() + 1, 2) + '/' +
                                                SA.projects.foundations.utilities.miscellaneousFunctions.pad(datetime.getUTCDate(), 2)
                                            let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + RAWDATA_FOLDER_NAME + '/' + dateForPath;
                                            let fullFileName = filePath + '/' + fileName
                                            SA.logger.info(MODULE_NAME + " saveMessage -> save -> loading saved data from file = " + fullFileName)
                                            fileStorage.getTextFile(fullFileName, onFileReceived)
                                        
                                         } else {
                                            chunkingNewDayData(row) 
                                         }
                                } else {
                                    /* Check if this is the first save loop for this current execution of the bot 
                                       Or if we are on a new day meaning we will be starting a new saving cycle
                                    */
                                    if (lastTimestamp === undefined ||
                                        currentTimestamp.getFullYear() !==  lastTimestamp.getFullYear() ||
                                        currentTimestamp.getMonth() !== lastTimestamp.getMonth() ||
                                        currentTimestamp.getDate() !== lastTimestamp.getDate() ) {

                                        //Run intial checks to see if there is old data associated with this day that needs aggregated with this new data
                                        startingDate = currentTimestamp
                                        let fileName = "Data.json"
                                        let dateForPath = startingDate.getUTCFullYear() + '/' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCMonth() + 1, 2) + '/' +
                                            SA.projects.foundations.utilities.miscellaneousFunctions.pad(startingDate.getUTCDate(), 2)
                                        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + RAWDATA_FOLDER_NAME + '/' + dateForPath;
                                        let fullFileName = filePath + '/' + fileName
                                        let fullFilePath = global.env.PATH_TO_DATA_STORAGE + '/' + fullFileName
                                            //console.log(fullFilePath)
                                        // Check if this data has a corresponding day file or not
                                        if (SA.nodeModules.fs.existsSync(fullFilePath)) {
                                            // If it does we load it and start the aggregation process
                                            SA.logger.info(MODULE_NAME + " saveMessage - > save -> loading saved data from file = " + fullFileName)
                                            fileStorage.getTextFile(fullFileName, onFileReceived)
            
                                        } else {
                                            chunkingNewDayData(row)
                                        }
                                    } else {
                                        // Add the next set of data to the current day file
                                        aggregatingAndChunkingNewDayData()
                                    }
                                }
                            }

                            function onFileReceived(err, text) {
                                try {
                                    if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                        try {
                                            rawDataArray = JSON.parse(text);
                                            aggregatingAndChunkingNewDayData()

                                        } catch (err) {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[ERROR]  saveMessage -> save -> onFileReceived -> Error Parsing JSON -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                                rawDataArray = []
                                                chunkingNewDayData(row)
                                            return
                                        }
                                    } else {
                                        if (err.message === 'File does not exist.' || err.code === 'The specified key does not exist.') {
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> File not found -> err = " + err.stack)
                                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                                "[WARN]  saveMessage -> save -> onFileReceived -> Falling back to default start with empty rawDataArray.");
                                                rawDataArray = []
                                                chunkingNewDayData(row)
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

                            function chunkingNewDayData(newData) {
                                console.log("saving to a fresh day file")

                                let currentMinChunk = toOneMinChunk(newData)
                                // we want to convert incoming data into a one min chunk and assign it to the day file
                                console.log(currentTimestamp)
                                console.log(currentMinChunk)
                                console.log("filecontent before new save: ", fileContent)

                                // save minute chunk to fresh day file
                                fileContent = []
                                currentDay = currentTimestamp
                                fileContent.push(currentMinChunk)
                                console.log("filecontent after new save: ", fileContent)

                                lastTimestamp = currentTimestamp
                            }

                            function aggregatingAndChunkingNewDayData(newData) {
                                console.log("aggregating and saving new day data to old day file")
                                
                                console.log("this is our old saved data", rawDataArray)
                                console.log("this is our current file content", fileContent)
                                let currentMinChunk = toOneMinChunk(newData)
                                aggregationMethodAvg(currentMinChunk)

                                //TODO: aggregate new data in with the old data
                                function aggregationMethodAvg(newDataChunk) {
                                    /* 
                                    This is the AVG type of aggregation.
                                    */
                                   
                                    // check if new data chunk in same day as current day
                                    if (currentTimestamp.getFullYear() !==  lastTimestamp.getFullYear() ||
                                        currentTimestamp.getMonth() !== lastTimestamp.getMonth() ||
                                        currentTimestamp.getDate() !== lastTimestamp.getDate()) {
                                            //move to new day 
                                    } else {
                                            //say on same day
                                        }


                                    for (let j = 0; j < recordDef.properties.length; j++) {
                                        let property = recordDef.properties[j]
                                        if (property.config) {
                                            switch (property.config.codeName) {
                                                case "begin":
                                                    let begin = currentTimestamp
                                                    begin.setSeconds(0, 0)
                                                    // always put the begin property at the beginning of the minute chunk array
                                                    minuteChunk.splice(0, 0, begin.getTime())
                                                    hasBegin = true
                                                    break;
                                                case "end":
                                                    let end = currentTimestamp
                                                    end.setSeconds(0, 0)
                                                    end.setMinutes(currentTimestamp.getMinutes() + 1)
                                                    // always put the end property in the second spot of the minute chunk array
                                                    minuteChunk.splice(1, 0, end.getTime())
                                                    hasEnd = true
                                                    break;
                                                case undefined:
                                                    return
                                                    // TODO: probably should error out here
                                                default:
                                                    // all other record properties are assigned based on the order of the nodes in the UI
                                                    minuteChunk.push(newData[property.config.codeName])
                                                    break;
                                              }                  
                                        } else {
                                            // TODO: maybe add hint to make sure a config is added for this property
                                            minuteChunk = undefined
                                            SA.logger.error("Invalid Property Config for Property:", JSON.stringify(property))
                                        }
                                    }
                                }

                                lastTimestamp = currentTimestamp
                            }

                            function toOneMinChunk(newData) {
                                // We take in new data an convert it into a one min chunk array according to the record properties defined at the UI
                                console.log(currentTimestamp)
                                console.log(newData)
                                let minuteChunk =[]
                                let hasBegin = false
                                let hasEnd = false

                                for (let j = 0; j < recordDef.properties.length; j++) {
                                    let property = recordDef.properties[j]
                                    if (property.config) {
                                        switch (property.config.codeName) {
                                            case "begin":
                                                let begin = currentTimestamp
                                                begin.setSeconds(0, 0)
                                                // always put the begin property at the beginning of the minute chunk array
                                                minuteChunk.splice(0, 0, begin.getTime())
                                                hasBegin = true
                                                break;
                                            case "end":
                                                let end = currentTimestamp
                                                end.setSeconds(0, 0)
                                                end.setMinutes(currentTimestamp.getMinutes() + 1)
                                                // always put the end property in the second spot of the minute chunk array
                                                minuteChunk.splice(1, 0, end.getTime())
                                                hasEnd = true
                                                break;
                                            case undefined:
                                                return
                                                // TODO: probably should error out here
                                            default:
                                                // all other record properties are assigned based on the order of the nodes in the UI
                                                minuteChunk.push(newData[property.config.codeName])
                                                break;
                                          }                  
                                    } else {
                                        // TODO: maybe add hint to make sure a config is added for this property
                                        minuteChunk = undefined
                                        SA.logger.error("Invalid Property Config for Property:", JSON.stringify(property))
                                    }
                                }

                                if (hasBegin === true && hasEnd === true) {
                                    return minuteChunk

                                } else{
                                    SA.logger.error("Missing Begin or End Value in Record definition.  Defintion has valid Begin value: ", hasBegin, " Defintion has valid End value: ", hasEnd )
                                    minuteChunk = undefined
                                    return minuteChunk
                                }
                                
                            }



                            let needSeparator = false
                            let error
                            let separator
                            
                            let savingProcedureFinished = false
                            let endOfDataArrayReached = false
                            
    
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
        
                                function saveFile(day) {
                                    fileContent = fileContent + ']'
                                    let rawFileContent = getRawDataToSave(day)
        
                                    // TODO:can hook this up to add dynamic name from dataset definition
                                    let fileName = 'Data.json'
        
                                    filesToCreate++
                                    fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, DATA_FOLDER_NAME) + '/' + fileName, fileContent + '\n', onFileCreated);
        
                                    if (rawFileContent !== undefined) {
                                        filesToCreate++
                                        fileStorage.createTextFile(getFilePath(day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS, RAWDATA_FOLDER_NAME) + '/' + fileName, rawFileContent + '\n', onFileCreated);
                                        mustLoadRawData = true
                                    } else {
                                        mustLoadRawData = false
                                    }
        
                                    fileContent = '['
                                    needSeparator = false
                                }
        
                                function getRawDataToSave(day) {
                                    /*
                                    What we are doing here is determining whether the currently accumulated raw Data should be saved or not,
                                    so that the next time the bot process runs, it must continue from where the raw Data ended.
                                    If the current end of the array contains elements beyond the day being processed, it means that the full
                                    day has been successfully downloaded, so it is not necessary to save this data.
                                    */
                                    let rawDataFileData
                                    let dataLength = newDataArray.length
                                    if (dataLength > 0) {
                                        // first get the start of the day after this day we are checking
                                        let timestamp = (day * SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS) +
                                            SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                        if (newDataArray[dataLength - 1][0] < timestamp) {
                                            // there is no data for the next day, so now trim this day's data to remove anything before it
                                            timestamp -= SA.projects.foundations.globals.timeConstants.ONE_DAY_IN_MILISECONDS
                                            let dataIndex = 0
                                            while (dataIndex < dataLength - 1) {
                                                if (newDataArray[dataIndex][0] < timestamp) {  // this data is from a previous day
                                                    dataIndex++
                                                } else {
                                                    break  // found the beginning of this day's data
                                                }
                                            }
                                            if (dataIndex > 0) {
                                                newDataArray = newDataArray.slice(dataIndex, dataLength)  // remove data from previous days
                                                dataLength = newDataArray.length
                                            }
                                            if (dataLength > 0) {
                                                rawDataFileData = JSON.stringify(newDataArray)  // finally we have what we need to save
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
    }
};
