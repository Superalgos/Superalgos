
exports.newDataMiningBotModulesScanDatabase = function (processIndex) {

    const MODULE_NAME = "Scan Database";
    const FOLDER_NAME = "Database-Files";
    const sqlite3 = require('sqlite3').verbose() 
    
    let thisObject = {
        initialize: initialize,
        start: start
    };

    let fileStorage = TS.projects.foundations.taskModules.fileStorage.newFileStorage(processIndex);
    let statusDependencies

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {
            statusDependencies = pStatusDependencies;
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {
            if (TS.projects.foundations.globals.taskVariables.IS_TASK_STOPPING === true) {
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);
                return
            }

            // TODO: Grab path and table name from task node config

            let fileContent
            const dbPath = 'C:/Users/arche/Pepper-X/signalityc_pepperX_engine/Brenden_dump/EMD.sqlite'
            const dbName = 'Rolling_EMD'

            getContextVariables(dbPath, dbName, getDatabaseData)

            function getContextVariables(dbPath, dbName, callBack) {
                try {
                    // TODO: finish getting key from note names 
                    let reportKey = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName 
                        + "-" + "Database-Sensor" + "-" + "Scan-Database"

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[INFO] start -> getContextVariables -> reportKey = " + reportKey)

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[ERROR] start -> getContextVariables -> Can not continue because dependency Status Report is corrupt. ");
                        callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                    if (thisReport.file.lastRun !== undefined) {

                        let fileName = 'Data.json'
                        let filePath = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).FILE_PATH_ROOT + "/Output/" + FOLDER_NAME + "/" + 'Single-File'
                        fileStorage.getTextFile(filePath + '/' + fileName, onFileReceived);

                        function onFileReceived(err, text) {
                            if (err.result !== TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                                    "[ERROR] start -> getContextVariables -> onFileReceived -> Could read file. ->  filePath = " + filePath + "/" + fileName);
                                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                            } else {

                                fileContent = text
                                callBack(dbPath, dbName, saveMessages)
                            }
                        }
                    } else { // If there is no status report, we assume there is no previous file or that if there is we will override it.
                        callBack(dbPath, dbName, saveMessages)
                    }
                } catch (err) {
                    TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                            "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getDatabaseData(dbPath, dbName, callBack){

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

            function saveMessages(data) {
                try {
                    save(data)
                    function save() {

                        if (fileContent !== undefined) {
                            // TODO: Need logic to splite and package data into one min files here
                            fileContent = JSON.stringify(data)
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
                    thisReport.file = {
                        lastRun: (new Date()).toISOString()
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
