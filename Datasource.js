exports.newDatasource = function newDatasource(BOT) {

    /* 

    This module allows trading bots to access information stored at the cloud storage.

    */

    const MODULE_NAME = "Datasource";

    thisObject = {
        initialize: initialize,
        candlesFiles: new Map,
        candlesMap: new Map,
        stairsFiles: new Map,
        stairsMap: new Map
    };

    let bot = BOT;

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;

    return thisObject;

    function initialize(callBackFunction) {

        try {

            getCandles(onCandlesReady);

            function onCandlesReady() {getPatterns(onPatternsReady); }

            function onDailyFileonPatternsReadysReady() {callBackFunction();}

        } catch (err) {

            logger.write("[ERROR] initialize -> err = " + err);
            callBackFunction("Operation Failed.");
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

                        getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Market/@Period", periodName, undefined, onFileReceived);

                        function onFileReceived(file) {

                            thisObject.candlesFiles.set(periodName, file);

                            if (thisObject.candlesFiles.size === marketFilesPeriods.length) {

                                getDailyFiles();

                            }
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getCandles -> getMarketFiles -> err = " + err);
                    callBack("Operation Failed.");
                }
            }

            function getDailyFiles(callBack) {

                try {
                    for (i = 0; i < dailyFilePeriods.length; i++) {

                        let periodTime = dailyFilePeriods[i][0];
                        let periodName = dailyFilePeriods[i][1];

                        getFile(oliviaAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Output/Candles/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived);

                        function onFileReceived(file) {

                            thisObject.candlesFiles.set(periodName, file);

                            if (thisObject.candlesFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                getCandlesWeAreIn();

                            }
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getCandles -> getDailyFiles -> err = " + err);
                    callBack("Operation Failed.");
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

                            callBack();

                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getCandles -> getCandlesWeAreIn -> err = " + err);
                    callBack("Operation Failed.");
                }
            }

        } catch (err) {
            logger.write("[ERROR] getCandles -> err = " + err);
            callBack("Operation Failed.");
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

                        getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Market/@Period", periodName, undefined, onFileReceived);

                        function onFileReceived(file) {

                            thisObject.stairsFiles.set(periodName, file);

                            if (thisObject.stairsFiles.size === marketFilesPeriods.length) {

                                getDailyFiles();

                            }
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getPatterns -> getMarketFiles -> err = " + err);
                    callBack("Operation Failed.");
                }
            }

            function getDailyFiles() {

                try {
                    for (i = 0; i < dailyFilePeriods.length; i++) {

                        let periodTime = dailyFilePeriods[i][0];
                        let periodName = dailyFilePeriods[i][1];

                        getFile(tomAzureFileStorage, "@AssetA_@AssetB.json", "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Daily/@Period/@Year/@Month/@Day", periodName, processDatetime, onFileReceived);

                        function onFileReceived(file) {

                            thisObject.stairsFiles.set(periodName, file);

                            if (thisObject.stairsFiles.size === dailyFilePeriods.length + marketFilesPeriods.length) {

                                getStairsWeAreIn();

                            }
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getPatterns -> getDailyFiles -> err = " + err);
                    callBack("Operation Failed.");
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

                            callBack();

                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] getPatterns -> getStairsWeAreIn -> err = " + err);
                    callBack("Operation Failed.");
                }
            }

        } catch (err) {
            logger.write("[ERROR] getPatterns -> err = " + err);
            callBack("Operation Failed.");
        }
    }

    function getFile(pFileService, pFileName, pFilePath, pPeriodName, pDatetime, callBackFunction) {
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

                callBackFunction(data);

            }

        } catch (err) {
            logger.write("[ERROR] getPatterns -> err = " + err);
            callBack("Operation Failed.");
        }
    }
};