exports.newDataSet = function newDataSet(BOT, logger) {

    const MODULE_NAME = "Dataset";

    let bot = BOT;

    let thisObject = {
        initialize: initialize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    let dataDependencyNode;

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage = FILE_STORAGE.newFileStorage(logger);

    return thisObject;

    function initialize(pDataDependencyNode, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            dataDependencyNode = pDataDependencyNode;
            logger.fileName = MODULE_NAME + "." + dataDependencyNode.type + "." + dataDependencyNode.name + "." + dataDependencyNode.id;

            /* Some very basic validations that we have all the information needed. */
            if (dataDependencyNode.referenceParent === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Dependency without Reference Parent. Data Dependency = " + JSON.stringify(dataDependencyNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset witn no codeName defined. Product Dataset = " + JSON.stringify(dataDependencyNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset not attached to a Product Definition. Dataset = " + JSON.stringify(dataDependencyNode.referenceParent));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition witn no codeName defined. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition not attached to a Bot. Product Definition = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot witn no codeName defined. Bot = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine. Bot = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (dataDependencyNode.referenceParent.parentNode.parentNode.parentNode.code.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(dataDependencyNode.referenceParent.parentNode.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Simplifying the access to basic info */
            dataDependencyNode.dataSet = dataDependencyNode.referenceParent.code.codeName
            dataDependencyNode.product = dataDependencyNode.referenceParent.parentNode.code.codeName
            dataDependencyNode.bot = dataDependencyNode.referenceParent.parentNode.parentNode.code.codeName
            dataDependencyNode.dataMine = dataDependencyNode.referenceParent.parentNode.parentNode.parentNode.code.codeName

            /* This stuff is still hardcoded and unresolved. */
            dataDependencyNode.botVersion = {
                "major": 1,
                "minor": 0
            }
            dataDependencyNode.dataSetVersion = "dataSet.V1"

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> Entering function."); }

            let filePathRoot = dataDependencyNode.dataMine + "/" + dataDependencyNode.bot + "/" + bot.exchange;
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

            let ownerId = dataDependencyNode.dataMine + "-" + dataDependencyNode.bot + "-" + dataDependencyNode.botVersion.major + "-" + dataDependencyNode.botVersion.minor + "-" + dataDependencyNode.dataSetVersion;
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

            let filePathRoot = dataDependencyNode.dataMine + "/" + dataDependencyNode.bot + "/" + bot.exchange;
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
