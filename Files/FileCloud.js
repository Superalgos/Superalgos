
function newFileCloud() {

    const MODULE_NAME = "File Cloud";
    const FULL_LOG = false;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    var fileCloud = {
        getFile: getFile,
        initialize: initialize
    };

    let blobService;

    return fileCloud;

    function initialize(pBot) {

        if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
        if (FULL_LOG === true) { logger.write("[INFO] initialize -> pBot = " + pBot.codeName); }

        blobService = AzureStorage.Blob.createBlobServiceWithSas(pBot.storage.fileUri, pBot.storage.sas);

    }

    function getFile(pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pDatetime, pSequence, callBackFunction) {

        if (FULL_LOG === true) { logger.write("[INFO] getFile -> Entering function."); }
        if (FULL_LOG === true) { logger.write("[INFO] getFile -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pSet.filePath + "-" + pSet.fileName); }

        let fileName = pSet.fileName;
        let filePath = pSet.filePath;

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

        if (FULL_LOG === true) { logger.write("[INFO] getFile -> filePath = " + filePath); }
        if (FULL_LOG === true) { logger.write("[INFO] getFile -> fileName = " + fileName); }

        try {

            blobService.getBlobToText('data', filePath + "/" + fileName, onFileReceived);

        } catch (err) {

            if (FULL_LOG === true) { logger.write("[ERROR] getFile -> err = " + err); }

        }

        function onFileReceived(err, text, response) {

            if (FULL_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> filePath = " + filePath); }
            if (FULL_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> fileName = " + fileName); }

            let data;

            if (err) {

                if (err.code === "BlobNotFound") {

                    let customErr = {
                        result: GLOBAL.CUSTOM_FAIL_RESPONSE.result,
                        message: "File does not exist."
                    };

                    if (FULL_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> customErr.message = " + customErr.message); }

                    callBackFunction(customErr);
                    return;
                }

                if (FULL_LOG === true) { logger.write("[ERROR] getFile -> onFileReceived -> Unexpected Error Ocurred."); }
                if (FULL_LOG === true) { logger.write("[ERROR] getFile -> onFileReceived -> err = " + err); }
                callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                return;

            } else {

                try {

                    data = JSON.parse(text);

                    if (FULL_LOG === true) { logger.write("[INFO] getFile -> onFileReceived -> Data received is valid JSON."); }

                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, data);
                    return;

                } catch (err) {

                    if (FULL_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> err = " + err); }

                    let customErr = {
                        result: GLOBAL.CUSTOM_OK_RESPONSE.result,
                        message: "Data not in JSON Format."
                    };

                    if (FULL_LOG === true) { logger.write("[WARN] getFile -> onFileReceived -> customErr.message = " + customErr.message); }

                    callBackFunction(customErr, text);
                    return;
                }
            }
        }
    }
}