
function newFileCursorCache() {

    const CONSOLE_LOG = false;

    let fileCursorCache = {
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

    return fileCursorCache;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

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
                fileCursor.initialize(fileCloud, pSet, exchange, pMarket, periodName, periodTime, pDatetime, pTimePeriod, onFileReceived);

                fileCursors.set(periodTime, fileCursor);

                expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

            }
        }
    }

    function onFileReceived() {

        console.log("FileCursorCache -> onFileReceived")

        filesLoaded++;
        callBackWhenFileReceived(); // Note that the call back is called for every file loaded at each cursor.

    }

    function getFileCursor(pPeriod) {

        return fileCursors.get(pPeriod);

    }

    function setDatetime(pDatetime) {

        filesLoaded = 0;
        expectedFiles = 0;

        fileCursors.forEach(setDatetimeToEach)

        function setDatetimeToEach(fileCursor, key, map) {

            fileCursor.setDatetime(pDatetime, onFileReceived);
            expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

        }

        if (CONSOLE_LOG === true) {

            console.log("FileCursorCache -> setDatetime -> expectedFiles = " + expectedFiles);

        }
    }

    function setTimePeriod(pTimePeriod, pDatetime) {

        filesLoaded = 0;
        expectedFiles = 0;

        fileCursors.forEach(setTimePeriodToEach)

        function setTimePeriodToEach(fileCursor, key, map) {

            fileCursor.setTimePeriod(pTimePeriod, pDatetime, onFileReceived);
            expectedFiles = expectedFiles + fileCursor.getExpectedFiles();

        }

        if (CONSOLE_LOG === true) {

            console.log("FileCursorCache -> setTimePeriod -> expectedFiles = " + expectedFiles);

        }
    }

    function getExpectedFiles() {

        return expectedFiles;

    }

    function getFilesLoaded() {

        return filesLoaded;

    }
}