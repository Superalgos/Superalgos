exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const SIMULATED_RECORDS_FOLDER_NAME = "Trading-Simulation";
    const CONDITIONS_FOLDER_NAME = "Simulation-Conditions";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let dataDependencies;

    return thisObject;

    function initialize(pDataDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            dataDependencies = pDataDependencies;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(marketFiles, outputPeriod, timePeriod, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let marketFile;

            let LRCMap = new Map();
            let percentageBandwidthMap = new Map();
            let bollingerBandsMap = new Map();
            let bollingerChannelsArray = [];
            let bollingerSubChannelsArray = [];

            let candles = [];
            let recordsArray = [];
            let conditionsArray = [];
            let simulationLogic = {};

            let fileCounter = 0;

            for (let i = 0; i < dataDependencies.length; i++) {

                let dependency = dataDependencies[i];
                marketFile = marketFiles[i];

                switch (i) {

                    case 0: {
                        buildLRC();
                        fileCounter++;
                        break;
                    }
                    case 1: {
                        buildPercentageBandwidthMap();
                        fileCounter++;
                        break;
                    }
                    case 2: {
                        buildBollingerBandsMap();
                        fileCounter++;
                        break;
                    }
                    case 3: {
                        buildBollingerChannelsArray();
                        fileCounter++;
                        break;
                    }
                    case 4: {
                        buildBollingerSubChannelsArray();
                        fileCounter++;
                        break;
                    }
                    case 5: {
                        buildCandles();
                        fileCounter++;
                        break;
                    }
                }
            }

            commons.runSimulation(
                candles,
                bollingerBandsMap,
                percentageBandwidthMap,
                LRCMap,
                bollingerChannelsArray,
                bollingerSubChannelsArray,
                recordsArray,
                conditionsArray,
                simulationLogic,
                outputPeriod,
                writeRecordsFile)

            function buildLRC() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildLRC -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let LRC = {
                            begin: marketFile[i][0],
                            end: marketFile[i][1],
                            _15: marketFile[i][2],
                            _30: marketFile[i][3],
                            _60: marketFile[i][4]
                        };

                        if (previous !== undefined) {

                            if (previous._15 > LRC._15) { LRC.direction15 = 'down'; }
                            if (previous._15 < LRC._15) { LRC.direction15 = 'up'; }
                            if (previous._15 === LRC._15) { LRC.direction15 = 'side'; }

                            if (previous._30 > LRC._30) { LRC.direction30 = 'down'; }
                            if (previous._30 < LRC._30) { LRC.direction30 = 'up'; }
                            if (previous._30 === LRC._30) { LRC.direction30 = 'side'; }

                            if (previous._60 > LRC._60) { LRC.direction60 = 'down'; }
                            if (previous._60 < LRC._60) { LRC.direction60 = 'up'; }
                            if (previous._60 === LRC._60) { LRC.direction60 = 'side'; }

                        }

                        LRC.previous = previous;

                        LRCMap.set(LRC.begin, LRC);

                        previous = LRC;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildLRC -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildPercentageBandwidthMap() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildPercentageBandwidthMap -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let percentageBandwidth = {
                            begin: marketFile[i][0],
                            end: marketFile[i][1],
                            value: marketFile[i][2],
                            movingAverage: marketFile[i][3],
                            bandwidth: marketFile[i][4]
                        };

                        if (previous !== undefined) {

                            if (previous.movingAverage > percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'down'; }
                            if (previous.movingAverage < percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'up'; }
                            if (previous.movingAverage === percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'side'; }

                        }

                        percentageBandwidth.previous = previous;

                        percentageBandwidthMap.set(percentageBandwidth.begin, percentageBandwidth);

                        previous = percentageBandwidth;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildPercentageBandwidthMap -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildBollingerBandsMap() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBollingerBandsMap -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let bollingerBand = {
                            begin: marketFile[i][0],
                            end: marketFile[i][1],
                            movingAverage: marketFile[i][2],
                            standardDeviation: marketFile[i][3],
                            deviation: marketFile[i][4]
                        };

                        if (previous !== undefined) {

                            if (previous.movingAverage > bollingerBand.movingAverage) { bollingerBand.direction = 'down'; }
                            if (previous.movingAverage < bollingerBand.movingAverage) { bollingerBand.direction = 'up'; }
                            if (previous.movingAverage === bollingerBand.movingAverage) { bollingerBand.direction = 'side'; }

                        }

                        bollingerBand.previous = previous;

                        bollingerBandsMap.set(bollingerBand.begin, bollingerBand);

                        previous = bollingerBand;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildBollingerBandsMap -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildBollingerChannelsArray() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBollingerChannelsArray -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let bollingerChannel = {
                            begin: marketFile[i][0],
                            end: marketFile[i][1],
                            direction: marketFile[i][2],
                            period: marketFile[i][3],
                            firstMovingAverage: marketFile[i][4],
                            lastMovingAverage: marketFile[i][5],
                            firstDeviation: marketFile[i][6],
                            lastDeviation: marketFile[i][7]
                        };

                        bollingerChannel.previous = previous;

                        bollingerChannelsArray.push(bollingerChannel);

                        previous = bollingerChannel;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildBollingerChannelsArray -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildBollingerSubChannelsArray() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildBollingerSubChannelsArray -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let bollingerSubChannel = {
                            begin: marketFile[i][0],
                            end: marketFile[i][1],
                            direction: marketFile[i][2],
                            slope: marketFile[i][3],
                            period: marketFile[i][4],
                            firstMovingAverage: marketFile[i][5],
                            lastMovingAverage: marketFile[i][6],
                            firstDeviation: marketFile[i][7],
                            lastDeviation: marketFile[i][8]
                        };

                        bollingerSubChannel.previous = previous;

                        bollingerSubChannelsArray.push(bollingerSubChannel);

                        previous = bollingerSubChannel;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildBollingerSubChannelsArray -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildCandles() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandles -> Entering function."); }

                try {

                    let previous;

                    for (let i = 0; i < marketFile.length; i++) {

                        let candle = {
                            open: undefined,
                            close: undefined,
                            min: 10000000000000,
                            max: 0,
                            begin: undefined,
                            end: undefined,
                            direction: undefined
                        };

                        candle.min = marketFile[i][0];
                        candle.max = marketFile[i][1];

                        candle.open = marketFile[i][2];
                        candle.close = marketFile[i][3];

                        candle.begin = marketFile[i][4];
                        candle.end = marketFile[i][5];

                        if (candle.open > candle.close) { candle.direction = 'down'; }
                        if (candle.open < candle.close) { candle.direction = 'up'; }
                        if (candle.open === candle.close) { candle.direction = 'side'; }

                        candle.previous = previous;

                        candles.push(candle);

                        previous = candle;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildCandles -> err = " + err.message);
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
                            record.rate + "," +
                            record.amount + "," +
                            record.balanceA + "," +
                            record.balanceB + "," +
                            record.profit + "," +
                            record.lastProfit + "," +
                            record.stopLoss + "," +
                            record.roundtrips + "," +
                            record.hits + "," +
                            record.fails + "," +
                            record.hitRatio + "," +
                            record.ROI + "," +
                            record.periods + "," +
                            record.days + "," +
                            record.anualizedRateOfReturn + "," +
                            record.sellRate + "," +
                            record.lastProfitPercent + "," +
                            record.strategy + "," +
                            record.strategyPhase + "," +
                            record.buyOrder + "," +
                            record.stopLossPhase + "," +
                            record.buyOrderPhase + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + SIMULATED_RECORDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                    jasonStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeRecordsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeConditionsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeRecordsFile -> err = " + err.message);
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

                        for (let j = 0; j < record.length - 1; j++) {
                            conditions = conditions + conditionsSeparator + record[j];
                            if (conditionsSeparator === "") { conditionsSeparator = ","; }
                        }

                        conditions = conditions + conditionsSeparator + '[' + record[record.length - 1] + ']';   // The last item contains an Array of condition values.

                        fileContent = fileContent + separator + '[' + conditions + ']';

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";
                    fileContent = "[" + JSON.stringify(simulationLogic) + "," + fileContent + "]";
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + CONDITIONS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                    jasonStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeConditionsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeConditionsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> err = " + err.message);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            callBackFunction(global.DEFAULT_OK_RESPONSE);

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> onFileCreated -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeConditionsFile -> err = " + err.message);
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
