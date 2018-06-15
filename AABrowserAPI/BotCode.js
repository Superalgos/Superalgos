exports.newBotCode = function newBotCode() {

    let thisObject = {
        saveBotCode: saveBotCode,
        initialize: initialize
    }

    let serverConfig;

    return thisObject;

    function initialize(pServerConfig) {

        serverConfig = pServerConfig;

    }

    function saveBotCode(pDevTeam, pSource, pRepo, pPath, pSourceCode, callBackFunction) {

        writeData(pDevTeam + "/" + pSource, pRepo, pPath, pSourceCode, onDataWritten);

        function onDataWritten(err) {

            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                console.log("[ERROR] API -> saveBotCode -> Source code file could not be saved. ");
                console.log("[ERROR] API -> saveBotCode -> err.message = " + err.message);

                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                return;
            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);
        }
    }

    function writeData(pOrg, pRepo, pPath, pFileContent, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> Entering function."); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pOrg = " + pOrg); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pRepo = " + pRepo); }
            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> pPath = " + pPath); }

            if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData ->  " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

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
            let blobPath = pOrg + "/" + pRepo + "/" + pPath;
            let blobText = nodify(pFileContent.toString());

            blobService.createBlockBlobFromText('aaplatform', blobPath, blobText, onFileCreated);

            function onFileCreated(err, text, response) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> Entering function."); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                    if (LOG_FILE_CONTENT === true) { console.log("[INFO] API -> writeData -> onFileCreated -> response = " + JSON.stringify(response)); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pOrg = " + pOrg); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pRepo = " + pRepo); }
                    if (CONSOLE_LOG === true) { console.log("[INFO] API -> writeData -> onFileCreated -> pPath = " + pPath); }

                    if (err !== null || text === null) {

                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> Error Received from API Library. "); }
                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> err = " + JSON.stringify(err)); }
                        if (CONSOLE_LOG === true) { console.log("[ERROR] API -> writeData -> onFileCreated -> Returning an empty JSON object string. "); }

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;

                    }

                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                } catch (err) {
                    console.log("[ERROR] API -> writeData -> onFileCreated -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            console.log("[ERROR] API -> writeData -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function nodify(pData) {

       
        let start = pData.indexOf('function') + 9;
        let end = pData.indexOf('(') + 0;

        let functionName = pData.substring(start, end);

        let result = "exports." + functionName + " = " + pData;

        result = replaceAll(result, "webRequire", "require");
        result = replaceAll(result, "window", "global");

        return result;

        function replaceAll(text, search, replacement) {
            return text.replace(new RegExp(search, 'g'), replacement);
        }
    }

}