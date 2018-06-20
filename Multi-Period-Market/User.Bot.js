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


            let periods =
                '[' +
                '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
                '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
                '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
                '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
                '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
                '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
                '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
                '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

            const outputPeriods = JSON.parse(periods);

            marketsLoop(); 

            /*
    
            At every run, the process needs to loop through all the markets at this exchange.
            The following functions marketsLoop(), openMarket(), closeMarket() and closeAndOpenMarket() controls the serialization of this processing.

            */

            function marketsLoop() {

                try {

                    if (FULL_LOG === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'marketsLoop'");
                    }

                    markets.getMarketsByExchange(EXCHANGE_ID, onMarketsReady);

                    function onMarketsReady(marketsArray) {

                        marketQueue = JSON.parse(marketsArray);

                        openMarket(); // First execution and entering into the real loop.

                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'marketsLoop' - ERROR : " + err.message;
                    logger.write(MODULE_NAME, logText);
                }
            }

            function openMarket() {

                // To open a Market means picking a new market from the queue.

                try {

                    if (FULL_LOG === true) {
                        logger.write(MODULE_NAME, "[INFO] Entering function 'openMarket'");
                    }


                    if (marketQueue.length === 0) {

                        if (FULL_LOG === true) {
                            logger.write(MODULE_NAME, "[INFO] 'openMarket' - marketQueue.length === 0");
                        }

                        const logText = "[WARN] We processed all the markets.";
                        logger.write(MODULE_NAME, logText);

                        callBackFunction(nextIntervalExecution, nextIntervalLapse);

                        return;
                    }

                    if (GO_RANDOM === true) {
                        const index = parseInt(Math.random() * (marketQueue.length - 1));

                        market.id = marketQueue[index][0];
                        market.assetA = marketQueue[index][1];
                        market.assetB = marketQueue[index][2];
                        market.status = marketQueue[index][3];

                        marketQueue.splice(index, 1);
                    } else {
                        let marketRecord = marketQueue.shift();

                        market.id = marketRecord[0];
                        market.assetA = marketRecord[1];
                        market.assetB = marketRecord[2];
                        market.status = marketRecord[3];

                        if (FORCE_MARKET > 0) {
                            if (FORCE_MARKET !== market.id) {
                                closeAndOpenMarket();
                                return;
                            }
                        }
                    }

                    if (FULL_LOG === true) {
                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - marketQueue.length = " + marketQueue.length);
                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - market sucessfully opened : " + market.assetA + "_" + market.assetB);
                    }

                    if (market.status === markets.ENABLED) {

                        buildStairs();

                    } else {

                        logger.write(MODULE_NAME, "[INFO] 'openMarket' - market " + market.assetA + "_" + market.assetB + " skipped because its status is not valid. Status = " + market.status);
                        closeAndOpenMarket();
                        return;

                    }
                }
                catch (err) {
                    const logText = "[ERROR] 'openMarket' - ERROR : " + err.message;
                    logger.write(MODULE_NAME, logText);
                    closeMarket();
                }
            }

            function closeMarket() {

                if (FULL_LOG === true) {
                    logger.write(MODULE_NAME, "[INFO] Entering function 'closeMarket'");
                }

            }

            function closeAndOpenMarket() {

                if (FULL_LOG === true) {
                    logger.write(MODULE_NAME, "[INFO] Entering function 'closeAndOpenMarket'");
                }

                openMarket();
            }

            /*

            The following code executes for each market.

            */

            function buildStairs() {

                let n;

                periodsLoop();

                function periodsLoop() {

                    /*
    
                    We will iterate through all posible periods.
    
                    */

                    n = 0   // loop Variable representing each possible period as defined at the periods array.

                    loopBody();


                }

                function loopBody() {

                    const outputPeriod = outputPeriods[n][0];
                    const timePeriod = outputPeriods[n][1];

                    nextCandleFile();

                    function nextCandleFile() {

                        let fileName = market.assetA + '_' + market.assetB + ".json"
                        let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                        oliviaStorage.getTextFile(filePath, fileName, onFileReceived, true);

                        function onFileReceived(text) {

                            let marketFile;

                            try {

                                marketFile = JSON.parse(text);

                            } catch (err) {

                                const logText = "[ERR] 'nextCandleFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                logger.write(MODULE_NAME, logText);

                                closeAndOpenMarket();

                                nextIntervalExecution = true;  // we request a new interval execution.
                                nextIntervalLapse = 30000;

                                return;
                            }

                            let candles = [];
                            let stairsArray = [];

                            buildCandles();

                            function buildCandles() {

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

                            function findCandleStairs() {

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

                            function writeCandleStairsFile() {

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

                                let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + CANDLE_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod;

                                utilities.createFolderIfNeeded(filePath, tomStorage, onFolderCreated);

                                function onFolderCreated() {

                                    tomStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                                    function onFileCreated() {

                                        const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                        console.log(logText);
                                        logger.write(MODULE_NAME, logText);

                                        nextVolumeFile();
                                    }
                                }
                            }

                        }
                    }

                    function nextVolumeFile() {

                        let fileName = market.assetA + '_' + market.assetB + ".json"
                        let filePath = EXCHANGE_NAME + "/Output/" + VOLUMES_FOLDER_NAME + "/" + "Multi-Period-Market" + "/" + timePeriod;

                        oliviaStorage.getTextFile(filePath, fileName, onFileReceived, true);

                        function onFileReceived(text) {

                            let marketFile;

                            try {

                                marketFile = JSON.parse(text);

                            } catch (err) {

                                const logText = "[ERR] 'nextVolumeFile' - Empty or corrupt candle file found at " + filePath + " for market " + market.assetA + '_' + market.assetB + " . Skipping this Market. ";
                                logger.write(MODULE_NAME, logText);

                                closeAndOpenMarket();

                                nextIntervalExecution = true;  // we request a new interval execution.
                                nextIntervalLapse = 30000;

                                return;
                            }

                            let volumes = [];
                            let stairsArray = [];

                            buildVolumes();

                            function buildVolumes() {

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

                            function findVolumesStairs() {

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

                            function writeVolumeStairsFile() {

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

                                let filePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Output/" + VOLUME_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod;

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
                            }
                        }
                    }
                }

                function controlLoop() {

                    n++;

                    if (n < outputPeriods.length) {

                        loopBody();

                    } else {

                        writeStatusReport();

                    }
                }

            }

            function writeStatusReport() {

                if (FULL_LOG === true) {
                    logger.write(MODULE_NAME, "[INFO] Entering function 'writeStatusReport'");
                }

                try {

                    let reportFilePath = EXCHANGE_NAME + "/" + bot.name + "/" + bot.dataSetVersion + "/Processes/" + bot.process;

                    utilities.createFolderIfNeeded(reportFilePath, tomStorage, onFolderCreated);

                    function onFolderCreated() {

                        try {

                            let lastFileDate = new Date();

                            let fileName = "Status.Report." + market.assetA + '_' + market.assetB + ".json";

                            let report = {
                                lastFile: {
                                    year: lastFileDate.getUTCFullYear(),
                                    month: (lastFileDate.getUTCMonth() + 1),
                                    days: lastFileDate.getUTCDate()
                                }
                            };

                            let fileContent = JSON.stringify(report); 

                            tomStorage.createTextFile(reportFilePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated() {

                                if (FULL_LOG === true) {
                                    logger.write(MODULE_NAME, "[INFO] 'writeStatusReport' - Content written: " + fileContent);
                                }

                                nextIntervalExecution = true;
                                closeAndOpenMarket();
                            }
                        }
                        catch (err) {
                            const logText = "[ERROR] 'writeStatusReport - onFolderCreated' - ERROR : " + err.message;
                            logger.write(MODULE_NAME, logText);
                            closeMarket();
                        }
                    }

                }
                catch (err) {
                    const logText = "[ERROR] 'writeStatusReport' - ERROR : " + err.message;
                    logger.write(MODULE_NAME, logText);
                    closeMarket();
                }

            }

        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(MODULE_NAME, logText);
        }
    }
};
