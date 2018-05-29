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

        callBackFunction();
    }

    function loadCloudScripts(callBackfunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Entering function."); }

            /*
        
            First we will get a list of the scripts to be loaded, and then we will load them into the cache.
        
            */

            storage.getStorageData('AdvancedAlgos', 'AACloud', 'web.config.json', onDataArrived);

            function onDataArrived(pData) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Entering function."); }

                    let data = pData.toString();
                    data = data.trim(); // remove first byte with some encoding.

                    dataObject = JSON.parse(data);
                    retrieveScripts(dataObject, callBackfunction);
                }
                catch (err) {
                    console.log("[ERROR] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Error = " + err);
                }
            }
        }
        catch (err) {
            console.log("[ERROR] CloudScripts -> loadCloudScripts -> Error = " + err);
        }
    }

    function retrieveScripts(pCloudWebConfig, callBackfunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Entering function."); }

            /*
        
            Here we go through the webModules Array and bring them all.
        
            */

            let modulesRetrieved = 0;

            for (let i = 0; i < pCloudWebConfig.webModules.length; i++) {

                let webModule = pCloudWebConfig.webModules[i].name + '.js';

                storage.getStorageData('AdvancedAlgos', 'AACloud', webModule, onDataArrived);

                function onDataArrived(pData) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> Entering function."); }

                        let data = pData.toString();
                        data = data.trim(); // remove first byte with some encoding.

                        data = browserify(data);

                        storageData.set(webModule, data);

                        modulesRetrieved++;
                        if (modulesRetrieved === pCloudWebConfig.webModules.length) {
                            createHTML(callBackfunction);
                        }

                    }
                    catch (err) {
                        console.log("[ERROR] CloudScripts -> retrieveScripts -> Cloud -> onDataArrived -> Error = " + err);
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

            function createHTML(callBackfunction) {

                let links = "";
                let htmlLine = '' + '\n' + '    <script type="text/javascript" src="AACloud/@module@"></script>'

                for (let i = 0; i < pCloudWebConfig.webModules.length; i++) {

                    let webModule = pCloudWebConfig.webModules[i].name + '.js';
                    let htmlLineCopy = htmlLine;
                    let newLink = htmlLineCopy.replace('@module@', webModule);

                    links = links + newLink;
                }

                callBackfunction(links);
            }

        }
        catch (err) {
            console.log("[ERROR] CloudScripts -> retrieveScripts -> Error = " + err);
        }
    }
}