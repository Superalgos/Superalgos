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
    let githubData;
    let storageData;
    let fileSystemData;
    let ecosystem;
    let ecosystemObject;

    return thisObject;

    function initialize(pEcosystem, pEcosystemObject, pServerConfig, pGithubData, pStorageData, pFileSystemData, callBackFunction) {

        serverConfig = pServerConfig;
        githubData = pGithubData;
        fileSystemData = pFileSystemData;
        storageData = pStorageData;
        ecosystem = pEcosystem;
        ecosystemObject = pEcosystemObject;

        callBackFunction();
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
                            retrieveScripts(dataObject, callBackfunction);
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

                        function onFileRead(err, pData) {

                            try {

                                if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> loadCloudScripts -> File System -> onFileRead -> Entering function."); }

                                let data = pData.toString();
                                data = data.trim(); // remove first byte with some encoding.

                                dataObject = JSON.parse(data);
                                retrieveScripts(dataObject, callBackfunction);
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
                            retrieveScripts(dataObject, callBackfunction);
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

    function retrieveScripts(pCloudWebConfig, callBackfunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Entering function."); }

            /*
        
            Here we go through the webModules Array and bring them all.
        
            */

            let modulesRetrieved = 0;

            for (let i = 0; i < pCloudWebConfig.webModules.length; i++) {

                let webModule = pCloudWebConfig.webModules[i].name + '.js';

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Cloud -> Entering Case."); }

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

                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> File System -> Entering Case."); }

                        let fs = require('fs');
                        try {
                            let fileName = '../AACloud/' + webModule;
                            fs.readFile(fileName, onFileRead);

                            function onFileRead(err, pData) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> File System -> onFileRead -> Entering function."); }

                                    let data = pData.toString();
                                    data = data.trim(); // remove first byte with some encoding.

                                    data = browserify(data);

                                    fileSystemData.set(webModule, data);

                                    modulesRetrieved++;
                                    if (modulesRetrieved === pCloudWebConfig.webModules.length) {
                                        createHTML(callBackfunction);
                                    }
                                }
                                catch (err) {
                                    console.log("[ERROR] CloudScripts -> retrieveScripts -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                }

                            }
                        }
                        catch (err) {
                            console.log("[ERROR] CloudScripts -> retrieveScripts -> File System -> File = " + fileName + " Error = " + err);
                        }
                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] CloudScripts -> retrieveScripts -> Github -> Entering Case."); }

                        github.getGithubData('AdvancedAlgos', 'AACloud', 'web.config.json', onDataArrived);

                        function onDataArrived(pData) {

                            try {

                                let data = pData.toString();
                                data = data.trim(); // remove first byte with some encoding.

                                data = browserify(data);

                                githubData.set(webModule, data);

                                modulesRetrieved++;
                                if (modulesRetrieved === pCloudWebConfig.webModules.length) {
                                    createHTML(callBackfunction);
                                }
                            }
                            catch (err) {
                                console.log("[ERROR] CloudScripts -> retrieveScripts -> Github -> onDataArrived -> Error = " + err);
                            }
                        }
                        break;
                    }
                }
            }

            function browserify(pData) {

                let result = pData.substring(pData.indexOf('=') + 2);

                result = result.replace("require", "webRequire");
                result = result.replace("global", "window");

                return result;

            }

            function createHTML(callBackfunction) {

                let links = "";
                let htmlLine = '' + '\n' + '    <script type="text/javascript" src="Cloud/@module@"></script>'

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