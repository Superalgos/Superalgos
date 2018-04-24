const CONSOLE_LOG = true;

if (CONSOLE_LOG === true) {

    console.log("Node Server Starting. Be happy, everything is going to be allright. :-)");

}

const DEBUG_MODE = false;           // This forces the server to read Plotters from the local drive.

if (CONSOLE_LOG === true && DEBUG_MODE === true) {

    console.log("Hey! if you expect this to run on production I have some bad news for you son, DEBUG_MODE is true, that means the server wont find your local files. ");

}

let githubData = new Map;
let ecosystem;
let ecosystemObject;

//'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

initialize();

function initialize() {

    if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> Entering function."); }

    readEcosystemConfig();

    function readEcosystemConfig() {

        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readEcosystemConfig -> Entering function."); }

        /*

        This configuration file is the backbone of the system. The first file we are going to get is a template where other configurations are
        injected and the files ends up inflated with all these configs in one single JSON object that in turn is later injected into a
        javascript module with an object that is going to instantiate it at run-time.

        */

        if (DEBUG_MODE === true) {

            let fs = require('fs');
            try {
                let fileName = '../AAPlatform/ecosystem.json';
                fs.readFile(fileName, onFileRead);

                function onFileRead(err, file) {

                    try {
                        ecosystem = file.toString();
                        ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                        ecosystemObject = JSON.parse(ecosystem);
                        readCompetitionsConfig();
                    }
                    catch (err) {
                        console.log("readEcosystemConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                    }

                }
            }
            catch (err) {
                console.log(err);
            }

        } else {

            getGithubData('AdvancedAlgos', 'AAPlatform', 'ecosystem.json', onDataArrived)

            function onDataArrived(pData) {

                try {
                    ecosystem = pData.toString();
                    ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                    ecosystemObject = JSON.parse(ecosystem);
                    readCompetitionsConfig();
                }
                catch (err) {
                    console.log("readEcosystemConfig -> onDataArrived -> Error = " + err);
                }

            }
        }
    }

    function readCompetitionsConfig() {

        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> Entering function."); }

        /*

        The file previously read contains the reference to all competiotion hosts and their competitions. We use these references to load the specific
        configurations and inject them to the first file.

        Lets remember that these files can come from 3 different sources, and this patter is later repeated many times down this module:

            1.If we are in debug mode, from the filesystem.
            2.If we are in production from a cache we keep in memory at the node server.
            3.If the cache does not have the file, then we get it from github.com, put in on the cache and serve it.

        2 and 3 are done by the getGithubData function.

        */

        let requestsSent = 0;
        let responsesReceived = 0;

        for (let i = 0; i < ecosystemObject.hosts.length; i++) {

            let host = ecosystemObject.hosts[i];

            /* In this first section we will load the competitions configurations. */

            for (let j = 0; j < host.competitions.length; j++) {

                let competition = host.competitions[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Competitions/' + host.codeName + '/' + competition.repo + '/' + competition.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onFileRead -> Entering function."); }
                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onFileRead -> fileName = " + fileName); }

                            try {
                                responsesReceived++;

                                pData = pData.toString();
                                pData = pData.trim(); // remove first byte with some encoding.

                                let configObj = JSON.parse(pData);

                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                configObj.repo = competition.repo;
                                configObj.configFile = competition.configFile;

                                host.competitions[j] = configObj;

                                if (requestsSent === responsesReceived) {

                                    readBotsAndPlottersConfig();

                                }
                            }
                            catch (err) {
                                console.log("readCompetitionsConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log(err);
                    }

                } else {

                    getGithubData(host.codeName, competition.repo, competition.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> host.codeName = " + host.codeName); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> competition.repo = " + competition.repo); }

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readCompetitionsConfig -> onDataArrived -> pData = " + pData);

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

                                readBotsAndPlottersConfig();

                            }

                        }
                        catch (err) {
                            console.log("readCompetitionsConfig -> onDataArrived -> Error = " + err);
                        }
                    }
                }
            }

            /* In this second section we will load the plotters configurations. */

            for (let j = 0; j < host.plotters.length; j++) {

                let plotter = host.plotters[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Plotters/' + host.codeName + '/' + plotter.repo + '/' + plotter.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onFileRead -> Entering function."); }
                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onFileRead -> fileName = " + fileName); }

                            try {
                                responsesReceived++;

                                pData = pData.toString();
                                pData = pData.trim(); // remove first byte with some encoding.

                                let configObj = JSON.parse(pData);

                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                configObj.repo = plotter.repo;
                                configObj.configFile = plotter.configFile;

                                host.plotters[j] = configObj;

                                if (requestsSent === responsesReceived) {

                                    readBotsAndPlottersConfig();

                                }
                            }
                            catch (err) {
                                console.log("readCompetitionsConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log(err);
                    }

                } else {

                    getGithubData(host.codeName, plotter.repo, plotter.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> host.codeName = " + host.codeName); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readCompetitionsConfig -> onDataArrived -> plotter.repo = " + plotter.repo); }

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readCompetitionsConfig -> onDataArrived -> pData = " + pData);

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

                                readBotsAndPlottersConfig();

                            }

                        }
                        catch (err) {
                            console.log("readCompetitionsConfig -> onDataArrived -> Error = " + err);
                        }
                    }
                }
            }
        }
    }

    function readBotsAndPlottersConfig() {

        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> Entering function."); }

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

            /* In the next section we are loading the bots configurations. */

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Bots/' + devTeam.codeName + '/' + bot.repo + '/' + bot.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onFileRead -> Entering function."); }
                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onFileRead -> fileName = " + fileName); }

                            try {
                                responsesReceived++;

                                pData = pData.toString();
                                pData = pData.trim(); // remove first byte with some encoding.

                                let configObj = JSON.parse(pData);

                                /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                                configObj.repo = bot.repo;
                                configObj.configFile = bot.configFile;

                                devTeam.bots[j] = configObj;

                                if (requestsSent === responsesReceived) {

                                    startHtttpServer();

                                }
                            }
                            catch (err) {
                                console.log("readBotsAndPlottersConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log(err);
                    }

                } else {

                    getGithubData(devTeam.codeName, bot.repo, bot.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> bot.repo = " + bot.repo); }

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readBotsAndPlottersConfig -> onDataArrived -> pData = " + pData);

                            }

                            responsesReceived++;

                            pData = pData.toString();
                            pData = pData.trim(); // remove first byte with some encoding.

                            let configObj = JSON.parse(pData);

                            /* Since we are going to replace the full bot object and we dont want to lose these two properties, we do this: */

                            configObj.repo = bot.repo;
                            configObj.configFile = bot.configFile;

                            devTeam.bots[j] = configObj;

                            if (requestsSent === responsesReceived) {

                                startHtttpServer();

                            }

                        }
                        catch (err) {
                            console.log("readBotsAndPlottersConfig -> onDataArrived -> Error = " + err);
                        }
                    }
                }
            }

            /* In the next section we are loading the plotters configurations. */

            for (let j = 0; j < devTeam.plotters.length; j++) {

                let plotter = devTeam.plotters[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Plotters/' + devTeam.codeName + '/' + plotter.repo + '/' + plotter.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onFileRead -> Entering function."); }
                            if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onFileRead -> fileName = " + fileName); }

                            try {
                                responsesReceived++;

                                pData = pData.toString();
                                pData = pData.trim(); // remove first byte with some encoding.

                                let configObj = JSON.parse(pData);

                                /* Since we are going to replace the full plotter object and we dont want to lose these two properties, we do this: */

                                configObj.repo = plotter.repo;
                                configObj.configFile = plotter.configFile;

                                devTeam.plotters[j] = configObj;

                                if (requestsSent === responsesReceived) {

                                    startHtttpServer();

                                }
                            }
                            catch (err) {
                                console.log("readPlottersConfig -> onFileRead -> File = " + fileName + " Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log(err);
                    }

                } else {

                    getGithubData(devTeam.codeName, plotter.repo, plotter.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> devTeam.codeName = " + devTeam.codeName); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] initialize -> readBotsAndPlottersConfig -> onDataArrived -> plotter.repo = " + plotter.repo); }

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readBotsAndPlottersConfig -> onDataArrived -> pData = " + pData);

                            }

                            responsesReceived++;

                            pData = pData.toString();
                            pData = pData.trim(); // remove first byte with some encoding.

                            let configObj = JSON.parse(pData);

                            /* Since we are going to replace the full plotter object and we dont want to lose these two properties, we do this: */

                            configObj.repo = plotter.repo;
                            configObj.configFile = plotter.configFile;

                            devTeam.plotters[j] = configObj;

                            if (requestsSent === responsesReceived) {

                                startHtttpServer();

                            }

                        }
                        catch (err) {
                            console.log("readBotsAndPlottersConfig -> onDataArrived -> Error = " + err);
                        }
                    }
                }
            }
        }
    }
}

