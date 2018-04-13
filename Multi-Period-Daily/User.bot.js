exports.newUserBot = function newUserBot(BOT, COMMONS, UTILITIES, DEBUG_MODULE, FILE_STORAGE, BLOB_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    let bot = BOT;

    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const EXCHANGE_NAME = "Poloniex";

    const TRADES_FOLDER_NAME = "Trades";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    const commons = COMMONS.newCommons(bot, DEBUG_MODULE, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let oliviaStorage = FILE_STORAGE.newFileStorage(bot);
    let bruceStorage = FILE_STORAGE.newFileStorage(bot);

    let utilities = UTILITIES.newUtilities(bot);

    let dependencies;

    return thisObject;

    function initialize(pDependencies, pMonth, pYear, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            dependencies = pDependencies;

            commons.initializeStorage(oliviaStorage, bruceStorage, onInizialized);

            function onInizialized(err) {

                if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                    if (FULL_LOG === true) { logger.write("[INFO] initialize -> onInizialized -> Initialization Succeed."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } else {
                    logger.write("[ERROR] initialize -> onInizialized -> err = " + err.message);
                    callBackFunction(err);
                }
            }

        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

/*

This process is going to do the following:

Read the candles and volumes from Bruce and produce a file for each day and for each period with candles and volumes. 

*/

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] start -> Entering function."); }

            let market = global.MARKET;

            /* Context Variables */

            let contextVariables = {
                lastCandleFile: undefined,          // Datetime of the last file files sucessfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxCandleFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Poloniex-Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write("[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);
                        logger.write("[HINT] start -> getContextVariables -> It is too early too run this process since the trade history of the market is not there yet.");

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency does not exist."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.firstTradeFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + thisReport.lastFile.hours + ":" + thisReport.lastFile.minutes + GMT_SECONDS);

                    reportKey = "AAMasters" + "-" + "AABruce" + "-" + "One-Min-Daily-Candles-Volumes" + "-" + "dataSet.V1" + "-" +  bot.processDatetime.getUTCFullYear() + "-" + utilities.pad(bot.processDatetime.getUTCMonth() + 1,2);
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile === undefined) {
                        logger.write("[WARN] start -> getContextVariables -> Undefined Last File. -> reportKey = " + reportKey);

                        let customOK = {
                            result: global.CUSTOM_OK_RESPONSE.result,
                            message: "Dependency not ready."
                        }
                        logger.write("[WARN] start -> getContextVariables -> customOK = " + customOK.message);
                        callBackFunction(customOK);
                        return;
                    }

                    contextVariables.maxCandleFile = new Date(thisReport.lastFile.year + "-" + thisReport.lastFile.month + "-" + thisReport.lastFile.days + " " + "00:00" + GMT_SECONDS);

                    reportKey = "AAMasters" + "-" + "AAOlivia" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (dependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write("[ERROR] start -> getContextVariables -> Can not continue because self dependecy Status Report is corrupt. Aborting Process.");
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    thisReport = dependencies.statusReports.get(reportKey).file;

                    if (thisReport.lastFile !== undefined) {

                        contextVariables.lastCandleFile = new Date(thisReport.lastFile);

                        /*
                        Here we assume that the last day written might contain incomplete information. This actually happens every time the head of the market is reached.
                        For that reason we go back one day, the partial information is discarded and added again with whatever new info is available.
                        */

                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS);

                        buildCandles();
                        return;

                    } else {

                        contextVariables.lastCandleFile = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);
                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well.

                        buildCandles();
                        return;
                    }

                } catch (err) {
                    logger.write("[ERROR] start -> getContextVariables -> err = " + err.message);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write("[HINT] start -> getContextVariables -> Check the bot configuration to see if all of its dependencies declarations are correct. ");
                        logger.write("[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(dependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function buildCandles() {

                try {

                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> Entering function."); }

                    let outputCandles;
                    let outputVolumes;

                    advanceTime();

                    function advanceTime() {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> advanceTime -> Entering function."); }

                        contextVariables.lastCandleFile = new Date(contextVariables.lastCandleFile.valueOf() + ONE_DAY_IN_MILISECONDS);

                        if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> advanceTime -> New processing time @ " + contextVariables.lastCandleFile.getUTCFullYear() + "/" + (contextVariables.lastCandleFile.getUTCMonth() + 1) + "/" + contextVariables.lastCandleFile.getUTCDate() + "."); }

                        /* Validation that we are not going past the head of the market. */

                        if (contextVariables.lastCandleFile.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                            if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> advanceTime -> Head of the market found @ " + contextVariables.lastCandleFile.getUTCFullYear() + "/" + (contextVariables.lastCandleFile.getUTCMonth() + 1) + "/" + contextVariables.lastCandleFile.getUTCDate() + "."); }

                            callBackFunction(global.DEFAULT_OK_RESPONSE); // Here is where we finish processing and wait for the platform to run this module again.
                            return;
                        }

                        /*

                        We prepere the arrays that will accumulate all the information for each output file.

                        */

                        outputCandles = [];
                        outputVolumes = [];

                        for (n = 0; n < global.dailyFilePeriods.length; n++) {

                            const emptyArray1 = [];
                            const emptyArray2 = [];

                            outputCandles.push(emptyArray1);
                            outputVolumes.push(emptyArray2);

                        }

                        periodsLoop();

                    }

                    function periodsLoop() {

                        /*
        
                        We will iterate through all posible periods.
        
                        */

                        let n = 0   // loop Variable representing each possible period as defined at the periods array.

                        loopBody();

                        function loopBody() {

                            if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> Entering function."); }

                            const outputPeriod = global.dailyFilePeriods[n][0];
                            const folderName = global.dailyFilePeriods[n][1];

                            nextCandleFile();

                            function nextCandleFile() {

                                if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> Entering function."); }

                                let dateForPath = contextVariables.lastCandleFile.getUTCFullYear() + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCDate(), 2);
                                let fileName = market.assetA + '_' + market.assetB + ".json"
                                let filePathRoot = bot.devTeam + "/" + "AABruce" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

                                if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> fileName = " + fileName); }
                                if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> filePath = " + filePath); }

                                bruceStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                function onFileReceived(err, text) {

                                    try {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Entering function."); }
                                        if (LOG_FILE_CONTENT === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> text = " + text); }

                                        let candlesFile;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                candlesFile = JSON.parse(text);

                                            } catch (err) {
                                                logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Error Parsing JSON -> err = " + err.message);
                                                logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                return;
                                            }
                                        } else {
                                            logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> Error Received -> err = " + err.message);
                                            callBackFunction(err);
                                            return;
                                        }

                                        const inputCandlesPerdiod = 60 * 1000;              // 1 min
                                        const inputFilePeriod = 24 * 60 * 60 * 1000;        // 24 hs

                                        let totalOutputCandles = inputFilePeriod / outputPeriod; 
                                        let beginingOutputTime = contextVariables.lastCandleFile.valueOf();

                                        for (let i = 0; i < totalOutputCandles; i++) {

                                            let outputCandle = {
                                                open: 0,
                                                close: 0,
                                                min: 0,
                                                max: 0,
                                                begin: 0,
                                                end: 0
                                            };

                                            let saveCandle = false;

                                            outputCandle.begin = beginingOutputTime + i * outputPeriod;
                                            outputCandle.end = beginingOutputTime + (i + 1) * outputPeriod - 1;

                                            for (let j = 0; j < candlesFile.length; j++) {

                                                let candle = {
                                                    open: candlesFile[j][2],
                                                    close: candlesFile[j][3],
                                                    min: candlesFile[j][0],
                                                    max: candlesFile[j][1],
                                                    begin: candlesFile[j][4],
                                                    end: candlesFile[j][5]
                                                };

                                                /* Here we discard all the candles out of range.  */

                                                if (candle.begin >= outputCandle.begin && candle.end <= outputCandle.end) {

                                                    if (saveCandle === false) { // this will set the value only once.

                                                        outputCandle.open = candle.open;
                                                        outputCandle.min = candle.min;
                                                        outputCandle.max = candle.max;
                                                    }

                                                    saveCandle = true;

                                                    outputCandle.close = candle.close;      // only the last one will be saved

                                                    if (candle.min < outputCandle.min) {

                                                        outputCandle.min = candle.min;
                                                    }

                                                    if (candle.max > outputCandle.max) {

                                                        outputCandle.max = candle.max;
                                                    }
                                                }
                                            }

                                            if (saveCandle === true) {      // then we have a valid candle, otherwise it means there were no candles to fill this one in its time range.

                                                outputCandles[n].push(outputCandle);
                                            }
                                        }

                                        nextVolumeFile();

                                    } catch (err) {
                                        logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextCandleFile -> onFileReceived -> err = " + err.message);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }

                            function nextVolumeFile() {

                                try {

                                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> Entering function."); }

                                    let dateForPath = contextVariables.lastCandleFile.getUTCFullYear() + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCDate(), 2);
                                    let fileName = market.assetA + '_' + market.assetB + ".json"
                                    let filePathRoot = bot.devTeam + "/" + "AABruce" + "." + bot.version.major + "." + bot.version.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                    let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + VOLUMES_ONE_MIN + '/' + dateForPath;

                                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> fileName = " + fileName); }
                                    if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> filePath = " + filePath); }

                                    bruceStorage.getTextFile(filePath, fileName, onFileReceived, true);

                                    function onFileReceived(err, text) {

                                        if (FULL_LOG === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Entering function."); }
                                        if (LOG_FILE_CONTENT === true) { logger.write("[INFO] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> text = " + text); }

                                        let volumesFile;

                                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                                            try {
                                                volumesFile = JSON.parse(text);

                                            } catch (err) {
                                                logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Error Parsing JSON -> err = " + err.message);
                                                logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Asuming this is a temporary situation. Requesting a Retry.");
                                                callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                return;
                                            }
                                        } else {
                                            logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> Error Received -> err = " + err.message);
                                            callBackFunction(err);
                                            return;
                                        }

                                        const inputVolumesPerdiod = 60 * 1000;              // 1 min
                                        const inputFilePeriod = 24 * 60 * 60 * 1000;        // 24 hs

                                        let totalOutputVolumes = inputFilePeriod / outputPeriod; // this should be 2 in this case.
                                        let beginingOutputTime = contextVariables.lastCandleFile.valueOf();

                                        for (let i = 0; i < totalOutputVolumes; i++) {

                                            let outputVolume = {
                                                buy: 0,
                                                sell: 0,
                                                begin: 0,
                                                end: 0
                                            };

                                            let saveVolume = false;

                                            outputVolume.begin = beginingOutputTime + i * outputPeriod;
                                            outputVolume.end = beginingOutputTime + (i + 1) * outputPeriod - 1;

                                            for (let j = 0; j < volumesFile.length; j++) {

                                                let volume = {
                                                    buy: volumesFile[j][0],
                                                    sell: volumesFile[j][1],
                                                    begin: volumesFile[j][2],
                                                    end: volumesFile[j][3]
                                                };

                                                /* Here we discard all the Volumes out of range.  */

                                                if (volume.begin >= outputVolume.begin && volume.end <= outputVolume.end) {

                                                    saveVolume = true;

                                                    outputVolume.buy = outputVolume.buy + volume.buy;
                                                    outputVolume.sell = outputVolume.sell + volume.sell;

                                                }
                                            }

                                            if (saveVolume === true) {

                                                outputVolumes[n].push(outputVolume);

                                            }
                                        }

                                        writeFiles(outputCandles[n], outputVolumes[n], folderName, controlLoop);

                                    }
                                } catch (err) {
                                    logger.write("[ERROR] start -> buildCandles -> periodsLoop -> loopBody -> nextVolumeFile -> onFileReceived -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }
                        }

                        function controlLoop() {

                            n++;

                            if (n < global.dailyFilePeriods.length) {

                                loopBody();

                            } else {

                                writeStatusReport(contextVariables.lastCandleFile, advanceTime);
                            }
                        }
                    }
                }
                catch (err) {
                    logger.write("[ERROR] start -> buildCandles -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeFiles(candles, volumes, folderName, callBack) {

                if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> Entering function."); }

                /*

                Here we will write the contents of the Candles and Volumens files.

                */

                try {

                    writeCandles();

                    function writeCandles() {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;
                        let fileContent = "";

                        for (i = 0; i < candles.length; i++) {

                            let candle = candles[i];

                            fileContent = fileContent + separator + '[' + candles[i].min + "," + candles[i].max + "," + candles[i].open + "," + candles[i].close + "," + candles[i].begin + "," + candles[i].end + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                        let dateForPath = contextVariables.lastCandleFile.getUTCFullYear() + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCDate(), 2);
                        let filePath = bot.filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + "/" + bot.process + "/" + folderName + "/" + dateForPath;

                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> fileName = " + fileName); }
                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> filePath = " + filePath); }

                        utilities.createFolderIfNeeded(filePath, oliviaStorage, onFolderCreated);

                        function onFolderCreated(err) {

                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> err = " + err.message);
                                callBackFunction(err);
                                return;
                            }

                            oliviaStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> Entering function."); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBackFunction(err);
                                    return;
                                }

                                if (LOG_FILE_CONTENT === true) {
                                    logger.write("[INFO] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                                }

                                logger.write("[WARN] start -> writeFiles -> writeCandles -> onFolderCreated -> onFileCreated ->  Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName);

                                writeVolumes();
                            }
                        }
                    }

                    function writeVolumes() {

                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> Entering function."); }

                        let separator = "";
                        let fileRecordCounter = 0;
                        let fileContent = "";

                        for (i = 0; i < volumes.length; i++) {

                            let candle = volumes[i];

                            fileContent = fileContent + separator + '[' + volumes[i].buy + "," + volumes[i].sell + "," + volumes[i].begin + "," + volumes[i].end + "]";

                            if (separator === "") { separator = ","; }

                            fileRecordCounter++;

                        }

                        fileContent = "[" + fileContent + "]";

                        let fileName = '' + market.assetA + '_' + market.assetB + '.json';
                        let dateForPath = contextVariables.lastCandleFile.getUTCFullYear() + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCMonth() + 1, 2) + '/' + utilities.pad(contextVariables.lastCandleFile.getUTCDate(), 2);
                        let filePath = bot.filePathRoot  + "/Output/" + VOLUMES_FOLDER_NAME + "/" + bot.process + "/" + folderName + "/" + dateForPath;

                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> fileName = " + fileName); }
                        if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> filePath = " + filePath); }

                        utilities.createFolderIfNeeded(filePath, oliviaStorage, onFolderCreated);

                        function onFolderCreated(err) {

                            if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> err = " + err.message);
                                callBackFunction(err);
                                return;
                            }

                            oliviaStorage.createTextFile(filePath, fileName, fileContent + '\n', onFileCreated);

                            function onFileCreated(err) {

                                if (FULL_LOG === true) { logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> Entering function."); }

                                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                    logger.write("[ERROR] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated -> err = " + err.message);
                                    callBackFunction(err);
                                    return;
                                }

                                if (LOG_FILE_CONTENT === true) {
                                    logger.write("[INFO] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated ->  Content written = " + fileContent);
                                }

                                logger.write("[WARN] start -> writeFiles -> writeVolumes -> onFolderCreated -> onFileCreated ->  Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName);

                                callBack();
                            }
                        }
                    }
                }
                catch (err) {
                    logger.write("[ERROR] start -> writeFiles -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStatusReport(lastFileDate, callBack) {

                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> Entering function."); }
                if (FULL_LOG === true) { logger.write("[INFO] start -> writeStatusReport -> lastFileDate = " + lastFileDate); }

                try {

                    let reportKey = "AAMasters" + "-" + "AAOlivia" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    let thisReport = dependencies.statusReports.get(reportKey);

                    thisReport.file.lastExecution = bot.processDatetime;
                    thisReport.file.lastFile = lastFileDate;
                    thisReport.save(callBack);

                }
                catch (err) {
                    logger.write("[ERROR] start -> writeStatusReport -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        }
        catch (err) {
            const logText = "[ERROR] 'Start' - ERROR : " + err.message;
            logger.write(logText);
        }
    }
};
