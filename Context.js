exports.newContext = function newContext(BOT) {

    /* 

    This module allows trading bots to connect to the exchange and do trding operations on it. So far it can only work with Poloniex.
    It deals with these 3 different files that helps the bot process remember where it is standing:

    1. The Status Report.
    2. The Execution History.
    3. The Execution Context.

    */

    const MODULE_NAME = "Context";

    thisObject = {
        initialize: initialize,
        saveAll: saveAll
    };

    let bot = BOT;

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;

    let statusReport;                           // This is the typical Status Report that defines which was the last sucessfull execution and a few other pieces of info.
    let executionHistory;                       // This is 
    let executionContext;                       // Here is the information of the last execution of this bot process.

    return thisObject;

    function initialize(callBackFunction) {

        try {
            /*

            Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
            of the process.

            */

            getStatusReport();

            function getStatusReport() {

                /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                let fileName = "Status.Report.json"
                let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                function onFileReceived(text) {

                    try {

                        statusReport = JSON.parse(text);

                        if (statusReport.lastExecution === undefined) {

                            createConext();

                        } else {

                            getExecutionHistory();

                        }

                    } catch (err) {

                        /*

                        It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                        since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                        is needed.

                        */

                        const logText = "[ERROR] 'getStatusReport' - Bot cannot execute without a status report. ERROR : " + err.message;
                        logger.write(logText);

                    }
                }
            }

            function getExecutionHistory() {

                let fileName = "Execution.History.json"
                let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                function onFileReceived(text) {

                    try {

                        executionHistory = JSON.parse(text);
                        getExecutionContext();

                    } catch (err) {

                        /*

                        It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                        since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                        is needed.

                        */

                        const logText = "[ERROR] 'getExecutionHistory' - Bot cannot execute without the Execution History. ERROR : " + err.message;
                        logger.write(logText);

                    }
                }
            }

            function getExecutionContext() {

                let date = new Date(statusReport.lastExecution);

                let fileName = "Execution.Context.json"
                let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                mariamAzureFileStorage.getTextFile(filePath, fileName, onFileReceived, true);

                function onFileReceived(text) {

                    try {

                        executionContext = JSON.parse(text);

                        executionContext.transactions = []; // We record here the transactions that happened duting this execution.

                        ordersExecutionCheck();

                    } catch (err) {

                        /*

                        It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                        since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                        is needed.

                        */

                        const logText = "[ERROR] 'getExecutionContext' - Bot cannot execute without the Execution Context. ERROR : " + err.message;
                        logger.write(logText);

                    }
                }
            }

            function createConext() {

                /*
    
                When the bot is executed for the very first time, there are a few files that do not exist and need to be created, and that
                is what we are going to do now.
    
                */

                executionHistory = [];

                executionContext = {
                    investment: {
                        assetA: 0,
                        assetB: 0
                    },
                    availableBalance: {
                        assetA: 0,
                        assetB: 0
                    },
                    positions: [],
                    transactions: []
                };

                getCandles();

            }

        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err);
            callBackFunction("Operation Failed.");
        }
    }

    function saveAll(callBackFunction) {

        try {

            writeExecutionContext();

            function writeExecutionContext() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeExecutionContext'");
                }

                try {

                    let fileName = "Execution.Context.json"
                    let dateForPath = processDatetime.getUTCFullYear() + '/' + utilities.pad(processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDatetime.getUTCDate(), 2) + '/' + utilities.pad(processDatetime.getUTCHours(), 2) + '/' + utilities.pad(processDatetime.getUTCMinutes(), 2);
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                    utilities.createFolderIfNeeded(filePath, mariamAzureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let fileContent = JSON.stringify(executionContext);

                            mariamAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeExecutionContext' - Content written: " + fileContent);
                                }

                                writeExucutionHistory();
                            }
                        }
                        catch (err) {
                            const logText = "[ERROR] 'writeExecutionContext - onFolderCreated' - ERROR : " + err.message;
                            logger.write(logText);
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'writeExecutionContext' - ERROR : " + err.message;
                    logger.write(logText);
                }
            }

            function writeExucutionHistory() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeExucutionHistory'");
                }

                try {

                    let fileName = "Execution.History.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                    utilities.createFolderIfNeeded(filePath, mariamAzureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let newRecord = [
                                newHistoryRecord.date.valueOf(),
                                newHistoryRecord.rate,
                                newHistoryRecord.newPositions,
                                newHistoryRecord.newTrades,
                                newHistoryRecord.movedPositions
                            ];

                            executionHistory.push(newRecord);

                            let fileContent = JSON.stringify(executionHistory);

                            mariamAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeExucutionHistory'");
                                }

                                writeStatusReport();
                            }
                        }
                        catch (err) {
                            const logText = "[ERROR] 'writeExucutionHistory - onFolderCreated' - ERROR : " + err.message;
                            logger.write(logText);
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'writeExucutionHistory' - ERROR : " + err.message;
                    logger.write(logText);
                }
            }

            function writeStatusReport() {

                if (LOG_INFO === true) {
                    logger.write("[INFO] Entering function 'writeStatusReport'");
                }

                try {

                    let fileName = "Status.Report.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    utilities.createFolderIfNeeded(filePath, mariamAzureFileStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            statusReport.lastExecution = processDatetime;

                            let fileContent = JSON.stringify(statusReport);

                            mariamAzureFileStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (LOG_INFO === true) {
                                    logger.write("[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                callBackFunction(true); // We tell the AA Platform that we request a regular execution and finish the bot s process.
                                return;
                            }
                        }
                        catch (err) {
                            const logText = "[ERROR] 'writeStatusReport - onFolderCreated' - ERROR : " + err.message;
                            logger.write(logText);
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'writeStatusReport' - ERROR : " + err.message;
                    logger.write(logText);
                }
            }


        } catch (err) {
            logger.write("[ERROR] saveAll -> Error = " + err.message);
            callBackFunction("Operation Failed.");
        }
    }

};