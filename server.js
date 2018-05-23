/* These 2 are global variables, that is why they do not have a let or var */

CONSOLE_LOG = false;
LOG_FILE_CONTENT = false;

if (CONSOLE_LOG === true) { console.log("[INFO] server -> Node Server Starting."); }

let serverConfig;

let githubData = new Map;
let storageData = new Map;
let fileSystemData = new Map;

let HTMLCloudScripts;           // This are the html script tags needed to download the cloud web scripts.

let ecosystem;
let ecosystemObject;

//'use strict';
let http = require('http');
let port = process.env.PORT || 1337;

let isHttpServerStarted = false;

const GITHUB = require('./Server/Github');
let github = GITHUB.newGithub();

const STORAGE = require('./Server/Storage');
let storage = STORAGE.newStorage();

initialize();

function initialize() {

    if (CONSOLE_LOG === true) { console.log("[INFO] server -> initialize -> Entering function."); }

    /* Clear all cached information. */

    githubData = new Map;
    storageData = new Map;
    fileSystemData = new Map;

    const CONFIG_READER = require('./Server/ConfigReader');
    let configReader = CONFIG_READER.newConfigReader();

    configReader.initialize(ecosystem, ecosystemObject, serverConfig, githubData, storageData, onInitialized);

    function onInitialized(pServerConfig) {

        serverConfig = pServerConfig;

        configReader.loadConfigs(onConfigsLoaded);

        function onConfigsLoaded(pEcosystem, pEcosystemObject) {

            ecosystem = pEcosystem;
            ecosystemObject = pEcosystemObject;
            
            github.initialize(githubData);
            storage.initialize(storageData, serverConfig)

            const CLOUD_SCRIPTS = require('./Server/CloudScripts');
            let cloudScripts = CLOUD_SCRIPTS.newCloudScripts();

            cloudScripts.initialize(ecosystem, ecosystemObject, serverConfig, githubData, storageData, fileSystemData, onInitialized);

            function onInitialized() {

                cloudScripts.loadCloudScripts(onLoadCompeted);

                function onLoadCompeted(pHTMLCloudScripts) {

                    const PERMISSIONS = require('./Server/Permissions');
                    let permissions = PERMISSIONS.newPermissions();

                    permissions.initialize(ecosystemObject, onInitialized);

                    function onInitialized() {

                        const BOT_SCRIPTS = require('./Server/BotsScripts');
                        let botScripts = BOT_SCRIPTS.newBotScripts();

                        botScripts.initialize(ecosystem, ecosystemObject, serverConfig, githubData, storageData, fileSystemData, onInitialized);

                        function onInitialized() {

                            botScripts.loadBotScripts(onScriptsLoaded);

                            function onScriptsLoaded(){

                                HTMLCloudScripts = pHTMLCloudScripts;
                                startHtttpServer();
                            }
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
    if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> request.url = " + request.url); }

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

        case "Scripts": // This means the Scripts folder.
            {

                respondWithFile('./Scripts/' + requestParameters[2], response);

            }
            break; 

        case "Cloud": // This means the cloud folder.
            {

                let map;

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Cloud -> Entering Case."); }

                        map = storageData;
                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> File System -> Entering Case."); }

                        map = fileSystemData;
                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Github -> Entering Case."); }

                        github.getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        map = githubData;
                        break;
                    }
                }

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

                let map;

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Cloud -> Entering Case."); }

                        map = storageData;
                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> File System -> Entering Case."); }

                        map = fileSystemData;
                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Github -> Entering Case."); }

                        github.getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        map = githubData;
                        break;
                    }
                }

                let key;

                if (requestParameters[4] !== undefined) {

                    key = requestParameters[2] + "." + requestParameters[3] + "." + requestParameters[4];

                } else {

                    key = requestParameters[2] + "." + requestParameters[3];

                }

                let script = map.get(key);

                if (script !== undefined) {

                    respondWithContent(script, response);

                } else {

                    if (CONSOLE_LOG === true) { console.log("[WARN] server -> onBrowserRequest -> readEcosystemConfig -> Script Not Found."); }
                    if (CONSOLE_LOG === true) { console.log("[WARN] server -> onBrowserRequest -> readEcosystemConfig -> key = " + key); }

                    respondWithContent("", response);
                }
            }
            break; 

        case "Plotters": // This means the plotter folder, not to be confused with the Plotters script!
            {

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Cloud -> Entering Case."); }

                        storage.getStorageData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        function onDataArrived(pData) {

                            respondWithContent(pData, response);

                        }

                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> File System -> Entering Case."); }

                        respondWithFile('../Plotters/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response);

                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Github -> Entering Case."); }

                        github.getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        function onDataArrived(pData) {

                            respondWithContent(pData, response);

                        }

                        break;
                    }
                }
            }
            break; 

        case "PlotterPanels": // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
            {

                switch (serverConfig.configAndPlugins.Location) {

                    case 'Cloud': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Cloud -> Entering Case."); }

                        storage.getStorageData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        function onDataArrived(pData) {

                            respondWithContent(pData, response);

                        }

                        break;
                    }

                    case 'File System': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> File System -> Entering Case."); }

                        respondWithFile('../Plotters/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response);

                        break;
                    }

                    case 'Github': {

                        if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> readEcosystemConfig -> Github -> Entering Case."); }

                        github.getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived);

                        function onDataArrived(pData) {

                            respondWithContent(pData, response);

                        }

                        break;
                    }
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

                            addCloudWebScripts();
                            addPlotters();
                            addImages();

                            function addCloudWebScripts() {

                                if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addCloudWebScripts -> Entering function."); }

                                let firstPart = fileContent.substring(0, fileContent.indexOf('<!--CloudWebScripts-->') + 22);
                                let secondPart = fileContent.substring(fileContent.indexOf('<!--CloudWebScripts-->') + 22);

                                fileContent = firstPart + HTMLCloudScripts + secondPart;
                            }

                            function addPlotters() {

                                if (CONSOLE_LOG === true) { console.log("[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> Entering function."); }

                                let htmlLinePlotter = '' + '\n' +
                                    '    <script type="text/javascript" src="Plotters/@devTeam@/@repo@/@module@.js"></script>'

                                let htmlLinePlotterPanel = '' + '\n' +
                                    '    <script type="text/javascript" src="PlotterPanels/@devTeam@/@repo@/@module@.js"></script>'

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

                                                    let firstPart = fileContent.substring(0, fileContent.indexOf('<!--Plotters-->') + 15);
                                                    let secondPart = fileContent.substring(fileContent.indexOf('<!--Plotters-->') + 15);

                                                    fileContent = firstPart + stringToInsert + secondPart;

                                                    if (module.panels !== undefined) {

                                                        for (let l = 0; l < module.panels.length; l++) {

                                                            let panel = module.panels[l];

                                                            let htmlLineCopy = htmlLinePlotterPanel;

                                                            let stringToInsert;
                                                            stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                                            stringToInsert = stringToInsert.replace('@repo@', plotter.repo);
                                                            stringToInsert = stringToInsert.replace('@module@', panel.moduleName);

                                                            let firstPart = fileContent.substring(0, fileContent.indexOf('<!--PlotterPanels-->') + 20);
                                                            let secondPart = fileContent.substring(fileContent.indexOf('<!--PlotterPanels-->') + 20);

                                                            fileContent = firstPart + stringToInsert + secondPart;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }

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

                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(htmlResponse);
                response.end("\n");
                //console.log("File Sent: " + fileName);
                //
            }
            catch (err) {
                returnEmptyArray();
                console.log("File Not Found: " + fileName);
                console.log("[ERROR] server -> respondWithFile -> onFileRead -> File Not Found: " + fileName + " or Error = " + err);
            }

        }
    }
    catch (err) {
        returnEmptyArray();
    }

    function returnEmptyArray() {

        if (CONSOLE_LOG === true) { console.log("[INFO] server -> respondWithFile -> returnEmptyArray -> Entering function."); }

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setHeader("Expires", "0"); // Proxies.

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write("[]");
        response.end("\n");

    }
}



