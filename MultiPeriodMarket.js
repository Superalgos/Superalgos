exports.newMultiPeriodMarket = function newMultiPeriodMarket(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, USER_BOT_MODULE, COMMONS_MODULE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Multi Period Market";

    const EXCHANGE_NAME = "Poloniex";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;
    let dataDependencies;
    let storages = [];
    let dataFiles = [];

    let usertBot;

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            dataDependencies = pDataDependencies;

            for (let i = 0; i < dataDependencies.config.length; i++) {

                let key;
                let storage;
                let dependency = dataDependencies.config[i];

                key = dependency.devTeam + "-" +
                    dependency.bot + "-" +
                    dependency.product + "-" +
                    dependency.dataSet + "-" +
                    dependency.dataSetVersion 

                storage = dataDependencies.dataSets.get(key);

                storages.push(storage);

            }

            usertBot = USER_BOT_MODULE.newUserBot(bot, logger, COMMONS_MODULE, UTILITIES, BLOB_STORAGE);
            usertBot.initialize(dataDependencies, pMonth, pYear, callBackFunction);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            processTimePeriods();

            function processTimePeriods() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoop -> Entering function."); }

                            /*
            
                            We will iterate through all posible periods.
            
                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            periodsLoopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];

                            let dependencyIndex = 0;
                            dataFiles = [];

                            dependencyLoopBody();

                            function dependencyLoopBody() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> Entering function."); }

                                    let dependency = dataDependencies.config[dependencyIndex];
                                    let storage = storages[dependencyIndex];

                                    getFile();

                                    function getFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> Entering function."); }

                                            let fileName = market.assetA + '_' + market.assetB + ".json";

                                            let filePath = dependency.product + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                            storage.getTextFile(filePath, fileName, onFileReceived, true);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> text = " + text); }

                                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> filePath = " + filePath);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> fileName = " + fileName);
                                                        callBackFunction(err);
                                                        return;
                                                    }

                                                    let dataFile = JSON.parse(text);
                                                    dataFiles.push(dataFile);

                                                    dependencyControlLoop();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> dependencyLoopBody -> getFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoop -> dependencyLoopBody -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function dependencyControlLoop() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> dependencyControlLoop -> Entering function."); }

                                    dependencyIndex++;

                                    if (dependencyIndex < dataDependencies.config.length) {

                                        dependencyLoopBody();

                                    } else {

                                        callTheBot();

                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> dependencyControlLoop -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                           
                            function callTheBot() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> callTheBot -> Entering function."); }

                                    const outputPeriod = global.marketFilesPeriods[n][0];
                                    const timePeriod = global.marketFilesPeriods[n][1];

                                    usertBot.start(dataFiles, outputPeriod, timePeriod, onBotFinished);

                                    function onBotFinished(err) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsLoopBody -> callTheBot -> onBotFinished -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                callBackFunction(err);
                                                return;
                                            }

                                            periodsControlLoop();
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> callTheBot -> onBotFinished -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch(err){
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> callTheBot -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsControlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> periodsControlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                periodsLoopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsControlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }

                try {

                    let reportKey = bot.devTeam + "-" + bot.codeName + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }

        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
