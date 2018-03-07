exports.newContext = function newContext(BOT, DEBUG_MODULE, FILE_STORAGE) {

    const FULL_LOG = true;

    /* 

    This module allows trading bots to connect to the exchange and do trding operations on it. So far it can only work with Poloniex.
    It deals with these 3 different files that helps the bot process remember where it is standing:

    1. The Status Report.
    2. The Execution History.
    3. The Execution Context.

    */

    const MODULE_NAME = "Context";

    /*

    Here we will keep the last status report, to be available during the whole process. The Status Report is a file the bot process
    reads and saves again after each execution. Its main purpose is to know when the last execution was in order to locate the execution
    context. When the bot runs for the first time it takes some vital parameters from there and it checks them through its lifecycle to see
    if they changed. The Status Report file can eventually be manipulated by the bot operators / developers in order to change those parameters
    or to point the last execution to a different date. Humans are not supose to manipulate the Execution Histroy or the execution Context files.

    The Execution History is basically an index with dates of all the executions the bot did across its history. It allows the bot plotter
    to know which datetimes have informacion about the bots execution in order to display it.

    The Execution Context file records all the context information of the bot at the moment of execution and the final state of all of its
    positions on the market.

    */

    thisObject = {
        statusReport: undefined,            // Here is the information that defines which was the last sucessfull execution and some other details.
        executionHistory: [],               // This is the record of bot execution.
        executionContext: undefined,        // Here is the business information of the last execution of this bot process.
        newHistoryRecord : {
            date: undefined,
            rate: 0,                        // This will be used to know where to plot this information in the time line. 
            newPositions: 0,
            newTrades: 0,
            movedPositions: 0
        },
        initialize: initialize,
        saveThemAll: saveThemAll
    };

    /*

    During the process we will create a new History Record. This will go to the Context History file which essentially mantains an
    index of all the bots executions. This file will later be plotted by the bot s plotter on the timeline, allowing end users to
    know where there is information related to the actions taken by the bot.

    */

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    /* Storage account to be used here. */

    let cloudStorage = FILE_STORAGE.newAzureFileStorage(bot);

    let processDatetime;

    const EXCHANGE_NAME = "Poloniex";

    return thisObject;

    function initialize(pProcessDatetime, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /*

            Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
            of the process.

            */
            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(bot.codeName, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        thisObject.newHistoryRecord.date = pProcessDatetime;
                        processDatetime = pProcessDatetime;

                        getStatusReport(onDone);

                    } else {
                        logger.write("[ERROR] initialize -> initializeStorage -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] initialize -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] initialize -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getStatusReport(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getStatusReport -> Entering function."); }

                    /* If the process run and was interrupted, there should be a status report that allows us to resume execution. */

                    let fileName = "Status.Report.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] initialize -> getStatusReport -> onFileReceived -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (FULL_LOG === true) {
                            logger.write("[INFO] initialize -> getStatusReport -> onFileReceived -> Content received = " + text);
                        }

                        try {

                            thisObject.statusReport = JSON.parse(text);

                            if (thisObject.statusReport.lastExecution === undefined) {
                                createConext(callBack);
                            } else {
                                getExecutionHistory(callBack);
                            }

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without an Execution Context,
                            since it is risky to ignore its own context, so even for first time execution, a file with the right format
                            is needed.

                            */

                            logger.write("[ERROR] initialize -> getStatusReport -> onFileReceived -> Bot cannot execute without the Status report. -> Err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getExecutionHistory -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getExecutionHistory(callBack) {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionHistory -> Entering function."); }

                    let fileName = "Execution.History.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] initialize -> getExecutionHistory -> onFileReceived -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (FULL_LOG === true) {
                            logger.write("[INFO] initialize -> getExecutionHistory -> onFileReceived -> Content received = " + text);
                        }

                        try {

                            thisObject.executionHistory = JSON.parse(text);
                            getExecutionContext(callBack);

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without an Execution Hitory,
                            since it is risky to ignore its own history, so even for first time execution, a file with the right format
                            is needed.

                            */

                            logger.write("[ERROR] initialize -> getExecutionHistory -> onFileReceived -> Bot cannot execute without the Execution History. -> Err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getExecutionHistory -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getExecutionContext(callBack) {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionContext -> Entering function."); }

                    let date = new Date(thisObject.statusReport.lastExecution);

                    let fileName = "Execution.Context.json"
                    let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] initialize -> getExecutionContext -> onFileReceived -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (FULL_LOG === true) {
                            logger.write("[INFO] initialize -> getExecutionContext -> onFileReceived -> Content received = " + text);
                        }

                        try {

                            thisObject.executionContext = JSON.parse(text);
                            thisObject.executionContext.transactions = []; // We record here the transactions that happened duting this execution.
                            callBack(global.DEFAULT_OK_RESPONSE);

                        } catch (err) {

                            /*

                            It might happen that the file content is corrupt or it does not exist. The bot can not run without a Status Report,
                            since it is risky to ignore its own history, so even for first time execution, a status report with the right format
                            is needed.

                            */

                            logger.write("[ERROR] initialize -> getExecutionContext -> onFileReceived -> Bot cannot execute without the Execution Context. -> Err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getExecutionContext -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function createConext(callBack) {

                try {
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> createConext -> Entering function."); }
                    /*
    
                    When the bot is executed for the very first time, there are a few files that do not exist and need to be created, and that
                    is what we are going to do now.
    
                    */

                    thisObject.executionHistory = [];

                    thisObject.executionContext = {
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

                    callBack(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    logger.write("[ERROR] initialize -> createConext -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function saveThemAll(callBackFunction) {

        try {

            writeExecutionContext(onDone);

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] saveThemAll -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] saveThemAll -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    logger.write("[ERROR] saveThemAll -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeExecutionContext(callBack) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] saveThemAll -> writeExecutionContext -> Entering function.");
                }

                try {

                    let fileName = "Execution.Context.json"
                    let dateForPath = processDatetime.getUTCFullYear() + '/' + utilities.pad(processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDatetime.getUTCDate(), 2) + '/' + utilities.pad(processDatetime.getUTCHours(), 2) + '/' + utilities.pad(processDatetime.getUTCMinutes(), 2);
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + dateForPath;

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeExecutionContext -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            let fileContent = JSON.stringify(thisObject.executionContext);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBack(err);
                                    return;
                                }

                                if (FULL_LOG === true) {
                                    logger.write("[INFO] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                                }

                                writeExucutionHistory(callBack);
                                return;
                            }
                        }
                        catch (err) {
                            logger.write("[ERROR] saveThemAll -> writeExecutionContext -> onFolderCreated -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write("[ERROR] saveThemAll -> writeExecutionContext -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeExucutionHistory(callBack) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] saveThemAll -> writeExucutionHistory -> Entering function.");
                }

                try {

                    let fileName = "Execution.History.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Output/" + bot.process;

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            let newRecord = [
                                newHistoryRecord.date.valueOf(),
                                newHistoryRecord.rate,
                                newHistoryRecord.newPositions,
                                newHistoryRecord.newTrades,
                                newHistoryRecord.movedPositions
                            ];

                            thisObject.executionHistory.push(newRecord);

                            let fileContent = JSON.stringify(thisObject.executionHistory);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBack(err);
                                    return;
                                }

                                if (FULL_LOG === true) {
                                    logger.write("[INFO] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                                }

                                writeStatusReport(callBack);
                                return;
                            }
                        }
                        catch (err) {
                            logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] saveThemAll -> writeStatusReport -> Entering function.");
                }

                try {

                    let fileName = "Status.Report.json"
                    let filePath = EXCHANGE_NAME + "/" + bot.codeName + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeStatusReport -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            thisObject.statusReport.lastExecution = processDatetime;

                            let fileContent = JSON.stringify(thisObject.statusReport);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] saveThemAll -> writeStatusReport -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBack(err);
                                    return;
                                }

                                if (FULL_LOG === true) {
                                    logger.write("[INFO] saveThemAll -> writeStatusReport -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                                }

                                callBack(global.DEFAULT_OK_RESPONSE); 
                                return;
                            }
                        }
                        catch (err) {
                            logger.write("[ERROR] saveThemAll -> writeStatusReport -> onFolderCreated -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write("[ERROR] saveThemAll -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            logger.write("[ERROR] saveThemAll -> Error = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};