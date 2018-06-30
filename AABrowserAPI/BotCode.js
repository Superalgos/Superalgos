exports.newBotCode = function newBotCode() {

    let thisObject = {
        saveBotCode: saveBotCode,
        initialize: initialize
    }

    let storage;

    return thisObject;

    function initialize(pServerConfig) {

        const STORAGE = require('../Server/Storage');
        storage = STORAGE.newStorage();

        storage.initialize(undefined, pServerConfig);
        
    }

    function saveBotCode(pDevTeam, pSource, pRepo, pPath, pSourceCode, callBackFunction) {

        let blobText = nodify(pSourceCode.toString());

        storage.writeData(pDevTeam + "/" + pSource, pRepo, pPath, blobText, onDataWritten);

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