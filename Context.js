exports.newContext = function newContext(BOT, DEBUG_MODULE, BLOB_STORAGE, UTILITIES, STATUS_REPORT) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    let bot = BOT;

    const MODULE_NAME = "Context";

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;
    logger.initialize();

    /* 

    This module allows deals with keeping the context between different executions of the bot. 
    It deals with these 3 different files that helps the bot process remember where it is standing:

    1. The Status Report.
    2. The Execution History.
    3. The Execution Context.

    */

 

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
            lastSellRate: 0,
            sellExecRate: 0,
            lastBuyRate: 0,
            buyExecRate: 0,
            marketRate: 0,
            newPositions: 0,
            newTrades: 0,
            movedPositions: 0,
            profitsAssetA: 0,
            profitsAssetB: 0,
            combinedProfitsA: 0,
            combinedProfitsB: 0,
            messageRelevance: 0,
            messageTitle: "",
            messageBody: ""
        },
        initialize: initialize,
        saveThemAll: saveThemAll
    };

    /*

    During the process we will create a new History Record. This will go to the Context History file which essentially mantains an
    index of all the bots executions. This file will later be plotted by the bot s plotter on the timeline, allowing end users to
    know where there is information related to the actions taken by the bot.

    */

    let statusReportModule;

    /* Utilities needed. */

    let utilities = UTILITIES.newCloudUtilities(bot);

    /* Storage account to be used here. */

    let cloudStorage = BLOB_STORAGE.newBlobStorage(bot);

    let statusDependencies;

    let runIndex;  // This is the index for this run and depends on the runMode. 

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            /*

            Here we get the positions the bot did and that are recorded at the bot storage account. We will use them through out the rest
            of the process.

            */
            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(bot.devTeam, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        thisObject.newHistoryRecord.date = bot.processDatetime;

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

                            bot.hasTheBotJustStarted = false;

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] initialize -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err);
                            return;
                        }
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] initialize -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                        default: {
                            logger.write("[ERROR] initialize -> onDone -> Operation Failed with custom response.");
                            callBackFunction(err);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getStatusReport(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getStatusReport -> Entering function."); }

                    let key = bot.devTeam + "-" + bot.codeName + "-" + bot.process + "-" + bot.dataSetVersion;

                    statusReportModule = statusDependencies.statusReports.get(key);
                    thisObject.statusReport = statusReportModule.file;

                    if (bot.hasTheBotJustStarted === true) { 

                        createConext(callBack);

                    } else {

                        switch (bot.runMode) {

                            case "Live": {

                                runIndex = thisObject.statusReport.liveRuns.length - 1;
                                break;
                            }

                            case "Backtest": {

                                runIndex = thisObject.statusReport.backtestRuns.length - 1;
                                break;
                            }

                            case "Competition": {

                                runIndex = thisObject.statusReport.competitionRuns.length - 1;
                                break;
                            }

                            default: {
                                logger.write("[ERROR] initialize -> createConext -> Unexpected bot.runMode.");
                                logger.write("[ERROR] initialize -> createConext -> bot.runMode = " + bot.runMode);
                                callBack(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }
                        }

                        getExecutionHistory(callBack); 

                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> getStatusReport -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getExecutionHistory(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> getExecutionHistory -> Entering function."); }

                    let fileName = "Execution.History." + bot.runMode + "." + runIndex + ".json";
                    let filePath = bot.filePathRoot + "/Output/" + bot.process;

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

                            thisObject.newHistoryRecord.buyAvgRate = thisObject.executionHistory[thisObject.executionHistory.length-1][1];
                            thisObject.newHistoryRecord.sellAvgRate = thisObject.executionHistory[thisObject.executionHistory.length - 1][2];

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

                    let date;

                    switch (bot.runMode) {

                        case "Live": {
                            date = new Date(thisObject.statusReport.liveRuns[runIndex].lastExecution);
                            thisObject.statusReport.liveRuns[runIndex].lastExecution = bot.processDatetime;
                            thisObject.statusReport.liveRuns[runIndex].endDatetime = bot.processDatetime;
                            break;
                        }

                        case "Backtest": {
                            date = new Date(thisObject.statusReport.backtestRuns[runIndex].lastExecution);
                            thisObject.statusReport.backtestRuns[runIndex].lastExecution = bot.processDatetime;
                            break;
                        }

                        case "Competition": {
                            date = new Date(thisObject.statusReport.competitionRuns[runIndex].lastExecution);
                            thisObject.statusReport.competitionRuns[runIndex].lastExecution = bot.processDatetime;
                            break;
                        }

                        default: {
                            logger.write("[ERROR] initialize -> getExecutionContext -> Unexpected bot.runMode.");
                            logger.write("[ERROR] initialize -> getExecutionContext -> bot.runMode = " + bot.runMode);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    let fileName = "Execution.Context." + bot.runMode + "." + runIndex + ".json";
                    let dateForPath = date.getUTCFullYear() + '/' + utilities.pad(date.getUTCMonth() + 1, 2) + '/' + utilities.pad(date.getUTCDate(), 2) + '/' + utilities.pad(date.getUTCHours(), 2) + '/' + utilities.pad(date.getUTCMinutes(), 2);
                    let filePath = bot.filePathRoot + "/Output/" + bot.process + '/' + dateForPath;

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

                    /* Here, we dont know if the Status Report was ever created or not. To test that we do this. */

                    if (thisObject.statusReport.liveRuns === undefined) { // This means that the Status Report does not exist.

                        thisObject.statusReport = {
                            liveRuns: [],
                            backtestRuns: [],
                            competitionRuns: []
                        };
                    } 

                    switch (bot.runMode) {

                        case "Live": {

                            let runContent = {
                                beginDatetime: bot.processDatetime,
                                endDatetime: bot.processDatetime,
                                lastExecution: bot.processDatetime
                            };

                            thisObject.statusReport.liveRuns.push(runContent);
                            runIndex = thisObject.statusReport.liveRuns.length - 1;
                            break;
                        }

                        case "Backtest": {

                            let runContent = {
                                beginDatetime: new Date(bot.backtest.beginDatetime),
                                endDatetime: new Date(bot.backtest.endDatetime),
                                lastExecution: bot.processDatetime
                            };

                            thisObject.statusReport.backtestRuns.push(runContent);
                            runIndex = thisObject.statusReport.backtestRuns.length - 1;
                            break;
                        }

                        case "Competition": {

                            let runContent = {
                                beginDatetime: new Date(bot.competition.beginDatetime),
                                endDatetime: new Date(bot.competition.endDatetime),
                                lastExecution: bot.processDatetime
                            };

                            thisObject.statusReport.competitionRuns.push(runContent);
                            runIndex = thisObject.statusReport.competitionRuns.length - 1;
                            break;
                        }

                        default: {
                            logger.write("[ERROR] initialize -> createConext -> Unexpected bot.runMode.");
                            logger.write("[ERROR] initialize -> createConext -> bot.runMode = " + bot.runMode);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                    }

                    thisObject.executionHistory = [];

                    /*
                    In the current release, the platform is going to be used for the first competition, so we have a few parameters just for that. They will be removed later
                    once we advance into multiple competitions scheme.
                    */

					const INITIAL_INVESTMENT_A = 0;              // This is just for this release of the platform.
                    const INITIAL_INVESTMENT_B = .001;              // This is just for this release of the platform.

                    thisObject.executionContext = {
                        investment: {                               // This is used to calculate profits. 
                            assetA: INITIAL_INVESTMENT_A,
                            assetB: INITIAL_INVESTMENT_B
                        },
                        balance: {                                  // This is the total balance that includes positions at the order book + funds available to be traded. 
                            assetA: INITIAL_INVESTMENT_A,
                            assetB: INITIAL_INVESTMENT_B              // It starts with the initial investment.
                        },
                        availableBalance: {                         // This is the balance the bot has at any moment in time available to be traded (not in positions at the order book). 
                            assetA: INITIAL_INVESTMENT_A,
                            assetB: INITIAL_INVESTMENT_B              // It starts with the initial investment.
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

                    let fileName = "Execution.Context." + bot.runMode + "." + runIndex +".json";
                    let dateForPath = bot.processDatetime.getUTCFullYear() + '/' + utilities.pad(bot.processDatetime.getUTCMonth() + 1, 2) + '/' + utilities.pad(bot.processDatetime.getUTCDate(), 2) + '/' + utilities.pad(bot.processDatetime.getUTCHours(), 2) + '/' + utilities.pad(bot.processDatetime.getUTCMinutes(), 2);
                    let filePath = bot.filePathRoot + "/Output/" + bot.process + '/' + dateForPath;

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

                    let fileName = "Execution.History." + bot.runMode + "." + runIndex + ".json";
                    let filePath = bot.filePathRoot + "/Output/" + bot.process;

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

                                thisObject.newHistoryRecord.lastSellRate,
                                thisObject.newHistoryRecord.sellExecRate,
                                thisObject.newHistoryRecord.lastBuyRate,
                                thisObject.newHistoryRecord.buyExecRate,

                                thisObject.newHistoryRecord.marketRate,
                                thisObject.newHistoryRecord.newPositions,
                                thisObject.newHistoryRecord.newTrades,
                                thisObject.newHistoryRecord.movedPositions,
                                thisObject.newHistoryRecord.profitsAssetA,
                                thisObject.newHistoryRecord.profitsAssetB,
                                thisObject.newHistoryRecord.combinedProfitsA,
                                thisObject.newHistoryRecord.combinedProfitsB,

                                thisObject.newHistoryRecord.messageRelevance,
                                thisObject.newHistoryRecord.messageTitle,
                                thisObject.newHistoryRecord.messageBody
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

                                /* Here we will write the file containing the max sequence number. */

                                fileContent = runIndex;
                                fileName = "Execution.History." + bot.runMode + "." + "Sequence" + ".json";
                                filePath = bot.filePathRoot + "/Output/" + bot.process;

                                cloudStorage.createTextFile(filePath, fileName, fileContent + '\n', onSequenceFileCreated);

                                function onSequenceFileCreated(err) {

                                    if (FULL_LOG === true) { logger.write("[INFO] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> onSequenceFileCreated -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                        logger.write("[ERROR] saveThemAll -> writeExucutionHistory -> onFolderCreated -> onFileCreated -> onSequenceFileCreated -> err = " + err.message);
                                        callBack(err);
                                        return;
                                    }

                                    writeStatusReport(callBack);
                                    return;
                                }
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

                    statusReportModule.file = thisObject.statusReport;
                    statusReportModule.save(callBack);

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