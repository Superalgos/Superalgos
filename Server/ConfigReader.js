exports.newConfigReader = function newConfigReader() {

    let thisObject = {
        loadConfigs: loadConfigs,
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

        readAAWebConfig();

        function readAAWebConfig() {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readAAWebConfig -> Entering function."); }

                let fs = require('fs');

                let fileName = './this.server.config.json';
                fs.readFile(fileName, onFileRead);

                function onFileRead(err, file) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readAAWebConfig -> onFileRead -> Entering function."); }

                        let fileText;

                        fileText = file.toString();
                        fileText = fileText.trim(); // remove first byte with some encoding.

                        serverConfig = JSON.parse(fileText);

                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readAAWebConfig -> onFileRead -> fileText = " + fileText); }

                        CONSOLE_LOG = serverConfig.webServerLog.console;
                        LOG_FILE_CONTENT = serverConfig.webServerLog.fileContent;

                        /* Finalize initializations. */

                        github.initialize(githubData);
                        storage.initialize(storageData, serverConfig);

                        callBackFunction(serverConfig);
                    }
                    catch (err) {
                        console.log("[ERROR] ConfigReader -> readAAWebConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                    }

                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readAAWebConfig -> Error = " + err);
            }
        }
    }

    function loadConfigs(callBackFunction) {

        readEcosystemConfig();

        function readEcosystemConfig() {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Entering function."); }

                /*
        
                This configuration file is the backbone of the system. The first file we are going to get is a template where other configurations are
                injected and the files ends up inflated with all these configs in one single JSON object that in turn is later injected into a
                javascript module with an object that is going to instantiate it at run-time.
        
                */

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Cloud -> Entering Case."); }

                        storage.getStorageData('AdvancedAlgos', 'AAPlatform', 'ecosystem.json', onDataArrived);

                        function onDataArrived(pData) {

                            try {

                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Cloud -> onDataArrived -> Entering function."); }

                                ecosystem = pData.toString();
                                ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                                ecosystemObject = JSON.parse(ecosystem);
                                readHostsConfigs();
                            }
                            catch (err) {
                                console.log("[ERROR] ConfigReader -> readEcosystemConfig -> Cloud -> onDataArrived -> Error = " + err);
                            }
                        }

                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> File System -> Entering Case."); }

                        let fs = require('fs');
                        try {
                            let fileName = '../AAPlatform/ecosystem.json';
                            fs.readFile(fileName, onFileRead);

                            function onFileRead(err, file) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> File System -> onFileRead -> Entering function."); }

                                    ecosystem = file.toString();
                                    ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                                    ecosystemObject = JSON.parse(ecosystem);
                                    readHostsConfigs();
                                }
                                catch (err) {
                                    console.log("[ERROR] ConfigReader -> readEcosystemConfig -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                }

                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader -> readEcosystemConfig -> File System -> File = " + fileName + " Error = " + err);
                        }
                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Github -> Entering Case."); }

                        github.getGithubData('AdvancedAlgos', 'AAPlatform', 'ecosystem.json', onDataArrived);

                        function onDataArrived(pData) {

                            try {

                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Github -> onDataArrived -> Entering function."); }

                                ecosystem = pData.toString();
                                ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                                ecosystemObject = JSON.parse(ecosystem);
                                readHostsConfigs();
                            }
                            catch (err) {
                                console.log("[ERROR] ConfigReader -> readEcosystemConfig -> Github -> onDataArrived -> Error = " + err);
                            }
                        }
                        break;
                    }
                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readEcosystemConfig -> Error = " + err);
            }
        }

        function readHostsConfigs() {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readHostsConfigs -> Entering function."); }

                let requestsSent = 0;
                let responsesReceived = 0;

                for (let i = 0; i < ecosystemObject.hosts.length; i++) {

                    let host = ecosystemObject.hosts[i];

                    getCompetitions();
                    getPlotters();

                    function getCompetitions() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readHostsConfigs -> getCompetitions -> Entering function."); }

                            /* In this first section we will load the competitions configurations. */

                            for (let j = 0; j < host.competitions.length; j++) {

                                let competition = host.competitions[j];

                                requestsSent++;

                                switch (serverConfig.configAndPlugins.Location) {

                                    case 'Cloud': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> Entering Case."); }

                                        storage.getStorageData(host.codeName + "/" + "competitions", competition.repo, competition.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> host.codeName = " + host.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> competition.repo = " + competition.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = competition.repo;
                                                configObj.configFile = competition.configFile;

                                                host.competitions[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    readDevTeamsConfigs();

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }

                                    case 'File System': {

                                        try {
                                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> File System -> Entering Case."); }

                                            let fs = require('fs');

                                            let fileName = '../Competitions/' + host.codeName + '/' + competition.repo + '/' + competition.configFile;
                                            fs.readFile(fileName, onFileRead);

                                            function onFileRead(err, pData) {

                                                try {

                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> File System -> onFileRead -> Entering function."); }
                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> File System -> onFileRead -> fileName = " + fileName); }

                                                    responsesReceived++;

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = competition.repo;
                                                    configObj.configFile = competition.configFile;

                                                    host.competitions[j] = configObj;

                                                    if (requestsSent === responsesReceived) {

                                                        readDevTeamsConfigs();

                                                    }
                                                }
                                                catch (err) {
                                                    console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> File System -> File = " + fileName + " Error = " + err);
                                        }

                                        break;
                                    }

                                    case 'Github': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> Entering Case."); }

                                        github.getGithubData(host.codeName, competition.repo, competition.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> onDataArrived -> host.codeName = " + host.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> onDataArrived -> competition.repo = " + competition.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = competition.repo;
                                                configObj.configFile = competition.configFile;

                                                host.competitions[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    readDevTeamsConfigs();

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> Github -> onDataArrived -> Error = " + err);
                                            }
                                        }

                                        break;
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> getCompetitions -> Error = " + err);
                        }
                    }

                    function getPlotters() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> getPlotters -> Entering function."); }

                            /* In this second section we will load the competition plotters configurations. */

                            for (let j = 0; j < host.plotters.length; j++) {

                                let plotter = host.plotters[j];

                                requestsSent++;

                                switch (serverConfig.configAndPlugins.Location) {

                                    case 'Cloud': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> Entering Case."); }

                                        storage.getStorageData(host.codeName + "/" + "plotters", plotter.repo, plotter.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> host.codeName = " + host.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = plotter.repo;
                                                configObj.configFile = plotter.configFile;

                                                host.plotters[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    readDevTeamsConfigs();

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> Error = " + err);
                                            }
                                        }

                                        break;
                                    }

                                    case 'File System': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> File System -> Entering Case."); }

                                        try {

                                            let fs = require('fs');

                                            let fileName = '../Plotters/' + host.codeName + '/' + plotter.repo + '/' + plotter.configFile;
                                            fs.readFile(fileName, onFileRead);

                                            function onFileRead(err, pData) {

                                                try {

                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> File System -> onFileRead -> Entering function."); }
                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> File System -> onFileRead -> fileName = " + fileName); }

                                                    responsesReceived++;

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = plotter.repo;
                                                    configObj.configFile = plotter.configFile;

                                                    host.plotters[j] = configObj;

                                                    if (requestsSent === responsesReceived) {

                                                        readDevTeamsConfigs();

                                                    }
                                                }
                                                catch (err) {
                                                    console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                                }

                                            }
                                        }
                                        catch (err) {
                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> File System -> File = " + fileName + " Error = " + err);
                                        }

                                        break;
                                    }

                                    case 'Github': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> Entering Case."); }

                                        github.getGithubData(host.codeName, plotter.repo, plotter.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> onDataArrived -> host.codeName = " + host.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = plotter.repo;
                                                configObj.configFile = plotter.configFile;

                                                host.plotters[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    readDevTeamsConfigs();

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> Github -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> getCompetitions -> Error = " + err);
                        }
                    }
                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readHostsConfigs -> Error = " + err);
            }
        }

        function readDevTeamsConfigs() {

            try {

                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> Entering function."); }

                /*
        
                Each bot has its configuration at its own repo since each team must be able to change it at will.
                So what we do here is to use the master config at the AAPlatform repo that we already have on
                memory and inject into it the config of each bot.
        
                Inmediatelly after that, we also load the Plotters configs using the same technique.
        
                */

                let requestsSent = 0;
                let responsesReceived = 0;

                for (let i = 0; i < ecosystemObject.devTeams.length; i++) {

                    let devTeam = ecosystemObject.devTeams[i];

                    getBots();
                    getPlotters();

                    function getBots() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Entering function."); }

                            /* In the next section we are loading the bots configurations. */

                            for (let j = 0; j < devTeam.bots.length; j++) {

                                let bot = devTeam.bots[j];

                                requestsSent++;

                                switch (serverConfig.configAndPlugins.Location) {

                                    case 'Cloud': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> Entering Case."); }

                                        storage.getStorageData(devTeam.codeName + "/" + "bots", bot.repo, bot.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> bot.repo = " + bot.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                if (pData !== "{}") { // If for any reason we could not tet this config, then we just exclude this bot to improve resiliency.

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = bot.repo;
                                                    configObj.configFile = bot.configFile;

                                                    addStoragePermissions(configObj);

                                                    devTeam.bots[j] = configObj;

                                                }

                                                if (requestsSent === responsesReceived) {

                                                    callBackFunction(ecosystem, ecosystemObject);

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }

                                    case 'File System': {

                                        try {
                                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> File System -> Entering Case."); }

                                            let fs = require('fs');

                                            let fileName = '../Bots/' + devTeam.codeName + '/' + bot.repo + '/' + bot.configFile;
                                            fs.readFile(fileName, onFileRead);

                                            function onFileRead(err, pData) {

                                                try {

                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> File System -> onFileRead -> Entering function."); }
                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> File System -> onFileRead -> fileName = " + fileName); }

                                                    responsesReceived++;

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = bot.repo;
                                                    configObj.configFile = bot.configFile;

                                                    addStoragePermissions(configObj);

                                                    devTeam.bots[j] = configObj;

                                                    if (requestsSent === responsesReceived) {

                                                        callBackFunction(ecosystem, ecosystemObject);

                                                    }
                                                }
                                                catch (err) {
                                                    console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                                }

                                            }
                                        }
                                        catch (err) {
                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> File System -> File = " + fileName + " Error = " + err);
                                        }

                                        break;
                                    }

                                    case 'Github': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> Entering Case."); }

                                        github.getGithubData(devTeam.codeName, bot.repo, bot.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> onDataArrived -> bot.repo = " + bot.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = bot.repo;
                                                configObj.configFile = bot.configFile;

                                                addStoragePermissions(configObj);

                                                devTeam.bots[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    callBackFunction(ecosystem, ecosystemObject);

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Github -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }

                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Error = " + err);
                        }
                    }

                    function getPlotters() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Entering Function."); }

                            /* In the next section we are loading the plotters configurations. */

                            for (let j = 0; j < devTeam.plotters.length; j++) {

                                let plotter = devTeam.plotters[j];

                                requestsSent++;

                                switch (serverConfig.configAndPlugins.Location) {

                                    case 'Cloud': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> Entering Case."); }

                                        storage.getStorageData(devTeam.codeName + "/" + "plotters", plotter.repo, plotter.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                if (pData !== "{}") { // If for any reason we could not tet this config, then we just exclude this bot to improve resiliency.

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full plotter object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = plotter.repo;
                                                    configObj.configFile = plotter.configFile;

                                                    devTeam.plotters[j] = configObj;

                                                }

                                                if (requestsSent === responsesReceived) {

                                                    callBackFunction(ecosystem, ecosystemObject);

                                                }
                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }

                                    case 'File System': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> File System -> Entering Case."); }

                                        try {

                                            let fs = require('fs');

                                            let fileName = '../Plotters/' + devTeam.codeName + '/' + plotter.repo + '/' + plotter.configFile;
                                            fs.readFile(fileName, onFileRead);

                                            function onFileRead(err, pData) {

                                                try {

                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> File System -> onFileRead -> Entering function."); }
                                                    if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> File System -> onFileRead -> fileName = " + fileName); }

                                                    responsesReceived++;

                                                    pData = pData.toString();
                                                    pData = pData.trim(); // remove first byte with some encoding.

                                                    let configObj = JSON.parse(pData);

                                                    /* Since we are going to replace the full plotter object and we dont want to lose these two properties, we do this: */

                                                    configObj.repo = plotter.repo;
                                                    configObj.configFile = plotter.configFile;

                                                    devTeam.plotters[j] = configObj;

                                                    if (requestsSent === responsesReceived) {

                                                        callBackFunction(ecosystem, ecosystemObject);

                                                    }
                                                }
                                                catch (err) {
                                                    console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> File System -> onFileRead -> File = " + fileName + " Error = " + err);
                                                }
                                            }
                                        }
                                        catch (err) {
                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> File = " + fileName + " Error = " + err);
                                        }
                                        break;
                                    }

                                    case 'Github': {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> Entering Case."); }

                                        github.getGithubData(devTeam.codeName, plotter.repo, plotter.configFile, onDataArrived);

                                        function onDataArrived(pData) {

                                            try {

                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> onDataArrived -> Entering function."); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                                if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                                if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> onDataArrived -> pData = " + pData); }

                                                responsesReceived++;

                                                pData = pData.toString();
                                                pData = pData.trim(); // remove first byte with some encoding.

                                                let configObj = JSON.parse(pData);

                                                /* Since we are going to replace the full plotter object and we dont want to lose these two properties, we do this: */

                                                configObj.repo = plotter.repo;
                                                configObj.configFile = plotter.configFile;

                                                devTeam.plotters[j] = configObj;

                                                if (requestsSent === responsesReceived) {

                                                    callBackFunction(ecosystem, ecosystemObject);

                                                }

                                            }
                                            catch (err) {
                                                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Github -> onDataArrived -> Error = " + err);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }

                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Error = " + err);
                        }
                    }
                }

                function addStoragePermissions(pConfigObj) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> addStoragePermissions -> Entering function."); }

                        if (pConfigObj.storage !== undefined) { return; } // If this information is at the config file, then we take it, otherwise, we define it here. 

                        let fileUri;
                        let sas;

                        switch (serverConfig.environment) {

                            case "Develop": {

                                fileUri = serverConfig.productsStorage.Develop.fileUri;
                                sas = serverConfig.productsStorage.Develop.sas;

                                break;
                            }

                            case "Production": {

                                fileUri = serverConfig.productsStorage.Production.fileUri;
                                sas = serverConfig.productsStorage.Production.sas;

                                break;
                            }
                        }

                        pConfigObj.storage = {
                            sas: sas,
                            fileUri: fileUri
                        };

                    }
                    catch (err) {
                        console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> addStoragePermissions -> Error = " + err);
                    }
                }

            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> Error = " + err);
            }
        }


    }
}