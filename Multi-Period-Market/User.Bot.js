exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLE_STAIRS_FOLDER_NAME = "Candle-Stairs";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUME_STAIRS_FOLDER_NAME = "Volume-Stairs";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let statusDependencies;

    return thisObject;

    function initialize(pStatusDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            statusDependencies = pStatusDependencies;
            callBackFunction(global.DEFAULT_OK_RESPONSE);

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

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;

            buildStairs();

            function buildStairs() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> Entering function."); }

                try {

                    let n;

                    periodsLoop();

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> periodsLoop -> Entering function."); }

                            /*

                            We will iterate through all posible periods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> Entering function."); }

                            const outputPeriod = global.marketFilesPeriods[n][0];
                            const timePeriod = global.marketFilesPeriods[n][1];

                            nextCandleFile();

                            function nextCandleFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json";

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(bot.devTeam, filePath, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> Entering function."); }
                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> text = " + text); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.message);
                                                callBackFunction(err);
                                                return;

                                            }

                                            let marketFile = JSON.parse(text);

                                            let candles = [];
                                            let stairsArray = [];

                                            buildCandles();

                                            function buildCandles() {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> Entering function."); }

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

                                                    findCandleStairs();

                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> buildCandles -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function findCandleStairs() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> findCandleStairs -> Entering function."); }

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
                                                                stairsArray.push(stairs);
                                                                stairs = undefined;
                                                            }
                                                        }
                                                    }

                                                    writeCandleStairsFile();
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> findCandleStairs -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeCandleStairsFile() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> Entering function."); }

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

                                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + CANDLE_STAIRS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> Entering function."); }
                                                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> fileContent = " + fileContent); }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> err = " + err.message);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> filePath = " + filePath);
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                                callBackFunction(err);
                                                                return;

                                                            }

                                                            nextVolumeFile();

                                                        }
                                                        catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> onFileCreated -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }
                                                }
                                                catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> writeCandleStairsFile -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextCandleFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }


                            function nextVolumeFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> Entering function."); }

                                    let fileName = market.assetA + '_' + market.assetB + ".json"

                                    let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;
                                    filePath += '/' + fileName

                                    fileStorage.getTextFile(bot.devTeam, filePath, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> Entering function."); }
                                        if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> text = " + text); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> err = " + err.message);
                                            callBackFunction(err);
                                            return;

                                        }

                                        let marketFile = JSON.parse(text);

                                        let volumes = [];
                                        let stairsArray = [];

                                        buildVolumes();

                                        function buildVolumes() {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> buildVolumes -> Entering function."); }

                                                for (let i = 0; i < marketFile.length; i++) {

                                                    let volume = {
                                                        amountBuy: 0,
                                                        amountSell: 0,
                                                        begin: undefined,
                                                        end: undefined
                                                    };

                                                    volume.amountBuy = marketFile[i][0];
                                                    volume.amountSell = marketFile[i][1];

                                                    volume.begin = marketFile[i][2];
                                                    volume.end = marketFile[i][3];

                                                    volumes.push(volume);

                                                }

                                                findVolumesStairs();
                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> buildVolumes -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }

                                        function findVolumesStairs() {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> findVolumesStairs -> Entering function."); }

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

                                                                stairsArray.push(buyUpStairs);
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

                                                                stairsArray.push(buyDownStairs);
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

                                                                stairsArray.push(sellUpStairs);
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

                                                                stairsArray.push(sellDownStairs);
                                                            }

                                                            sellDownStairs = undefined;
                                                        }
                                                    }
                                                }

                                                writeVolumeStairsFile();
                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> findVolumesStairs -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }

                                        function writeVolumeStairsFile() {

                                            try {

                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> Entering function."); }

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

                                                let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                                let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                                let filePath = filePathRoot + "/Output/" + VOLUME_STAIRS_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;
                                                filePath += '/' + fileName

                                                fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                                function onFileCreated(err) {

                                                    try {

                                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> Entering function."); }
                                                        if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> fileContent = " + fileContent); }

                                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> err = " + err.message);
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> filePath = " + filePath);
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                                            callBackFunction(err);
                                                            return;

                                                        }

                                                        controlLoop();

                                                    }
                                                    catch (err) {
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> onFileCreated -> err = " + err.message);
                                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                    }
                                                }
                                            }
                                            catch (err) {
                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> onFileReceived -> writeVolumeStairsFile -> err = " + err.message);
                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            }
                                        }
                                    }
                                }
                                catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> nextVolumeFile -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.marketFilesPeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(callBackFunction);

                            }
                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> controlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(callBack) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStatusReport -> Entering function."); }

                try {

                    let reportKey = "AAMasters" + "-" + "AATom" + "-" + "Multi-Period-Market" + "-" + "dataSet.V1";
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
