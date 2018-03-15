exports.newCommons = function newCommons(BOT, DEBUG_MODULE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";

    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        initializeStorage: initializeStorage,
        getContextVariables: getContextVariables
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let utilities = UTILITIES.newUtilities(bot);

    return thisObject;

    function initializeStorage(charlyFileStorage, bruceFileStorage, oliviaFileStorage, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] initializeStorage -> Entering function."); }

            initializeCharlyStorage();

            function initializeCharlyStorage() {

                charlyFileStorage.initialize("AACharly", onCharlyInizialized);

                function onCharlyInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        initializeBruceStorage();

                    } else {
                        logger.write("[ERROR] initializeStorage -> initializeCharlyStorage -> onCharlyInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function initializeBruceStorage() {

                bruceFileStorage.initialize("AABruce", onBruceInizialized);

                function onBruceInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        initializeOliviaStorage();

                    } else {
                        logger.write("[ERROR] initializeStorage -> initializeBruceStorage -> onBruceInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function initializeOliviaStorage() {

                oliviaFileStorage.initialize("AAOlivia", onOliviaInizialized);

                function onOliviaInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write("[ERROR] initializeStorage -> initializeOliviaStorage -> onOliviaInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] initializeStorage -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getContextVariables(charlyFileStorage, bruceFileStorage, oliviaFileStorage, contextVariables, statusReportModule, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> Entering function."); }

            let reportFilePath;
            let fileName = "Status.Report." + global.MARKET.assetA + '_' + global.MARKET.assetB + ".json"

            if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> fileName = " + fileName); }

            getHistoricTrades();

            function getHistoricTrades() {

                if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getHistoricTrades -> Entering function."); }

                /*

                We need to know where is the begining of the market, since that will help us know where the Index Files should start. 

                */

                reportFilePath = EXCHANGE_NAME + "/Processes/" + "Poloniex-Historic-Trades";

                if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getHistoricTrades -> reportFilePath = " + reportFilePath); }

                charlyFileStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                function onFileReceived(err, text) {

                    if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getHistoricTrades -> onFileReceived -> Entering function."); }
                    if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getHistoricTrades -> onFileReceived -> text = " + text); }

                    let thisReport;

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        try {
                            thisReport = JSON.parse(text);

                            contextVariables.firstTradeFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                            getOneMinDailyCandlesVolumes();

                        } catch (err) {
                            logger.write("[ERROR] getContextVariables -> getHistoricTrades -> onFileReceived -> err = " + err.message);
                            logger.write("[ERROR] getContextVariables -> getHistoricTrades -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        }
                    } else {
                        logger.write("[ERROR] getContextVariables -> getHistoricTrades -> onFileReceived -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function getOneMinDailyCandlesVolumes() {

                if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getOneMinDailyCandlesVolumes -> Entering function."); }

                /* We need to discover the maxCandle file, which is the last file with candles we can use as input. */

                let date = new Date();
                let currentYear = date.getUTCFullYear();
                let currentMonth = utilities.pad(date.getUTCMonth() + 1, 2);

                reportFilePath = EXCHANGE_NAME + "/Processes/" + "One-Min-Daily-Candles-Volumes" + "/" + currentYear + "/" + currentMonth;

                if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getOneMinDailyCandlesVolumes -> reportFilePath = " + reportFilePath); }

                bruceFileStorage.getTextFile(reportFilePath, fileName, onFileReceived);

                function onFileReceived(err, text) {

                    if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getOneMinDailyCandlesVolumes -> onFileReceived -> Entering function."); }
                    if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getOneMinDailyCandlesVolumes -> onFileReceived -> text = " + text); }

                    let thisReport;

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        try {
                            thisReport = JSON.parse(text);

                            contextVariables.maxCandleFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + "00:00" + GMT_SECONDS);

                            getThisProcessReport();

                        } catch (err) {
                            logger.write("[ERROR] getContextVariables -> getOneMinDailyCandlesVolumes -> onFileReceived -> err = " + err.message);
                            logger.write("[ERROR] getContextVariables -> getOneMinDailyCandlesVolumes -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        }
                    } else {
                        logger.write("[ERROR] getContextVariables -> getHistoricTrades -> onFileReceived -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function getThisProcessReport() {

                if (FULL_LOG === true) { logger.write("[INFO] getContextVariables -> getThisProcessReport -> Entering function."); }

                statusReportModule.initialize(bot, onInitilized);

                function onInitilized(err) {

                    try {

                        switch (err.result) {
                            case global.DEFAULT_OK_RESPONSE.result: {
                                logger.write("[INFO] getContextVariables -> getThisProcessReport -> onInitilized -> Execution finished well. :-)");

                                contextVariables.lastCandleFile = new Date(statusReportModule.file.lastFile);

                                /*
                                Here we assume that the last day written might contain incomplete information. This actually happens every time the head of the market is reached.
                                For that reason we go back one day, the partial information is discarded and added again with whatever new info is available.
                                */

                                contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS);

                                let customOk = {
                                    result: global.CUSTOM_OK_RESPONSE.result,
                                    message: "Status Report did exist."
                                };

                                callBackFunction(customOk); 

                                return;
                            }
                            case global.CUSTOM_FAIL_RESPONSE.result: {  // We need to see if we can handle this.
                                logger.write("[ERROR] getContextVariables -> getThisProcessReport -> onInitilized -> err.message = " + err.message);

                                if (err.message === "Status Report was never created.") {

                                    contextVariables.lastCandleFile = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                                    contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                                    let customOk = {
                                        result: global.CUSTOM_OK_RESPONSE.result,
                                        message: "Status Report did not exist."
                                    };

                                    callBackFunction(customOk); 
                                    return;

                                } else {
                                    callBackFunction(err);              // we cant handle this here.
                                }
                                return;
                            }
                            default:
                                {
                                    logger.write("[ERROR] getContextVariables -> getThisProcessReport -> onInitilized -> Operation Failed.");
                                    callBackFunction(err);
                                    return;
                                }
                        }
                    }
                    catch (err) {
                        logger.write("[ERROR] getContextVariables -> getThisProcessReport -> onInitilized -> err = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] getContextVariables -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};