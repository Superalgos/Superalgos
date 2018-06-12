exports.newStorage = function newStorage() {

    let thisObject = {
        getStorageData: getStorageData,
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

    }

    function getStorageData(pOrg, pRepo, pPath, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> pRepo = " + pRepo); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> pPath = " + pPath); }

            let cacheVersion = storageData.get(pOrg + '.' + pRepo + '.' + pPath)

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData ->  " + pOrg + '.' + pRepo + '.' + pPath + " found at cache."); }

                callBackFunction(cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData ->  " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

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

                blobService.getBlobToText('aaplatform', pOrg + "/" + pRepo + "/" + pPath, onFileReceived);


                function onFileReceived(err, text, response) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> pOrg = " + pOrg); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> pRepo = " + pRepo); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getStorageData -> onFileReceived -> pPath = " + pPath); }

                        storageData.set(pOrg + '.' + pRepo + '.' + pPath, text);

                        if (err !== null || text === null) {

                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getStorageData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getStorageData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getStorageData -> onFileReceived -> Returning an empty JSON object string. "); }

                            callBackFunction("");
                            return;

                        }

                        callBackFunction(text);

                    } catch (err) {
                        console.log("[ERROR] Storage -> getStorageData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction("{}");
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> getStorageData -> err.message = " + err.message);
            callBackFunction("{}");
        }
    }
}