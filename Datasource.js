exports.newDatasource = function newDatasource(BOT, DEBUG_MODULE, FILE_STORAGE) {

    const FULL_LOG = true;

    /* 

    This module allows trading bots to access information stored at the cloud storage.

    */

    const MODULE_NAME = "Datasource";

    thisObject = {
        initialize: initialize,
        candlesFiles: new Map,      // Complete sets of candles for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        candlesMap: new Map,        // The last 10 candles for each Time Period will be stored here.
        stairsFiles: new Map,       // Complete sets of patterns for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        stairsMap: new Map          // The patterns we are currently in will be stored here.
    };

    let bot = BOT;

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;


    let marketFilesPeriods =
        '[' +
        '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
        '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
        '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
        '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
        '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
        '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
        '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
        '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

    marketFilesPeriods = JSON.parse(marketFilesPeriods);

    let dailyFilePeriods =
        '[' +
        '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
        '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
        '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
        '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
        '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
        '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
        '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
        '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
        '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
        '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
        '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

    dailyFilePeriods = JSON.parse(dailyFilePeriods);

    let oliviaAzureFileStorage = FILE_STORAGE.newAzureFileStorage(bot);
    let tomAzureFileStorage = FILE_STORAGE.newAzureFileStorage(bot);

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            initializeOliviaStorage();

            function initializeOliviaStorage() {

                oliviaAzureFileStorage.initialize("Olivia", onInizialized);

                function onInizialized(err) {
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        initializeTomStorage();
                    } else {
                        logger.write("[ERROR] initialize -> initializeOliviaStorage -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }

            function initializeTomStorage() {

                tomAzureFileStorage.initialize("Tom", onInizialized);

                function onInizialized(err) {
                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        getCandles(onDone);
                    } else {
                        logger.write("[ERROR] initialize -> initializeTomStorage -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
            
            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: {
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] initialize -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] initialize -> onDone -> Operation Failed. Aborting the process.");
                            callBackFunction(err);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getCandles(callBack) {

                try {

                    /*
        
                    We will read several files with candles for the current day. We will use these files as an input
                    to make trading decitions later.
        
                    */

                    getMarketFiles();

                    function getMarketFiles() {

                        try {
                            /* Now we will get the market files */

                            for (i = 0; i < marketFilesPeriods.length; i++) {

                                let periodTime = marketFilesPeriods[i][0];
                                let periodName = marketFilesPeriods[i][1];

                                getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Market/@Period", periodName, undefined, onFileReceived, callBack);

                                function onFileReceived(file) {

                                    thisObject.candlesFiles.set(periodName, file);

                                    if (thisObject.candlesFiles.size === marketFilesPeriods.length) {

                                        getDailyFiles();

                                    }
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getCandles -> getMarketFiles -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getDailyFiles() {

                        try {
                            for (i = 0; i < dailyFilePeriods.length; i++) {

                                let periodTime = dailyFilePeriods[i][0];
                                let periodName = dailyFilePeriods[i][1];

                                getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived, callBack);

                                function onFileReceived(file) {

                                    thisObject.candlesFiles.set(periodName, file);

                                    if (thisObject.candlesFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                        getCandlesWeAreIn();

                                    }
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getCandles -> getDailyFiles -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getCandlesWeAreIn() {

                        try {
                            let counter = 0;

                            thisObject.candlesFiles.forEach(getCurrentCandles);

                            function getCurrentCandles(pCandlesFile, pPeriodName, map) {

                                let candlesArray = [];

                                for (i = 0; i < pCandlesFile.length; i++) {

                                    let candle = {
                                        open: undefined,
                                        close: undefined,
                                        min: 10000000000000,
                                        max: 0,
                                        begin: undefined,
                                        end: undefined,
                                        direction: undefined
                                    };

                                    candle.min = pCandlesFile[i][0];
                                    candle.max = pCandlesFile[i][1];

                                    candle.open = pCandlesFile[i][2];
                                    candle.close = pCandlesFile[i][3];

                                    candle.begin = pCandlesFile[i][4];
                                    candle.end = pCandlesFile[i][5];

                                    if (candle.open > candle.close) { candle.direction = 'down'; }
                                    if (candle.open < candle.close) { candle.direction = 'up'; }
                                    if (candle.open === candle.close) { candle.direction = 'side'; }

                                    /* We are going to store the last 10 candles per period, which will give the bot a good sense of where it is. */

                                    let timePeriod = candle.end - candle.begin + 1; // In miliseconds. (remember each candle spans a period minus one milisecond)

                                    if (candle.begin >= processDatetime.valueOf() - timePeriod * 10 && candle.end <= processDatetime.valueOf()) {

                                        candlesArray.push(candle);

                                    }
                                }

                                thisObject.candlesMap.set(pPeriodName, candlesArray);

                                counter++;

                                if (counter === thisObject.candlesFiles.size) {

                                    getPatterns(callBack);

                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getCandles -> getCandlesWeAreIn -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] getCandles -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getPatterns(callBack) {

                try {
                    /*
        
                    We will read several files with pattern calculations for the current day. We will use these files as an input
                    to make trading decitions later.
        
                    */

                    getMarketFiles();

                    function getMarketFiles() {

                        try {
                            /* Now we will get the market files */

                            for (i = 0; i < marketFilesPeriods.length; i++) {

                                let periodTime = marketFilesPeriods[i][0];
                                let periodName = marketFilesPeriods[i][1];

                                getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Market/@Period", periodName, undefined, onFileReceived, callBack);

                                function onFileReceived(file) {

                                    thisObject.stairsFiles.set(periodName, file);

                                    if (thisObject.stairsFiles.size === marketFilesPeriods.length) {

                                        getDailyFiles();

                                    }
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getPatterns -> getMarketFiles -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getDailyFiles() {

                        try {
                            for (i = 0; i < dailyFilePeriods.length; i++) {

                                let periodTime = dailyFilePeriods[i][0];
                                let periodName = dailyFilePeriods[i][1];

                                getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived, callBack);

                                function onFileReceived(file) {

                                    thisObject.stairsFiles.set(periodName, file);

                                    if (thisObject.stairsFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                        getStairsWeAreIn();

                                    }
                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getPatterns -> getDailyFiles -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getStairsWeAreIn() {

                        try {
                            let counter = 0;

                            thisObject.stairsFiles.forEach(getCurrentStairs);

                            function getCurrentStairs(pStairsFile, pPeriodName, map) {

                                for (i = 0; i < pStairsFile.length; i++) {

                                    let stairs = {
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

                                    stairs.open = pStairsFile[i][0];
                                    stairs.close = pStairsFile[i][1];

                                    stairs.min = pStairsFile[i][2];
                                    stairs.max = pStairsFile[i][3];

                                    stairs.begin = pStairsFile[i][4];
                                    stairs.end = pStairsFile[i][5];

                                    stairs.direction = pStairsFile[i][6];
                                    stairs.candleCount = pStairsFile[i][7];

                                    stairs.firstMin = pStairsFile[i][8];
                                    stairs.firstMax = pStairsFile[i][9];

                                    stairs.lastMin = pStairsFile[i][10];
                                    stairs.lastMax = pStairsFile[i][11];

                                    if (processDatetime.valueOf() >= stairs.begin && processDatetime.valueOf() <= stairs.end) {

                                        thisObject.stairsMap.set(pPeriodName, stairs);

                                    }
                                }

                                counter++;

                                if (counter === thisObject.stairsFiles.size) {

                                    callBack(global.DEFAULT_OK_RESPONSE);

                                }
                            }
                        } catch (err) {
                            logger.write("[ERROR] getPatterns -> getStairsWeAreIn -> err = " + err.message);
                            callBack(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {
                    logger.write("[ERROR] getPatterns -> err = " + err.message);
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function getFile(pFileService, pFileName, pFilePath, pPeriodName, pDatetime, innerCallBack, outerCallBack) {
                try {
                    pFileName = pFileName.replace("@AssetA", market.assetA);
                    pFileName = pFileName.replace("@AssetB", market.assetB);

                    pFilePath = pFilePath.replace("@Exchange", EXCHANGE_NAME);
                    pFilePath = pFilePath.replace("@Period", pPeriodName);

                    if (pDatetime !== undefined) {

                        pFilePath = pFilePath.replace("@Year", pDatetime.getUTCFullYear());
                        pFilePath = pFilePath.replace("@Month", utilities.pad(pDatetime.getUTCMonth() + 1, 2));
                        pFilePath = pFilePath.replace("@Day", utilities.pad(pDatetime.getUTCDate(), 2));

                    }

                    pFileService.getTextFile(pFilePath, pFileName, onFileReceived);

                    function onFileReceived(text) {

                        let data;

                        try {

                            data = JSON.parse(text);

                        } catch (err) {

                            data = JSON.parse("[]");

                        }

                        innerCallBack(data);

                    }

                } catch (err) {
                    logger.write("[ERROR] getPatterns -> err = " + err.message);
                    outerCallBack("Operation Failed");
                }
            }

        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};