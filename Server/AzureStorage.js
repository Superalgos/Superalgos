exports.newAzureStorage = function newAzureStorage() {

    let thisObject = {
        readData: readData,
        writeData: writeData,
        createContainer: createContainer,
        deleteContainer: deleteContainer,
        deleteBlob: deleteBlob,
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    let Minio = require('minio');
    let minioClient;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

         minioClient = new Minio.Client({
             endPoint: process.env.MINIO_END_POINT,
             port: JSON.parse(process.env.MINIO_PORT),
             useSSL: JSON.parse(process.env.MINIO_USE_SSL),
             accessKey: process.env.MINIO_ACCESS_KEY,
             secretKey: process.env.MINIO_SECRET_KEY
        })

    }

    function readData(pOrg, pPath, pFile, saveAtCache, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> pFile = " + pFile); }

            let cacheVersion;

            if (storageData !== undefined) {

                cacheVersion = storageData.get(pOrg + '.' + pPath + '.' + pFile);
            }

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pOrg + '.' + pPath + '.' + pFile + " found at cache."); }

                callBackFunction(global.DEFAULT_OK_RESPONSE, cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData ->  " + pOrg + '.' + pPath + '.' + pFile + " NOT found at cache."); }

                let storage = require('azure-storage');
                let connectionString;

                switch (serverConfig.environment) {

                    case "Develop": {

                        connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                        break;
                    }

                    case "Production": {

                        connectionString = serverConfig.configAndPlugins.Production.connectionString;
                        break;
                    }
                }

                let blobService = storage.createBlobService(connectionString);

                let pParam1 = pOrg;
                let pParam2 = pPath;
                let pParam3 = pFile;
                let container = 'aaplatform';
                let azurePath = pOrg + "/" + pPath + "/" + pFile;

                let bucketName = 'aaplatform';
                let textFilename;

                if (pParam1 === undefined) {

                    /* This is used when the requests come from the browser, for background compatibility.  */

                    container = pParam3;
                    azurePath = pParam2;

                    bucketName = pParam3;
                    textFilename = pParam2.substring(pParam2.indexOf("/") + 1, pParam2.length);

                } else {

                    /* This is used for internal requests within AAWeb, for background compatibility. */

                    bucketName = 'aaplatform';
                    textFilename = pParam1 + "/" + pParam2 + "/" + pParam3;
                }


                blobService.getBlobToText(container, azurePath, onFileReceived);


                function onFileReceived(err, text, response) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pOrg = " + pOrg); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pPath = " + pPath); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> readData -> onFileReceived -> pFile = " + pFile); }

                        if (saveAtCache === true) {

                            storageData.set(pOrg + '.' + pPath + '.' + pFile, text);

                        }

                        if (err !== null || text === null) {

                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Returning an empty JSON object string. "); }

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;

                        }

                        /* TEMPORARY CODE TO UPDATE THE MINIO SERVER DURING TRANSITION. */

                        // try {

                        //     minioClient.putObject(bucketName, textFilename, text, 'text/plain', function (err) {
                        //         if (err) {
                        //             console.log("ERROR AT MINIO SERVER PUTTING OBJECT : " + err);
                        //             return;
                        //         }
                        //         console.log(textFilename + ' Successfully uploaded ' + textFilename + ' the MINIO SERVER');
                        //     })

                        // } catch (err) {
                        //     console.log("ERROR UPDATING MINIO SERVER : " + err);
                        // }


                        callBackFunction(global.DEFAULT_OK_RESPONSE, text);

                    } catch (err) {
                        console.log("[ERROR] Storage -> readData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> readData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function writeData(pOrg, pPath, pFile, pFileContent, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> pFile = " + pFile); }

            let storage = require('azure-storage');
            let connectionString;

            switch (serverConfig.environment) {

                case "Develop": {

                    connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                    break;
                }

                case "Production": {

                    connectionString = serverConfig.configAndPlugins.Production.connectionString;
                    break;
                }
            }

            let blobService = storage.createBlobService(connectionString);
            let blobPath = pOrg + "/" + pPath + "/" + pFile;
            let blobText = pFileContent.toString();

            blobService.createBlockBlobFromText('aaplatform', blobPath, blobText, onFileCreated);

            function onFileCreated(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pPath = " + pPath); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> writeData -> onFileCreated -> pFile = " + pFile); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Storage -> writeData -> onFileCreated -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> writeData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteBlob(pOrg, pPath, pFile, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pPath = " + pPath); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> pFile = " + pFile); }

            let storage = require('azure-storage');
            let connectionString;

            switch (serverConfig.environment) {

                case "Develop": {

                    connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                    break;
                }

                case "Production": {

                    connectionString = serverConfig.configAndPlugins.Production.connectionString;
                    break;
                }
            }

            let blobService = storage.createBlobService(connectionString);
            let blobPath = pOrg + "/" + pPath + "/" + pFile;

            blobService.deleteBlob('aaplatform', blobPath, onBlobDeleted);

            function onBlobDeleted(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pPath = " + pPath); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteBlob -> onBlobDeleted -> pFile = " + pFile); }

                    if (err !== null || text === null) {

                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> Error Received from Storage Library. "); }
                        if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> err = " + JSON.stringify(err)); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] Storage -> deleteBlob -> onBlobDeleted -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> deleteBlob -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function createContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> createContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> createContainer -> pContainerName = " + pContainerName); }

            let storage = require('azure-storage');
            let connectionString;

            switch (serverConfig.environment) {

                case "Develop": {

                    connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                    break;
                }

                case "Production": {

                    connectionString = serverConfig.configAndPlugins.Production.connectionString;
                    break;
                }
            }

            let blobService = storage.createBlobService(connectionString);

            let containerName = pContainerName.toLowerCase();

            blobService.createContainer(containerName, onContainerCreated);

            function onContainerCreated(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> err = " + JSON.stringify(err)); }


                    /* ContainerAlreadyExists check */

                    if (JSON.stringify(err).indexOf("ContainerAlreadyExists") > 0) {

                        let err = {
                            resutl: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "ContainerAlreadyExists"
                        };

                        callBackFunction(err);
                        return;

                    } else {

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Storage -> createContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function deleteContainer(pContainerName, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteContainer -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> deleteContainer -> pContainerName = " + pContainerName); }

            let storage = require('azure-storage');
            let connectionString;

            switch (serverConfig.environment) {

                case "Develop": {

                    connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                    break;
                }

                case "Production": {

                    connectionString = serverConfig.configAndPlugins.Production.connectionString;
                    break;
                }
            }

            let blobService = storage.createBlobService(connectionString);

            let containerName = pContainerName.toLowerCase();

            blobService.deleteContainer(containerName, onContainerDeleted);

            function onContainerDeleted(err) {

                if (err) {

                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteContainer -> onContainerDeleted -> Error Received from Storage Library. "); }
                    if (CONSOLE_ERROR_LOG === true) { console.log("[ERROR] Storage -> deleteContainer -> onContainerDeleted -> err = " + JSON.stringify(err)); }


                    /* ContainerAlreadyExists check */

                    if (JSON.stringify(err).indexOf("ContainerNotFound") > 0) {

                        let err = {
                            resutl: global.CUSTOM_FAIL_RESPONSE.result,
                            message: "ContainerNotFound"
                        };

                        callBackFunction(err);
                        return;

                    } else {

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return;
            }

        } catch (err) {
            console.log("[ERROR] Storage -> deleteContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
}