function startHtttpServer() {

    if (CONSOLE_LOG === true) { console.log("[INFO] startHtttpServer -> Entering function."); }

    try {

        gWebServer = http.createServer(onBrowserRequest).listen(port);
    }
    catch (err) {
        console.log(err);
    }
}

function onBrowserRequest(request, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> Entering function."); }
    if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> request.url = " + request.url); }

    var htmlResponse;
    var requestParameters = request.url.split("/");

    switch (requestParameters[1]) {

        case "clear-cache": {

            githubData = new Map;

            respondWithContent("command acepted", response);

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

                        if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> Entering function."); }

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

                                if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addToFileContent -> Entering function."); }

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
                            console.log("File Not Found: " + fileName + " or Error = " + err);
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

                        if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> Entering function."); }

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

                                if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addToFileContent -> Entering function."); }

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
                            console.log("File Not Found: " + fileName + " or Error = " + err);
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

                        if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();
                            let insertContent = JSON.stringify(ecosystemObject); 

                            fileContent = fileContent.replace('"@ecosystem.json@"', insertContent); 

                            respondWithContent(fileContent, response);

                        }
                        catch (err) {
                            console.log("File Not Found: " + fileName);
                        }

                    }
                }
                catch (err) {
                    console.log(err);
                }

            }
            break;

        case "Plotters": // This means the plotter folder, not to be confused with the Plotters script!
            {

                if (DEBUG_MODE === true) {

                    respondWithFile('../Plotters/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response);

                } else {

                    getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived)

                    function onDataArrived(pData) {

                        respondWithContent(pData, response);

                    }
                }
            }
            break; 

        case "PlotterPanels": // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
            {

                if (DEBUG_MODE === true) {

                    respondWithFile('../Plotters/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response);

                } else {

                    getGithubData(requestParameters[2], requestParameters[3], requestParameters[4], onDataArrived)

                    function onDataArrived(pData) {

                        respondWithContent(pData, response);

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


        default:

            if (requestParameters[1] === "") {

                let fs = require('fs');
                try {
                    let fileName = 'index.html';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> Entering function."); }

                        try {

                            let fileContent = file.toString();

                            addPlotters();
                            addImages();

                            function addPlotters() {

                                if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addPlotters -> Entering function."); }

                                let htmlLinePlotter = '' + '\n' +
                                    '    <script type="text/javascript" src="Plotters/@devTeam@/@repo@/@module@.js"></script>'

                                let htmlLinePlotterPanel = '' + '\n' +
                                    '    <script type="text/javascript" src="PlotterPanels/@devTeam@/@repo@/@module@.js"></script>'

                                let devTeams = ecosystemObject.devTeams;
                                let hosts = ecosystemObject.hosts;

                                addScript(devTeams);
                                addScript(hosts);

                                function addScript(pDevTeamsOrHosts) {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addPlotters -> addScript -> Entering function."); }

                                    for (let i = 0; i < pDevTeamsOrHosts.length; i++) {

                                        let devTeam = pDevTeamsOrHosts[i];

                                        for (let j = 0; j < devTeam.plotters.length; j++) {

                                            let plotter = devTeam.plotters[j];

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

                            function addImages() {

                                if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addImages -> Entering function."); }

                                const htmlLine = '' + '\n' +
                                    '    <img id="@id@" width="0" height="0" src="https://raw.githubusercontent.com/@devTeam@/@repo@/master/@image@">'

                                let devTeams = ecosystemObject.devTeams;

                                addScript(devTeams);

                                function addScript(pDevTeams) {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> onFileRead -> addImages -> addScript -> Entering function."); }

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
                            console.log("File Not Found: " + fileName + " or Error = " + err);
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

        if (CONSOLE_LOG === true) { console.log("[INFO] onBrowserRequest -> sendResponseToBrowser -> Entering function."); }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(htmlResponse);

        response.end("\n");
    }
}

function respondWithContent(content, response) {

    if (CONSOLE_LOG === true) { console.log("[INFO] respondWithContent -> Entering function."); }

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

    if (CONSOLE_LOG === true) { console.log("[INFO] respondWithFile -> Entering function."); }

    let fs = require('fs');
    try {

        fs.readFile(fileName, onFileRead);

        function onFileRead(err, file) {

            if (CONSOLE_LOG === true) { console.log("[INFO] respondWithFile -> onFileRead -> Entering function."); }

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
            }

        }
    }
    catch (err) {
        returnEmptyArray();
    }

    function returnEmptyArray() {

        if (CONSOLE_LOG === true) { console.log("[INFO] respondWithFile -> returnEmptyArray -> Entering function."); }

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setHeader("Expires", "0"); // Proxies.

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write("[]");
        response.end("\n");

    }
}

function getGithubData(pOrg, pRepo, pPath, callBackFunction) {

    if (CONSOLE_LOG === true) { console.log("[INFO] getGithubData -> Entering function."); }

    let cacheVersion = githubData.get(pOrg + '.' + pRepo + '.' + pPath)

    if (cacheVersion !== undefined) {

        if (CONSOLE_LOG === true) {

            console.log("getGithubData - " + pOrg + '.' + pRepo + '.' + pPath + " found at cache.  :-) ");

        }

        callBackFunction(cacheVersion);

    } else {

        if (CONSOLE_LOG === true) {

            console.log("getGithubData - " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache.  :-( ");

        }

        const octokit = require('@octokit/rest')()
        global.atob = require("atob");

        let owner = pOrg;
        let repo = pRepo;
        let branch = "master";
        let page = 1;
        let per_page = 100;
        let ref = "master";
        let path = pPath;

        octokit.repos.getContent({ owner, repo, path, ref }, onContent);

        function onContent(error, result) {

            if (CONSOLE_LOG === true) { console.log("[INFO] getGithubData -> onContent -> Entering function."); }

            if (CONSOLE_LOG === true) {

                console.log("[INFO] getGithubData -> onContent -> Github.com responded to request " + pOrg + '.' + pRepo + '.' + pPath + " with result = " + result.toString().substring(0,100));

            }

            if (error !== null) { console.log("getGithubData -> onContent -> " + error);}

            let decoded = atob(result.data.content);

            /*

            This method usually brings up to 3 characters of encoding info at the begining of the JSON string which destroys the JSON format.
            We will run the following code with the intention to eliminate this problem. 

            */

            let cleanString = decoded;
            let jsonTest;

            try {
                jsonTest = JSON.parse(cleanString);
            } catch (err) {
                cleanString = decoded.substring(1);
                try {
                    jsonTest = JSON.parse(cleanString);
                } catch (err) {
                    cleanString = decoded.substring(2);
                    try {
                        jsonTest = JSON.parse(cleanString);
                    } catch (err) {
                        cleanString = decoded.substring(3);
                        try {
                            jsonTest = JSON.parse(cleanString);
                        } catch (err) {
                            console.log("getGithubData -> onContent -> Could not clean the data received -> Data = " + decoded.substring(0, 50));
                        }
                    }
                }
            }
           
            githubData.set(pOrg + '.' + pRepo + '.' + pPath, cleanString);

            callBackFunction(cleanString);

        }
    }
}

