
exports.newBlobStorage = function newBlobStorage(BOT) {

    let FULL_LOG = false;
    let LOG_FILE_CONTENT = false;

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Blob Storage";

    let storage = require('azure-storage');

    const DEBUG_MODULE = require('./DebugLog');
    let logger;


    let thisObject = {
        initialize: initialize,
        createFolder: createFolder,
        createTextFile: createTextFile,
        getTextFile: getTextFile
    };

    let readOnlyBlobService;
    let writeOnlyBlobService;
    let containerName;
    let environment = global.CURRENT_ENVIRONMENT;

    return thisObject;

    function initialize(pDataOwner, callBackFunction, disableLogging) {

        try {

            containerName = pDataOwner.toLowerCase();

            logger = DEBUG_MODULE.newDebugLog();
            logger.fileName = MODULE_NAME;
            logger.bot = bot;
            logger.fileName = MODULE_NAME + '.' + pDataOwner;
            logger.initialize(disableLogging);

            if (pDataOwner.environment !== undefined) { // This is use for data migration from one environment to the other.

                environment = pDataOwner.environment;

            }

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> environment = " + environment); }
            if (FULL_LOG === true) { logger.write("[INFO] initialize -> containerName = " + containerName); }

            let readConnectionString = global.STORAGE_PERMISSIONS[environment][containerName].readConnectionString;

            if (readConnectionString !== undefined) {
                readOnlyBlobService = storage.createBlobService(readConnectionString);
            }

            let writeConnectionString = global.STORAGE_PERMISSIONS[environment][containerName].writeConnectionString;

            if (writeConnectionString !== undefined) {
                writeOnlyBlobService = storage.createBlobService(writeConnectionString);
            }

            if (readOnlyBlobService !== undefined || writeOnlyBlobService !== undefined) {

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }          
        }
        catch (err) {

            logger.write("[ERROR] initialize -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createFolder(pFolderPath, callBackFunction) {

        if (FULL_LOG === true) { logger.write("[INFO] createFolder -> Entering function."); }

        try {

            /* Folders do not need to be created when using blobs. */

            callBackFunction(global.DEFAULT_OK_RESPONSE);
            return;

        }
        catch (err) {
            logger.write("[ERROR] createFolder -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        if (writeOnlyBlobService === undefined) {

            logger.write("[ERROR] createTextFile -> initialize function not executed or failed. Can not process this request. Sorry.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }

        try {

            if (FULL_LOG === true) {
                logger.write("[INFO] createTextFile -> About to create a text file.");
                logger.write("[INFO] createTextFile -> containerName = " + containerName);
                logger.write("[INFO] createTextFile -> pFolderPath = " + pFolderPath);
                logger.write("[INFO] createTextFile -> pFileName = " + pFileName);
            }

            writeOnlyBlobService.createBlockBlobFromText(containerName, pFolderPath + "/" + pFileName, pFileContent, onFileCreated);

            function onFileCreated(err, result, response) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] createTextFile -> onFileCreated -> Response from Azure received.");
                    logger.write("[INFO] createTextFile -> onFileCreated -> err = " + JSON.stringify(err));
                    logger.write("[INFO] createTextFile -> onFileCreated -> result = " + JSON.stringify(result));
                    logger.write("[INFO] createTextFile -> onFileCreated -> response = " + JSON.stringify(response));
                }

                if (err) {

                    logger.write("[ERROR] createTextFile -> onFileCreated -> err = " + JSON.stringify(err));
                    logger.write("[ERROR] createTextFile -> onFileCreated -> result = " + JSON.stringify(result));
                    logger.write("[ERROR] createTextFile -> onFileCreated -> response = " + JSON.stringify(response));

                    if (err.code === 'ServerBusy'
                        || err.code === 'ECONNRESET'
                        || err.code === 'ENOTFOUND'
                        || err.code === 'ESOCKETTIMEDOUT'
                        || err.code === 'ETIMEDOUT'
                        || err.code === 'ECONNREFUSED'
                        || (err.code === 'AuthenticationFailed' && err.authenticationerrordetail.indexOf('Request date header too old') === 0)
                        || err.code === 'OperationTimedOut') {

                        setTimeout(secondTry, 1000);
                        return;

                        function secondTry() {

                            logger.write("[INFO] createTextFile -> onFileCreated -> secondTry -> Retrying to create the file.");

                            writeOnlyBlobService.createBlockBlobFromText(containerName, pFolderPath + "/" + pFileName, pFileContent, onSecondTry);

                            function onSecondTry(err, result, response) {

                                if (err) {
                                    logger.write("[ERROR] createTextFile -> onFileCreated -> secondTry -> File not created. Giving Up.");
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                } else {
                                    logger.write("[INFO] createTextFile -> onFileCreated -> secondTry -> File succesfully created on second try.");
                                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                                }
                            }
                        }
                    }

                    logger.write("[ERROR] createTextFile -> onFileCreated -> Dont know what to do here. Cancelling operation. ");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                } else {
                    if (FULL_LOG === true) { logger.write("[INFO] createTextFile -> onFileCreated -> File Created."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] 'createTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction) {

        if (readOnlyBlobService === undefined) {

            logger.write("[ERROR] getTextFile -> initialize function not executed or failed. Can not process this request. Sorry.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }

        try {

            if (FULL_LOG === true) {
                logger.write("[INFO] getTextFile -> About to get a text file.");
                logger.write("[INFO] getTextFile -> containerName = " + containerName);
                logger.write("[INFO] getTextFile -> pFolderPath = " + pFolderPath);
                logger.write("[INFO] getTextFile -> pFileName = " + pFileName);
            }

            readOnlyBlobService.getBlobToText(containerName, pFolderPath + "/" + pFileName, onFileReceived);

            function onFileReceived(err, text, response) {

                if (FULL_LOG === true) {
                    logger.write("[INFO] getTextFile -> onFileReceived -> Response from Azure received.");
                    logger.write("[INFO] getTextFile -> onFileReceived -> err = " + JSON.stringify(err));
                    logger.write("[INFO] getTextFile -> onFileReceived -> response = " + JSON.stringify(response));
                }

                if (LOG_FILE_CONTENT === true) {
                    logger.write("[INFO] getTextFile -> onFileReceived -> text = " + text);
                }

                if (err) {

                    if (err.code === 'ServerBusy'
                        || err.code === 'ECONNRESET'
                        || err.code === 'ENOTFOUND'
                        || err.code === 'ESOCKETTIMEDOUT'
                        || err.code === 'ETIMEDOUT'
                        || err.code === 'ECONNREFUSED'
                        || (err.code === 'AuthenticationFailed' && err.authenticationerrordetail.indexOf('Request date header too old') === 0)
                        || err.code === 'OperationTimedOut') {

                        setTimeout(secondTry, 1000);
                        return;

                        function secondTry() {

                            logger.write("[INFO] getTextFile -> onFileReceived -> secondTry -> Retrying to get the file.");

                            readOnlyBlobService.getBlobToText(containerName, pFolderPath + "/" + pFileName, onSecondTry);

                            function onSecondTry(err, text, response) {

                                if (err) {
                                    logger.write("[ERROR] getTextFile -> onFileReceived -> secondTry -> File not retrieved. Giving Up.");
                                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                                } else {
                                    logger.write("[INFO] getTextFile -> onFileReceived -> secondTry -> File succesfully retrieved on second try.");
                                    callBackFunction(global.DEFAULT_OK_RESPONSE, text);
                                }
                            }
                        }
                    }

                    if (err.code === "BlobNotFound") {

                        /* This is how Azure tell us the file does not exist. */

                        let customErr = {
                            result: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "File does not exist."
                        };

                        logger.write("[WARN] getTextFile -> onFileReceived -> Custom Response -> message = " + customErr.message);
                        logger.write("[WARN] getTextFile -> containerName = " + containerName);
                        logger.write("[WARN] getTextFile -> pFolderPath = " + pFolderPath);
                        logger.write("[WARN] getTextFile -> pFileName = " + pFileName);

                        callBackFunction(customErr);
                        return;

                    }

                    if (err.code === "ParentNotFound") {

                        /* This is how Azure tell us the folder where the file was supposed to be does not exist. We map this to our own response. */

                        let customErr = {
                            result: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "Folder does not exist."
                        };

                        logger.write("[WARN] getTextFile -> onFileReceived -> Custom Response -> message = " + customErr.message);
                        logger.write("[WARN] getTextFile -> containerName = " + containerName);
                        logger.write("[WARN] getTextFile -> pFolderPath = " + pFolderPath);
                        logger.write("[WARN] getTextFile -> pFileName = " + pFileName);

                        callBackFunction(customErr);
                        return;

                    }

                    logger.write("[ERROR] getTextFile -> onFileReceived -> Dont know what to do here. Cancelling operation. ");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                } else {
                    if (FULL_LOG === true) { logger.write("[INFO] getTextFile -> onFileReceived -> File retrieved."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE, text);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] 'getTextFile' -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

};