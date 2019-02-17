
function newFileCloud() {

    const MODULE_NAME = "File Cloud";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    /*

    This is the module in the system that actually connects to the cloud storage and grabs from there the needed files. 

    */

    var thisObject = {
        getFile: getFile,
        initialize: initialize
    };

    let blobService;

    return thisObject;

    function initialize(pBot) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] initialize -> pBot = " + pBot.codeName); }

            blobService = AzureStorage.Blob.createBlobServiceWithSas(pBot.storage.fileUri, pBot.storage.sas);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            //callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);  TODO> Handle this callback.
        }
    }

    function getFile(pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getFile -> Entering function."); }

            const MAX_RETRIES = 3;

            getFileRecursively(0, pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction)

            function getFileRecursively(pRetryCounter, pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> Entering function."); }
                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pSet.filePath + "-" + pSet.fileName); }

                    let fileName;
                    let filePath;

                    if (pDataRange === undefined) {

                        fileName = pSet.fileName;
                        filePath = pSet.filePath;

                    } else {

                        if (pSet.dataRange !== undefined) {

                            fileName = pSet.dataRange.fileName;
                            filePath = pSet.dataRange.filePath;

                        } else {

                            let customErr = {
                                result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                                message: "Missing Configuration."
                            };

                            if (ERROR_LOG === true) { logger.write("[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = " + customErr.message); }
                            if (ERROR_LOG === true) { logger.write("[WARN] getFile -> getFileRecursively -> onFileReceived -> Data Range configuration could not be found. "); }

                            callBackFunction(customErr);
                            return;
                        }
                    }

                    if (fileName === undefined) {

                        logger.write("[ERROR] getFile -> getFileRecursively -> Inconsistant data. Check the following: ");
                        logger.write("[ERROR] getFile -> getFileRecursively -> pDevTeam = " + JSON.stringify(pDevTeam));
                        logger.write("[ERROR] getFile -> getFileRecursively -> pBot = " + JSON.stringify(pBot));
                        logger.write("[ERROR] getFile -> getFileRecursively -> pSet = " + JSON.stringify(pSet));
                        logger.write("[ERROR] getFile -> getFileRecursively -> pExchange = " + JSON.stringify(pExchange));
                        logger.write("[ERROR] getFile -> getFileRecursively -> pMarket = " + JSON.stringify(pMarket));
                        logger.write("[ERROR] getFile -> getFileRecursively -> pPeriodName = " + JSON.stringify(pPeriodName));

                        throw ("Inconsistant data received.");
                    }

                    if (pMarket !== undefined) {

                        fileName = fileName.replace("@AssetA", pMarket.assetA);
                        fileName = fileName.replace("@AssetB", pMarket.assetB);
                    }

                    if (pDevTeam !== undefined) {

                        filePath = filePath.replace("@DevTeam", pDevTeam.codeName);
                    }

                    if (pBot !== undefined) {

                        filePath = filePath.replace("@Bot", pBot.codeName);
                    }

                    if (pExchange !== undefined) {

                        filePath = filePath.replace("@Exchange", pExchange.name);
                    }

                    filePath = filePath.replace("@Period", pPeriodName);

                    if (pDatetime !== undefined) {

                        filePath = filePath.replace("@Year", pDatetime.getUTCFullYear());
                        filePath = filePath.replace("@Month", pad(pDatetime.getUTCMonth() + 1, 2));
                        filePath = filePath.replace("@Day", pad(pDatetime.getUTCDate(), 2));
                        filePath = filePath.replace("@Hour", pad(pDatetime.getUTCHours(), 2));
                        filePath = filePath.replace("@Minute", pad(pDatetime.getUTCMinutes(), 2));

                    }

                    if (pSequence !== undefined) {

                        fileName = fileName.replace("@Sequence", pSequence);
                    }

                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> filePath = " + filePath); }
                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> fileName = " + fileName); }

                    let containerName;

                    containerName = pDevTeam.codeName.toLowerCase();

                    blobService.getBlobToText(containerName, filePath + "/" + fileName, onFileReceived);

                    function onFileReceived(err, text, response) {

                        try {

                            if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> onFileReceived -> Entering function."); }
                            if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> onFileReceived -> filePath = " + filePath); }
                            if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> onFileReceived -> fileName = " + fileName); }

                            let data;

                            if (err) {

                                if (err.code === "BlobNotFound" | err.code === "FileNotFound" | err.code === "ParentNotFound") {

                                    let customErr = {
                                        result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                                        message: "File does not exist."
                                    };

                                    if (INFO_LOG === true) { logger.write("[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = " + customErr.message); }

                                    callBackFunction(customErr);
                                    return;
                                }

                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> containerName = " + containerName); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> filePath = " + filePath); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> fileName = " + fileName); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> Unexpected Error Ocurred."); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> err = " + err); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> text = " + text); }
                                if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> response = " + response); }

                                if (err.message === "XHR error") {

                                    if (pRetryCounter < MAX_RETRIES) {

                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> Retrying to get this file. "); }
                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> MAX_RETRIES = " + MAX_RETRIES); }
                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> pRetryCounter = " + pRetryCounter); }

                                        getFileRecursively(pRetryCounter + 1, pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction)
                                        return;

                                    } else {

                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> Could not get this file from storage. "); }
                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> MAX_RETRIES = " + MAX_RETRIES); }
                                        if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> pRetryCounter = " + pRetryCounter); }

                                    }
                                }

                                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                return;

                            } else {

                                try {

                                    data = JSON.parse(text);

                                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> getFileRecursively -> onFileReceived -> Data received is valid JSON."); }

                                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, data);
                                    return;

                                } catch (err) {

                                    if (INFO_LOG === true) { logger.write("[WARN] getFile -> getFileRecursively -> onFileReceived -> err = " + err); }

                                    let customErr = {
                                        result: GLOBAL.CUSTOM_OK_RESPONSE.result,
                                        message: "Data not in JSON Format."
                                    };

                                    if (INFO_LOG === true) { logger.write("[WARN] getFile -> getFileRecursively -> onFileReceived -> customErr.message = " + customErr.message); }

                                    callBackFunction(customErr, text);
                                    return;
                                }
                            }

                        } catch (err) {

                            if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> onFileReceived -> err = " + err); }
                            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> getFileRecursively -> err = " + err); }
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> err = " + err); }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
        }
    }
}