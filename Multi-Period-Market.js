exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE, USER_BOT_MODULE, COMMONS_MODULE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

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
    let marketFiles = [];

    let usertBot;

    return thisObject;

    function initialize(pStatusDependencies, pDataDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            dataDependencies = pDataDependencies;

            for (let i = 0; i < dataDependencies.length; i++) {

                let key;
                let storage;
                let dependency = dataDependencies[i];

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

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];

                            let fileCount = 0;

                            for (let i = 0; i < dataDependencies.length; i++) {

                                let dependency = dataDependencies[i];
                                let storage = storages[i];

                                getFile();

                                function getFile() {

                                    try {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> getFile -> Entering function."); }

                                        let fileName = market.assetA + '_' + market.assetB + ".json";

                                        let filePathRoot = dependency.devTeam + "/" + dependency.bot + "." + dependency.botVersion.major + "." + dependency.botVersion.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + dependency.dataSetVersion;
                                        let filePath = filePathRoot + "/Output/" + dependency.product + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                        storage.getTextFile(filePath, fileName, onFileReceived, true);

                                        function onFileReceived(err, text) {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> getFile -> onFileReceived -> Entering function."); }
                                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> getFile -> onFileReceived -> text = " + text); }

                                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                    callBackFunction(err);
                                                    return;

                                                }

                                                let marketFile = JSON.parse(text);
                                                marketFiles.push(marketFile);
                                                fileCount++;

                                                callTheBot();

                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }
                                    }
                                    catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> getFile -> err = " + err.message);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }

                            }

                            function callTheBot() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> callTheBot -> Entering function."); }

                                    if (fileCount === dataDependencies.length + 1) {

                                        const outputPeriod = global.marketFilesPeriods[n][0];
                                        const timePeriod = global.marketFilesPeriods[n][1];

                                        usertBot.initialize(marketFiles, outputPeriod, timePeriod, callBackFunction);

                                        function onBotFinished(err) {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> loopBody -> callTheBot -> onBotFinished -> Entering function."); }

                                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                    callBackFunction(err);
                                                    return;
                                                }

                                                controlLoop();
                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> callTheBot -> onBotFinished -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }
                                    }

                                }
                                catch(err){
                                    logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> callTheBot -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> processTimePeriods -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> processTimePeriods -> controlLoop -> err = " + err.message);
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

                    let reportKey = "AAMasters" + "-" + "AAJason" + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
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
