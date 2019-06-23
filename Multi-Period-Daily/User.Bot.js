exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, fileStorage) {

    const FULL_LOG = true;
    const INTENSIVE_LOG = false;
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

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

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

            /* One of the challenges of this process is that each imput file contains one day of candles. So if a stair spans more than one day
            then we dont want to break the stais in two pieces. What we do is that we read to candles files at the time and record at the current
            date all stairs of the day plus the ones thas spans to the second day without bigining at the second day. Then when we process the next
            day, we must remember where the last stairs of each type endded, so as not to create overlapping stairs in the current day. */

            let market = global.MARKET;

            /* Context Variables */

            let contextVariables = {
                lastCandleFile: undefined,          // Datetime of the last file files sucessfully produced by this process.
                firstTradeFile: undefined,          // Datetime of the first trade file in the whole market history.
                maxCandleFile: undefined            // Datetime of the last file available to be used as an input of this process.
            };

            let previousDay;                        // Holds the date of the previous day relative to the processing date.
            let processDate;                        // Holds the processing date.

            getContextVariables();

            function getContextVariables() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> Entering function."); }

                    let thisReport;
                    let reportKey;
                    let statusReport;

                    /* We look first for Charly in order to get when the market starts. */

                    reportKey = "AAMasters" + "-" + "AACharly" + "-" + "Historic-Trades" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
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

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
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

                    contextVariables.maxCandleFile = new Date(thisReport.lastFile.valueOf());

                    /* Finally we get our own Status Report. */

                    reportKey = "AAMasters" + "-" + "AATom" + "-" + "Multi-Period-Daily" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    statusReport = statusDependencies.statusReports.get(reportKey);

                    if (statusReport === undefined) { // This means the status report does not exist, that could happen for instance at the begining of a month.
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
                        3 files.

                        1. The first file is a stairs file corresponding to processDay -2. From there we will know where the last staris ended.
                        2. The second is a candle or volume file corresponding to processDay -1.
                        3. The third is a candle of volume file at processDay.

                        We will recalculate 2 and 3 considering the objects already in 1, so as to make the transition between 2 and 3 smooth.
                        */

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> thisReport.lastFile !== undefined"); }

                        buildStairs();
                        return;

                    } else {

                        /*
                        In the case when there is no status report, we take the date of the file with the first trades as the begining of the market. Then we will
                        go one day back in time, so that when we enter the loop, one day will be added and we will be exactly at the date where the first trades occured.
                        */

                        contextVariables.lastCandleFile = new Date(contextVariables.firstTradeFile.getUTCFullYear() + "-" + (contextVariables.firstTradeFile.getUTCMonth() + 1) + "-" + contextVariables.firstTradeFile.getUTCDate() + " " + "00:00" + GMT_SECONDS);

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> thisReport.lastFile === undefined"); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> contextVariables.lastCandleFile = " + contextVariables.lastCandleFile); }

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

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> Entering function."); }

                    let n;
                    processDate = new Date(contextVariables.lastCandleFile.valueOf() - ONE_DAY_IN_MILISECONDS); // Go back one day to start well when we advance time at the begining of the loop.
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> processDate = " + processDate); }

                    advanceTime();

                    function advanceTime() {

                        try {

                            logger.newInternalLoop(bot.codeName, bot.process);

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> advanceTime -> Entering function."); }

                            processDate = new Date(processDate.valueOf() + ONE_DAY_IN_MILISECONDS);
                            previousDay = new Date(processDate.valueOf() - ONE_DAY_IN_MILISECONDS);

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> advanceTime -> processDate = " + processDate); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> advanceTime -> previousDay = " + previousDay); }

                            /* Validation that we are not going past the head of the market. */

                            if (processDate.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                                const logText = "Head of the market found @ " + previousDay.getUTCFullYear() + "/" + (previousDay.getUTCMonth() + 1) + "/" + previousDay.getUTCDate() + ".";
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> advanceTime -> " + logText); }

                                callBackFunction(global.DEFAULT_OK_RESPONSE);
                                return;

                            }

                            periodsLoop();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> advanceTime -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function periodsLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> periodsLoop -> Entering function."); }

                            /*

                            We will iterate through all posible timePeriods.

                            */

                            n = 0   // loop Variable representing each possible period as defined at the periods array.

                            loopBody();

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function loopBody() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> Entering function."); }

                            const timePeriod = global.dailyFilePeriods[n][1];

                            let endOfLastCandleStair = new Date(previousDay.valueOf() - ONE_DAY_IN_MILISECONDS);
                            let endOfLastBuyVolumeStair = new Date(previousDay.valueOf() - ONE_DAY_IN_MILISECONDS);
                            let endOfLastSellVolumeStair = new Date(previousDay.valueOf() - ONE_DAY_IN_MILISECONDS);

                            /*
                            By default we set the starting date of the processDay - 2 file. If we find the file this value shoulld be overwritten by the value of the end property
                            of the last object on the file.
                            */

                            endOfLastCandleStair = endOfLastCandleStair.valueOf();
                            endOfLastBuyVolumeStair = endOfLastBuyVolumeStair.valueOf();
                            endOfLastSellVolumeStair = endOfLastSellVolumeStair.valueOf();

                            getEndOfLastCandleStair();

                            function getEndOfLastCandleStair() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastCandleStair -> Entering function."); }

                                    let fileDate = new Date(previousDay.valueOf() - ONE_DAY_IN_MILISECONDS);
                                    getCandleStairsFile();

                                    function getCandleStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> Entering function."); }

                                            let dateForPath = fileDate.getUTCFullYear() + '/' + utilities.pad(fileDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(fileDate.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + CANDLE_STAIRS_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onFileReceived, true);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> onFileReceived -> Entering function."); }

                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> onFileReceived -> text = " + text); }

                                                    if (
                                                        err.result === global.CUSTOM_FAIL_RESPONSE.result &&
                                                        (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                                                    ) {

                                                        getEndOfLastVolumeStair();
                                                        return;
                                                    }

                                                    let stairsFile = JSON.parse(text);

                                                    if (stairsFile.length > 0) {

                                                        endOfLastCandleStair = stairsFile[stairsFile.length - 1][5]; // We get from the last regord the end value. Position 5 = Stairs.end
                                                        getEndOfLastVolumeStair();

                                                    } else {

                                                        getEndOfLastVolumeStair();
                                                        return;

                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> onFileReceived -> err = " + err.message);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> onFileReceived -> filePath = " + filePath);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> onFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastCandleStair -> getCandleStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastCandleStair -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function getEndOfLastVolumeStair() {

                                try {


                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastVolumeStair -> Entering function."); }

                                    let fileDate = new Date(previousDay.valueOf() - ONE_DAY_IN_MILISECONDS);
                                    getCandleStairsFile();

                                    function getCandleStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> Entering function."); }

                                            let dateForPath = fileDate.getUTCFullYear() + '/' + utilities.pad(fileDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(fileDate.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + VOLUME_STAIRS_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onFileReceived, true);

                                            function onFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> onFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> onFileReceived -> text = " + text); }

                                                    if (
                                                        err.result === global.CUSTOM_FAIL_RESPONSE.result &&
                                                        (err.message === 'Folder does not exist.' || err.message === 'File does not exist.')
                                                    ) {

                                                        processCandles();
                                                        return;
                                                    }

                                                    let stairsFile = JSON.parse(text);

                                                    if (stairsFile.length > 0) {

                                                        for (let i = 0; i < stairsFile.length; i++) {

                                                            let stairs = {
                                                                type: stairsFile[i][0],
                                                                begin: stairsFile[i][1],
                                                                end: stairsFile[i][2],
                                                                direction: stairsFile[i][3],
                                                                barsCount: stairsFile[i][4],
                                                                firstAmount: stairsFile[i][5],
                                                                lastAmount: stairsFile[i][6]
                                                            };

                                                            if (stairs.type === 'buy') {

                                                                endOfLastBuyVolumeStair = stairs.end;

                                                            } else {

                                                                endOfLastSellVolumeStair = stairs.end;

                                                            }
                                                        }

                                                        processCandles();

                                                    } else {

                                                        processCandles();
                                                        return;

                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> onFileReceived -> err = " + err.message);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> onFileReceived -> filePath = " + filePath);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> onFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                }
                                            }
                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastVolumeStair -> getCandleStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> getEndOfLastVolumeStair -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function processCandles() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> Entering function."); }

                                    let candles = [];                   // Here we will put all the candles of the 2 files read.

                                    let previousDayStairsArray = [];    // Here All the stairs of the previous day.
                                    let processDayStairsArray = [];     // Here All the stairs of the process day.

                                    let previousDayFile;
                                    let processDayFile;

                                    getCandleStairsFile();

                                    function getCandleStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getCandleStairsFile -> Entering function."); }

                                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                            function onCurrentDayFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getCandleStairsFile -> onCurrentDayFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getCandleStairsFile -> onCurrentDayFileReceived -> text = " + text); }

                                                    previousDayFile = JSON.parse(text);
                                                    getProcessDayFile()

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getCandleStairsFile -> onCurrentDayFileReceived -> err = " + err.message);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getCandleStairsFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getCandleStairsFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getCandleStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function getProcessDayFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getProcessDayFile -> Entering function."); }

                                            let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + CANDLES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                            function onCurrentDayFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getProcessDayFile -> onCurrentDayFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> getProcessDayFile -> onCurrentDayFileReceived -> text = " + text); }

                                                    processDayFile = JSON.parse(text);
                                                    buildCandles();

                                                } catch (err) {

                                                    if (processDate.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                                                        processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                                        buildCandles();

                                                    } else {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getProcessDayFile -> onCurrentDayFileReceived -> err = " + err.message);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getProcessDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getProcessDayFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> getProcessDayFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function buildCandles() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> buildCandles -> Entering function."); }

                                            pushCandles(previousDayFile);
                                            pushCandles(processDayFile);
                                            findCandleStairs();

                                            function pushCandles(candlesFile) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> buildCandles -> pushCandles -> Entering function."); }

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

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> buildCandles -> pushCandles -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                    return;
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> buildCandles -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                    function findCandleStairs() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> findCandleStairs -> Entering function."); }

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

                                                        /*
                                                        Here we detect stairs that started at process day - 2.
                                                        */

                                                        if (stairs.begin > endOfLastCandleStair) {

                                                            if (stairs.begin >= processDate.valueOf()) {

                                                                processDayStairsArray.push(stairs);

                                                            } else {

                                                                previousDayStairsArray.push(stairs);

                                                            }
                                                        }

                                                        stairs = undefined;
                                                    }
                                                }
                                            }

                                            writeCandleStairsFile();

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> findCandleStairs -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }
                                    }

                                    function writeCandleStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> Entering function."); }

                                            writeFile(previousDayStairsArray, previousDay, onPreviousFileWritten);

                                            function onPreviousFileWritten() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> onPreviousFileWritten -> Entering function."); }

                                                    writeFile(processDayStairsArray, processDate, onProcessFileWritten);

                                                    function onProcessFileWritten() {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> onPreviousFileWritten -> onProcessFileWritten -> Entering function."); }

                                                            processVolumes();

                                                        } catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> writeCandleStairsFile -> onPreviousFileWritten -> onProcessFileWritten -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> writeCandleStairsFile -> onPreviousFileWritten -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeFile(pStairs, pDate, callback) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> Entering function."); }

                                                    let separator = "";
                                                    let fileRecordCounter = 0;

                                                    let fileContent = "";

                                                    for (i = 0; i < pStairs.length; i++) {

                                                        let stairs = pStairs[i];

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

                                                    let dateForPath = pDate.getUTCFullYear() + '/' + utilities.pad(pDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(pDate.getUTCDate(), 2);
                                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + CANDLE_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> onFileCreated -> Entering function."); }

                                                            if (LOG_FILE_CONTENT === true) {
                                                                logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> onFileCreated ->  Content written = " + fileContent);
                                                            }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> onFileCreated -> err = " + err.message);
                                                                callBack(err);
                                                                return;
                                                            }

                                                            const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> onFileCreated -> " + logText); }

                                                            callback();

                                                        } catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> onFileCreated -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        }
                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> writeCandleStairsFile -> writeFile -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> writeCandleStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processCandles -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                            function processVolumes() {

                                try {

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> Entering function."); }

                                    let volumes = [];

                                    let previousDayStairsArray = [];    // Here All the stairs of the previous day.
                                    let processDayStairsArray = [];     // Here All the stairs of the process day.

                                    let previousDayFile;
                                    let processDayFile;

                                    getCandleStairsFile();

                                    function getCandleStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getCandleStairsFile -> Entering function."); }

                                            let dateForPath = previousDay.getUTCFullYear() + '/' + utilities.pad(previousDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(previousDay.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                            function onCurrentDayFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getCandleStairsFile -> onCurrentDayFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getCandleStairsFile -> onCurrentDayFileReceived -> text = " + text); }

                                                    previousDayFile = JSON.parse(text);
                                                    getProcessDayFile()

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getCandleStairsFile -> onCurrentDayFileReceived -> err = " + err.message);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getCandleStairsFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getCandleStairsFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getCandleStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function getProcessDayFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getProcessDayFile -> Entering function."); }

                                            let dateForPath = processDate.getUTCFullYear() + '/' + utilities.pad(processDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(processDate.getUTCDate(), 2);
                                            let fileName = market.assetA + '_' + market.assetB + ".json"

                                            let filePathRoot = bot.devTeam + "/" + "AAOlivia" + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                            let filePath = filePathRoot + "/Output/" + VOLUMES_FOLDER_NAME + '/' + "Multi-Period-Daily" + "/" + timePeriod + "/" + dateForPath;
                                            filePath += '/' + fileName

                                            fileStorage.getTextFile(bot.devTeam, filePath, onCurrentDayFileReceived, true);

                                            function onCurrentDayFileReceived(err, text) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getProcessDayFile -> onCurrentDayFileReceived -> Entering function."); }
                                                    if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> getProcessDayFile -> onCurrentDayFileReceived -> text = " + text); }

                                                    processDayFile = JSON.parse(text);
                                                    buildVolumes();

                                                } catch (err) {

                                                    if (processDate.valueOf() > contextVariables.maxCandleFile.valueOf()) {

                                                        processDayFile = [];  // we are past the head of the market, then no worries if this file is non existent.
                                                        buildVolumes();

                                                    } else {

                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getProcessDayFile -> onCurrentDayFileReceived -> err = " + err.message);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getProcessDayFile -> onCurrentDayFileReceived -> filePath = " + filePath);
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getProcessDayFile -> onCurrentDayFileReceived -> market = " + market.assetA + '_' + market.assetB);

                                                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                                        return;
                                                    }
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> getProcessDayFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function buildVolumes() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> buildVolumes -> Entering function."); }

                                            pushVolumes(previousDayFile);
                                            pushVolumes(processDayFile);
                                            findVolumesStairs();

                                            function pushVolumes(volumesFile) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> buildVolumes -> pushVolumes -> Entering function."); }

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

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> buildVolumes -> pushVolumes -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> buildVolumes -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function findVolumesStairs() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> findVolumesStairs -> Entering function."); }

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

                                                    if (INTENSIVE_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> findVolumesStairs -> pushToArray -> Entering function."); }

                                                    try {

                                                        if (stairs !== undefined) {

                                                            /*
                                                           Here we detect stairs that started at process day - 2.
                                                           */

                                                            if (stairs.type === 'sell') {

                                                                if (stairs.begin > endOfLastSellVolumeStair) {

                                                                    if (stairs.begin >= processDate.valueOf()) {

                                                                        processDayStairsArray.push(stairs);

                                                                    } else {

                                                                        previousDayStairsArray.push(stairs);

                                                                    }
                                                                }
                                                            }
                                                            else {

                                                                if (stairs.begin > endOfLastBuyVolumeStair) {

                                                                    if (stairs.begin >= processDate.valueOf()) {

                                                                        processDayStairsArray.push(stairs);

                                                                    } else {

                                                                        previousDayStairsArray.push(stairs);

                                                                    }
                                                                }

                                                            }

                                                            stairs = undefined;
                                                        }

                                                    } catch (err) {
                                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> findVolumesStairs -> pushToArray -> err = " + err.message);
                                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                    }
                                                }
                                            }

                                            writeVolumeStairsFile();

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> findVolumesStairs -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                    function writeVolumeStairsFile() {

                                        try {

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> Entering function."); }

                                            writeFile(previousDayStairsArray, previousDay, onPreviousFileWritten);

                                            function onPreviousFileWritten() {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> Entering function."); }

                                                    writeFile(processDayStairsArray, processDate, onProcessFileWritten);

                                                    function onProcessFileWritten() {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> onProcessFileWritten -> Entering function."); }

                                                            controlLoop();

                                                        } catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> onProcessFileWritten -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                            function writeFile(pStairs, pDate, callback) {

                                                try {

                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> writeFile -> Entering function."); }

                                                    let separator = "";
                                                    let fileRecordCounter = 0;

                                                    let fileContent = "";

                                                    for (i = 0; i < pStairs.length; i++) {

                                                        let stairs = pStairs[i];

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

                                                    let dateForPath = pDate.getUTCFullYear() + '/' + utilities.pad(pDate.getUTCMonth() + 1, 2) + '/' + utilities.pad(pDate.getUTCDate(), 2);
                                                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                                                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                                                    let filePath = filePathRoot + "/Output/" + VOLUME_STAIRS_FOLDER_NAME + "/" + bot.process + "/" + timePeriod + "/" + dateForPath;
                                                    filePath += '/' + fileName

                                                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                                                    function onFileCreated(err) {

                                                        try {

                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> writeFile -> onFileCreated -> Entering function."); }

                                                            if (LOG_FILE_CONTENT === true) {
                                                                logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> writeFile -> onFileCreated ->  Content written = " + fileContent);
                                                            }

                                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                                                logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> writeFile -> onFileCreated -> err = " + err.message);
                                                                callBack(err);
                                                                return;
                                                            }

                                                            const logText = "[WARN] Finished with File @ " + market.assetA + "_" + market.assetB + ", " + fileRecordCounter + " records inserted into " + filePath + "/" + fileName + "";
                                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> loopBody -> processVolumes -> writeVolumeStairsFile -> writeFile -> onFileCreated -> " + logText); }

                                                            callback();

                                                        } catch (err) {
                                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> writeFile -> onFileCreated -> err = " + err.message);
                                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                        }
                                                    }

                                                } catch (err) {
                                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> writeVolumeStairsFile -> onPreviousFileWritten -> writeFile -> err = " + err.message);
                                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                }
                                            }

                                        } catch (err) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> writeVolumeStairsFile -> err = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        }
                                    }

                                } catch (err) {
                                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> processVolumes -> err = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> loopBody -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function controlLoop() {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> controlLoop -> Entering function."); }

                            n++;

                            if (n < global.dailyFilePeriods.length) {

                                loopBody();

                            } else {

                                n = 0;

                                writeDataRanges(onWritten);

                                function onWritten(err) {

                                    try {

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> buildStairs -> controlLoop -> onWritten -> Entering function."); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> controlLoop -> onWritten -> err = " + err.message);
                                            callBack(err);
                                            return;
                                        }

                                        writeStatusReport(processDate, advanceTime);

                                    } catch (err) {
                                        logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> controlLoop -> onWritten -> err = " + err.message);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }

                        } catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> periodsLoop -> controlLoop -> err = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }

                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> buildStairs -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

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
            logger.write(MODULE_NAME, "[ERROR] start -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
