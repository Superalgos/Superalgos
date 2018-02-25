
const MODULE_NAME = "Node Server";
const START_BROWSER_APP = true;


/*
const octokit = require('@octokit/rest')()
global.atob = require("atob");

let owner = "AAMasters";
let repo = "AABruce-Indicator-Bot";
let branch = "master";
let page = 1;
let per_page = 100;
let ref = "master";
let path = "One-Min-Daily-Candles-Volumes/Interval.js";

octokit.repos.getContent({ owner, repo, path, ref }, onContent);

function onContent (error, result) {

    let decoded = atob(result.data.content);

    console.log(decoded.substring(3));

    console.log(result);

}

return;
*/

let debugMode = false;
let githubPages = new Map;

//'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

startHtttpServer();

function onRequestReceivedFromBrowser(request, response) {

    var htmlResponse;
    var requestParameters = request.url.split("/");


    switch (requestParameters[1]) {

        case "AAMasters":
            {

                if (debugMode === true) {

                    respondWithFile('../' + requestParameters[2] + "-Plotter" + '/' + requestParameters[3], response);

                } else {

                    let cacheVersion = githubPages.get(requestParameters[1] + requestParameters[2] + requestParameters[3])

                    if (cacheVersion !== undefined) {

                        respondWithContent(cacheVersion, response);

                    } else {

                        const octokit = require('@octokit/rest')()
                        global.atob = require("atob");

                        let owner = requestParameters[1];
                        let repo = requestParameters[2] + "-Plotter";
                        let branch = "master";
                        let page = 1;
                        let per_page = 100;
                        let ref = "master";
                        let path = requestParameters[3];

                        octokit.repos.getContent({ owner, repo, path, ref }, onContent);

                        function onContent(error, result) {

                            let decoded = atob(result.data.content);

                            let cleanString = decoded.substring(3); // Eliminate first 2 bytes of noise.

                            respondWithContent(cleanString, response);

                            githubPages.set(requestParameters[1] + requestParameters[2] + requestParameters[3], cleanString);

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

        case "lastTrades":
            {
                const marketId = requestParameters[2];
                const exchangeId = requestParameters[3];

                const sqlQuery = "SELECT TOP 100000 "
                    + " InternalExchangeTradeId AS Id, "
                    + " Type, "
                    + " Rate, "
                    + " AmountAssetA AS AmountA, "
                    + " AmountAssetB AS AmountB, "
                    + " Timestamp "
                    + " FROM Trades "
                    + " WHERE "
                    + " IdMarket = " + marketId + " "
                    + " AND "
                    + " IdExchange = " + exchangeId + " "
                    + " ORDER BY IdExchange ASC, IdMarket ASC, InternalExchangeTradeId DESC"
                    ;

                ////console.log("About to execute: " + sqlQuery);


                /* Then we execute the query */

                database.executeSQL(sqlQuery, function (err, resultSet) {

                    //console.log("Query executed: " + sqlQuery);

                    var myJsonString = JSON.stringify(resultSet);

                    ////console.log(myJsonString);

                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.write(myJsonString);
                    response.end("\n");
                }
                );

            }
            break;


        case "trades":
            {
                const marketId = requestParameters[2];
                const exchangeId = requestParameters[3];
                const idBegin = unescape(requestParameters[4]);
                const idEnd = unescape(requestParameters[5]);

                const sqlQuery = "SELECT "
                    + " InternalExchangeTradeId AS Id, "
                    + " Type, "
                    + " Rate, "
                    + " AmountAssetA AS AmountA, "
                    + " AmountAssetB AS AmountB, "
                    + " Timestamp "
                    + " FROM Trades "
                    + " WHERE "
                    + " IdExchange = " + exchangeId + " "
                    + " AND "
                    + " IdMarket = " + marketId + " "
                    + " AND "
                    + " InternalExchangeTradeId >= " + idBegin + " "
                    + " AND "
                    + " InternalExchangeTradeId <= " + idEnd + " "
                    + " ORDER BY IdExchange, IdMarket, InternalExchangeTradeId "
                    ;

                let records = idEnd - idBegin;
                console.log("Records Requested: " + records + " idBegin = " + idBegin + " idEnd = " + idEnd);


                /* Then we execute the query */

                database.executeSQL(sqlQuery, function (err, resultSet) {

                    //console.log("Query executed: " + sqlQuery);

                    var myJsonString = JSON.stringify(resultSet);

                    ////console.log(myJsonString);

                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.write(myJsonString);
                    response.end("\n");
                }
                );

            }
            break;


        case "orderbook":

            {
                const marketId = requestParameters[2];
                const datetimeBegin = unescape(requestParameters[3]);
                const datetimeEnd = unescape(requestParameters[4]);

                var sqlQuery = "SELECT "
                    + " Id, "
                    + " Rate, "
                    + " Amount * Rate AS AmountA, "
                    + " Amount AS AmountB, "
                    + " Type AS Type, "
                    + " DatetimeIn AS DatetimeIn, "
                    + " ISNULL(DatetimeOut, '3000-01-01') AS DatetimeOut "
                    + " FROM OrderBooks "
                    + " WHERE "
                    + " ( "
                    + " IdMarket = " + marketId + " "
                    + " ) "
                    + " AND "
                    + " ( "
                    + " DatetimeIn <= '" + datetimeEnd + "' "
                    + " ) "
                    + " AND "
                    + " ( "
                    + " ISNULL(DatetimeOut, '3000-01-01') > '" + datetimeBegin + "' "
                    + " ) "
                    ;


                //console.log(sqlQuery);


                /* Then we execute the query */

                database.executeSQL(sqlQuery, function (err, resultSet) {

                    var myJsonString = JSON.stringify(resultSet);

                    //console.log(myJsonString);

                    response.writeHead(200, { 'Content-Type': 'text/plain' });
                    response.write(myJsonString);
                    response.end("\n");
                }
                );
            }
            break;





        default:
            ////console.log("Unknown request received from the browser: " + request.url);

            if (requestParameters[1] === "") {
                requestParameters[1] = "index.html";
            }

            respondWithFile("" + requestParameters[1], response);

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
        console.log("Content Sent: " + content);

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
                console.log("File Sent: " + fileName);
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

function startHtttpServer() {

    if (START_BROWSER_APP === true) {

        try {

            gWebServer = http.createServer(onRequestReceivedFromBrowser).listen(port);
        }
        catch (err) {
            console.log(err);
        }
    }
}


