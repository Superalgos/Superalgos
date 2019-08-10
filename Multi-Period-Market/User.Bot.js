exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const EXECUTION_FOLDER_NAME = "Trading-Execution";
    const SIMULATED_RECORDS_FOLDER_NAME = "Trading-Simulation";
    const CONDITIONS_FOLDER_NAME = "Simulation-Conditions";
    const STRATEGIES_FOLDER_NAME = "Simulation-Strategies";
    const TRADES_FOLDER_NAME = "Simulation-Trades";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let dataDependencies;
    let assistant;

    return thisObject;

    function initialize(pDataDependencies, callBackFunction, pAssistant) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            dataDependencies = pDataDependencies;
            assistant = pAssistant;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(dataFiles, timePeriod, outputPeriodLabel, startDate, endDate,  callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;
            let dataFile;

            let recordsArray
            let conditionsArray
            let strategiesArray
            let tradesArray
            let lastObjectsArray 

            let tradingSystem = {};
            let interExecutionMemory = {};
            let currentDay = bot.processDatetime;

            commons.initializeData();

            for (let i = 0; i < dataDependencies.config.length; i++) {

                let dependency = dataDependencies.config[i];
                dataFile = dataFiles[i];

                switch (i) {

                    /*
                    case 0: {
                        commons.buildLRC(dataFile, callBackFunction);
                        break;
                    }*/
                    case 0: {
                        commons.buildPercentageBandwidthMap(dataFile, callBackFunction);
                        break;
                    }
                    case 1: {
                        commons.buildBollingerBandsMap(dataFile, callBackFunction);
                        break;
                    }
                    case 2: {
                        commons.buildBollingerChannelsArray(dataFile, callBackFunction);
                        break;
                    }
                    case 3: {
                        commons.buildBollingerSubChannelsArray(dataFile, callBackFunction);
                        break;
                    }
                    case 4: {
                        commons.buildCandles(dataFile, callBackFunction);
                        break;
                    }
                }
            }

            commons.runSimulation(
                timePeriod,
                currentDay,
                startDate,
                endDate,
                interExecutionMemory,
                assistant,
                writeFiles,
                callBackFunction)

            function writeFiles(pTradingSystem, pExecutionArray, pRecordsArray, pConditionsArray, pStrategiesArray, pTradesArray, pLastObjectsArray) {

                tradingSystem = pTradingSystem
                executionArray = pExecutionArray
                recordsArray = pRecordsArray
                conditionsArray = pConditionsArray
                strategiesArray = pStrategiesArray
                tradesArray = pTradesArray
                lastObjectsArray = pLastObjectsArray

                writeExecutionFile()
            }

            function writeExecutionFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeExecutionFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < executionArray.length; i++) {

                        let record = executionArray[i];

                        fileContent = fileContent + separator + '[' +
                            record.begin + "," +
                            record.end + "," +
                            JSON.stringify(record.executionRecord) + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + EXECUTION_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeExecutionFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeExecutionFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeExecutionFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeExecutionFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeExecutionFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeRecordsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeExecutionFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeExecutionFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeRecordsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeRecordsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < recordsArray.length; i++) {

                        let record = recordsArray[i];

                        fileContent = fileContent + separator + '[' +
                            record.begin + "," +
                            record.end + "," +
                            record.type + "," +
                            record.marketRate + "," +
                            record.amount + "," +
                            record.balanceA + "," +
                            record.balanceB + "," +
                            record.profit + "," +
                            record.lastTradeProfitLoss + "," +
                            record.stopLoss + "," +
                            record.roundtrips + "," +
                            record.hits + "," +
                            record.fails + "," +
                            record.hitRatio + "," +
                            record.ROI + "," +
                            record.periods + "," +
                            record.days + "," +
                            record.anualizedRateOfReturn + "," +
                            record.positionRate + "," +
                            record.lastTradeROI + "," +
                            record.strategy + "," +
                            record.strategyStageNumber  + "," +
                            record.takeProfit + "," +
                            record.stopLossPhase + "," +
                            record.takeProfitPhase + "," +
                            JSON.stringify(record.executionRecord) + "," +
                            record.positionSize + "," +
                            record.initialBalanceA + "," +
                            record.minimumBalanceA + "," +
                            record.maximumBalanceA + "," +
                            record.initialBalanceB + "," +
                            record.minimumBalanceB + "," +
                            record.maximumBalanceB + "," +
                            record.baseAsset + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeRecordsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeConditionsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeConditionsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeConditionsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < conditionsArray.length; i++) {

                        let record = conditionsArray[i];

                        let conditions = "";
                        let conditionsSeparator = "";

                        for (let j = 0; j < record.length - 3; j++) {
                            conditions = conditions + conditionsSeparator + record[j];
                            if (conditionsSeparator === "") { conditionsSeparator = ","; }
                        }

                        conditions = conditions + conditionsSeparator + '[' + record[record.length - 3] + ']';   // The last item contains an Array of condition values.
                        conditions = conditions + conditionsSeparator + '[' + record[record.length - 2] + ']';   // The last item contains an Array of formulaErrors.
                        conditions = conditions + conditionsSeparator + '[' + record[record.length - 1] + ']';   // The last item contains an Array of formulaValues.

                        fileContent = fileContent + separator + '[' + conditions + ']';

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";
                    fileContent = "[" + JSON.stringify(tradingSystem) + "," + JSON.stringify(lastObjectsArray) + "," + fileContent + "]";
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + CONDITIONS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeConditionsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeConditionsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeStrategiesFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStrategiesFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStrategiesFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < strategiesArray.length; i++) {
                        let record = strategiesArray[i];

                        fileContent = fileContent + separator + '[' +
                            record.begin + "," +
                            record.end + "," +
                            record.status + "," +
                            record.number + "," +
                            record.beginRate + "," +
                            record.endRate  + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + STRATEGIES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStrategiesFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStrategiesFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStrategiesFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStrategiesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeTradesFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStrategiesFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeTradesFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeTradesFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < tradesArray.length; i++) {

                        let record = tradesArray[i];
                        if (record.stopRate === undefined) { record.stopRate = 0 }

                        fileContent = fileContent + separator + '[' +
                            record.begin + "," +
                            record.end + "," +
                            record.status + "," +
                            record.lastTradeROI + "," +
                            record.beginRate + "," +
                            record.endRate + "," +
                            record.exitType + "," +
                            record.stopRate + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + outputPeriodLabel;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeTradesFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeTradesFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeTradesFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeTradesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            callBackFunction(global.DEFAULT_OK_RESPONSE);

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeTradesFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
