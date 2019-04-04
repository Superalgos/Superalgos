exports.newDataSet = function newDataSet(BOT, logger, BLOB_STORAGE, UTILITIES) {

    const MODULE_NAME = "Data Set";

    let bot = BOT;

    let thisObject = {
        initialize: initialize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    let dependencyConfig;

    /* Utilities needed. */

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    /* Storage account to be used here. */

    let cloudStorage = BLOB_STORAGE.newBlobStorage(bot, logger);

    return thisObject;

    function initialize(pDependencyConfig, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME + "." + pDependencyConfig.bot + "." + pDependencyConfig.product + "." + pDependencyConfig.dataSet;

            dependencyConfig = pDependencyConfig;

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(dependencyConfig.devTeam, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> initializeStorage -> onInizialized -> Entering function."); }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write(MODULE_NAME, "[ERROR] initialize -> initializeStorage -> onInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> pFolderPath = " + pFolderPath); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> pFileName = " + pFileName); }

            let filePathRoot = dependencyConfig.devTeam + "/" + dependencyConfig.bot + "." + dependencyConfig.botVersion.major + "." + dependencyConfig.botVersion.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + dependencyConfig.dataSetVersion;
            let filePath = filePathRoot + "/Output/" + pFolderPath;

            cloudStorage.getTextFile(filePath, pFileName, onFileReceived);

            function onFileReceived(err, text) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> onFileReceived -> Entering function."); }

                callBackFunction(err, text);

            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'getTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> pFolderPath = " + pFolderPath); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> pFileName = " + pFileName); }

            let ownerId = dependencyConfig.devTeam + "-" + dependencyConfig.bot + "-" + dependencyConfig.botVersion.major + "-" + dependencyConfig.botVersion.minor + "-" + dependencyConfig.dataSetVersion;
            let botId = bot.devTeam + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.dataSetVersion;

            if (ownerId !== botId) {

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Data Set can create text files on them."
                };
                logger.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let filePathRoot = dependencyConfig.devTeam + "/" + dependencyConfig.bot + "." + dependencyConfig.botVersion.major + "." + dependencyConfig.botVersion.minor + "/" + global.PLATFORM_CONFIG.codeName + "." + global.PLATFORM_CONFIG.version.major + "." + global.PLATFORM_CONFIG.version.minor + "/" + global.EXCHANGE_NAME + "/" + dependencyConfig.dataSetVersion;
            let filePath = filePathRoot + "/Output/" + pFolderPath;

            cloudStorage.createTextFile(filePath, pFileName, pFileContent, onFileCreated);

            function onFileCreated(err) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> onFileCreated -> Entering function."); }

                callBackFunction(err);

            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'createTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};