/* These 2 are global variables, that is why they do not have a let or var */

CONSOLE_LOG = false;
LOG_FILE_CONTENT = false;

if (CONSOLE_LOG === true) { console.log("[INFO] server -> Node Server Starting."); }

let serverConfig;

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

global.DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
};

global.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
};

global.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
};

let storageData = new Map;

let HTMLCloudScripts;           // This are the html script tags needed to download the cloud web scripts.
let botScripts;                 // This module is the one which grabs user bots scrips from the storage, and browserifys them.

let ecosystem;
let ecosystemObject;

//'use strict';
let http = require('http');
let port = process.env.PORT || 1337;

let isHttpServerStarted = false;

const STORAGE = require('./Server/Storage');
let storage = STORAGE.newStorage();

let authenticatedSession;               // We do not send these keys to the browser, instead they are kept here for when they are needed.

initialize();

function initialize() {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> initialize -> Entering function."); }

    /* Clear all cached information. */

    storageData = new Map;

    const CONFIG_READER = require('./Server/ConfigReader');
    let configReader = CONFIG_READER.newConfigReader();

    configReader.initialize(ecosystem, ecosystemObject, serverConfig, storageData, onInitialized);

    function onInitialized(pServerConfig) {

        serverConfig = pServerConfig;

        configReader.loadConfigs(onConfigsLoaded);

        function onConfigsLoaded(pEcosystem, pEcosystemObject) {

            ecosystem = pEcosystem;
            ecosystemObject = pEcosystemObject;
            
            storage.initialize(storageData, serverConfig)

            const CLOUD_SCRIPTS = require('./Server/CloudScripts');
            let cloudScripts = CLOUD_SCRIPTS.newCloudScripts();

            cloudScripts.initialize(ecosystem, ecosystemObject, serverConfig, storageData, onInitialized);

            function onInitialized() {

                cloudScripts.loadCloudScripts(onLoadCompeted);

                function onLoadCompeted(pHTMLCloudScripts) {

                    const PERMISSIONS = require('./Server/Permissions');
                    let permissions = PERMISSIONS.newPermissions();

                    permissions.initialize(ecosystemObject, onInitialized);

                    function onInitialized(pPermissionsSecrets) {

                        authenticatedSession = pPermissionsSecrets;

                        const BOT_SCRIPTS = require('./Server/BotsScripts');
                        botScripts = BOT_SCRIPTS.newBotScripts();

                        botScripts.initialize(serverConfig, onInitialized);

                        function onInitialized() {

                            HTMLCloudScripts = pHTMLCloudScripts;
                            startHtttpServer();

                        }
                    }
                }
            }
        }
    }
}



function startHtttpServer() {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> startHtttpServer -> Entering function."); }

    try {

        if (isHttpServerStarted === false) {

            gWebServer = http.createServer(onBrowserRequest).listen(port);
            isHttpServerStarted = true;
        }
    }
    catch (err) {
        console.log("[ERROR] server -> startHtttpServer -> Error = " + err);
    }
}

