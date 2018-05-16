
exports.newBlobStorage = function newBlobStorage(BOT) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Blob Storage";

    var util = require('util');
    var guid = require('node-uuid');
    var crypto = require('crypto');
    var storage = require('azure-storage');

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    let thisObject = {
        initialize: initialize,
        createFolder: createFolder,
        createTextFile: createTextFile,
        getTextFile: getTextFile
    };

    let blobService;
    let containerName = 'aamasters';
    let dataOwner;
    let environment = global.STORAGE_CONN_STRING_FOLDER;

    return thisObject;

    function initialize(pDataOwner, callBackFunction) {

        try {

            if (pDataOwner === undefined) {
                dataOwner = bot.devTeam;
                logger.fileName = MODULE_NAME + '.' + bot.devTeam + '.' + bot.codeName + '.' + containerName;
            } else {
                dataOwner = pDataOwner.devTeam;
                logger.fileName = MODULE_NAME + '.' + pDataOwner.devTeam + '.' + pDataOwner.bot + '.' + containerName;

                if (pDataOwner.environment !== undefined) {

                    environment = pDataOwner.environment;
                    containerName = pDataOwner.devTeam.toLowerCase();
                    logger.fileName = MODULE_NAME + '.' + pDataOwner.devTeam + '.' + pDataOwner.bot + '.' + containerName;
                }
            }

            if (FULL_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            readConnectionStringConfigFile(onConnectionStringReady);

            function onConnectionStringReady(err, pConnObj) {

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                    logger.write("[ERROR] initialize -> onConnectionStringReady -> err = " + err.message);
                    callBackFunction(err);
                    return;
                }

                try {

                    if (pConnObj.connectionString !== "") {
                        blobService = storage.createBlobService(pConnObj.connectionString);
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }

                    if (pConnObj.accountName !== "") {
                        blobService = storage.createBlobService(pConnObj.accountName, pConnObj.sas);
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    
                    logger.write("[ERROR] initialize -> onConnectionStringReady -> Either a connectionString or an accountName must be provided.");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;

                } catch (err) {

                    logger.write("[ERROR] initialize -> onConnectionStringReady -> createFileService -> err = " + err.message);
                    callBackFunction(err);
                    return;
                }
            }

            function readConnectionStringConfigFile(callBack) {

                let filePath;

                try {
                    let fs = require('fs');
                    filePath = '../' + 'Connection-Strings' + '/' + environment + '/' + dataOwner + '.azure.storage.connstring';
                    let connObj = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                    callBack(global.DEFAULT_OK_RESPONSE, connObj);
                }
                catch (err) {
                    logger.write("[ERROR] readConnectionStringConfigFile -> err = " + err.message);
                    logger.write("[HINT] readConnectionStringConfigFile -> You need to have a file at this path -> " + filePath);
                    logger.write("[HINT] readConnectionStringConfigFile -> The file must have the connection string to the Azure Storage Account. Request the file to an AA Team Member if you dont have it.");
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBack(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createFolder(pFolderPath, callBackFunction) {

        if (FULL_LOG === true) { logger.write("[INFO] createFolder -> Entering function."); }

        if (blobService === undefined) {

            logger.write("[ERROR] createFolder -> initialize function not executed or failed. Can not process this request. Sorry.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }

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

        if (blobService === undefined) {

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

            blobService.createBlockBlobFromText(containerName, pFolderPath + "/" + pFileName, pFileContent, onFileCreated);

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
                        || err.code === 'ECONNREFUSED') {

                        setTimeout(secondTry, 1000);
                        return;

                        function secondTry() {

                            logger.write("[INFO] createTextFile -> onFileCreated -> secondTry -> Retrying to create the file.");

                            blobService.createBlockBlobFromText(containerName, pFolderPath + "/" + pFileName, pFileContent, onSecondTry);

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

        if (blobService === undefined) {

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

            blobService.getBlobToText(containerName, pFolderPath + "/" + pFileName, onFileReceived);

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
                        || err.code === 'ECONNREFUSED') {

                        setTimeout(secondTry, 1000);
                        return;

                        function secondTry() {

                            logger.write("[INFO] getTextFile -> onFileReceived -> secondTry -> Retrying to get the file.");

                            blobService.getBlobToText(containerName, pFolderPath + "/" + pFileName, onSecondTry);

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

                        logger.write("[ERROR] getTextFile -> onFileReceived -> Custom Response -> message = " + customErr.message);

                        callBackFunction(customErr);
                        return;

                    }

                    if (err.code === "ParentNotFound") {

                        /* This is how Azure tell us the folder where the file was supposed to be does not exist. We map this to our own response. */

                        let customErr = {
                            result: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "Folder does not exist."
                        };

                        logger.write("[ERROR] getTextFile -> onFileReceived -> Custom Response -> message = " + customErr.message);

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