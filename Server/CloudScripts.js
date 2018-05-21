exports.newConfigReader = function newConfigReader() {

    let thisObject = {
        loadCloudScripts: loadCloudScripts,
        initialize: initialize
    }

    const GITHUB = require('../Server/Github');
    let github = GITHUB.newGithub();

    const STORAGE = require('../Server/Storage');
    let storage = STORAGE.newStorage();

    let serverConfig;
    let githubData;
    let storageData;
    let ecosystem;
    let ecosystemObject;

    return thisObject;

    function initialize(pEcosystem, pEcosystemObject, pServerConfig, pGithubData, pStorageData, callBackFunction) {

        serverConfig = pServerConfig;
        githubData = pGithubData;
        storageData = pStorageData;
        ecosystem = pEcosystem;
        ecosystemObject = pEcosystemObject;

    }

    function loadCloudScripts(callBackfunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Entering function."); }

            /*
        
            First we will get a list of the scripts to be loaded, and then we will load them into the cache.
        
            */

            switch (serverConfig.configAndPlugins.Location) {

                case 'Cloud': {

                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Cloud -> Entering Case."); }

                    storage.getStorageData('AdvancedAlgos', 'AACloud', 'web.config.json', onDataArrived);

                    function onDataArrived(pData) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Entering function."); }

                            let data = pData.toString();
                            data = data.trim(); // remove first byte with some encoding.

                            dataObject = JSON.parse(data);
                            retrieveScripts();
                        }
                        catch (err) {
                            console.log("[ERROR] CloudScripts -> loadCloudScripts -> Cloud -> onDataArrived -> Error = " + err);
                        }
                    }

                    break;
                }

                case 'File System': {

                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> File System -> Entering Case."); }

                    let fs = require('fs');
                    try {
                        let fileName = '../AACloud/web.config.json';
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, file) {

                            try {

                                if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> File System -> onFileRead -> Entering function."); }

                                let data = pData.toString();
                                data = data.trim(); // remove first byte with some encoding.

                                dataObject = JSON.parse(data);
                                retrieveScripts();
                            }
                            catch (err) {
                                console.log("[ERROR] CloudScripts -> loadCloudScripts -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log("[ERROR] CloudScripts -> loadCloudScripts -> File System -> File = " + fileName + " Error = " + err);
                    }
                    break;
                }

                case 'Github': {

                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Github -> Entering Case."); }

                    github.getGithubData('AdvancedAlgos', 'AACloud', 'web.config.json', onDataArrived);

                    function onDataArrived(pData) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> Github -> onDataArrived -> Entering function."); }

                            let data = pData.toString();
                            data = data.trim(); // remove first byte with some encoding.

                            dataObject = JSON.parse(data);
                            retrieveScripts();
                        }
                        catch (err) {
                            console.log("[ERROR] CloudScripts -> loadCloudScripts -> Github -> onDataArrived -> Error = " + err);
                        }
                    }
                    break;
                }
            }
        }
        catch (err) {
            console.log("[ERROR] CloudScripts -> loadCloudScripts -> Error = " + err);
        }
    }

}