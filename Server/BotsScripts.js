exports.newBotScripts = function newBotScripts() {

    let thisObject = {
        getScript: getScript,
        initialize: initialize
    }

    const STORAGE = require('../Server/Storage');
    let storage = STORAGE.newStorage();

    let serverConfig;
    let storageData;

    return thisObject;

    function initialize(pServerConfig, callBackFunction) {

        let storageData = new Map(); // For backwards compatibility only. Not used.

        storage.initialize(storageData, pServerConfig);

        callBackFunction();
    }

    function getScript(pDevTeam, pSource, pRepo, pPath, callBackFunction) {

        storage.getStorageData(pDevTeam + "/" + pSource, pRepo, pPath, onDataArrived);

        function onDataArrived(pData) {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                let data;

                if (pData !== undefined) {

                    data = pData.toString();
                    data = data.trim(); // remove first byte with some encoding.

                    data = browserify(data);

                }

                callBackFunction(data);

            }
            catch (err) {
                console.log("[ERROR] BotScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
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