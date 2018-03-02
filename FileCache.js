
function newFileCache() {

    let fileCache = {
        getFile: getFile,
        getExpectedFiles: getExpectedFiles,
        getFilesLoaded: getFilesLoaded,
        initialize: initialize
    }

    let filesLoaded = 0;

    let fileCloud;

    let files = new Map;

    let datetime;
    
    return fileCache;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {

        let exchange = ecosystem.getExchange(pProduct, pExchange);

        if (exchange === undefined) {

            throw "Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pBot);

        /* Now we will get the market files */

        for (i = 0; i < marketFilesPeriods.length; i++) {

            let periodTime = marketFilesPeriods[i][0];
            let periodName = marketFilesPeriods[i][1];

            if (pSet.validPeriods.includes(periodName) === true) {

                fileCloud.getFile(pSet, exchange, pMarket, periodName, undefined, onFileReceived);

                function onFileReceived(file) {

                    files.set(periodTime, file);

                    filesLoaded++;

                    callBackFunction(); // Note that the callback is called for every file loaded.

                }
            }
        }
    }
  
    function getFile(pPeriod) {

        return files.get(pPeriod);

    }

    function getExpectedFiles() {

        return marketFilesPeriods.length;

    }

    function getFilesLoaded() {

        return filesLoaded;

    }

}