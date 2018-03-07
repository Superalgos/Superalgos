
exports.newAzureFileStorage = function newAzureFileStorage(BOT) {

    const FULL_LOG = true;

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Azure File Storage";

    var util = require('util');
    var guid = require('node-uuid');
    var crypto = require('crypto');
    var storage = require('azure-storage');

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.pFileName = MODULE_NAME;
    logger.bot = bot;

    const shareName = 'data';
    let dataOwner;

    let thisObject = {
        initialize: initialize,
        createFolder: createFolder,
        createTextFile: createTextFile,
        getTextFile: getTextFile,
        listFilesAndFolders: listFilesAndFolders
    };

    let fileService;

    return thisObject;


    function initialize(pDataOwnerBotCodeName, callBackFunction) {

        try {
            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            if (pDataOwnerBotCodeName === undefined) {
                dataOwner = bot.codeName;
            } else {
                dataOwner = pDataOwnerBotCodeName;
            }

            fileService = storage.createFileService(readConfig().connectionString);

            callBackFunction(global.DEFAULT_OK_RESPONSE);
        }
        catch (err) {
            logger.write("[ERROR] initialize -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function readConfig() {

        try {
            let fs = require('fs');
            let filePath = '../' + 'Connection-Strings' + '/' + global.RUNNING_MODE + '/' +  dataOwner + '.azure.storage.connstring' + '.json';
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        catch (err) {
            logger.write("[ERROR] readConfig -> err = " + err.message);
            logger.write("[HINT] You need to have a file at this path -> " + filePath);
            logger.write("[HINT] The file must have the connection string to the Azure Storage Account. Request the file to an AA Team Member if you dont have it.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createFolder(pFolderPath, callBackFunction) {

        if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

        if (fileService === undefined) {

            logger.write("[ERROR] createFolder -> initialize function not executed or failed. Can not process this request. Sorry.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }

        try {

            fileService.createDirectoryIfNotExists(shareName, pFolderPath, onFolderCreated);

            function onFolderCreated(err) {

                if (err) {
                    logger.write("[ERROR] createFolder -> onFolderCreated -> err = " + err.message);
                    logger.write("[ERROR] createFolder -> onFolderCreated -> shareName = " + shareName);
                    logger.write("[ERROR] createFolder -> onFolderCreated -> pFolderPath = " + pFolderPath);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }
                callBackFunction(global.DEFAULT_OK_RESPONSE);
            }
        }
        catch (err) {
            logger.write("[ERROR] createFolder -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createTextFile(pFolderPath, pFileName, pFileContent, callBackFunction) {

        if (fileService === undefined) {

            logger.write("[ERROR] createFolder -> initialize function not executed or failed. Can not process this request. Sorry.");
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            return;
        }

        try {

            if (FULL_LOG === true) {
                logger.write("[INFO] createTextFile -> About to create a text file.");
                logger.write("[INFO] createTextFile -> shareName = " + shareName);
                logger.write("[INFO] createTextFile -> pFolderPath = " + pFolderPath);
                logger.write("[INFO] createTextFile -> pFileName = " + pFileName);
            }

            fileService.createFileFromText(shareName, pFolderPath, pFileName, pFileContent, onFileCreated);

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

                    if (err.message.indexOf("The server is busy") > 0) {

                        setTimeout(secondTry, 1000);

                        function secondTry() {

                            logger.write("[INFO] createTextFile -> onFileCreated -> secondTry -> Retrying to create the file.");

                            fileService.createFileFromText(shareName, pFolderPath, pFileName, pFileContent, onFileCreatedSecondTry);

                            function onFileCreatedSecondTry(err) {

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
                    if (LOG_INFO === true) { logger.write("[INFO] createTextFile -> onFileCreated -> File Created."); }
                    callBackFunction(global.DEFAULT_OK_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write("[ERROR] 'createTextFile' - ERROR : " + JSON.stringify(err));
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function getTextFile(pFolderPath, pFileName, callBackFunction, ignoreNotFound) {

        if (fileService === undefined) {

            const logText = "[ERROR] initialize function not executed or failed. Can not process this request. Sorry.";
            logger.write(logText);
            return;
        }

        try {

            fileService.getFileToText(shareName, pFolderPath, pFileName, undefined, onFileReceived);

            function onFileReceived(err, text, response) {

                if (err) {

                    if (ignoreNotFound === undefined) {

                        const logText = "[ERROR] getTextFile - onFileReceived ' ERROR = " + err.message + " SHARE NAME = " + shareName + " FOLDER PATH = " + pFolderPath + " FILE NAME = " + pFileName;
                        console.log(logText);
                        logger.write(logText);

                    }

                    text = undefined;

                }

                callBackFunction(text);
            }

        }
        catch (err) {
            const logText = "[ERROR] 'getTextFile' - ERROR : " + err.message;
            logger.write(logText);
        }

    }

    function listFilesAndFolders(pFolderPath, callBackFunction) {

        if (fileService === undefined) {

            const logText = "[ERROR] initialize function not executed or failed. Can not process this request. Sorry.";
            logger.write(logText);
            return;
        }

        try {

            let items = {
                files: [],
                folders: []
            };

            /*
            * @param { object } [options]                        The request options.
            * @param { int } [options.maxResults]                Specifies the maximum number of folders to return per call to Azure ServiceClient. 
            *                                                    This does NOT affect list size returned by this function. (maximum: 5000)
            * @param { LocationMode } [options.locationMode]     Specifies the location mode used to decide which location the request should be sent to. 
            *                                                    Please see StorageUtilities.LocationMode for the possible values.
            * @param { int } [options.timeoutIntervalInMs]       The server timeout interval, in milliseconds, to use for the request.
            * @param { int } [options.maximumExecutionTimeInMs]  The maximum execution time, in milliseconds, across all potential retries, to use when making this request.
            *                                                    The maximum execution time interval begins at the time that the client begins building the request.The maximum
            *                                                    execution time is checked intermittently while performing requests, and before executing retries.
            * @param { string } [options.clientRequestId]        A string that represents the client request ID with a 1KB character limit.
            * @param { bool } [options.useNagleAlgorithm]        Determines whether the Nagle al
            */

            let options = {
                maxResults: 500
            };

            fileService.listFilesAndDirectoriesSegmented(shareName, pFolderPath, null, options, onFilesAndFoldersReceived);


            function onFilesAndFoldersReceived(error, result) {

                try {

                    if (error) {

                        const logText = "[ERROR] 'listFilesAndFolders - onFilesAndFoldersReceived' - ERROR RECEIVED : " + error;
                        logger.write(logText);

                        callBackFunction(items);

                    } else {

                        items.files.push.apply(items.files, result.entries.files);
                        items.folders.push.apply(items.folders, result.entries.directories);

                        callBackFunction(items);

                    }

                }


                catch (err) {
                    const logText = "[ERROR] 'listFilesAndFolders - onFilesAndFoldersReceived' - ERROR : " + err.message;
                    logger.write(logText);
                }

            }

        }
        catch (err) {
            const logText = "[ERROR] 'listFilesAndFolders' - ERROR : " + err.message;
            logger.write(logText);
        }
    }

};