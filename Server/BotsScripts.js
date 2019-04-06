exports.newBotScripts = function newBotScripts() {

    let thisObject = {
        getScript: getScript,
        initialize: initialize
    }

    let storage;

    let serverConfig;
    let storageData;

    return thisObject;

    function initialize(pServerConfig, pStorage, callBackFunction) {

        storage = pStorage;

        let storageData = new Map(); // For backwards compatibility only. Not used.

        storage.initialize(storageData, pServerConfig);

        callBackFunction();
    }

    function getScript(pDevTeam, pSource, pRepo, pPath, callBackFunction) {

        storage.readData(pDevTeam + "/" + pSource, pRepo, pPath, false, onDataArrived);

        function onDataArrived(err, pData) {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                    console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Could not read a file. ");
                    console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> err.message = " + err.message);

                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    return;
                }

                let data;

                if (pData !== undefined) {

                    data = pData.toString();
                    data = data.trim(); // remove first byte with some encoding.

                    data = browserify(data);

                }

                callBackFunction(global.DEFAULT_OK_RESPONSE, data);

            }
            catch (err) {
                console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
        }
    }

    function browserify(pData) {

        let result = pData.substring(pData.indexOf('=') + 2);

        result = replaceAll(result, "require", "webRequire");
        result = replaceAll(result, "global", "window");

        return result;

        function replaceAll(text, search, replacement) {
            return text.replace(new RegExp(search, 'g'), replacement);
        }
    }
}