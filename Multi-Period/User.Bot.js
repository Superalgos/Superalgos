exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const SIMULATED_RECORDS_FOLDER_NAME = "Trading-Simulation";
    const CONDITIONS_FOLDER_NAME = "Simulation-Conditions";
    const STRATEGIES_FOLDER_NAME = "Simulation-Strategies";
    const TRADES_FOLDER_NAME = "Simulation-Trades";

    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let assistant;

    return thisObject;

    function initialize(callBackFunction, pAssistant) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            assistant = pAssistant;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(multiPeriodDataFiles, timePeriod, timePeriodLabel, currentDay, startDate, endDate, interExecutionMemory, callBackFunction) {

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

            for (let j = 0; j < global.marketFilesPeriods.length; j++) {

                let mapKey = marketFilesPeriods[j][1]
                let dataFiles = multiPeriodDataFiles.get(mapKey)

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Building Dataset for timePeriod = " + mapKey); }

                if (dataFiles) {
                    for (let i = 0; i < 5; i++) {

                        dataFile = dataFiles[i];

                        switch (i) {
                            case 0: {
                                commons.buildPercentageBandwidthArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 1: {
                                commons.buildBollingerBandsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 2: {
                                commons.buildBollingerChannelsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 3: {
                                commons.buildBollingerSubChannelsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 4: {
                                commons.buildCandles(dataFile, mapKey, callBackFunction);
                                break;
                            }
                        }
                    }
                }
            }

            for (let j = 0; j < global.dailyFilePeriods.length; j++) {

                let mapKey = global.dailyFilePeriods[j][1]
                let dataFiles = multiPeriodDataFiles.get(mapKey)

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Building Dataset for timePeriod = " + mapKey); }

                if (dataFiles) {
                    for (let i = 0; i < 5; i++) {

                        dataFile = dataFiles[i];

                        switch (i) {
                            case 0: {
                                commons.buildPercentageBandwidthArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 1: {
                                commons.buildBollingerBandsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 2: {
                                commons.buildBollingerChannelsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 3: {
                                commons.buildBollingerSubChannelsArray(dataFile, mapKey, callBackFunction);
                                break;
                            }
                            case 4: {
                                commons.buildCandles(dataFile, mapKey, callBackFunction);
                                break;
                            }
                        }
                    }
                }
            }

            commons.runSimulation(
                timePeriod,
                timePeriodLabel,
                currentDay,
                startDate,
                endDate,
                interExecutionMemory,
                assistant,
                writeFiles,
                callBackFunction)

            function writeFiles(pTradingSystem, pRecordsArray, pConditionsArray, pStrategiesArray, pTradesArray, pLastObjectsArray) {

                tradingSystem = pTradingSystem
                recordsArray = pRecordsArray
                conditionsArray = pConditionsArray
                strategiesArray = pStrategiesArray
                tradesArray = pTradesArray
                lastObjectsArray = pLastObjectsArray

                if (timePeriod > global.dailyFilePeriods[0][0]) {
                    writeMarketFiles()
                } else {
                    writeDailyFiles()
                }
            }

            function writeMarketFiles() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> Entering function."); }

                writeRecordsFile();

                function writeRecordsFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeRecordsFile -> Entering function."); }

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
                                record.strategyStageNumber + "," +
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
                                record.baseAsset + "," +
                                record.positionPeriods + "," +
                                record.positionDays + "," +
                                record.distanceToLastTriggerOn + "," +
                                record.distanceToLastTriggerOff + "," +
                                record.distanceToLastTakePosition + "," +
                                record.distanceToLastClosePosition + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriodLabel;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeConditionsFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeRecordsFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeConditionsFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeConditionsFile -> Entering function."); }

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
                        let filePath = filePathRoot + "/Output/" + CONDITIONS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriodLabel;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeStrategiesFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeConditionsFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeStrategiesFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeStrategiesFile -> Entering function."); }

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
                                record.endRate + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + STRATEGIES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriodLabel;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeTradesFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeStrategiesFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeTradesFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeTradesFile -> Entering function."); }

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
                                record.exitType + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriodLabel;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                /* Emit event that signals that simulation files were updated */
                                global.SYSTEM_EVENT_HANDLER.raiseEvent('Jason-Multi-Period', 'Simulation Files Updated')

                                callBackFunction(global.DEFAULT_OK_RESPONSE);

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeMarketFiles -> writeTradesFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

            }

            function writeDailyFiles() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> Entering function."); }

                writeRecordsFile();

                /* TODO : NEXT function is a work in progress, not used today */
                function writeFinalResults() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeFinalResults -> Entering function."); }

                        if ( // We only write this file if we are at the head of the market.
                            Math.trunc(currentDay.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS
                            !==
                            Math.trunc((new Date()).valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS
                        ) {
                            writeRecordsFile();
                            return;
                        }

                        let separator = "";
                        let fileRecordCounter = 0;

                        let fileContent = "";

                        for (let i = 0; i < recordsArray.length; i++) {

                            let record = recordsArray[i];

                            /* Will only add to the file the records of the current day */

                            if (record.begin < currentDay.valueOf()) { continue; }

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
                                record.strategyStageNumber + "," +
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
                                record.baseAsset + "," +
                                record.positionPeriods + "," +
                                record.positionDays + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + timePeriodLabel;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeRecordsFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeFinalResults -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeFinalResults -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeRecordsFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeRecordsFile -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;

                        let fileContent = "";

                        for (let i = 0; i < recordsArray.length; i++) {

                            let record = recordsArray[i];

                            /* Will only add to the file the records of the current day */

                            if (record.begin < currentDay.valueOf()) { continue; }

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
                                record.strategyStageNumber + "," +
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
                                record.baseAsset + "," +
                                record.positionPeriods + "," +
                                record.positionDays + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + timePeriodLabel + "/" + dateForPath;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeConditionsFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeRecordsFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeRecordsFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeConditionsFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeConditionsFile -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;

                        let fileContent = "";

                        for (let i = 0; i < conditionsArray.length; i++) {

                            let record = conditionsArray[i];

                            /* Will only add to the file the records of the current day */

                            if (record.begin < currentDay.valueOf()) { continue; }

                            let conditions = "";
                            let conditionsSeparator = "";

                            /* Will only add to the file the records of the current day */

                            if (record.begin < currentDay.valueOf()) { continue; }

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

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + CONDITIONS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + timePeriodLabel + "/" + dateForPath;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeStrategiesFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeConditionsFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeConditionsFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeStrategiesFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeStrategiesFile -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;

                        let fileContent = "";

                        for (let i = 0; i < strategiesArray.length; i++) {
                            let record = strategiesArray[i];

                            /* Will only add to the file the records of the current day. In this case since objects can span more than one day, we add all of the objects that ends
                            at the current date. */

                            if (record.end < currentDay.valueOf()) { continue; }

                            fileContent = fileContent + separator + '[' +
                                record.begin + "," +
                                record.end + "," +
                                record.status + "," +
                                record.number + "," +
                                record.beginRate + "," +
                                record.endRate + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + STRATEGIES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + timePeriodLabel + "/" + dateForPath;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                writeTradesFile();

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeStrategiesFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeStrategiesFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

                function writeTradesFile() {

                    try {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeTradesFile -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;

                        let fileContent = "";

                        for (let i = 0; i < tradesArray.length; i++) {

                            let record = tradesArray[i];

                            /* Will only add to the file the records of the current day. In this case since objects can span more than one day, we add all of the objects that ends
                            at the current date. */

                            if (record.end < currentDay.valueOf()) { continue; }
                            if (record.stopRate === undefined) { record.stopRate = 0 }

                            fileContent = fileContent + separator + '[' +
                                record.begin + "," +
                                record.end + "," +
                                record.status + "," +
                                record.lastTradeROI + "," +
                                record.beginRate + "," +
                                record.endRate + "," +
                                record.exitType + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                        let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                        let filePath = filePathRoot + "/Output/" + TRADES_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + timePeriodLabel + "/" + dateForPath;
                        filePath += '/' + fileName

                        fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                        function onFileCreated(err) {

                            try {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> Entering function."); }
                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> fileContent = " + fileContent); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> filePath = " + filePath);
                                    logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                    callBackFunction(err);
                                    return;

                                }

                                /* Emit event that signals that simulation files were updated */
                                global.SYSTEM_EVENT_HANDLER.raiseEvent('Jason-Multi-Period', 'Simulation Files Updated')

                                callBackFunction(global.DEFAULT_OK_RESPONSE);

                            }
                            catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeTradesFile -> onFileCreated -> err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            }
                        }
                    }
                    catch (err) {
                        logger.write(MODULE_NAME, "[ERROR] start -> writeDailyFiles -> writeTradesFile -> err = " + err.stack);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
