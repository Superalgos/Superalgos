
const MODULE_NAME = "Node Server";
const START_BROWSER_APP = false;

let debugMode = true;           // This forces the server to read Plotters from the local drive.
let githubPages = new Map;
let ecosystem;
let ecosystemObject;

//'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

initialize();

function initialize() {

    let fs = require('fs');
    try {
        let fileName = 'ecosystem.json';
        fs.readFile(fileName, onFileRead);

        function onFileRead(err, file) {

            try {
                ecosystem = file.toString();
                ecosystem = ecosystem.trim(); // remove first byte with some encoding.

                ecosystemObject = JSON.parse(ecosystem);
                startHtttpServer();
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

function startHtttpServer() {

    if (START_BROWSER_APP === true) {

        try {

            gWebServer = http.createServer(onBrowserRequest).listen(port);
        }
        catch (err) {
            console.log(err);
        }
    }
}

function onBrowserRequest(request, response) {

    var htmlResponse;
    var requestParameters = request.url.split("/");


    switch (requestParameters[1]) {

        case "Plotters.js":
            {
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

                                    /* Now each of these layers has a plotter that we need to define on the Plotter.js file. */

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
                let fs = require('fs');
                try {
                    let fileName = 'Ecosystem.js';
                    fs.readFile(fileName, onFileRead);

                    function onFileRead(err, file) {

                        try {

                            let fileContent = file.toString();
                            let trimmedEcosystem = ecosystem.trim(); 

                            fileContent = fileContent.replace('"@ecosystem.json@"', trimmedEcosystem); 

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

                if (debugMode === true) {

                    respondWithFile('../Plotters/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response);

                } else {

                    let cacheVersion = githubPages.get(requestParameters[2] + requestParameters[3] + requestParameters[4])

                    if (cacheVersion !== undefined) {

                        respondWithContent(cacheVersion, response);

                    } else {

                        const octokit = require('@octokit/rest')()
                        global.atob = require("atob");

                        let owner = requestParameters[2];
                        let repo = requestParameters[3];
                        let branch = "master";
                        let page = 1;
                        let per_page = 100;
                        let ref = "master";
                        let path = requestParameters[4];

                        octokit.repos.getContent({ owner, repo, path, ref }, onContent);

                        function onContent(error, result) {

                            let decoded = atob(result.data.content);

                            let cleanString = decoded.substring(3); // Eliminate first 2 bytes of noise.

                            respondWithContent(cleanString, response);

                            githubPages.set(requestParameters[2] + requestParameters[3] + requestParameters[4], cleanString);

                        }
                    }
                }
            }
            break; 

        case "CandleTechnicalAnalisys":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
            }
            break; 

        case "VolumeTechnicalAnalisys":
            {
                respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response);
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

        case "Indicators":
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




