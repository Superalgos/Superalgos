exports.newConfigReader = function newConfigReader() {

    let thisObject = {
        loadConfigs: loadConfigs,
        initialize: initialize
    }

    const GITHUB = require('../Server/Github');
    let github = GITHUB.newGithub();

    let storage;

    let serverConfig;
    let storageData;
    let ecosystem;
    let ecosystemObject;

    return thisObject;

    function initialize(pEcosystem, pEcosystemObject, pStorageData, pStorage, callBackFunction) {

        storage = pStorage;
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

                        storage.initialize(storageData, serverConfig);

                        callBackFunction(global.DEFAULT_OK_RESPONSE, serverConfig);
                    }
                    catch (err) {
                        console.log("[ERROR] ConfigReader -> readAAWebConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }

                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readAAWebConfig -> Error = " + err);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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

                storage.readData('AdvancedAlgos', 'AAPlatform', 'ecosystem.json', true, onDataArrived);

                function onDataArrived(err, pData) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readEcosystemConfig -> Cloud -> onDataArrived -> Entering function."); }

                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                            console.log("[ERROR] ConfigReader -> readEcosystemConfig -> Cloud -> onDataArrived -> Could not read a file. ");
                            console.log("[ERROR] ConfigReader -> readEcosystemConfig -> Cloud -> onDataArrived -> err.message = " + err.message);

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }

                        ecosystem = pData.toString();
                        ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                        ecosystemObject = JSON.parse(ecosystem);
                        readHostsConfigs();
                    }
                    catch (err) {
                        console.log("[ERROR] ConfigReader -> loadConfigs -> readEcosystemConfig -> onDataArrived -> Error = " + err);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> loadConfigs -> readEcosystemConfig -> Error = " + err);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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

                                storage.readData(host.codeName + "/" + "competitions", competition.repo, competition.configFile, true, onDataArrived);

                                function onDataArrived(err, pData) {

                                    try {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> Entering function."); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> host.codeName = " + host.codeName); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> competition.repo = " + competition.repo); }
                                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> pData = " + pData); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> Could not read a file. ");
                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> Cloud -> onDataArrived -> err.message = " + err.message);

                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }

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
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getCompetitions -> getCompetitions -> Error = " + err);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getPlotters() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> getPlotters -> Entering function."); }

                            /* In this second section we will load the competition plotters configurations. */

                            for (let j = 0; j < host.plotters.length; j++) {

                                let plotter = host.plotters[j];

                                requestsSent++;

                                storage.readData(host.codeName + "/" + "plotters", plotter.repo, plotter.configFile, true, onDataArrived);

                                function onDataArrived(err, pData) {

                                    try {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> Entering function."); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> host.codeName = " + host.codeName); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> pData = " + pData); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> Could not read a file. ");
                                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> Cloud -> onDataArrived -> err.message = " + err.message);

                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }

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
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader ->  readHostsConfigs -> getPlotters -> getCompetitions -> Error = " + err);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }
                }
            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readHostsConfigs -> Error = " + err);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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

                                storage.readData(devTeam.codeName + "/" + "bots", bot.repo, bot.configFile, true, onDataArrived);

                                function onDataArrived(err, pData) {

                                    try {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> Entering function."); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> bot.repo = " + bot.repo); }
                                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> pData = " + pData); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> Could not read a file. ");
                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> err.message = " + err.message);

                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }

                                        responsesReceived++;

                                        if (pData !== "{}") { // If for any reason we could not tet this config, then we just exclude this bot to improve resiliency.

                                            pData = pData.toString();
                                            pData = pData.trim(); // remove first byte with some encoding.

                                            let configObj = JSON.parse(pData);

                                            /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                            configObj.repo = bot.repo;
                                            configObj.configFile = bot.configFile;

                                            addStoragePermissions(configObj);                                            

                                            /* Here we will add all the possible Clones of this bot */

                                            if (configObj.genes !== undefined) {

                                                /* Here, based on the genes we will create one instance for each combination of genes */

                                                let valueMatrix = [];

                                                for (let i = 0; i < configObj.genes.length; i++) {

                                                    let gene = configObj.genes[i];

                                                    let possibleValues = [];

                                                    for (let j = gene.lowerLimit; j <= gene.upperLimit; j++) {

                                                        possibleValues.push(j);

                                                    }

                                                    valueMatrix.push(possibleValues);

                                                }

                                                /* 
                                                Now we have all the possible genes values in a multi-dimensional matrix.
                                                We will go thorugh each of the elements of each dimension and get each combination possible with the other dimmensions. 
                                                */

                                                let combinations = [];
                                                let combination = [];
                                                let dimensionIndex = 0;

                                                calculateCombinations(dimensionIndex, combination);

                                                function calculateCombinations(pDimensionIndex, pCombination) {

                                                    let dimension = valueMatrix[pDimensionIndex];

                                                    for (let j = 0; j < dimension.length; j++) {

                                                        let copy = JSON.parse(JSON.stringify(pCombination));

                                                        let value = dimension[j];
                                                        copy.push(value);

                                                        if (pDimensionIndex < valueMatrix.length - 1) {

                                                            calculateCombinations(pDimensionIndex + 1, copy);

                                                        } else {

                                                            combinations.push(copy);

                                                        }
                                                    }
                                                }

                                                /* We delete the bot definition since it is going to be replaced by one definition for each of its clones. */

                                                devTeam.bots.splice(j);

                                                /* At this point we have an array with all the possible combinations, we just need to create an instance for each one and set the genes according to that. */

                                                for (let i = 0; i < combinations.length; i++) {

                                                    let botConfig = JSON.parse(JSON.stringify(configObj));
                                                    let combination = combinations[i];
                                                    let genes = {};
                                                    let clonKey = "";

                                                    for (let j = 0; j < botConfig.genes.length; j++) {

                                                        genes[botConfig.genes[j].name] = combination[j];
                                                        clonKey = clonKey + "." + combination[j];

                                                    }

                                                    let clonName = "Clon" + clonKey;
                                                    let clonConfig = JSON.parse(JSON.stringify(botConfig));

                                                    /* Lets adapt the bot config so as to tune it for the new clon. */

                                                    clonConfig.displayName = clonConfig.displayName + " " + clonName;
                                                    clonConfig.codeName = clonConfig.codeName + "-" + clonName;

                                                    /*
                                                    for (let j = 0; j < clonConfig.products.length; j++) {

                                                        let product = clonConfig.products[j];

                                                        for (let k = 0; k < product.dataSets.length; k++) {

                                                            let dataSet = product.dataSets[k];

                                                            dataSet.filePath = dataSet.filePath.replace("@Clon", "-" + clonName);
                                                        }
                                                    }
                                                    */

                                                    devTeam.bots.push(clonConfig);

                                                }
                                            } else {

                                                /* If the bot does not have any genes at all we do what we did before clones existed */

                                                devTeam.bots[j] = configObj;

                                            }

                                        }

                                        if (requestsSent === responsesReceived) {

                                            callBackFunction(global.DEFAULT_OK_RESPONSE, ecosystem, ecosystemObject);

                                        }

                                    }
                                    catch (err) {
                                        console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Cloud -> onDataArrived -> Error = " + err);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getBots -> Error = " + err);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function getPlotters() {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Entering Function."); }

                            /* In the next section we are loading the plotters configurations. */

                            for (let j = 0; j < devTeam.plotters.length; j++) {

                                let plotter = devTeam.plotters[j];

                                requestsSent++;

                                storage.readData(devTeam.codeName + "/" + "plotters", plotter.repo, plotter.configFile, true, onDataArrived);

                                function onDataArrived(err, pData) {

                                    try {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> Entering function."); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                                        if (CONSOLE_LOG === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> plotter.repo = " + plotter.repo); }
                                        if (LOG_FILE_CONTENT === true) { console.log("[INFO] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> pData = " + pData); }

                                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> Could not read a file. ");
                                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> err.message = " + err.message);

                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                            return;
                                        }

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

                                            callBackFunction(global.DEFAULT_OK_RESPONSE, ecosystem, ecosystemObject);

                                        }
                                    }
                                    catch (err) {
                                        console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Cloud -> onDataArrived -> Error = " + err);
                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                    }
                                }
                            }

                        }
                        catch (err) {
                            console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> getPlotters -> Error = " + err);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
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
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    }
                }

            }
            catch (err) {
                console.log("[ERROR] ConfigReader -> readDevTeamsConfigs -> Error = " + err);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
        }
    }
}