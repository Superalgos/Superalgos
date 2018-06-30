exports.newStorage = function newStorage() {

    let thisObject = {
        getData: getData,
        initialize: initialize
    }

    let storageData;
    let serverConfig;

    return thisObject;

    function initialize(pStorageData, pServerConfig) {

        storageData = pStorageData;
        serverConfig = pServerConfig;

    }

    function getData(pOrg, pRepo, pPath, saveAtCache, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> pRepo = " + pRepo); }
            if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> pPath = " + pPath); }

            let cacheVersion;

            if (storageData !== undefined) {

                cacheVersion = storageData.get(pOrg + '.' + pRepo + '.' + pPath);
            }

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData ->  " + pOrg + '.' + pRepo + '.' + pPath + " found at cache."); }

                callBackFunction(cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData ->  " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

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

                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> err = " + JSON.stringify(err)); }
                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> response = " + JSON.stringify(response)); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> pOrg = " + pOrg); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> pRepo = " + pRepo); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Storage -> getData -> onFileReceived -> pPath = " + pPath); }

                        if (saveAtCache === true) {

                            storageData.set(pOrg + '.' + pRepo + '.' + pPath, text);

                        }
                        
                        if (err !== null || text === null) {

                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getData -> onFileReceived -> Error Received from Storage Library. "); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getData -> onFileReceived -> err = " + JSON.stringify(err)); }
                            if (CONSOLE_LOG === true) { console.log("[ERROR] Storage -> getData -> onFileReceived -> Returning an empty JSON object string. "); }

                            callBackFunction("");
                            return;

                        }

                        callBackFunction(text);

                    } catch (err) {
                        console.log("[ERROR] Storage -> getData -> onFileReceived -> err.message = " + err.message);
                        callBackFunction("{}");
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Storage -> getData -> err.message = " + err.message);
            callBackFunction("{}");
        }
    }
}