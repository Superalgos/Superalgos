exports.newDataSet = function newDataSet(BOT, DEBUG_MODULE, BLOB_STORAGE, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Data Set";

    let thisObject = {
        file: undefined,                    // Here we have the JSON object representing the file content.
        initialize: initialize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    let bot = BOT;
    let dependencyConfig;                       

    const logger = DEBUG_MODULE.newDebugLog();
    logger.bot = bot;

    /* Utilities needed. */

    let utilities = UTILITIES.newUtilities(bot);

    /* Storage account to be used here. */

    let cloudStorage = BLOB_STORAGE.newBlobStorage(bot);

    return thisObject;

    function initialize(pDependencyConfig, callBackFunction) {

        try {

            logger.fileName = MODULE_NAME + "." + pDependencyConfig.bot + "." + pDependencyConfig.product + "." + pDependencyConfig.dataSet;

            dependencyConfig = pDependencyConfig;

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            initializeStorage();

            function initializeStorage() {

                cloudStorage.initialize(dependencyConfig, onInizialized);

                function onInizialized(err) {

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {

                        if (FULL_LOG === true) { logger.write("[INFO] initialize -> initializeStorage -> onInizialized -> Entering function."); }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);

                    } else {
                        logger.write("[ERROR] initialize -> initializeStorage -> onInizialized -> err = " + err.message);
                        callBackFunction(err);
                    }
                }
            }
        } catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] getTextFile -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] getTextFile -> pFolderPath = " + pFolderPath); }
            if (FULL_LOG === true) { logger.write("[INFO] getTextFile -> pFileName = " + pFileName); }

            cloudStorage.getTextFile(pFolderPath, pFileName, onFileReceived);

            function onFileReceived(err, text) {

                if (FULL_LOG === true) { logger.write("[INFO] getTextFile -> onFileReceived -> Entering function."); }

                callBackFunction(err, text);

            }
        }
        catch (err) {
            logger.write("[ERROR] 'getTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write("[INFO] createTextFile -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] createTextFile -> pFolderPath = " + pFolderPath); }
            if (FULL_LOG === true) { logger.write("[INFO] createTextFile -> pFileName = " + pFileName); }

            let ownerId = dependencyConfig.devTeam + "-" + dependencyConfig.bot + "-" + dependencyConfig.botVersion.major + "-" + dependencyConfig.botVersion.minor + "-" + dependencyConfig.dataSetVersion;
            let botId = bot.devTeam + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.dataSetVersion;

            if (ownerId !== botId) {

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Data Set can create text files on them."
                };
                logger.write("[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            cloudStorage.createTextFile(pFolderPath, pFileName, pFileContent, onFileCreated);

            function onFileCreated(err) {

                if (FULL_LOG === true) { logger.write("[INFO] createTextFile -> onFileCreated -> Entering function."); }

                callBackFunction(err);

            }
        }
        catch (err) {
            logger.write("[ERROR] 'createTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};