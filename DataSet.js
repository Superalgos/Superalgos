exports.newDataSet = function newDataSet(BOT, logger) {

    const MODULE_NAME = "Dataset";

    let bot = BOT;

    let thisObject = {
        node: undefined,
        initialize: initialize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    return thisObject;

    function initialize(dataDependency, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            thisObject.node = dataDependency.referenceParent;
            logger.fileName = MODULE_NAME + "." + thisObject.node.type + "." + thisObject.node.name + "." + thisObject.node.id;

            /* Some very basic validations that we have all the information needed. */
            if (thisObject.node === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Dependency without Reference Parent -> dataDependency = " + JSON.stringify(dataDependency));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset witn no codeName defined -> Product Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset not attached to a Product Definition -> Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition witn no codeName defined -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition not attached to a Bot -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot witn no codeName defined. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(thisObject.node.parentNode.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> Entering function."); }

            let dataMineCodeName = thisObject.node.parentNode.parentNode.parentNode.code.codeName
            let botCodeName = thisObject.node.parentNode.parentNode.code.codeName

            let filePathRoot = bot.exchange + "/" + bot.market.baseAsset + "-" + bot.market.quotedAsset + "/" + dataMineCodeName + "/" + botCodeName;
            let filePath = filePathRoot + "/Output/" + pFolderPath;
            filePath += '/' + pFileName

            fileStorage.getTextFile(filePath, onFileReceived);

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

            let ownerId = thisObject.node.dataMine + "-" + thisObject.node.bot + "-" + thisObject.node.botVersion.major + "-" + thisObject.node.botVersion.minor + "-" + thisObject.node.dataSetVersion;
            let botId = bot.dataMine + "-" + bot.codeName + "-" + bot.version.major + "-" + bot.version.minor + "-" + bot.dataSetVersion;

            if (ownerId !== botId) {

                let customErr = {
                    result: global.CUSTOM_FAIL_RESPONSE.result,
                    message: "Only bots owners of a Data Set can create text files on them."
                };
                logger.write(MODULE_NAME, "[ERROR] save -> customErr = " + customErr.message);
                callBackFunction(customErr);
                return;
            }

            let filePathRoot = bot.exchange + "/" + bot.market.baseAsset + "-" + bot.market.quotedAsset + "/" + thisObject.node.dataMine + "/" + thisObject.node.bot;
            let filePath = filePathRoot + "/Output/" + pFolderPath + '/' + pFileName;

            fileStorage.createTextFile(filePath, pFileContent, onFileCreated);

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
