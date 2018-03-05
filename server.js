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

    if (CONSOLE_LOG === true) {

        console.log("I am entering the Initialize function. So far so good.");

    }

    readEcosystemConfig();

    function readEcosystemConfig() {

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
                        console.log("File Not Found: " + fileName + " or Error = " + err);
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
                    console.log("File Not Found:  Error = " + err);
                }

            }
        }
    }

    function readCompetitionsConfig() {

        if (CONSOLE_LOG === true) {

            console.log("I am entering the readCompetitionsConfig function.");

        }

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

        for (let i = 0; i < ecosystemObject.competitionHosts.length; i++) {

            let host = ecosystemObject.competitionHosts[i];

            for (let j = 0; j < host.competitions.length; j++) {

                let competition = host.competitions[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Competitions/' + host.codeName + '/' + competition.repo + '/' + competition.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

                            try {
                                responsesReceived++;

                                pData = pData.toString();
                                pData = pData.trim(); // remove first byte with some encoding.

                                let configObj = JSON.parse(pData);
                                competition.configObj = configObj;

                                if (requestsSent === responsesReceived) {

                                    readBotsConfig();

                                }
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

                    getGithubData(host.codeName, competition.repo, competition.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readCompetitionsConfig -> onDataArrived -> pData = " + pData);

                            }

                            responsesReceived++;

                            pData = pData.toString();
                            pData = pData.trim(); // remove first byte with some encoding.

                            let configObj = JSON.parse(pData);
                            competition.configObj = configObj;

                            if (requestsSent === responsesReceived) {

                                readBotsConfig();

                            }

                        }
                        catch (err) {
                            console.log("readCompetitionsConfig Error = " + err + " pData = " + pData);
                        }
                    }
                }
            }
        }
    }

    function readBotsConfig() {

        if (CONSOLE_LOG === true) {

            console.log("I am entering the readBotsConfig function.");

        }
        /*

        Each bot has its configuration at its own repo since each team must be able to change it at will.
        So what we do here is to use the master config at the AAPlatform repo that we already have on
        memory and inject into it the config of each bot. 

        */

        let requestsSent = 0;
        let responsesReceived = 0;

        for (let i = 0; i < ecosystemObject.devTeams.length; i++) {

            let devTeam = ecosystemObject.devTeams[i];

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                requestsSent++;

                if (DEBUG_MODE === true) {

                    let fs = require('fs');
                    try {
                        let fileName = '../Bots/' + devTeam.codeName + '/' + bot.repo + '/' + bot.configFile;
                        fs.readFile(fileName, onFileRead);

                        function onFileRead(err, pData) {

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
                                console.log("File Not Found: " + fileName + " or Error = " + err);
                            }

                        }
                    }
                    catch (err) {
                        console.log(err);
                    }

                } else {

                    getGithubData(devTeam.codeName, bot.repo, bot.configFile, onDataArrived)

                    function onDataArrived(pData) {

                        try {

                            if (CONSOLE_LOG === true) {

                                console.log("readBotsConfig -> onDataArrived -> pData = " + pData);

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
                            console.log("readBotsConfig Error = " + err + " pData = " + pData);
                        }
                    }
                }
            }
        }
    }
}

function startHtttpServer() {

    if (CONSOLE_LOG === true) {

        console.log("I am entering the startHtttpServer function. So far so good.");

    }

    try {

        gWebServer = http.createServer(onBrowserRequest).listen(port);
    }
    catch (err) {
        console.log(err);
    }
}

function onBrowserRequest(request, response) {

    var htmlResponse;
    var requestParameters = request.url.split("/");

    switch (requestParameters[1]) {

        case "clear-cache": {

            githubData = new Map;

            respondWithContent("command acepted", response);

        }
            break;
        case "Plotters.js":
            {
                /*

                This file is build dinamically because it has the code to instantiate the different configured Plotters. The instantiation code
                will be generated using a pre-defined string with replacement points. We will go through the configuration file to learn
                about all the possible plotters the system can load.

                */

                let fs = require('fs');
                try {
                    let fileName = 'Plotters.js';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

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

                            for (let i = 0; i < devTeams.length; i++) {

                                let devTeam = devTeams[i];

                                for (let j = 0; j < devTeam.plotters.length; j++) {

                                    let plotter = devTeam.plotters[j];

                                    let caseStringCopy = caseString;

                                    let newFunctionName = devTeam.codeName + plotter.repo + plotter.moduleName; 
                                    newFunctionName = newFunctionName.replace(/-/g, "");

                                    let stringToInsert;
                                    stringToInsert = caseStringCopy.replace('@newFunctionName@', newFunctionName);
                                    stringToInsert = stringToInsert.replace('newPlotterName', 'new' + newFunctionName);

                                    let firstPart = fileContent.substring(0,fileContent.indexOf('// Cases'));
                                    let secondPart = fileContent.substring(fileContent.indexOf('// Cases'));

                                    fileContent = firstPart + stringToInsert + secondPart;
                                    
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


        default:

            if (requestParameters[1] === "") {

                let fs = require('fs');
                try {
                    let fileName = 'index.html';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        try {

                            let fileContent = file.toString();

                            /* This is the string we will use to insert into the Plotters.js script. */

                            let htmlLine = '' + '\n' +
                                '    <script type="text/javascript" src="Plotters/@devTeam@/@repo@/@module@.js"></script>'

                            let devTeams = ecosystemObject.devTeams;

                            for (let i = 0; i < devTeams.length; i++) {

                                let devTeam = devTeams[i];

                                for (let j = 0; j < devTeam.plotters.length; j++) {

                                    let plotter = devTeam.plotters[j];

                                    /* Now each of these layers has a plotter that we need to define on the Plotter.js file. */

                                    let htmlLineCopy = htmlLine;

                                    let stringToInsert;
                                    stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName);
                                    stringToInsert = stringToInsert.replace('@repo@', plotter.repo);
                                    stringToInsert = stringToInsert.replace('@module@', plotter.moduleName);

                                    let firstPart = fileContent.substring(0, fileContent.indexOf('<!--Plotters-->') + 15);
                                    let secondPart = fileContent.substring(fileContent.indexOf('<!--Plotters-->') + 15);

                                    fileContent = firstPart + stringToInsert + secondPart;

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
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(htmlResponse);

        response.end("\n");
    }
}

function respondWithContent(content, response) {

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

    let fs = require('fs');
    try {

        fs.readFile(fileName, onFileRead);

        function onFileRead(err, file) {

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

        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
        response.setHeader("Pragma", "no-cache"); // HTTP 1.0.
        response.setHeader("Expires", "0"); // Proxies.

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write("[]");
        response.end("\n");

    }
}

function getGithubData(pOrg, pRepo, pPath, callBackFunction) {

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

            if (CONSOLE_LOG === true) {

                console.log("getGithubData - Github.com responded to request " + pOrg + '.' + pRepo + '.' + pPath + " with result = " + result.toString().substring(0,100));

            }

            if (error !== null) { console.log("getGithubData -> onContent -> " + error);}

            let decoded = atob(result.data.content);

            let cleanString = decoded.substring(3); // Eliminate first 2 bytes of ecoding info.

            githubData.set(pOrg + '.' + pRepo + '.' + pPath, cleanString);

            callBackFunction(cleanString);

        }
    }
}

