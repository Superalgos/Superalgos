
exports.newAzureFileStorage = function newAzureFileStorage(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const MODULE_NAME = "Azure File Storage";

    var fs = require('fs');
    var util = require('util');
    var guid = require('node-uuid');
    var crypto = require('crypto');
    var storage = require('azure-storage');

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    const shareName = 'data';
    let dataOwner;

    let azureFileStorage = {
        initialize: initialize,
        createFolder: createFolder,
        createTextFile: createTextFile,
        getTextFile: getTextFile,
        listFilesAndFolders: listFilesAndFolders
    };

    let fileService;

    return azureFileStorage;


    function initialize(dataOwnerBotName) {

        try {

            if (dataOwnerBotName === undefined) {

                dataOwner = bot.name;

            } else {

                dataOwner = dataOwnerBotName;

            }

            fileService = storage.createFileService(readConfig().connectionString);

        }
        catch (err) {
            const logText = "[ERROR] 'initialize' - ERROR : " + err.message;
            logger.write(logText);
        }
    }

    function readConfig() {

        try {

            return JSON.parse(fs.readFileSync(ROOT_DIR + dataOwner + '.azure.storage.connstring', 'utf8'));

        }
        catch (err) {
            const logText = "[ERROR] 'readConfig' - ERROR : " + err.message;
            logger.write(logText);
        }

    }

    function createFolder(folderPath, callBackFunction) {

        try {

            fileService.createDirectoryIfNotExists(shareName, folderPath, onFolderCreated);

            function onFolderCreated(err) {

                if (err) {

                    const logText = "[ERROR] createFolder - onFolderCreated ' ERROR = " + err.message + " SHARE NAME = " + shareName + " FOLDER PATH = " + folderPath;
                    console.log(logText);
                    logger.write(logText);

                }

                callBackFunction();

            }

        }
        catch (err) {
            const logText = "[ERROR] 'createFolder' - ERROR : " + err.message;
            logger.write(logText);
        }

    }

    function createTextFile(folderPath, fileName, fileContent, callBackFunction) {

        try {

            fileService.createFileFromText(shareName, folderPath, fileName, fileContent, onFileCreated);

            function onFileCreated(err, result, response) {

                if (err) {

                    const logText = "[WARN] createTextFile - onFileCreated ' ERROR = " + err.message + " SHARE NAME = " + shareName + " FOLDER PATH = " + folderPath + " FILE NAME = " + fileName;
                    console.log(logText);
                    logger.write(logText);

                    if (err.message.indexOf("The server is busy") > 0) {

                        fileService.createFileFromText(shareName, folderPath, fileName, fileContent, onFileCreatedSecondTry);

                        function onFileCreatedSecondTry(err) {

                            if (err) {

                                const logText = "[ERROR] createTextFile - onFileCreated - onFileCreatedSecondTry : File not created. Giving Up.' ERROR = " + err.message + " SHARE NAME = " + shareName + " FOLDER PATH = " + folderPath + " FILE NAME = " + fileName;
                                console.log(logText);
                                logger.write(logText);

                            } else {

                                const logText = "[INFO] createTextFile - onFileCreated - onFileCreatedSecondTry ' : File succesfully created on second try. SHARE NAME = " + shareName + " FOLDER PATH = " + folderPath + " FILE NAME = " + fileName;
                                console.log(logText);
                                logger.write(logText);

                            }
                        }
                    }
                }

                callBackFunction();
            }

        }
        catch (err) {
            const logText = "[ERROR] 'createTextFile' - ERROR : " + err.message;
            logger.write(logText);
        }

    }

    function getTextFile(folderPath, fileName, callBackFunction, ignoreNotFound) {

        try {

            fileService.getFileToText(shareName, folderPath, fileName, undefined, onFileReceived);

            function onFileReceived(err, text, response) {

                if (err) {

                    if (ignoreNotFound === undefined) {

                        const logText = "[ERROR] getTextFile - onFileReceived ' ERROR = " + err.message + " SHARE NAME = " + shareName + " FOLDER PATH = " + folderPath + " FILE NAME = " + fileName;
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

    function listFilesAndFolders(folderPath, callBackFunction) {

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

            fileService.listFilesAndDirectoriesSegmented(shareName, folderPath, null, options, onFilesAndFoldersReceived);


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