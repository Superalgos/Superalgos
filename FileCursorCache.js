
function newFileCursorCache() {

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

    return fileCursorCache;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

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

                function onFileReceived() {

                    filesLoaded++;
                    callBackFunction(); // Note that the call back is called for every file loaded at each cursor.

                }
            }
        }
    }

    function getFileCursor(pPeriod) {

        return fileCursors.get(pPeriod);

    }

    function setDatetime(pDatetime) {

        fileCursors.forEach(setDatetimeToEach)

        function setDatetimeToEach(value, key, map) {

            value.setDatetime(pDatetime);

        }
    }

    function setTimePeriod(pTimePeriod) {

        fileCursors.forEach(setTimePeriodToEach)

        function setTimePeriodToEach(value, key, map) {

            value.setTimePeriod(pTimePeriod);

        }
    }

    function getExpectedFiles() {

        return expectedFiles;

    }

    function getFilesLoaded() {

        return filesLoaded;

    }
}