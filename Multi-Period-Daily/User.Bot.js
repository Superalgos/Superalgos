exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, BLOB_STORAGE, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLE_STAIRS_FOLDER_NAME = "Candle-Stairs";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUME_STAIRS_FOLDER_NAME = "Volume-Stairs";

    const commons = COMMONS.newCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let oliviaStorage = BLOB_STORAGE.newBlobStorage(bot, logger);
    let tomStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;

            commons.initializeStorage(oliviaStorage, tomStorage, onInizialized);

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

    /*
    
    This process is going to do the following:
    
    Read the candles and volumes from Olivia and produce for each market two files with candles stairs and volumes stairs respectively.
    
    */

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) {
                logger.write(MODULE_NAME, "[INFO] Entering function 'start'");
            }

            /* One of the challenges of this process is that each imput file contains one day of candles. So if a stair spans more than one day
            then we dont want to break the stais in two pieces. What we do is that we read to candles files at the time and record at the current
            date all stairs of the day plus the ones thas spans to the second day without bigining at the second day. Then when we process the next
            day, we must remember where the last stairs of each type endded, so as not to create overlapping stairs in the current day. These next
            3 variables are stored at the status report and they are to remember where the last staris ended. */

            let lastEndValues = [];

            for (let i = 0; i < global.dailyFilePeriods.length; i++) {

                let lastEndValuesItem = {
                    timePeriod: global.dailyFilePeriods[i][1],
                    candleStairEnd: undefined,
                    volumeBuyEnd: undefined,
                    volumeSellEnd: undefined
                };

                lastEndValues.push(lastEndValuesItem);
            }

            let currentEndValues = [];

            for (let i = 0; i < global.dailyFilePeriods.length; i++) {

                let currentEndValuesItem = {
                    timePeriod: global.dailyFilePeriods[i][1],
                    candleStairEnd: undefined,
                    volumeBuyEnd: undefined,
                    volumeSellEnd: undefined
                };

                currentEndValues.push(currentEndValuesItem);
            }

            let market = global.MARKET;

            /* Context Variables */

            let contextVariables = {
                lastCandleFile: undefined,          // Datetime of the last file files sucessfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxCandleFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let processDate;                         // Holds the processing date.

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We look first for Charly in order to get when the market starts. */

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Poloniex-Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

                    if (statusReport === "undefined") { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.firstTradeFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                    /* Second, we get the report from Olivia, to know when the marted ends. */

                    reportKey = "AAMasters" + "-" + "AAOlivia" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

                    if (statusReport === "undefined") { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.maxCandleFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + "00:00" + GMT_SECONDS);

                    /* Finally we get our own Status Report. */

                    reportKey = "AAMasters" + "-" + "AATom" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

                    if (statusReport === "undefined") { // This means the status report does not exist, that could happen for instance at the begining of a month.
                        logger.write(MODULE_NAME, "[WARN] start -> getContextVariables -> Status Report does not exist. Retrying Later. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    if (statusReport.status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile !== undefined) {

                        contextVariables.lastCandleFile = new Date(thisReport.lastFile);

                        /*
                        The stairs objects can span more than one day. In order not to cut these objects into two when this happens, this process will alsways read
                        2 files. The previous one already processed, and the current one. That means that it will allways re-process the previous one, until the
                        last moment in which the previous one turns into the current one. By doing so, we avoid breaking the objects when day changes.

                        So you will se we go 2 days back. One if because of the above explanation. The second is because we enter the loop by advancing one day.
                        */

                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS * 2);

                        buildStairs();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we take the date of the file with the first trades as the begining of the market. Then we will
                        go one day back in time, so that when we enter the loop, one day will be added and we will be exactly at the date where the first trades occured.
                        */

                        contextVariables.lastCandleFile = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);
                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                        buildStairs();
                        return;
                    }

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.message);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its statusDependencies declarations are correct. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildStairs() {

                let n;
                previousDay = contextVariables.lastCandleFile;                

                advanceTime();

                function advanceTime() {

                    previousDay = new Date(previousDay.valueOf() + ONE_DAY_IN_MILISECONDS);
                    processDate = new Date(previousDay.valueOf() + ONE_DAY_IN_MILISECONDS);

                    const logText = "[INFO] New current day @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                    console.log(logText);
                    logger.write(MODULE_NAME, logText);

                    /* Validation that we are not going past the head of the market. */

                    if (previousDay.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                        const logText = "[INFO] 'buildStairs' - Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                        logger.write(MODULE_NAME, logText);

                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;

                    }

                    periodsLoop();

                }

                function periodsLoop() {

                    /*
    
                    We will iterate through all posible periods.
    
                    */

                    n = 0   // loop Variable representing each possible period as defined at the periods array.

                    loopBody();


                }

                function loopBody() {

                    const timePeriod = global.dailyFilePeriods[n][1];

                    processCandles();

                    function processCandles() {

                        let candles = [];
                        let stairsArray = [];
                        let previousDayFile;
                        let processDayFile;

                        getPreviousDayFile();

                        function getPreviousDayFile() {

                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"

                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                            let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;

                            oliviaStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(err, text) {

                                try {

                                    previousDayFile = JSON.parse(text);
                                    getProcessDayFile()

                                } catch (err) {

                                    const logText = "[ERR] 'processCandles - getPreviousDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(MODULE_NAME, logText);

                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                    return;
                                }
                            }
                        }

                        function getProcessDayFile() {

                            let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"

                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                            let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;

                            oliviaStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(err, text) {

                                try {

                                    processDayFile = JSON.parse(text);
                                    buildCandles();

                                } catch (err) {

                                    if (processDate.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                                        processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                        buildCandles();

                                    } else {

                                        const logText = "[ERR] 'processCandles - getProcessDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                        logger.write(MODULE_NAME, logText);

                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        return;
                                    }
                                }
                            }
                        }

                        function buildCandles() {

                            try {

                                pushCandles(previousDayFile);
                                pushCandles(processDayFile);
                                findCandleStairs();

                                function pushCandles(candlesFile) {

                                    for (let i = 0; i < candlesFile.length; i++) {

                                        let candle = {
                                            open: undefined,
                                            close: undefined,
                                            min: 10000000000000,
                                            max: 0,
                                            begin: undefined,
                                            end: undefined,
                                            direction: undefined
                                        };

                                        candle.min = candlesFile[i][0];
                                        candle.max = candlesFile[i][1];

                                        candle.open = candlesFile[i][2];
                                        candle.close = candlesFile[i][3];

                                        candle.begin = candlesFile[i][4];
                                        candle.end = candlesFile[i][5];

                                        if (candle.open > candle.close) { candle.direction = 'down'; }
                                        if (candle.open < candle.close) { candle.direction = 'up'; }
                                        if (candle.open === candle.close) { candle.direction = 'side'; }

                                        candles.push(candle);
                                    }
                                }

                            } catch (err) {

                                const logText = "[ERR] 'buildCandles' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }

                        function findCandleStairs() {

                            try {

                                /* Finding stairs */

                                let stairs;

                                for (let i = 0; i < candles.length - 1; i++) {

                                    let currentCandle = candles[i];
                                    let nextCandle = candles[i + 1];

                                    if (currentCandle.direction === nextCandle.direction && currentCandle.direction !== 'side') {

                                        if (stairs === undefined) {

                                            stairs = {
                                                open: undefined,
                                                close: undefined,
                                                min: 10000000000000,
                                                max: 0,
                                                begin: undefined,
                                                end: undefined,
                                                direction: undefined,
                                                candleCount: 0,
                                                firstMin: 0,
                                                firstMax: 0,
                                                lastMin: 0,
                                                lastMax: 0
                                            };

                                            stairs.direction = currentCandle.direction;
                                            stairs.candleCount = 2;

                                            stairs.begin = currentCandle.begin;
                                            stairs.end = nextCandle.end;

                                            stairs.open = currentCandle.open;
                                            stairs.close = nextCandle.close;

                                            if (currentCandle.min < nextCandle.min) { stairs.min = currentCandle.min; } else { stairs.min = nextCandle.min; }
                                            if (currentCandle.max > nextCandle.max) { stairs.max = currentCandle.max; } else { stairs.max = nextCandle.max; }

                                            if (stairs.direction === 'up') {

                                                stairs.firstMin = currentCandle.open;
                                                stairs.firstMax = currentCandle.close;

                                                stairs.lastMin = nextCandle.open;
                                                stairs.lastMax = nextCandle.close;

                                            } else {

                                                stairs.firstMin = currentCandle.close;
                                                stairs.firstMax = currentCandle.open;

                                                stairs.lastMin = nextCandle.close;
                                                stairs.lastMax = nextCandle.open;

                                            }


                                        } else {

                                            stairs.candleCount++;
                                            stairs.end = nextCandle.end;
                                            stairs.close = nextCandle.close;

                                            if (stairs.min < nextCandle.min) { stairs.min = currentCandle.min; }
                                            if (stairs.max > nextCandle.max) { stairs.max = currentCandle.max; }

                                            if (stairs.direction === 'up') {

                                                stairs.lastMin = nextCandle.open;
                                                stairs.lastMax = nextCandle.close;

                                            } else {

                                                stairs.lastMin = nextCandle.close;
                                                stairs.lastMax = nextCandle.open;

                                            }

                                        }

                                    } else {

                                        if (stairs !== undefined) {

                                            /* As we are using two consecutives days of candles, we do want to include stairs that spans from the first
                                            day to the second, but we do not want to include stairs that begins on the second day, since those are to be
                                            included when time advances one day. */

                                            if (stairs.begin < processDate.valueOf()) {

                                                /* Also, we dont want to include stairs that started in the previous day. To detect that we use the date
                                                that we recorded on the Status Report with the end of the last stair of the previous day. */

                                                if (lastEndValues[n].candleStairEnd !== undefined) {

                                                    if (stairs.begin > lastEndValues[n].candleStairEnd) {

                                                        stairsArray.push(stairs);
                                                        currentEndValues[n].candleStairEnd = stairs.end;

                                                    }
                                                } else {

                                                    stairsArray.push(stairs);
                                                    currentEndValues[n].candleStairEnd = stairs.end;
                                                    
                                                }
                                            }
                                            stairs = undefined;
                                        }
                                    }
                                }

                                writeCandleStairsFile();

                            } catch (err) {

                                const logText = "[ERR] 'findCandleStairs' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }

                        function writeCandleStairsFile() {

                            try {

                                let separator = "";
                                let fileRecordCounter = 0;

                                let fileContent = "";

                                for (i = 0; i < stairsArray.length; i++) {

                                    let stairs = stairsArray[i];

                                    fileContent = fileContent + separator + '[' +
                                        stairs.open + "," +
                                        stairs.close + "," +
                                        stairs.min + "," +
                                        stairs.max + "," +
                                        stairs.begin + "," +
                                        stairs.end + "," +
                                        '"' + stairs.direction + '"' + "," +
                                        stairs.candleCount + "," +
                                        stairs.firstMin + "," +
                                        stairs.firstMax + "," +
                                        stairs.lastMin + "," +
                                        stairs.lastMax + "]";

                                    if (separator === "") { separator = ","; }

                                    fileRecordCounter++;

                                }

                                fileContent = "[" + fileContent + "]";

                                let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                let filePath = filePathRoot + "/Output/" + CANDLE_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;

                                utilities.createFolderIfNeeded(filePath, tomStorage, onFolderCreated);

                                function onFolderCreated() {

                                    tomStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated() {

                                        const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                        console.log(logText);
                                        logger.write(MODULE_NAME, logText);

                                        processVolumes();
                                    }
                                }
                            } catch (err) {

                                const logText = "[ERR] 'writeCandleStairsFile' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }
                    }

                    function processVolumes() {

                        let volumes = [];
                        let stairsArray = [];
                        let previousDayFile;
                        let processDayFile;

                        getPreviousDayFile();

                        function getPreviousDayFile() {

                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"

                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                            let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;

                            oliviaStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(err, text) {

                                try {

                                    previousDayFile = JSON.parse(text);
                                    getProcessDayFile()

                                } catch (err) {

                                    const logText = "[ERR] 'processVolumes - getPreviousDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                    logger.write(MODULE_NAME, logText);

                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                    return;
                                }
                            }
                        }

                        function getProcessDayFile() {

                            let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                            let fileName = market.assetA + '_' + market.assetB + ".json"

                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                            let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;

                            oliviaStorage.getTextFile(filePath, fileName, onCurrentDayFileReceived, true);

                            function onCurrentDayFileReceived(err, text) {

                                try {

                                    processDayFile = JSON.parse(text);
                                    buildVolumes();

                                } catch (err) {

                                    if (processDate.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                                        processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                        buildVolumes();

                                    } else {

                                        const logText = "[ERR] 'processVolumes - getProcessDayFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                        logger.write(MODULE_NAME, logText);

                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                        return;
                                    }
                                }
                            }
                        }

                        function buildVolumes() {

                            try {

                                pushVolumes(previousDayFile);
                                pushVolumes(processDayFile);
                                findVolumesStairs();

                                function pushVolumes(volumesFile) {

                                    for (let i = 0; i < volumesFile.length; i++) {

                                        let volume = {
                                            amountBuy: 0,
                                            amountSell: 0,
                                            begin: undefined,
                                            end: undefined
                                        };

                                        volume.amountBuy = volumesFile[i][0];
                                        volume.amountSell = volumesFile[i][1];

                                        volume.begin = volumesFile[i][2];
                                        volume.end = volumesFile[i][3];

                                        volumes.push(volume);

                                    }
                                }
                            } catch (err) {

                                const logText = "[ERR] 'buildVolumes' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }

                        function findVolumesStairs() {

                            try {

                                /* Finding stairs */

                                let buyUpStairs;
                                let buyDownStairs;

                                let sellUpStairs;
                                let sellDownStairs;

                                for (let i = 0; i < volumes.length - 1; i++) {

                                    let currentVolume = volumes[i];
                                    let nextVolume = volumes[i + 1];


                                    /* buy volume going up */

                                    if (currentVolume.amountBuy < nextVolume.amountBuy) {

                                        if (buyUpStairs === undefined) {

                                            buyUpStairs = {
                                                type: undefined,
                                                begin: undefined,
                                                end: undefined,
                                                direction: undefined,
                                                barsCount: 0,
                                                firstAmount: 0,
                                                lastAmount: 0
                                            };

                                            buyUpStairs.type = 'buy';
                                            buyUpStairs.direction = 'up';
                                            buyUpStairs.barsCount = 2;

                                            buyUpStairs.begin = currentVolume.begin;
                                            buyUpStairs.end = nextVolume.end;

                                            buyUpStairs.firstAmount = currentVolume.amountBuy;
                                            buyUpStairs.lastAmount = nextVolume.amountBuy;

                                        } else {

                                            buyUpStairs.barsCount++;
                                            buyUpStairs.end = nextVolume.end;
                                            buyUpStairs.lastAmount = nextVolume.amountBuy;

                                        }

                                    } else {

                                        if (buyUpStairs !== undefined) {

                                            if (buyUpStairs.barsCount > 2) {

                                                pushToArray(buyUpStairs);
                                            }

                                            buyUpStairs = undefined;
                                        }
                                    }

                                    /* buy volume going down */

                                    if (currentVolume.amountBuy > nextVolume.amountBuy) {

                                        if (buyDownStairs === undefined) {

                                            buyDownStairs = {
                                                type: undefined,
                                                begin: undefined,
                                                end: undefined,
                                                direction: undefined,
                                                barsCount: 0,
                                                firstAmount: 0,
                                                lastAmount: 0
                                            };

                                            buyDownStairs.type = 'buy';
                                            buyDownStairs.direction = 'down';
                                            buyDownStairs.barsCount = 2;

                                            buyDownStairs.begin = currentVolume.begin;
                                            buyDownStairs.end = nextVolume.end;

                                            buyDownStairs.firstAmount = currentVolume.amountBuy;
                                            buyDownStairs.lastAmount = nextVolume.amountBuy;

                                        } else {

                                            buyDownStairs.barsCount++;
                                            buyDownStairs.end = nextVolume.end;
                                            buyDownStairs.lastAmount = nextVolume.amountBuy;

                                        }

                                    } else {

                                        if (buyDownStairs !== undefined) {

                                            if (buyDownStairs.barsCount > 2) {

                                                pushToArray(buyDownStairs);
                                            }

                                            buyDownStairs = undefined;
                                        }
                                    }

                                    /* sell volume going up */

                                    if (currentVolume.amountSell < nextVolume.amountSell) {

                                        if (sellUpStairs === undefined) {

                                            sellUpStairs = {
                                                type: undefined,
                                                begin: undefined,
                                                end: undefined,
                                                direction: undefined,
                                                barsCount: 0,
                                                firstAmount: 0,
                                                lastAmount: 0
                                            };

                                            sellUpStairs.type = 'sell';
                                            sellUpStairs.direction = 'up';
                                            sellUpStairs.barsCount = 2;

                                            sellUpStairs.begin = currentVolume.begin;
                                            sellUpStairs.end = nextVolume.end;

                                            sellUpStairs.firstAmount = currentVolume.amountSell;
                                            sellUpStairs.lastAmount = nextVolume.amountSell;

                                        } else {

                                            sellUpStairs.barsCount++;
                                            sellUpStairs.end = nextVolume.end;
                                            sellUpStairs.lastAmount = nextVolume.amountSell;

                                        }

                                    } else {

                                        if (sellUpStairs !== undefined) {

                                            if (sellUpStairs.barsCount > 2) {

                                                pushToArray(sellUpStairs);
                                            }

                                            sellUpStairs = undefined;
                                        }
                                    }

                                    /* sell volume going down */

                                    if (currentVolume.amountSell > nextVolume.amountSell) {

                                        if (sellDownStairs === undefined) {

                                            sellDownStairs = {
                                                type: undefined,
                                                begin: undefined,
                                                end: undefined,
                                                direction: undefined,
                                                barsCount: 0,
                                                firstAmount: 0,
                                                lastAmount: 0
                                            };

                                            sellDownStairs.type = 'sell';
                                            sellDownStairs.direction = 'down';
                                            sellDownStairs.barsCount = 2;

                                            sellDownStairs.begin = currentVolume.begin;
                                            sellDownStairs.end = nextVolume.end;

                                            sellDownStairs.firstAmount = currentVolume.amountSell;
                                            sellDownStairs.lastAmount = nextVolume.amountSell;

                                        } else {

                                            sellDownStairs.barsCount++;
                                            sellDownStairs.end = nextVolume.end;
                                            sellDownStairs.lastAmount = nextVolume.amountSell;

                                        }

                                    } else {

                                        if (sellDownStairs !== undefined) {

                                            if (sellDownStairs.barsCount > 2) {

                                                pushToArray(sellDownStairs);
                                            }

                                            sellDownStairs = undefined;
                                        }
                                    }

                                    function pushToArray(stairs) {

                                        if (stairs !== undefined) {

                                            /* As we are using two consecutives days of candles, we do want to include stairs that spans from the first
                                            day to the second, but we do not want to include stairs that begins on the second day, since those are to be
                                            included when time advances one day. */

                                            if (stairs.begin < processDate.valueOf()) {

                                                /* Also, we dont want to include stairs that started in the previous day. To detect that we use the date
                                                that we recorded on the Status Report with the end of the last stair of the previous day. */

                                                /* Additional to that, there are two types of stais: buy and sell. */

                                                if (stairs.type === 'sell') {

                                                    if (lastEndValues[n].volumeSellEnd !== undefined) {

                                                        if (stairs.begin > lastEndValues[n].volumeSellEnd) {

                                                            stairsArray.push(stairs);
                                                            currentEndValues[n].volumeSellEnd = stairs.end;
                                                        }
                                                    } else {

                                                        stairsArray.push(stairs);
                                                        currentEndValues[n].volumeSellEnd = stairs.end;
                                                    }

                                                } else {

                                                    if (lastEndValues[n].volumeBuyEnd !== undefined) {

                                                        if (stairs.begin > lastEndValues[n].volumeBuyEnd) {

                                                            stairsArray.push(stairs);
                                                            currentEndValues[n].volumeBuyEnd = stairs.end;
                                                        }
                                                    } else {

                                                        stairsArray.push(stairs);
                                                        currentEndValues[n].volumeBuyEnd = stairs.end;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                
                                writeVolumeStairsFile();

                            } catch (err) {

                                const logText = "[ERR] 'findVolumesStairs' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }

                        function writeVolumeStairsFile() {

                            try {

                                let separator = "";
                                let fileRecordCounter = 0;

                                let fileContent = "";

                                for (i = 0; i < stairsArray.length; i++) {

                                    let stairs = stairsArray[i];

                                    fileContent = fileContent + separator + '[' +
                                        '"' + stairs.type + '"' + "," +
                                        stairs.begin + "," +
                                        stairs.end + "," +
                                        '"' + stairs.direction + '"' + "," +
                                        stairs.barsCount + "," +
                                        stairs.firstAmount + "," +
                                        stairs.lastAmount + "]";

                                    if (separator === "") { separator = ","; }

                                    fileRecordCounter++;

                                }

                                fileContent = "[" + fileContent + "]";

                                let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                let filePath = filePathRoot + "/Output/" + VOLUME_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;

                                utilities.createFolderIfNeeded(filePath, tomStorage, onFolderCreated);

                                function onFolderCreated() {

                                    tomStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated() {

                                        const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                        console.log(logText);
                                        logger.write(MODULE_NAME, logText);

                                        controlLoop();
                                    }
                                }
                            } catch (err) {

                                const logText = "[ERR] 'writeVolumeStairsFile' - Message: " + err.message;
                                logger.write(MODULE_NAME, logText);

                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                return;

                            }
                        }
                    }
                }

                function controlLoop() {

                    n++;

                    if (n < global.dailyFilePeriods.length) {

                        loopBody();

                    } else {

                        n = 0;

                        writeDataRanges(onWritten);

                        function onWritten(err) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildCandles -> periodsLoop -> controlLoop -> onWritten -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] writeDataRanges -> writeDataRanges -> onCandlesDataRangeWritten -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            writeStatusReport(processDate, switchEndValues);

                            function switchEndValues() {

                                lastEndValues = currentEndValues;
                                advanceTime();

                            }
                        }
                    }
                }
            }

            function writeDataRanges(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                    writeDataRange(contextVariables.firstTradeFile, processDate, CANDLE_STAIRS_FOLDER_NAME, onCandlesStairsDataRangeWritten);
                                                                                                     
                    function onCandlesStairsDataRangeWritten(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRanges -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] writeDataRanges -> writeDataRanges -> onCandlesStairsDataRangeWritten -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        writeDataRange(contextVariables.firstTradeFile, processDate, VOLUME_STAIRS_FOLDER_NAME, onVolumeStairsDataRangeWritten);

                        function onVolumeStairsDataRangeWritten(err) {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] writeDataRanges -> writeDataRanges -> onVolumeStairsDataRangeWritten -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write(MODULE_NAME, "[ERROR] writeDataRanges -> writeDataRanges -> onVolumeStairsDataRangeWritten -> err = " + err.message);
                                callBack(err);
                                return;
                            }

                            callBack(global.DEFAULT_OK_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRanges -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }

            }

            function writeDataRange(pBegin, pEnd, pProductFolder, callBack) {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> Entering function."); }

                    let dataRange = {
                        begin: pBegin.valueOf(),
                        end: pEnd.valueOf()
                    };

                    let fileContent = JSON.stringify(dataRange);

                    let fileName = 'Data.Range.' + market.assetA + '_' + market.assetB + '.json';
                    let filePath = bot.filePathRoot + "/Output/" + pProductFolder + "/" + bot.process;

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> fileName = " + fileName); }
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> filePath = " + filePath); }

                    tomStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> onFileCreated -> err = " + err.message);
                            callBack(err);
                            return;
                        }

                        if (LOG_FILE_CONTENT === true) {
                            logger.write(MODULE_NAME, "[INFO] start -> writeDataRange -> onFileCreated ->  Content written = " + fileContent);
                        }

                        callBack(global.DEFAULT_OK_RESPONSE);
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeDataRange -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }

                try {

                    let reportKey = "AAMasters" + "-" + "AATom" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    let thisReport = statusDependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'Start' - ERROR : " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
