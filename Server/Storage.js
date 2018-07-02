exports.newStorage = function newStorage() {

    let thisObject = {
        readData: readData,
        writeData: writeData,
        createContainer: createContainer, 
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

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

                callBackFunction(cacheVersion);

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

                blobService.getBlobToText('aaplatform', pOrg + "/" + pPath + "/" + pFile, onFileReceived);


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

                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> readData -> onFileReceived -> Returning an empty JSON object string. "); }

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;

                        }

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

                        if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> Error Received from Storage Library. "); }
                        if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }

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


    function createContainer(pContainerName, pPath, pFile, pFileContent, callBackFunction) {

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

            pContainerName.toLowerCase();

            blobService.createContainer(pContainerName, onContainerCreated);

            function onContainerCreated(err) {

                if (err) {

                    if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> Error Received from Storage Library. "); }
                    if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> createContainer -> onContainerCreated -> err = " + JSON.stringify(err)); }

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE);
            }

        } catch (err) {
            console.log("[ERROR] Storage -> createContainer -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
}