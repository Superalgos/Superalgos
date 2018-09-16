exports.newCloudScripts = function newCloudScripts() {
                                   
    let thisObject = {
        loadCloudScripts: loadCloudScripts,
        initialize: initialize
    }

    const GITHUB = require('../Server/Github');
    let github = GITHUB.newGithub();

    const STORAGE = require('../Server/Storage');
    let storage = STORAGE.newStorage();

    let serverConfig;
    let storageData;
    let ecosystem;
    let ecosystemObject;

    return thisObject;

    function initialize(pEcosystem, pEcosystemObject, pServerConfig, pStorageData, callBackFunction) {

        serverConfig = pServerConfig;
        storageData = pStorageData;
        ecosystem = pEcosystem;
        ecosystemObject = pEcosystemObject;

        storage.initialize(storageData, serverConfig);

        callBackFunction(global.DEFAULT_OK_RESPONSE);
    }

    function loadCloudScripts(callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Entering function."); }

            /*
        
            First we will get a list of the scripts to be loaded, and then we will load them into the cache.
        
            */

            storage.readData('AdvancedAlgos', 'AACloud', 'web.config.json', true, onDataArrived);

            function onDataArrived(err, pData) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Entering function."); }

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                        console.log("[ERROR] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Could not read a file. ");
                        console.log("[ERROR] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> err.message = " + err.message);

                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }

                    let data = pData.toString();
                    data = data.trim(); // remove first byte with some encoding.

                    dataObject = JSON.parse(data);
                    retrieveScripts(dataObject, callBackFunction);
                }
                catch (err) {
                    console.log("[ERROR] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Error = " + err);
                }
            }
        }
        catch (err) {
            console.log("[ERROR] CloudScripts -> loadCloudScripts -> Error = " + err);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function retrieveScripts(pCloudWebConfig, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Entering function."); }

            /*
        
            Here we go through the webModules Array and bring them all.
        
            */

            let modulesRetrieved = 0;

            for (let i = 0; i < pCloudWebConfig.webModules.length; i++) {

                let webModule = pCloudWebConfig.webModules[i].name;

                storage.readData('AdvancedAlgos', 'AACloud', webModule, true, onDataArrived);

                function onDataArrived(err, pData) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                            console.log("[ERROR] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> Could not read a file. ");
                            console.log("[ERROR] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> err.message = " + err.message);
                            console.log("[ERROR] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> ewebModule = " + webModule);

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }

                        let data = pData.toString();
                        data = data.trim(); // remove first byte with some encoding.

                        data = browserify(data);

                        storageData.set(webModule, data);

                        modulesRetrieved++;
                        if (modulesRetrieved === pCloudWebConfig.webModules.length) {
                            createJS(callBackFunction);
                        }

                    }
                    catch (err) {
                        console.log("[ERROR] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
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

            function createJS(callBackFunction) {

                let lines = "";
                let jsLine = '' + '\n' + '            "AACloud/@module@",'

                for (let i = 0; i < pCloudWebConfig.webModules.length; i++) {

                    let webModule = pCloudWebConfig.webModules[i].name;
                    let htmlLineCopy = jsLine;
                    let newLink = htmlLineCopy.replace('@module@', webModule);

                    lines = lines + newLink;
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE, lines);
            }

        }
        catch (err) {
            console.log("[ERROR] CloudScripts -> retrieveScripts -> Error = " + err);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
}