function onBrowserRequest(request, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> Entering function."); }
    if (CONSOLE_LOG === true && request.url.indexOf("NO-LOG") === -1) { console.log("[INFO] server -> onBrowserRequest -> request.url = " + request.url); }

    var htmlResponse;
    var requestParameters = request.url.split("/");

    switch (requestParameters[1]) {

        case serverConfig.reinitializeCommand: {

            initialize();

            respondWithContent("Node JS Server Reinitilized.", response);

        }
            break;

        case "Plotter.js":
            {
                /*

                This file is build dinamically because it has the code to instantiate the different configured Plotters. The instantiation code
                will be generated using a pre-defined string with replacement points. We will go through the configuration file to learn
                about all the possible plotters the system can load.

                */

                let fs = require('fs');
                try {
                    let fileName = 'Plotter.js';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();

                            /* This is the string we will use to insert into the Plotters.js script. */

                            let caseString = '' +
                                '        case "@newFunctionName@":' + '\n' +
                                '        {' + '\n' +
                                '            plotter = newPlotterName();' + '\n' +
                                '        }' + '\n' +
                                '        break;' + '\n' + '\n' 

                            let devTeams = ecosystemObject.devTeams;
                            let hosts = ecosystemObject.hosts;

                            addToFileContent(devTeams);
                            addToFileContent(hosts);

                            function addToFileContent(pDevTeamsOrHosts) {

                                if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addToFileContent -> Entering function."); }

                                for (let i = 0; i < pDevTeamsOrHosts.length; i++) {

                                    let devTeam = pDevTeamsOrHosts[i];

                                    for (let j = 0; j < devTeam.plotters.length; j++) {

                                        let plotter = devTeam.plotters[j];

                                        for (let k = 0; k < plotter.modules.length; k++) {

                                            let module = plotter.modules[k];

                                            let caseStringCopy = caseString;

                                            let newFunctionName = devTeam.codeName + plotter.codeName + module.codeName;
                                            newFunctionName = newFunctionName.replace(/-/g, "");

                                            let stringToInsert;
                                            stringToInsert = caseStringCopy.replace('@newFunctionName@', newFunctionName);
                                            stringToInsert = stringToInsert.replace('newPlotterName', 'new' + newFunctionName);

                                            let firstPart = fileContent.substring(0, fileContent.indexOf('// Cases'));
                                            let secondPart = fileContent.substring(fileContent.indexOf('// Cases'));

                                            fileContent = firstPart + stringToInsert + secondPart;
                                        }
                                    }
                                }
                            }

                            respondWithContent(fileContent, response);

                        }
                        catch (err) {
                            console.log("[ERROR] server -> onBrowserRequest -> File Not Found: " + fileName + " or Error = " + err);
                        }

                    }
                }
                catch (err) {
                    console.log(err);
                }

            }
            break;

        case "PlotterPanel.js":
            {
                /*

                This file is build dinamically because it has the code to instantiate the different configured Plotter Panels. The instantiation code
                will be generated using a pre-defined string with replacement points. We will go through the configuration file to learn
                about all the possible plotters panels the system can load.

                */

                let fs = require('fs');
                try {
                    let fileName = 'PlotterPanel.js';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();

                            /* This is the string we will use to insert into the Plotters.js script. */

                            let caseString = '' +
                                '        case "@newFunctionName@":' + '\n' +
                                '        {' + '\n' +
                                '            plotterPanel = newPlotterPanelName();' + '\n' +
                                '        }' + '\n' +
                                '        break;' + '\n' + '\n'

                            let devTeams = ecosystemObject.devTeams;
                            let hosts = ecosystemObject.hosts;

                            addToFileContent(devTeams);
                            addToFileContent(hosts);

                            function addToFileContent(pDevTeamsOrHosts) {

                                if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addToFileContent -> Entering function."); }

                                for (let i = 0; i < pDevTeamsOrHosts.length; i++) {

                                    let devTeam = pDevTeamsOrHosts[i];

                                    for (let j = 0; j < devTeam.plotters.length; j++) {

                                        let plotter = devTeam.plotters[j];

                                        for (let k = 0; k < plotter.modules.length; k++) {

                                            let module = plotter.modules[k];

                                            for (let l = 0; l < module.panels.length; l++) {

                                                let panel = module.panels[l];

                                                let caseStringCopy = caseString;

                                                let newFunctionName = devTeam.codeName + plotter.codeName + module.codeName + panel.codeName;
                                                newFunctionName = newFunctionName.replace(/-/g, "");

                                                let stringToInsert;
                                                stringToInsert = caseStringCopy.replace('@newFunctionName@', newFunctionName);
                                                stringToInsert = stringToInsert.replace('newPlotterPanelName', 'new' + newFunctionName);

                                                let firstPart = fileContent.substring(0, fileContent.indexOf('// Cases'));
                                                let secondPart = fileContent.substring(fileContent.indexOf('// Cases'));

                                                fileContent = firstPart + stringToInsert + secondPart;
                                            }
                                        }
                                    }
                                }
                            }

                            respondWithContent(fileContent, response);

                        }
                        catch (err) {
                            console.log("[ERROR] server -> onBrowserRequest -> File Not Found: " + fileName + " or Error = " + err);
                        }

                    }
                }
                catch (err) {
                    console.log(err);
                }

            }
            break;

        case "Ecosystem.js":
            {
                /*

                At this page we need to insert the configuration file for the whole system that we assamble before at the begining of this module
                execution. So what we do is to load a template file with an insertion point where the configuration json is injected in. 

                */

                let fs = require('fs');
                try {
                    let fileName = 'Ecosystem.js';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();
                            let insertContent = JSON.stringify(ecosystemObject); 

                            fileContent = fileContent.replace('"@ecosystem.json@"', insertContent); 

                            respondWithContent(fileContent, response);

                        }
                        catch (err) {
                            console.log("[ERROR] server -> onBrowserRequest -> File Not Found: " + fileName + " or Error = " + err);
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }

            }
            break;

        case "CloudVM": // This means the Scripts folder.
            {

                respondWithFile('./CloudVM/' + requestParameters[2], response);

            }
            break; 

        case "Images": // This means the Scripts folder.
            {

                respondWithImage('./Images/' + requestParameters[2], response);

            }
            break; 

        case "favicon.ico": // This means the Scripts folder.
            {

                respondWithImage('./Images/' + 'favicon.ico', response);

            }
            break; 

        case "BottomSpace": // This means the BottomSpace folder.
            {

                respondWithFile('./BottomSpace/' + requestParameters[2], response);

            }
            break; 

        case "TopSpace": // This means the TopSpace folder.
            {

                respondWithFile('./TopSpace/' + requestParameters[2], response);

            }
            break; 

        case "AABrowserAPI": // This means the Scripts folder.
            {
                const AABROSER_API_MODULE = require('./AABrowserAPI/' + 'API');
                let api = AABROSER_API_MODULE.newAPI();

                api.initialize(serverConfig);

                processPost(request, response, onPostReceived)

                function onPostReceived(pData) {

                    switch (requestParameters[2]) {

                        case "saveBotCode": {

                            let devTeam = requestParameters[3];
                            let source = requestParameters[4] + "/" +  requestParameters[5];
                            let repo = requestParameters[6];
                            let path;

                            if (requestParameters[8] !== undefined) {
                                path = requestParameters[7] + "/" + requestParameters[8];
                            } else {
                                path = requestParameters[7];
                            }
                            api.saveBotCode(devTeam, source, repo, path, pData, onResponse);
                            break;
                        }

                    }

                    function onResponse(err, pResponse) {

                        respondWithContent(JSON.stringify(pResponse), response);
                    }
                }
            }
            break; 

        case "Scripts": // This means the Scripts folder.
            {

                if (requestParameters[2] === "AppLoader.js") {

                    let fs = require('fs');
                    try {
                        let fileName = './Scripts/' + 'AppLoader.js';
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, file) {

                            if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> Entering function."); }

                            try {

                                let fileContent = file.toString();

                                addCloudWebScripts();
                                addPlotters();

                                function addCloudWebScripts() {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addCloudWebScripts -> Entering function."); }

                                    let firstPart = fileContent.substring(0, fileContent.indexOf('/* CloudWebScripts */') + 21);
                                    let secondPart = fileContent.substring(fileContent.indexOf('/* CloudWebScripts */') + 21);

                                    fileContent = firstPart + HTMLCloudScripts + secondPart;
                                }

                                function addPlotters() {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> Entering function."); }

                                    let htmlLinePlotter = '' + '\n' +
                                        '            "Plotters/@devTeam@/@repo@/@module@.js",'

                                    let htmlLinePlotterPanel = '' + '\n' +
                                        '            "PlotterPanels/@devTeam@/@repo@/@module@.js",'

                                    let devTeams = ecosystemObject.devTeams;
                                    let hosts = ecosystemObject.hosts;

                                    addScript(devTeams);
                                    addScript(hosts);

                                    function addScript(pDevTeamsOrHosts) {

                                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> addScript -> Entering function."); }

                                        for (let i = 0; i < pDevTeamsOrHosts.length; i++) {

                                            let devTeam = pDevTeamsOrHosts[i];

                                            for (let j = 0; j < devTeam.plotters.length; j++) {

                                                let plotter = devTeam.plotters[j];

                                                if (plotter.modules !== undefined) {

                                                    for (let k = 0; k < plotter.modules.length; k++) {

                                                        let module = plotter.modules[k];

                                                        let htmlLineCopy = htmlLinePlotter;

                                                        let stringToInsert;
                                                        stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                                        stringToInsert = stringToInsert.replace('@repo@', plotter.repo);
                                                        stringToInsert = stringToInsert.replace('@module@', module.moduleName);

                                                        let firstPart = fileContent.substring(0, fileContent.indexOf('/* Plotters */') + 14);
                                                        let secondPart = fileContent.substring(fileContent.indexOf('/* Plotters */') + 14);

                                                        fileContent = firstPart + stringToInsert + secondPart;

                                                        if (module.panels !== undefined) {

                                                            for (let l = 0; l < module.panels.length; l++) {

                                                                let panel = module.panels[l];

                                                                let htmlLineCopy = htmlLinePlotterPanel;

                                                                let stringToInsert;
                                                                stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                                                stringToInsert = stringToInsert.replace('@repo@', plotter.repo);
                                                                stringToInsert = stringToInsert.replace('@module@', panel.moduleName);

                                                                let firstPart = fileContent.substring(0, fileContent.indexOf('/* PlotterPanels */') + 19);
                                                                let secondPart = fileContent.substring(fileContent.indexOf('/* PlotterPanels */') + 19);

                                                                fileContent = firstPart + stringToInsert + secondPart;
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                respondWithContent(fileContent, response);

                            }
                            catch (err) {
                                console.log("[ERROR] server -> onBrowserRequest -> File Not Found: " + fileName + " or Error = " + err);
                            }
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                } else {

                    respondWithFile('./Scripts/' + requestParameters[2], response);

                }
            }
            break; 

        case "PoloniexAPIClient": // This is trying to access this library functionality from the broser.
            {

                /* We are going to let access the exchange only to authenticated users, that measn that we need the a valid session token. */

                let sessionToken = requestParameters[3]; 

                for (let i = 0; i < authenticatedSession.length; i++) {

                    let session = authenticatedSession[i];

                    if (session.sessionToken === sessionToken) {

                        let exchangeKey = session.exchangeKeys[0].key;  // 0 because we only deal with one exchange for now.
                        let exchangeSecret = session.exchangeKeys[0].secret;  

                        const POLONIEX_CLIENT_MODULE = require('./Exchanges/' + 'PoloniexAPIClient');
                        let poloniexApiClient = POLONIEX_CLIENT_MODULE.newPoloniexAPIClient(exchangeKey, exchangeSecret);

                        switch (requestParameters[2]) {

                            case "returnOpenOrders": {
                                poloniexApiClient.API.returnOpenOrders(requestParameters[4], requestParameters[5], onExchangeResponse);
                                break;
                            }

                            case "returnOrderTrades": {
                                poloniexApiClient.API.returnOrderTrades(requestParameters[4], onExchangeResponse);
                                break;
                            }

                            case "buy": {
                                poloniexApiClient.API.buy(requestParameters[4], requestParameters[5], requestParameters[6], requestParameters[7], onExchangeResponse);
                                break;
                            }

                            case "sell": {
                                poloniexApiClient.API.sell(requestParameters[4], requestParameters[5], requestParameters[6], requestParameters[7], onExchangeResponse);
                                break;
                            }

                            case "moveOrder": {
                                poloniexApiClient.API.moveOrder(requestParameters[4], requestParameters[5], requestParameters[6], onExchangeResponse);
                                break;
                            }

                            case "returnTicker": {
                                poloniexApiClient.API.returnTicker(onExchangeResponse);
                                break;
                            }
                        }

                        function onExchangeResponse(err, exchangeResponse) {

                            /* Delete these secrets before they get logged. */

                            requestParameters[3] = "";

                            let serverResponse = {
                                err: err,
                                exchangeResponse: exchangeResponse
                            }

                            respondWithContent(JSON.stringify(serverResponse), response);
                        }

                        return;
                    }
                }
            }
            break; 
            
        case "AACloud": // This means the cloud folder.
            {

                let map = storageData;

                let script = map.get(requestParameters[2]);

                if (script !== undefined) {

                    respondWithContent(script, response);

                } else {

                    if (CONSOLE_LOG === true) { console.log("[WARN] server -> onBrowserRequest -> readEcosystemConfig -> Script Not Found."); }
                    if (CONSOLE_LOG === true) { console.log("[WARN] server -> onBrowserRequest -> readEcosystemConfig -> requestParameters[2] = " + requestParameters[2]); }

                    respondWithContent("", response);
                }
            }
            break; 

        case "Bots": // This means the cloud folder.
            {
                switch (requestParameters[3]) {

                    case 'bots': {

                        let devTeam = requestParameters[2];
                        let source = requestParameters[3];
                        let repo = requestParameters[4];
                        let path;

                        if (requestParameters[6] !== undefined) {
                            path = requestParameters[5] + "/" + requestParameters[6];
                        } else {
                            path = requestParameters[5];
                        }

                        botScripts.getScript(devTeam, source, repo, path, onScriptReady) 

                        break;
                    }

                    case 'members': {

                        let devTeam = requestParameters[2];
                        let source = requestParameters[3] + "/" + requestParameters[4];
                        let repo = requestParameters[5];
                        let path;

                        if (requestParameters[7] !== undefined) {
                            path = requestParameters[6] + "/" + requestParameters[7];
                        } else {
                            path = requestParameters[6];
                        }

                        botScripts.getScript(devTeam, source, repo, path, onScriptReady)

                        break;
                    }

                    default : {
                        if (CONSOLE_LOG === true) { console.log("[ERROR] server -> onBrowserRequest -> Bots -> Invalid Request. "); }
                    }
                }

                function onScriptReady(pScript) {

                    respondWithContent(pScript, response);

                }
            }
            break; 

        case "Plotters": // This means the plotter folder, not to be confused with the Plotters script!
            {

                storage.getStorageData(requestParameters[2] + "/" + "plotters", requestParameters[3], requestParameters[4], onDataArrived);

                function onDataArrived(pData) {

                    respondWithContent(pData, response);

                }
            }
            break; 

        case "PlotterPanels": // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
            {
                storage.getStorageData(requestParameters[2] + "/" + "plotters", requestParameters[3], requestParameters[4], onDataArrived);

                function onDataArrived(pData) {

                    respondWithContent(pData, response);

                }
            }
            break; 
        case "Panels":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        case "ChartLayers":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        case "Azure":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        case "Spaces":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        case "Files":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        case "FloatingSpace":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break;

        default:

            if (requestParameters[1] === "") {

                let fs = require('fs');
                try {
                    let fileName = 'index.html';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();

                            addImages();

                            function addImages() {

                                if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addImages -> Entering function."); }

                                const htmlLine = '' + '\n' +
                                    '    <img id="@id@" width="0" height="0" src="https://raw.githubusercontent.com/@devTeam@/@repo@/master/@image@">'

                                let devTeams = ecosystemObject.devTeams;

                                addScript(devTeams);

                                function addScript(pDevTeams) {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addImages -> addScript -> Entering function."); }

                                    for (let i = 0; i < pDevTeams.length; i++) {

                                        let devTeam = pDevTeams[i];

                                        let htmlLineCopy = htmlLine;

                                        let stringToInsert;
                                        stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                        stringToInsert = stringToInsert.replace('@repo@', devTeam.codeName + "-Dev-Team");
                                        stringToInsert = stringToInsert.replace('@image@', devTeam.codeName + ".png");
                                        stringToInsert = stringToInsert.replace('@id@', devTeam.codeName + ".png");

                                        let firstPart = fileContent.substring(0, fileContent.indexOf('<!--Images-->') + 15);
                                        let secondPart = fileContent.substring(fileContent.indexOf('<!--Images-->') + 15);

                                        fileContent = firstPart + stringToInsert + secondPart;

                                        for (let j = 0; j < devTeam.bots.length; j++) {

                                            let bot = devTeam.bots[j];

                                            if (bot.profilePicture !== undefined) {

                                                let htmlLineCopy = htmlLine;

                                                let stringToInsert;
                                                stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                                stringToInsert = stringToInsert.replace('@repo@', bot.repo);
                                                stringToInsert = stringToInsert.replace('@image@', bot.profilePicture);
                                                stringToInsert = stringToInsert.replace('@id@', devTeam.codeName + "." + bot.profilePicture);

                                                let firstPart = fileContent.substring(0, fileContent.indexOf('<!--Images-->') + 15);
                                                let secondPart = fileContent.substring(fileContent.indexOf('<!--Images-->') + 15);

                                                fileContent = firstPart + stringToInsert + secondPart;

                                            }
                                        }

                                        for (let j = 0; j < devTeam.plotters.length; j++) {

                                            let plotter = devTeam.plotters[j];

                                            for (let k = 0; k < plotter.modules.length; k++) {

                                                let module = plotter.modules[k];

                                                if (module.profilePicture !== undefined) {

                                                    let htmlLineCopy = htmlLine;

                                                    let stringToInsert;
                                                    stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                                    stringToInsert = stringToInsert.replace('@repo@', plotter.repo);
                                                    stringToInsert = stringToInsert.replace('@image@', module.profilePicture);
                                                    stringToInsert = stringToInsert.replace('@id@', devTeam.codeName + "." + plotter.codeName + "." + module.codeName + "." + module.profilePicture);

                                                    let firstPart = fileContent.substring(0, fileContent.indexOf('<!--Images-->') + 15);
                                                    let secondPart = fileContent.substring(fileContent.indexOf('<!--Images-->') + 15);

                                                    fileContent = firstPart + stringToInsert + secondPart;

                                                } 
                                            }
                                        }
                                    }
                                }
                            }
                           
                            respondWithContent(fileContent, response);

                        }
                        catch (err) {
                            console.log("[ERROR] server -> onBrowserRequest -> File Not Found: " + fileName + " or Error = " + err);
                        }
                    }
                }
                catch (err) {
                    console.log(err);
                }
            } else {

                respondWithFile("" + requestParameters[1], response);

            }
    }

    function sendResponseToBrowser(htmlResponse) {

        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> sendResponseToBrowser -> Entering function."); }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(htmlResponse);

        response.end("\n");
    }
}

function respondWithContent(content, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithContent -> Entering function."); }

    try {

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setHeader("Expires", "0"); // Proxies.
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allows to access data from other domains.

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(content);
        response.end("\n");
        //console.log("Content Sent: " + content);

    }
    catch (err) {
        returnEmptyArray();
    }
}

function respondWithFile(fileName, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithFile -> Entering function."); }

    let fs = require('fs');
    try {

        fs.readFile(fileName, onFileRead);

        function onFileRead(err, file) {

            if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithFile -> onFileRead -> Entering function."); }

            try {
                let htmlResponse = file.toString();

                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                response.setHeader("Expires", "0"); // Proxies.
                response.setHeader("Access-Control-Allow-Origin", "*"); // Allows to access data from other domains.

                //response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(htmlResponse);
                response.end("\n");
                //console.log("File Sent: " + fileName);
                //
            }
            catch (err) {
                returnEmptyArray();
                console.log("[ERROR] server -> respondWithFile -> onFileRead -> File Not Found: " + fileName + " or Error = " + err);
            }

        }
    }
    catch (err) {
        returnEmptyArray();
    }
}

function respondWithImage(fileName, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithImage -> Entering function."); }

    let fs = require('fs');
    try {

        fs.readFile(fileName, onFileRead);

        function onFileRead(err, file) {

            if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithImage -> onFileRead -> Entering function."); }

            try {

                response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
                response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
                response.setHeader("Expires", "0"); // Proxies.
                response.setHeader("Access-Control-Allow-Origin", "*"); // Allows to access data from other domains.

                response.writeHead(200, { 'Content-Type': 'image/png' });
                response.end(file, 'binary');

            }
            catch (err) {

                console.log("[ERROR] server -> respondWithImage -> onFileRead -> File Not Found: " + fileName + " or Error = " + err);
            }

        }
    }
    catch (err) {
        console.log("[ERROR] server -> respondWithImage -> err = " + err);
    }
}

function returnEmptyArray() {

    try {

        if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithFile -> returnEmptyArray -> Entering function."); }

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setHeader("Expires", "0"); // Proxies.

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write("[]");
        response.end("\n");

    } catch (err) {

        console.log("[ERROR] server -> returnEmptyArray -> err.message " + err.message);

    }
}

function processPost(request, response, callback) {
    let data = "";
    if (typeof callback !== 'function') return null;

    if (request.method == 'POST') {
        request.on('data', function (pData) {
            data += pData;
            if (data.length > 1e6) {
                data = "";
                response.writeHead(413, { 'Content-Type': 'text/plain' }).end();
                request.connection.destroy();
            }
        });

        request.on('end', function () {
            callback(data);
        });

    } else {
        response.writeHead(405, { 'Content-Type': 'text/plain' });
        response.end();
    }
}