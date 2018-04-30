
function newDailyFiles() {

    const MODULE_NAME = "Daily Files";
    const INFO_LOG = false;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        getFileCursor: getFileCursor,
        setDatetime: setDatetime,
        setTimePeriod: setTimePeriod,
        getExpectedFiles: getExpectedFiles,
        getFilesLoaded: getFilesLoaded,
        initialize: initialize
    }

    let filesLoaded = 0;
    let expectedFiles = 0;

    let fileCloud;

    let marketFiles = new Map;
    let fileCursors = new Map;

    let callBackWhenFileReceived;

    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
        if (INFO_LOG === true) { logger.write("[INFO] initialize -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

        callBackWhenFileReceived = callBackFunction;

        let exchange = ecosystem.getExchange(pProduct, pExchange);

        if (exchange === undefined) {

            throw "Exchange not supoorted by this product of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pBot);

        /* Now we will get the daily files */

        for (i = 0; i < dailyFilePeriods.length; i++) {

            let periodTime = dailyFilePeriods[i][0];
            let periodName = dailyFilePeriods[i][1];

            if (pSet.validPeriods.includes(periodName) === true) {

                let fileCursor = newFileCursor();
                fileCursor.initialize(fileCloud, pDevTeam, pBot, pSet, exchange, pMarket, periodName, periodTime, pDatetime, pTimePeriod, onFileReceived);

                fileCursors.set(periodTime, fileCursor);

                expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

            }
        }
    }

    function onFileReceived(err) {

        if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> Entering function."); }

        switch (err.result) {
            case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> Received OK Response."); }
                break;
            }

            case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> Received FAIL Response."); }
                callBackWhenFileReceived(GLOBAL.DEFAULT_FAIL_RESPONSE);
                return;
            }

            case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> Received CUSTOM FAIL Response."); }
                if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> err.message = " + err.message); }

                callBackWhenFileReceived(err);
                return;
            }

            default: {

                if (INFO_LOG === true) { logger.write("[INFO] onFileReceived -> Received Unexpected Response."); }
                callBackWhenFileReceived(err);
                return;
            }
        }

        filesLoaded++;
        callBackWhenFileReceived(GLOBAL.DEFAULT_OK_RESPONSE, thisObject); // Note that the call back is called for every file loaded at each cursor.

    }

    function getFileCursor(pPeriod) {

        if (INFO_LOG === true) { logger.write("[INFO] getFileCursor -> Entering function."); }

        return fileCursors.get(pPeriod);

    }

    function setDatetime(pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        filesLoaded = 0;
        expectedFiles = 0;

        fileCursors.forEach(setDatetimeToEach)

        function setDatetimeToEach(fileCursor, key, map) {

            fileCursor.setDatetime(pDatetime, onFileReceived);
            expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

        }

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> expectedFiles = " + expectedFiles); }

    }

    function setTimePeriod(pTimePeriod, pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

        filesLoaded = 0;
        expectedFiles = 0;

        fileCursors.forEach(setTimePeriodToEach)

        function setTimePeriodToEach(fileCursor, key, map) {

            fileCursor.setTimePeriod(pTimePeriod, pDatetime, onFileReceived);
            expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

        }

        if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> expectedFiles = " + expectedFiles); }

    }

    function getExpectedFiles() {

        if (INFO_LOG === true) { logger.write("[INFO] getExpectedFiles -> Entering function."); }

        return expectedFiles;

    }

    function getFilesLoaded() {

        if (INFO_LOG === true) { logger.write("[INFO] getFilesLoaded -> Entering function."); }

        return filesLoaded;

    }
}