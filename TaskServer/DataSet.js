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

            /* Now we will see where do we need to fetch this data from. */
            let network = global.TASK_NETWORK 
            let datasetProductDefinition = thisObject.node.parentNode

            for (let i = 0; i < network.networkNodes.length; i++) {
                let networkNode = network.networkNodes[i]
                if (networkNode.dataStorage !== undefined) {
                    if (networkNode.dataStorage.sessionIndependentData !== undefined) {
                        for (let j = 0; j < networkNode.dataStorage.sessionIndependentData.exchangeDataProducts.length; j++) {
                            let exchangeDataProduct = networkNode.dataStorage.sessionIndependentData.exchangeDataProducts[j]
                            for (let k = 0; k < exchangeDataProduct.singleMarketData.length; k++) {
                                let singleMarketData = exchangeDataProduct.singleMarketData[k]
                                if (singleMarketData.referenceParent !== undefined) {
                                    let market = singleMarketData.referenceParent
                                    let currentProcessMarket = bot.processNode.marketReference.referenceParent

                                    if (currentProcessMarket.id === market.id) {
                                        for (let m = 0; m < singleMarketData.dataProducts.length; m++) {
                                            let dataProduct = singleMarketData.dataProducts[m]
                                            if (dataProduct.referenceParent !== undefined) {
                                                let productDefinition = dataProduct.referenceParent
                                                if (datasetProductDefinition.id === productDefinition.id) {

                                                    /* We found where the data is located on the network. */
                                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving data from " + networkNode.name + "  -> host = " + networkNode.code.host + ' -> port = ' + networkNode.code.webPort + '.'); }

                                                    fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.code.host, networkNode.code.webPort);
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (networkNode.dataStorage.sessionBasedData !== undefined) {
                        for (let j = 0; j < networkNode.dataStorage.sessionBasedData.exchangeDataProducts.length; j++) {
                            let exchangeDataProduct = networkNode.dataStorage.sessionBasedData.exchangeDataProducts[j]
                            for (let s = 0; s < exchangeDataProduct.sessionReferences.length; s++) {
                                let sessionReference = exchangeDataProduct.sessionReferences[s]
                                let singleMarketData = sessionReference.singleMarketData
                                if (singleMarketData.referenceParent !== undefined) {
                                    let market = singleMarketData.referenceParent
                                    let currentProcessMarket = bot.processNode.marketReference.referenceParent

                                    if (currentProcessMarket.id === market.id) {
                                        for (let m = 0; m < singleMarketData.dataProducts.length; m++) {
                                            let dataProduct = singleMarketData.dataProducts[m]
                                            if (dataProduct.referenceParent !== undefined) {
                                                let productDefinition = dataProduct.referenceParent
                                                if (datasetProductDefinition.id === productDefinition.id) {

                                                    /* We found where the data is located on the network. */
                                                    if (global.LOG_CONTROL[MODULE_NAME].logInfo === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Retrieving data from " + networkNode.name + "  -> host = " + networkNode.code.host + ' -> port = ' + networkNode.code.webPort + '.'); }

                                                    fileStorage = FILE_STORAGE.newFileStorage(logger, networkNode.code.host, networkNode.code.webPort);
                                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                                    return
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            logger.write(MODULE_NAME, "[ERROR] initialize -> Initialization Failed because we could not find where the data of this dataset is located within the network. Check the logs for more info.");
            logger.write(MODULE_NAME, "[ERROR] initialize -> Could not find where " + datasetProductDefinition.name + " for " + bot.exchange + " " + bot.market.baseAsset + "/" + bot.market.quotedAsset + " is stored within the network.");

            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = "+ err.stack);
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
