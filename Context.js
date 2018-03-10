exports.newContext = function newContext(BOT, DEBUG_MODULE, FILE_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

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

    let thisObject = {
        statusReport: undefined,            // Here is the information that defines which was the last sucessfull execution and some other details.
        executionHistory: [],               // This is the record of bot execution.
        executionContext: undefined,        // Here is the business information of the last execution of this bot process.
        newHistoryRecord : {
            date: undefined,
            buyAvgRate: 0,
            sellAvgRate: 0,  
            marketRate: 0,
            newPositions: 0,
            newTrades: 0,
            movedPositions: 0,
            profitsAssetA: 0,
            profitsAssetB: 0,
            combinedProfitsA: 0,
            combinedProfitsB: 0
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

    /* Utilities needed. */

    let utilities = UTILITIES.newUtilities(bot);

    /* Storage account to be used here. */

    let cloudStorage = FILE_STORAGE.newAzureFileStorage(bot);

    return thisObject;

    function initialize(callBackFunction) {

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

                        thisObject.newHistoryRecord.date = global.processDatetime;

                        getStatusReport(onDone);

                    } else {
                        logger.write("[ERROR] initialize -> initializeStorage -> onInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {
                            logger.write("[INFO] initialize -> onDone -> Execution finished well. :-)");
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

                    let fileName = "Status.Report.json"
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Processes/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getStatusReport -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getStatusReport -> filePath = " + filePath); }

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result === global.DEFAULT_FAIL_RESPONSE.result && err.message === 'Folder does not exist.') {
                            logger.write("[INFO] initialize -> getStatusReport -> onFileReceived -> err = " + err.message);

                            /* In this case we can assume that this is the first execution ever of this bot.*/

                            createConext(callBack);
                            return;
                        }

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
                            getExecutionHistory(callBack);

                        } catch (err) {

                            /*
                            It might happen that the file content is corrupt. We will consider this as a temporary situation, since sometimes the file
                            is being updated at the moment of the read. The bot can not run without a valid Status Report but we can request the platform to retry later.
                            */

                            logger.write("[ERROR] initialize -> getStatusReport -> onFileReceived -> Bot cannot execute without a valid Status report. -> Err = " + err.message);
                            callBack(global.DEFAULT_RETRY_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getStatusReport -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getExecutionHistory(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionHistory -> Entering function."); }

                    let fileName = "Execution.History.json"
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionHistory -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionHistory -> filePath = " + filePath); }

                    cloudStorage.getTextFile(filePath, fileName, onFileReceived);

                    function onFileReceived(err, text) {

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write("[ERROR] initialize -> getExecutionHistory -> onFileReceived -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (LOG_FILE_CONTENT === true) {
                            logger.write("[INFO] initialize -> getExecutionHistory -> onFileReceived -> Content received = " + text);
                        }

                        try {

                            thisObject.executionHistory = JSON.parse(text);

                            /* Move some values to the new record, in case there are no transactions that re-calculate them. */

                            thisObject.newHistoryRecord.buyAvgRate = thisObject.executionHistory[1];
                            thisObject.newHistoryRecord.sellAvgRate = thisObject.executionHistory[2];

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
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + dateForPath;

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionContext -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionContext -> filePath = " + filePath); }

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

                            /* Update the new History Record, in case there are no trades during this execution that updates it. */

                            thisObject.newHistoryRecord.profitsAssetA = thisObject.executionContext.profits.assetA;
                            thisObject.newHistoryRecord.profitsAssetB = thisObject.executionContext.profits.assetB;

                            thisObject.newHistoryRecord.combinedProfitsA = thisObject.executionContext.combinedProfits.assetA;
                            thisObject.newHistoryRecord.combinedProfitsB = thisObject.executionContext.combinedProfits.assetB;

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
                    content is what we are going to set up now.
    
                    */

                    thisObject.statusReport = {};

                    thisObject.executionHistory = [];

                    /*
                    In the current release, the platform is going to be used for the first competition, so we have a few parameters just for that. They will be removed later
                    once we advance into multiple competitions scheme.
                    */

                    const INITIAL_INVESTMENT = 0.0001;              // This is just for this release of the platform.

                    thisObject.executionContext = {
                        investment: {                               // This is used to calculate profits. 
                            assetA: 0,
                            assetB: INITIAL_INVESTMENT
                        },
                        balance: {                                  // This is the total balance that includes positions at the order book + funds available to be traded. 
                            assetA: 0,
                            assetB: INITIAL_INVESTMENT              // It starts with the initial investment.
                        },
                        availableBalance: {                         // This is the balance the bot has at any moment in time available to be traded (not in positions at the order book). 
                            assetA: 0,
                            assetB: INITIAL_INVESTMENT              // It starts with the initial investment.
                        },
                        profits: {
                            assetA: 0,
                            assetB: 0
                        },
                        combinedProfits: {
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
                            logger.write("[INFO] saveThemAll -> onDone -> Execution finished well. :-)");
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

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExecutionContext -> Entering function."); }

                    let fileName = "Execution.Context.json"
                    let dateForPath = global.processDatetime.getUTCFullYear() + '/' + utilities.pad(global.processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(global.processDatetime.getUTCDate(), 2) + '/' + utilities.pad(global.processDatetime.getUTCHours(), 2) + '/' + utilities.pad(global.processDatetime.getUTCMinutes(), 2);
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + dateForPath;

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExecutionContext -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExecutionContext -> filePath = " + filePath); }

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExecutionContext -> onFolderCreated -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeExecutionContext -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            let fileContent = JSON.stringify(thisObject.executionContext);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExecutionContext -> onFolderCreated -> onFileCreated -> Entering function."); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] saveThemAll -> writeExecutionContext -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBack(err);
                                    return;
                                }

                                if (FULL_LOG === true) {
                                    logger.write("[INFO] saveThemAll -> writeExecutionContext -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
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

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> Entering function."); }

                    let fileName = "Execution.History.json"
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Output/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> filePath = " + filePath); }

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> onFolderCreated -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            let newRecord = [
                                thisObject.newHistoryRecord.date.valueOf(),
                                thisObject.newHistoryRecord.buyAvgRate,
                                thisObject.newHistoryRecord.sellAvgRate,
                                thisObject.newHistoryRecord.marketRate,
                                thisObject.newHistoryRecord.newPositions,
                                thisObject.newHistoryRecord.newTrades,
                                thisObject.newHistoryRecord.movedPositions,
                                thisObject.newHistoryRecord.profitsAssetA,
                                thisObject.newHistoryRecord.profitsAssetB,
                                thisObject.newHistoryRecord.combinedProfitsA,
                                thisObject.newHistoryRecord.combinedProfitsB
                            ];

                            thisObject.executionHistory.push(newRecord);

                            let fileContent = JSON.stringify(thisObject.executionHistory);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> Entering function."); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBack(err);
                                    return;
                                }

                                if (LOG_FILE_CONTENT === true) {
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

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeStatusReport -> Entering function."); }

                    let fileName = "Status.Report.json"
                    let filePath = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + bot.dataSetVersion + "/Processes/" + bot.process + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor;

                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeStatusReport -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeStatusReport -> filePath = " + filePath); }

                    utilities.createFolderIfNeeded(filePath, cloudStorage, onFolderCreated);

                    function onFolderCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeStatusReport -> onFolderCreated -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] saveThemAll -> writeStatusReport -> onFolderCreated -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            thisObject.statusReport.lastExecution = global.processDatetime;

                            let fileContent = JSON.stringify(thisObject.statusReport);

                            cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeStatusReport -> onFolderCreated -> onFileCreated -> Entering function."); }

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