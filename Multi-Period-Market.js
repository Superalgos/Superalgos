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

                            let fileCount = 0;

                            for (let i = 0; i < dataDependencies.length; i++) {

                                let dependency = dataDependencies[i];
                                let storage = storages[i];

                                getFile();

                                function getFile() {

                                    try {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> getFile -> Entering function."); }

                                        let fileName = market.assetA + '_' + market.assetB + ".json";

                                        let filePathRoot = dependency.devTeam + "/" + dependency.bot + "." + dependency.botVersion.major + "." + dependency.botVersion.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + dependency.dataSetVersion;
                                        let filePath = filePathRoot + "/Output/" + dependency.product + "/" + "Multi-Period-Market" + "/" + timePeriod;

                                        storage.getTextFile(filePath, fileName, onFileReceived, true);

                                        function onFileReceived(err, text) {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> getFile -> onFileReceived -> Entering function."); }
                                                if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> getFile -> onFileReceived -> text = " + text); }

                                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                    callBackFunction(err);
                                                    return;

                                                }

                                                let marketFile = JSON.parse(text);
                                                marketFiles.push(marketFile);
                                                fileCount++;

                                                callTheBot();

                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> getFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }
                                    }
                                    catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> getFile -> err = " + err.message);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }

                            }

                            function callTheBot() {

                                if (fileCount === dataDependencies.length + 1) {



                                }
                            }



                            let LRCMap = new Map();
                            let percentageBandwidthMap = new Map();
                            let bollingerBandsMap = new Map();
                            let bollingerChannelsArray = [];
                            let bollingerSubChannelsArray = [];

                            let candles = [];
                            let recordsArray = [];
                            let conditionsArray = [];
                            let simulationLogic = {};

                            nextLRC();



                            function buildLRC() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildLRC -> Entering function."); }

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

                                    nextPercentageBandwidth();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildLRC -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }



                            function buildPercentageBandwidthMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> Entering function."); }

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

                                    nextBollingerBands();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildPercentageBandwidthMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }



                            function buildBollingerBandsMap() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> Entering function."); }

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

                                    nextBollingerChannels();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerBandsMap -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }



                            function buildBollingerChannelsArray() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerChannelsArray -> Entering function."); }

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

                                    nextBollingerSubChannels();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerChannelsArray -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }



                            function buildBollingerSubChannelsArray() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildBollingerSubChannelsArray -> Entering function."); }

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

                                    nextCandlesFile();

                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildRecords -> loopBody -> buildBollingerSubChannelsArray -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }


                            function buildCandles() {

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildRecords -> loopBody -> buildCandles -> Entering function."); }

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
        }

        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
