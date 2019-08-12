exports.newDataSet = function newDataSet(BOT, logger) {

    const MODULE_NAME = "Data Set";

    let bot = BOT;

    let thisObject = {
        initialize: initialize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    let dependencyConfig;

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./Integrations/FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage();

    return thisObject;

    function initialize(pDependencyConfig, callBackFunction) {

        try {


            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME + "." + pDependencyConfig.bot + "." + pDependencyConfig.product + "." + pDependencyConfig.dataSet;

            dependencyConfig = pDependencyConfig;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> Entering function."); }

            let filePathRoot = dependencyConfig.devTeam + "/" + dependencyConfig.bot + "." + dependencyConfig.botVersion.major + "." + dependencyConfig.botVersion.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + dependencyConfig.dataSetVersion;
            let filePath = filePathRoot + "/Output/" + pFolderPath;
            filePath += '/' + pFileName

            fileStorage.getTextFile(dependencyConfig.devTeam, filePath, onFileReceived);

            function onFileReceived(err, text) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> onFileReceived -> Entering function."); }

                callBackFunction(err, text);

            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'getTextFile' -> err = "+ err.stack);
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

            let filePathRoot = dependencyConfig.devTeam + "/" + dependencyConfig.bot + "." + dependencyConfig.botVersion.major + "." + dependencyConfig.botVersion.minor + "/" + global.CLONE_EXECUTOR.codeName + "." + global.CLONE_EXECUTOR.version + "/" + global.EXCHANGE_NAME + "/" + dependencyConfig.dataSetVersion;
            let filePath = filePathRoot + "/Output/" + pFolderPath + '/' + pFileName;

            fileStorage.createTextFile(dependencyConfig.devTeam, filePath, pFileContent, onFileCreated);

            function onFileCreated(err) {

                if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> onFileCreated -> Entering function."); }

                callBackFunction(err);

            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] 'createTextFile' -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
