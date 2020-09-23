exports.newDataSet = function newDataSet(BOT, logger) {

    const MODULE_NAME = "Dataset";

    let bot = BOT;

    let thisObject = {
        node: undefined,
        networkNode: undefined,
        initialize: initialize,
        finalize: finalize,
        getTextFile: getTextFile,
        createTextFile: createTextFile
    };

    /* Storage account to be used here. */

    const FILE_STORAGE = require('./FileStorage.js');
    let fileStorage

    return thisObject;

    function initialize(dataDependency, callBackFunction) {

        try {
            thisObject.node = dataDependency.referenceParent;
            logger.fileName = MODULE_NAME + "." + thisObject.node.type + "." + thisObject.node.name + "." + thisObject.node.id;

            /* Some very basic validations that we have all the information needed. */
            if (thisObject.node === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Dependency without Reference Parent -> dataDependency = " + JSON.stringify(dataDependency));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset witn no codeName defined -> Product Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Dataset not attached to a Product Definition -> Dataset = " + JSON.stringify(thisObject.node));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition witn no codeName defined -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Product Definition not attached to a Bot -> Product Definition = " + JSON.stringify(thisObject.node.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot witn no codeName defined. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Bot not attached to a Data Mine or Trading Mine. Bot = " + JSON.stringify(thisObject.node.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            if (thisObject.node.parentNode.parentNode.parentNode.config.codeName === undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Data Mine witn no codeName defined. Data Mine = " + JSON.stringify(thisObject.node.parentNode.parentNode.parentNode));
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return
            }

            /* Now we will see where do we need to fetch this data from. */
            let network = global.TASK_NETWORK
            let datasetProductDefinition = thisObject.node.parentNode

            let nodeArray = global.NODE_MESH_TO_PATH_ARRAY(network, datasetProductDefinition.id)
            let networkNode = global.FIND_NODE_IN_NODE_ARRAY(nodeArray, 'Network Node')

            if (networkNode === undefined) {
                logger.write(MODULE_NAME, "[WARN] initialize -> Network Node not found.")
                logger.write(MODULE_NAME, "[WARN] initialize -> Initialization Failed because we could not find where the data of this dataset is located within the network. Check the logs for more info.");
                logger.write(MODULE_NAME, "[WARN] initialize -> Could not find where " + datasetProductDefinition.name + " for " + bot.exchange + " " + bot.market.baseAsset + "/" + bot.market.quotedAsset + " is stored within the network.");    
                callBackFunction(global.DEFAULT_OK_RESPONSE, false);
                return
            }

            /* We found where the data is located on the network. */
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving data from " + networkNode.name + "  -> host = " + networkNode.config.host + ' -> port = ' + networkNode.config.webPort + '.'); }

            fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.config.host, networkNode.config.webPort);
            callBackFunction(global.DEFAULT_OK_RESPONSE, true);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finalize() {
        fileStorage = undefined
        thisObject.networkNode = undefined
        bot = undefined
        thisObject = undefined
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] getTextFile -> Entering function."); }

            let dataMineCodeName = thisObject.node.parentNode.parentNode.parentNode.config.codeName
            let botCodeName = thisObject.node.parentNode.parentNode.config.codeName

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
            logger.write(MODULE_NAME, "[ERROR] 'getTextFile' -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        try {

            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> Entering function."); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> pFolderPath = " + pFolderPath); }
            if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] createTextFile -> pFileName = " + pFileName); }

            let ownerId = thisObject.node.dataMine + "-" + thisObject.node.bot
            let botId = bot.dataMine + "-" + bot.codeName

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
            logger.write(MODULE_NAME, "[ERROR] 'createTextFile' -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};
