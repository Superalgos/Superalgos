
function newFileCloud() {

    const MODULE_NAME = "File Cloud";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
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

        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
        if (INFO_LOG === true) { logger.write("[INFO] initialize -> pBot = " + pBot.codeName); }

        blobService = AzureStorage.Blob.createBlobServiceWithSas(pBot.storage.fileUri, pBot.storage.sas);

    }

    function getFile(pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, pDataRange, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getFile -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] getFile -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pSet.filePath + "-" + pSet.fileName); }

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

                    if (ERROR_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> customErr.message = " + customErr.message); }
                    if (ERROR_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> Data Range configuration could not be found. "); }

                    callBackFunction(customErr);
                    return;
                }
            }

            if (fileName === undefined) {

                logger.write("[ERROR] getFile -> Inconsistant data. Check the following: ");
                logger.write("[ERROR] getFile -> pDevTeam = " + JSON.stringify(pDevTeam));
                logger.write("[ERROR] getFile -> pBot = " + JSON.stringify(pBot));
                logger.write("[ERROR] getFile -> pSet = " + JSON.stringify(pSet));
                logger.write("[ERROR] getFile -> pExchange = " + JSON.stringify(pExchange));
                logger.write("[ERROR] getFile -> pMarket = " + JSON.stringify(pMarket));
                logger.write("[ERROR] getFile -> pPeriodName = " + JSON.stringify(pPeriodName));

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

            if (INFO_LOG === true) { logger.write("[INFO] getFile -> filePath = " + filePath); }
            if (INFO_LOG === true) { logger.write("[INFO] getFile -> fileName = " + fileName); }

            blobService.getBlobToText('data', filePath + "/" + fileName, onFileReceived);

            function onFileReceived(err, text, response) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> Entering function."); }
                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> filePath = " + filePath); }
                    if (INFO_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> fileName = " + fileName); }

                    let data;

                    if (err) {

                        if (err.code === "BlobNotFound" | err.code === "FileNotFound" | err.code === "ParentNotFound") {

                            let customErr = {
                                result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                                message: "File does not exist."
                            };

                            if (INFO_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> customErr.message = " + customErr.message); }

                            callBackFunction(customErr);
                            return;
                        }

                        if (INFO_LOG === true) { logger.write("[ERROR] getFile -> onFileReceived -> Unexpected Error Ocurred."); }
                        if (INFO_LOG === true) { logger.write("[ERROR] getFile -> onFileReceived -> err = " + err); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                        return;

                    } else {

                        try {

                            data = JSON.parse(text);

                            if (INFO_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> Data received is valid JSON."); }

                            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, data);
                            return;

                        } catch (err) {

                            if (INFO_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> err = " + err); }

                            let customErr = {
                                result: GLOBAL.CUSTOM_OK_RESPONSE.result,
                                message: "Data not in JSON Format."
                            };

                            if (INFO_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> customErr.message = " + customErr.message); }

                            callBackFunction(customErr, text);
                            return;
                        }
                    }

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> onFileReceived -> err = " + err); }
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getFile -> err = " + err); }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
        }
    }
}