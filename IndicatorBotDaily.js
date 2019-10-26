exports.newIndicatorBotDaily = function newIndicatorBotDaily(bot, logger, COMMONS, UTILITIES, FILE_STORAGE) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;

    const MODULE_NAME = "User Bot";

    const BOLLINGER_CHANNELS_FOLDER_NAME = "Bollinger-Channels";
    const BOLLINGER_STANDARD_CHANNELS_FOLDER_NAME = "Bollinger-Standard-Channels";
    const BOLLINGER_SUB_CHANNELS_FOLDER_NAME = "Bollinger-Sub-Channels";
    const BOLLINGER_STANDARD_SUB_CHANNELS_FOLDER_NAME = "Bollinger-Standard-Sub-Channels";

    const commons = COMMONS.newIndicatorBotCommons(bot, logger, UTILITIES);

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let fileStorage = FILE_STORAGE.newFileStorage(logger);
    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            processConfig = pProcessConfig;
            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(dataFiles, timePeriod, outputPeriodLabel, currentDay, startDate, endDate, interExecutionMemory, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

            let market = global.MARKET;
            let dataFile;

            let bands = [];
            let channels = [];
            let standardChannels = [];
            let subChannels = [];
            let standardSubChannels = [];

            dataFile = dataFiles[0]; // We only need the bollinger bands.

            commons.buildBandsArray(dataFile, bands, timePeriod, callBackFunction);
            commons.buildChannels(bands, channels, callBackFunction);
            commons.buildStandardChannels(bands, standardChannels, callBackFunction);
            commons.buildSubChannels(bands, subChannels, callBackFunction);
            commons.buildStandardSubChannels(bands, standardSubChannels, callBackFunction);

            writeChannelsFile();

            function writeChannelsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeChannelsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (let i = 0; i < channels.length; i++) {

                        let channel = channels[i];

                        /*
                            Here we have an special problem that occurs when an object spans several time peridos. If not taken care of
                            it can happen that the object gets splitted between 2 days, which we dont want since it would loose some of
                            its properties.

                            To solve this issue, we wont save objects which ends at the last candle of the day, because we will save it
                            at the next day, in whole, even if it starts in the previous day.
                        */

                        let lastInstantOdDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;

                        if (channel.end < currentDay.valueOf() - 1) { continue; }
                        if (channel.end === lastInstantOdDay) { continue; }

                        fileContent = fileContent + separator + '[' +

                            channel.begin + "," +
                            channel.end + "," +
                            '"' + channel.direction + '"' + "," +
                            channel.period + "," +
                            channel.firstMovingAverage + "," +
                            channel.lastMovingAverage + "," +
                            channel.firstDeviation + "," +
                            channel.lastDeviation + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + BOLLINGER_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + outputPeriodLabel + "/" + dateForPath;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeChannelsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeChannelsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeChannelsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeChannelsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeChannelsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeStandardChannelsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeChannelsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeChannelsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStandardChannelsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardChannelsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (i = 0; i < standardChannels.length; i++) {

                        let channel = standardChannels[i];

                        if (channel.end < currentDay.valueOf()) { continue; }

                        fileContent = fileContent + separator + '[' +

                            channel.begin + "," +
                            channel.end + "," +
                            '"' + channel.direction + '"' + "," +
                            channel.period + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + BOLLINGER_STANDARD_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + outputPeriodLabel + "/" + dateForPath;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardChannelsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardChannelsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardChannelsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardChannelsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardChannelsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeSubChannelsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStandardChannelsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStandardChannelsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeSubChannelsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeSubChannelsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (i = 0; i < subChannels.length; i++) {

                        let channel = subChannels[i];

                        /*
                            Here we have an special problem that occurs when an object spans several time peridos. If not taken care of
                            it can happen that the object gets splitted between 2 days, which we dont want since it would loose some of
                            its properties.

                            To solve this issue, we wont save objects which ends at the last candle of the day, because we will save it
                            at the next day, in whole, even if it starts in the previous day.
                        */

                        let lastInstantOdDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;

                        if (channel.end < currentDay.valueOf() - 1) { continue; }
                        if (channel.end === lastInstantOdDay) { continue; }

                        fileContent = fileContent + separator + '[' +

                            channel.begin + "," +
                            channel.end + "," +
                            '"' + channel.direction + '"' + "," +
                            '"' + channel.slope + '"' + "," +
                            channel.period + "," +
                            channel.firstMovingAverage + "," +
                            channel.lastMovingAverage + "," +
                            channel.firstDeviation + "," +
                            channel.lastDeviation + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;

                    }

                    fileContent = "[" + fileContent + "]";

                    let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + BOLLINGER_SUB_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + outputPeriodLabel + "/" + dateForPath;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeSubChannelsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeSubChannelsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeSubChannelsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeSubChannelsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeSubChannelsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            writeStandardSubChannelsFile();

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeSubChannelsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeSubChannelsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function writeStandardSubChannelsFile() {

                try {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardSubChannelsFile -> Entering function."); }

                    let separator = "";
                    let fileRecordCounter = 0;

                    let fileContent = "";

                    for (i = 0; i < standardSubChannels.length; i++) {

                        let channel = standardSubChannels[i];

                        if (channel.end < currentDay.valueOf()) { continue; }

                        fileContent = fileContent + separator + '[' +

                            channel.begin + "," +
                            channel.end + "," +
                            '"' + channel.direction + '"' + "," +
                            '"' + channel.slope + '"' + "," +
                            channel.period + "]";

                        if (separator === "") { separator = ","; }

                        fileRecordCounter++;
                    }

                    fileContent = "[" + fileContent + "]";

                    let dateForPath = currentDay.getUTCFullYear() + '/' + utilities.pad(currentDay.getUTCMonth() + 1, 2) + '/' + utilities.pad(currentDay.getUTCDate(), 2);
                    let fileName = '' + market.assetA + '_' + market.assetB + '.json';

                    let filePathRoot = bot.devTeam + "/" + bot.codeName + "." + bot.version.major + "." + bot.version.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + bot.dataSetVersion;
                    let filePath = filePathRoot + "/Output/" + BOLLINGER_STANDARD_SUB_CHANNELS_FOLDER_NAME + "/" + "Multi-Period-Daily" + "/" + outputPeriodLabel + "/" + dateForPath;
                    filePath += '/' + fileName

                    fileStorage.createTextFile(bot.devTeam, filePath, fileContent + '\n', onFileCreated);

                    function onFileCreated(err) {

                        try {

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardSubChannelsFile -> onFileCreated -> Entering function."); }
                            if (LOG_FILE_CONTENT === true) { logger.write(MODULE_NAME, "[INFO] start -> writeStandardSubChannelsFile -> onFileCreated -> fileContent = " + fileContent); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardSubChannelsFile -> onFileCreated -> err = " + err.stack);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardSubChannelsFile -> onFileCreated -> filePath = " + filePath);
                                logger.write(MODULE_NAME, "[ERROR] start -> writeStandardSubChannelsFile -> onFileCreated -> market = " + market.assetA + "_" + market.assetB);

                                callBackFunction(err);
                                return;

                            }

                            callBackFunction(global.DEFAULT_OK_RESPONSE);

                        }
                        catch (err) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStandardSubChannelsFile -> onFileCreated -> err = " + err.stack);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStandardSubChannelsFile -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
