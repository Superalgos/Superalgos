
/*

This module is for enabling the AACloud to run at the browser.

When running at the clode on NodeJS some things work diffently that at the browser. That gap will be fixed by the functions at this module.

*/





function webRequire(pModulePath) {

    switch (pModulePath) {

        case 'fs': {

            return newWebFS();
        }
        case 'azure-storage': {

            return AzureStorage.Blob;
        }
        case './EventHandler': {

            let MODULE = {};
            MODULE.newEventHandler = newEventHandler;
            return MODULE;
        }
        case './BlobStorage': {

            let MODULE = {};
            MODULE.newBlobStorage = newBlobStorage;
            return MODULE;
        }
        case './DebugLog': {

            let MODULE = {};
            MODULE.newDebugLog = newDebugLog;
            return MODULE;
        }
        case './TradingBotProcessMainLoop': {

            let MODULE = {};
            MODULE.newTradingBotProcessMainLoop = newTradingBotProcessMainLoop;
            return MODULE;
        }
        case './ExtractionBotProcessMainLoop': {

            let MODULE = {};
            MODULE.newExtractionBotProcessMainLoop = newExtractionBotProcessMainLoop;
            return MODULE;
        }
        case './IndicatorBotProcessMainLoop': {

            let MODULE = {};
            MODULE.newIndicatorBotProcessMainLoop = newIndicatorBotProcessMainLoop;
            return MODULE;
        }
        case './CloudUtilities': {

            let MODULE = {};
            MODULE.newCloudUtilities = newCloudUtilities;
            return MODULE;
        }
        case './PoloniexAPIClient': {

            let MODULE = {};
            MODULE.newPoloniexAPIClient = newPoloniexAPIClient;
            return MODULE;
        }
        case './ExchangeAPI': {

            let MODULE = {};
            MODULE.newExchangeAPI = newExchangeAPI;
            return MODULE;
        }
        case './Context': {

            let MODULE = {};
            MODULE.newContext = newContext;
            return MODULE;
        }
        case './Assistant': {

            let MODULE = {};
            MODULE.newAssistant = newAssistant;
            return MODULE;
        }
        case './StatusReport': {

            let MODULE = {};
            MODULE.newStatusReport = newStatusReport;
            return MODULE;
        }
        case './DataSet': {

            let MODULE = {};
            MODULE.newDataSet = newDataSet;
            return MODULE;
        }
        case './StatusDependencies': {

            let MODULE = {};
            MODULE.newStatusDependencies = newStatusDependencies;
            return MODULE;
        }
        case './DataDependencies': {

            let MODULE = {};
            MODULE.newDataDependencies = newDataDependencies;
            return MODULE;
        }
        case './CloudRequire': {

            let MODULE = {};
            MODULE.newCloudRequire = newCloudRequire;
            return MODULE;
        }
        default: {
            console.log(pModulePath + " not found. ");
        }
    }
}

function downloadModule(pPath, callBackFunction) {

    /*  We will need this to load individual bots modules. */

    REQUIREJS([pPath], onRequired);

    function onRequired(pModule) {

        console.log("CloudVM " + pPath + " downloaded.");

        let MODULE = {};
        MODULE.newUserBot = newUserBot;
        callBackFunction(MODULE);
    }
}

function callServer(pContentToSend, pPath, callBackFunction) {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            callBackFunction(xhttp.responseText);

        }
    };

    if (pContentToSend === undefined) {

        xhttp.open("GET", pPath, true);
        xhttp.send();

    } else {

        let blob = new Blob([pContentToSend], { type: 'text/plain' });

        xhttp.open("POST", pPath, true);
        xhttp.send(blob);

    }
}



