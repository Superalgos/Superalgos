exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const PERCENTAGE_BANDWIDTH_FOLDER_NAME = "Percentage-Bandwidth";
    const BOLLINGER_BANDS_FOLDER_NAME = "Bollinger-Bands";
    const BOLLINGER_CHANNELS_FOLDER_NAME = "Bollinger-Channels";
    const BOLLINGER_SUB_CHANNELS_FOLDER_NAME = "Bollinger-Sub-Channels";
    const CANDLES_FOLDER_NAME = "Candles";
    const SIMULATED_RECORDS_FOLDER_NAME = "Trading-Simulation";
    const CONDITIONS_FOLDER_NAME = "Simulation-Conditions";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let chrisStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let oliviaStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let jasonStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            commons.initializeStorage(chrisStorage, jasonStorage, oliviaStorage, onInizialized);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> onInizialized -> Initialization Succeed."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } else {
                    logger.write(MODULE_NAME, "[ERROR] initialize -> onInizialized -> err = " + err.message);
                    callBackFunction(err);
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

 

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            buildRecords();

            function buildRecords() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> periodsLoop -> Entering function."); }

                            /*
            
                            We will iterate through all posible periods.
            
                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];
                            /*
                            if (timePeriod !== '01-hs') {
                                controlLoop();
                                return;
                            }
                            */
                            let marketFile;

                            let percentageBandwidthMap = new Map();
                            let bollingerBandsMap = new Map();
                            let bollingerChannelsArray = [];
                            let bollingerSubChannelsArray = [];

                            let candles = [];
                            let recordsArray = [];
                            let conditionsArray = [];
                            let simulationLogic = {};

                            nextPercentageBandwidth();

                            function nextPercentageBandwidth() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAChris" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + PERCENTAGE_BANDWIDTH_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildPercentageBandwidthMap();

                                            
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextPercentageBandwidth -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildPercentageBandwidthMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> Entering function."); }

                                try {

                                    for (let i = 0; i < marketFile.length; i++) {

                                        let percentageBandwidth = {
                                            begin: marketFile[i][0],
                                            end: marketFile[i][1],
                                            value: marketFile[i][2],
                                            movingAverage: marketFile[i][3],
                                            bandwidth: marketFile[i][4]
                                        };

                                        percentageBandwidthMap.set(percentageBandwidth.begin, percentageBandwidth);

                                    }

                                    nextBollingerBands();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextBollingerBands() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAChris" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_BANDS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildBollingerBandsMap();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerBands -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBollingerBandsMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> Entering function."); }

                                try {

                                    for (let i = 0; i < marketFile.length; i++) {

                                        let bollingerBands = {
                                            begin: marketFile[i][0],
                                            end: marketFile[i][1],
                                            movingAverage: marketFile[i][2],
                                            standardDeviation: marketFile[i][3],
                                            deviation: marketFile[i][4]
                                        };

                                        bollingerBandsMap.set(bollingerBands.begin, bollingerBands);

                                    }

                                    nextBollingerChannels();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextBollingerChannels() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerChannels -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAPaula" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerChannels -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerChannels -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerChannels -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildBollingerChannelsArray();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerChannels -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerChannels -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBollingerChannelsArray() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerChannelsArray -> Entering function."); }

                                try {

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

                                        bollingerChannelsArray.push(bollingerChannel);

                                    }

                                    nextBollingerSubChannels();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerChannelsArray -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextBollingerSubChannels() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAPaula" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + BOLLINGER_SUB_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    chrisStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildBollingerSubChannelsArray();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextBollingerSubChannels -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildBollingerSubChannelsArray() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerSubChannelsArray -> Entering function."); }

                                try {

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

                                        bollingerSubChannelsArray.push(bollingerSubChannel);

                                    }

                                    nextCandlesFile();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerSubChannelsArray -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function nextCandlesFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                    oliviaStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            marketFile = JSON.parse(text);

                                            buildCandles();


                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> nextCandlesFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function buildCandles() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildCandles -> Entering function."); }

                                try {

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

                                        candles.push(candle);

                                    }

                                    runSimulation(
                                        candles,
                                        bollingerBandsMap,
                                        percentageBandwidthMap,
                                        bollingerChannelsArray,
                                        bollingerSubChannelsArray,
                                        recordsArray,
                                        conditionsArray,
                                        simulationLogic,
                                        outputPeriod,
                                        writeRecordsFile)

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildCandles -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function writeRecordsFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> Entering function."); }

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

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> fileContent = " + fileContent); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> filePath = " + filePath);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                callBackFunction(err);
                                                return;

                                            }

                                            writeConditionsFile();

                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> onFileCreated -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeRecordsFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function writeConditionsFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeConditionsFile -> Entering function."); }

                                    let separator = "";
                                    let fileRecordCounter = 0;

                                    let fileContent = "";

                                    for (let i = 0; i < conditionsArray.length; i++) {

                                        let record = conditionsArray[i];

                                        let conditions = "";
                                        let conditionsSeparator = "";

                                        for (let j = 0; j < record.length; j++) {
                                            conditions = conditions + conditionsSeparator + record[j];
                                            if (conditionsSeparator === "") { conditionsSeparator = ","; }
                                        }

                                        fileContent = fileContent + separator + '[' + conditions + "]";

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

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> fileContent = " + fileContent); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> err = " + err.message);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> filePath = " + filePath);
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                callBackFunction(err);
                                                return;

                                            }

                                            controlLoop();

                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeConditionsFile -> onFileCreated -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> writeConditionsFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> controlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> err = " + err.message);
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

            function runSimulation(
                candles,
                bollingerBandsMap,
                percentageBandwidthMap,
                bollingerChannelsArray,
                bollingerSubChannelsArray,
                recordsArray,
                conditionsArray,
                simulationLogic,
                outputPeriod,
                callback) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> runSimulation -> Entering function."); }

                    /* Initial Values */

                    let initialDate = new Date("2018-08-01");
                    let initialBalanceA = 1;
                    let minimunBalanceA = 0.5;

                    /* Strategy and Phases */

                    let strategyNumber = 0;
                    let strategyPhase = 0;  // So far we will consider 5 possible phases: 0 = Initial state, 1 = Signal to buy, 2 = Buy, 3 = After Buy, 4 = Sell.

                    /* Stop Loss Management */

                    let stopLossPercentage = 1.5;
                    let previousStopLoss = 0;
                    let stopLoss = 0;
                    let stopLossDecay = 0;
                    let stopLossDecayIncrement = 0.06;
                    let stopLossPhase = 0;

                    /* Buy Order Management */

                    let buyOrderPercentage = 1;
                    let previousBuyOrder = 0;
                    let buyOrder = 0;
                    let buyOrderDecay = 0;
                    let buyOrderDecayIncrement = 0.01;
                    let buyOrderPhase = 0;

                    /* Building records */

                    let record;
                    let balanceAssetA = initialBalanceA;
                    let balanceAssetB = 0;
                    let profit = 0;
                    let lastProfit = 0;
                    let lastProfitPercent = 0;
                    let sellRate = 0;

                    let previousBalanceAssetA = 0;
                    let roundtrips = 0;
                    let hits = 0;
                    let fails = 0;
                    let hitRatio = 0;
                    let ROI = 0;
                    let periods = 0;
                    let days = 0;
                    let anualizedRateOfReturn = 0;
                    let type = '""';
                    let rate = 0;
                    let newStopLoss;

                    let initialBuffer = 3;

                    simulationLogic.strategies = [
                        {
                            name: "Trend Following",
                            entryPoint: {
                                situations: [
                                    {
                                        name: "Price Collapsing",
                                        conditions: [
                                            {
                                                name: "%B Moving Average going up",
                                                code: "percentageBandwidth2.movingAverage > percentageBandwidth1.movingAverage && percentageBandwidth1.movingAverage > percentageBandwidth.movingAverage"
                                            },
                                            {
                                                name: "%B Bandwidth going up",
                                                code: "percentageBandwidth2.bandwidth < percentageBandwidth1.bandwidth && percentageBandwidth1.bandwidth < percentageBandwidth.bandwidth"
                                            },
                                            {
                                                name: "Candles Min going down",
                                                code: "candles[i - 2].min > candles[i - 1].min && candles[i - 1].min > candle.min"
                                            }
                                        ]
                                    }
                                ]
                            },
                            exitPoint: {
                                situations: [
                                    {
                                        name: "Market Reversing",
                                        conditions: [
                                            {
                                                name: "Close above Band Moving Average",
                                                code: "candle.close > band.movingAverage"
                                            }
                                        ]
                                    }
                                ]
                            },
                            sellPoint: {
                                situations: [
                                    {
                                        name: "Min below lower band.",
                                        conditions: [
                                            {
                                                name: "3 Candles MIN below Lower Band",
                                                code: "candles[i - 2].min < band2.movingAverage - band2.deviation && candles[i - 1].min < band1.movingAverage - band1.deviation && candle.min < band.movingAverage - band.deviation"
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            name: "Range Trading",
                            entryPoint: {
                                situations: [
                                    {
                                        name: "Gentle Up Trend",
                                        conditions: [
                                            {
                                                name: "Sub-Channel going up",
                                                code: "subChannel.direction === 'Up'"
                                            },
                                            {
                                                name: "Sub-Channel Side|Gentle|Medium",
                                                code: "subChannel.slope === 'Side' || subChannel.slope === 'Gentle' || subChannel.slope === 'Medium'"
                                            },
                                            {
                                                name: "Candle Close above Lower Band",
                                                code: "candle.close > band.movingAverage + band.deviation"
                                            }
                                        ]
                                    }
                                ]
                            },
                            exitPoint: {
                                situations: [
                                    {
                                        name: "Outside Sub-Channel",
                                        conditions: [
                                            {
                                                name: "Going down or too Steep",
                                                code: "subChannel.direction === 'Down' || subChannel.slope === 'Steep' || subChannel.slope === 'Extreme'"
                                            }
                                        ]
                                    }
                                ]
                            },
                            sellPoint: {
                                situations: [
                                    {
                                        name: "Min below lower band.",
                                        conditions: [
                                            {
                                                name: "%B Moving Average going down",
                                                code: "percentageBandwidth1.movingAverage > percentageBandwidth.movingAverage"
                                            },
                                            {
                                                name: "%B Moving Average above 90",
                                                code: "percentageBandwidth1.movingAverage > 90"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ];

                    /* Main Simulation Loop: We go thourgh all the candles at this time period. */

                    for (let i = 0 + initialBuffer; i < candles.length; i++) {

                        /* Update all the data objects available for the simulation. */

                        let candle = candles[i];
                        let percentageBandwidth = percentageBandwidthMap.get(candle.begin);
                        let band = bollingerBandsMap.get(candle.begin);

                        if (percentageBandwidth === undefined) { continue; } // percentageBandwidth might start after the first few candles.
                        if (candle.begin < initialDate.valueOf()) { continue; }

                        periods++;

                        let band1 = bollingerBandsMap.get(candles[i - 1].begin);
                        let band2 = bollingerBandsMap.get(candles[i - 2].begin);
                        let band3 = bollingerBandsMap.get(candles[i - 3].begin);

                        let percentageBandwidth1 = percentageBandwidthMap.get(candles[i - 1].begin);
                        let percentageBandwidth2 = percentageBandwidthMap.get(candles[i - 2].begin);
                        let percentageBandwidth3 = percentageBandwidthMap.get(candles[i - 3].begin);

                        let subChannel = getElement(bollingerSubChannelsArray, candle.begin, candle.end);

                        let conditions = new Map;
                        let conditionsArrayRecord = [];

                        /* We define and evaluate all conditions to be used later during the simulation loop. */

                        conditionsArrayRecord.push(candle.begin);
                        conditionsArrayRecord.push(candle.end);

                        for (let j = 0; j < simulationLogic.strategies.length; j++) {

                            let strategy = simulationLogic.strategies[j];

                            for (let k = 0; k < strategy.entryPoint.situations.length; k++) {

                                let situation = strategy.entryPoint.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = strategy.name + '-' + situation.name + '-' + condition.name 

                                    newCondition(key, condition.code);
                                }
                            }

                            for (let k = 0; k < strategy.exitPoint.situations.length; k++) {

                                let situation = strategy.exitPoint.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = strategy.name + '-' + situation.name + '-' + condition.name

                                    newCondition(key, condition.code);
                                }
                            }

                            for (let k = 0; k < strategy.sellPoint.situations.length; k++) {

                                let situation = strategy.sellPoint.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = strategy.name + '-' + situation.name + '-' + condition.name

                                    newCondition(key, condition.code);
                                }
                            }
                        }

                        function newCondition(key, code) {

                            let condition;

                            condition = {
                                key: key,
                                value: eval(code)
                            };

                            conditions.set(condition.key, condition);

                            if (condition.value) {
                                conditionsArrayRecord.push(1);
                            } else {
                                conditionsArrayRecord.push(0);
                            }   
                        }

                        /* While we are outside all strategies, we evaluate whether it is time to enter one or not. */

                        if (strategyNumber === 0 &&
                            balanceAssetA > minimunBalanceA) {

                            /*
                            Here we need to pick a strategy, or if there is not suitable strategy for the current
                            market conditions, we pass until the next period.
            
                            To pick a new strategy we will evaluate what we call an entering condition. Once we enter
                            into one strategy, we will ignore market conditions for others. However there is also
                            a strategy exit condition which can be hit before entering into a trade. If hit, we would
                            be outside a strategy again and looking for the condition to enter all over again.

                            */

                            checkEntryPoints();

                            function checkEntryPoints() {

                                for (let j = 0; j < simulationLogic.strategies.length; j++) {

                                    let strategy = simulationLogic.strategies[j];

                                    for (let k = 0; k < strategy.entryPoint.situations.length; k++) {

                                        let situation = strategy.entryPoint.situations[k];
                                        let passed = true;

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m];
                                            let key = strategy.name + '-' + situation.name + '-' + condition.name

                                            let value = conditions.get(key).value;

                                            if (value === false) { passed = false; }
                                        }

                                        if (passed) {

                                            strategyPhase = 1;
                                            strategyNumber = j + 1;

                                            return;
                                        }
                                    }
                                }
                            }
                        }

                        /* Strategy Exit Condition */

                        if (strategyPhase === 1) {

                            checkExitPoints();

                            function checkExitPoints() {

                                let strategy = simulationLogic.strategies[strategyNumber - 1];

                                for (let k = 0; k < strategy.exitPoint.situations.length; k++) {

                                    let situation = strategy.exitPoint.situations[k];
                                    let passed = true;

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m];
                                        let key = strategy.name + '-' + situation.name + '-' + condition.name

                                        let value = conditions.get(key).value;

                                        if (value === false) { passed = false; }
                                    }

                                    if (passed) {

                                        strategyPhase = 0;
                                        strategyNumber = 0;

                                        return;
                                    }
                                }
                            }
                        }

                        /* Strategy Sell Condition */

                        if (strategyPhase === 1) {

                            checkSellPoints();

                            function checkSellPoints() {

                                let strategy = simulationLogic.strategies[strategyNumber - 1];

                                for (let k = 0; k < strategy.sellPoint.situations.length; k++) {

                                    let situation = strategy.sellPoint.situations[k];
                                    let passed = true;

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m];
                                        let key = strategy.name + '-' + situation.name + '-' + condition.name

                                        let value = conditions.get(key).value;

                                        if (value === false) { passed = false; }
                                    }

                                    if (passed) {

                                        type = '"Sell"';

                                        strategyPhase = 2;
                                        stopLossPhase = 1;
                                        buyOrderPhase = 1;

                                        return;
                                    }
                                }
                            }
                        }

                        if (strategyPhase === 3) {

                            /* Checking what happened since the last execution. We need to know if the Stop Loss
                                or our Buy Order were hit. */

                            /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                            if (candle.max >= stopLoss) {

                                balanceAssetA = balanceAssetB / stopLoss;

                                balanceAssetB = 0;
                                rate = stopLoss;
                                type = '"Buy@StopLoss"';
                                strategyPhase = 4;
                            }

                            /* Buy Order condition: Here we verify if the Buy Order was filled or not. */

                            if (candle.min <= buyOrder) {

                                balanceAssetA = balanceAssetB / buyOrder;

                                balanceAssetB = 0;
                                rate = buyOrder;
                                type = '"Buy@BuyOrder"';
                                strategyPhase = 4;
                            }
                        }

                        if (strategyPhase < 4) { // When a buy condition has not been detected yet.

                            if (strategyNumber === 1) {

                                /* Strategy #1: Trend Following. */

                                /* 
                                Strategy Summary:
                 
                                Once Percentage Bandwidth (PB) moving average is going down and
                                it is abobe 70%, we enter into Pre-Sell mode, which means that we are ready to
                                sell as soon as the trend starts going down. The trend should be measured by the
                                Bollinger Bands moving average.
                 
                                Once the band's moving average starts going down we Sell and we set the stop loss,
                                which initially is static or going down if the prices starts going up too.
                 
                                Once the candles minimun goes out of the lower Bollinger band, we enter into stop loss
                                trailing mode, which means that the stop loss will follow the band's moving average
                                from there on, getting closer or farther from it depending on the slope of the moving average
                                itself.
                 
                                */

                                /* Stop Loss Management */

                                if (stopLossPhase === 3) {

                                    newStopLoss = band.movingAverage;

                                    if (newStopLoss < previousStopLoss) {
                                        stopLoss = newStopLoss;
                                    } else {
                                        stopLoss = previousStopLoss;
                                    }
                                }

                                if (stopLossPhase === 2) {

                                    if (band1.movingAverage < band.movingAverage) {
                                        stopLossDecay = stopLossDecay + stopLossDecayIncrement * 2;
                                    } else {
                                        stopLossDecay = stopLossDecay - stopLossDecayIncrement / 2;
                                    }

                                    newStopLoss = band.movingAverage + band.movingAverage * (stopLossPercentage - stopLossDecay) / 100;

                                    if (newStopLoss < previousStopLoss) {
                                        stopLoss = newStopLoss;
                                    } else {
                                        stopLoss = previousStopLoss;
                                    }

                                    if (
                                        candle.max < band.movingAverage - band.deviation
                                    ) {
                                        stopLossPhase = 3;
                                    }
                                }

                                if (stopLossPhase === 1) {

                                    if (band1.movingAverage < band.movingAverage) {
                                        stopLossDecay = stopLossDecay + stopLossDecayIncrement * 2;
                                    } else {
                                        stopLossDecay = stopLossDecay - stopLossDecayIncrement / 2;
                                    }

                                    newStopLoss = newStopLoss = sellRate + sellRate * (stopLossPercentage - stopLossDecay) / 100;

                                    if (newStopLoss < previousStopLoss) {
                                        stopLoss = newStopLoss;
                                    } else {
                                        stopLoss = previousStopLoss;
                                    }

                                    if (
                                        strategyPhase === 3 &&
                                        candle.max < band.movingAverage &&
                                        band1.movingAverage > band.movingAverage 
                                    ) {

                                        stopLossPhase = 2;

                                    }
                                }

                                /* Buy Orders Management */

                                if (buyOrderPhase === 5) {

                                    buyOrder = band.movingAverage - band.standardDeviation * 2;

                                }

                                if (buyOrderPhase === 4) {

                                    buyOrder = band.movingAverage - band.standardDeviation * 3;

                                    if (
                                        percentageBandwidth1.movingAverage < percentageBandwidth.movingAverage &&
                                        percentageBandwidth.movingAverage > 30
                                    ) {
                                        buyOrderPhase = 5;
                                    }
                                }

                                if (buyOrderPhase === 3) {

                                    buyOrder = band.movingAverage - band.standardDeviation * 4;

                                    if (percentageBandwidth1.movingAverage > percentageBandwidth.movingAverage) {
                                        buyOrderPhase = 4;
                                    }
                                }

                                if (buyOrderPhase === 2) {

                                    buyOrder = band.movingAverage - band.standardDeviation * 10;

                                    if (
                                        percentageBandwidth1.movingAverage < percentageBandwidth.movingAverage &&
                                        percentageBandwidth.movingAverage > 0
                                    ) {
                                        buyOrderPhase = 3;
                                    }
                                }

                                if (buyOrderPhase === 1) {

                                    buyOrderDecay = buyOrderDecay + buyOrderDecayIncrement;

                                    buyOrder = band.movingAverage - band.standardDeviation * 10; //+ band.movingAverage - band.standardDeviation * 4 * (buyOrderPercentage + buyOrderDecay) / 100;

                                    if (
                                        strategyPhase === 3 &&
                                        candle.max < band.movingAverage &&
                                        band1.movingAverage > band.movingAverage &&
                                        candle.min < band.movingAverage - band.deviation
                                    ) {

                                        buyOrderPhase = 2;

                                    }
                                }
                            }

                            if (strategyNumber === 2) {

                                /* Strategy #2: Range Trading. */

                                /* 
                                Strategy Summary:
                
                                Once the candles maximun gets above the Bollinger Upper Band we wait until the B% moving average points
                                downward and then we Sell.
                
                                We keep our buy order just below the the Bollinger Bands moving average.
                
                                */


                                /* Stop Loss Management */

                                if (stopLossPhase === 1) {

                                    newStopLoss = newStopLoss = sellRate + sellRate * (stopLossPercentage - stopLossDecay) / 100;

                                    if (newStopLoss < previousStopLoss) {
                                        stopLoss = newStopLoss;
                                    } else {
                                        stopLoss = previousStopLoss;
                                    }
                                }

                                /* Buy Orders Management */

                                if (buyOrderPhase === 1) {

                                    buyOrder = band.movingAverage - band.standardDeviation;

                                }
                            }
                        }

                        /* Check if a Sell condition was found. */

                        if (strategyPhase === 2) {

                            previousBalanceAssetA = balanceAssetA;
                            lastProfit = 0;
                            lastProfitPercent = 0;

                            balanceAssetB = balanceAssetA * candle.close;
                            balanceAssetA = 0;

                            rate = candle.close;
                            sellRate = rate;

                            stopLoss = sellRate + sellRate * stopLossPercentage / 100;

                            stopLossDecay = 0;

                            addRecord();

                            strategyPhase = 3;
                            continue;
                        }

                        /* Check if a Buy condition was found. */

                        if (strategyPhase === 4) {

                            roundtrips++;
                            lastProfit = balanceAssetA - previousBalanceAssetA;

                            lastProfitPercent = lastProfit / previousBalanceAssetA * 100;
                            if (isNaN(lastProfitPercent)) { lastProfitPercent = 0; }

                            profit = profit + lastProfit;

                            ROI = (initialBalanceA + profit) / initialBalanceA - 1;
                            //if (isNaN(ROI)) { ROI = 0; }

                            if (lastProfit > 0) {
                                hits++;
                            } else {
                                fails++;
                            }
                            hitRatio = hits / roundtrips;

                            let miliSecondsPerDay = 24 * 60 * 60 * 1000;
                            days = periods * outputPeriod / miliSecondsPerDay;
                            anualizedRateOfReturn = ROI / days * 365;
                            
                            addRecord();

                            strategyNumber = 0;
                            stopLoss = 0;
                            sellRate = 0;
                            buyOrder = 0;
                            strategyPhase = 0;
                            stopLossPhase = 0;
                            buyOrderPhase = 0;

                            continue;

                        }

                        /* Not a buy or sell condition */

                        rate = candle.close;
                        addRecord();

                        function addRecord() {

                            record = {
                                begin: candle.begin,
                                end: candle.end,
                                type: type,
                                rate: rate,
                                amount: 1,
                                balanceA: balanceAssetA,
                                balanceB: balanceAssetB,
                                profit: profit,
                                lastProfit: lastProfit,
                                stopLoss: stopLoss,
                                roundtrips: roundtrips,
                                hits: hits,
                                fails: fails,
                                hitRatio: hitRatio,
                                ROI: ROI,
                                periods: periods,
                                days: days,
                                anualizedRateOfReturn: anualizedRateOfReturn,
                                sellRate: sellRate,
                                lastProfitPercent: lastProfitPercent,
                                strategy: strategyNumber,
                                strategyPhase: strategyPhase,
                                buyOrder: buyOrder,
                                stopLossPhase: stopLossPhase,
                                buyOrderPhase: buyOrderPhase
                            }

                            recordsArray.push(record);

                            previousStopLoss = stopLoss;

                            type = '""';

                            conditionsArray.push(conditionsArrayRecord);

                        }
                    }

                    callback();

                    function getElement(pArray, begin, end) {

                        let element;

                        for (let i = 0; i < pArray.length; i++) {

                            element = pArray[i];

                            if (begin >= element.begin && end <= element.end) {
                                return element
                            }
                        }

                        element = {
                            direction: 'unknown',
                            slope: 'unknown'
                        };
                        return element;
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> runSimulation -> err = " + err.message);
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
