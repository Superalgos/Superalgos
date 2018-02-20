
function newFileCache() {

    let marketFilesPeriods =
        '[' +
        '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
        '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
        '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
        '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
        '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
        '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
        '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
        '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

    marketFilesPeriods = JSON.parse(marketFilesPeriods);

    let dailyFilePeriods =
        '[' +
        '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
        '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
        '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
        '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
        '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
        '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
        '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
        '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
        '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
        '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
        '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

    dailyFilePeriods = JSON.parse(dailyFilePeriods);

    let fileCache = {
        getMarketFile: getMarketFile,
        getFileCursor: getFileCursor,
        setDatetime: setDatetime,
        initialize: initialize
    }

    let fileCloud;

    let marketFiles = new Map;
    let fileCursors = new Map;

    let datetime;
    
    return fileCache;

    function initialize(pTeamCodeName, pBotCodeName, pProductCodeName, pLayerCodeName, pExchange, pMarket, pDatetime, callBackFunction) {

        let product = ecosystem.getProduct(ecosystem.getBot(ecosystem.getTeam(pTeamCodeName), pBotCodeName), pProductCodeName);

        if (product === undefined) {

            throw "Product not found at this bot of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName;

        }

        let exchange = ecosystem.getExchange(product, pExchange);

        if (exchange === undefined) {

            throw "Exchange not supoorted by this product of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName + ", pExchange = " + pExchange;

        }

        let layer = ecosystem.getLayer(product, pLayerCodeName);

        if (layer === undefined) {

            throw "Layer not found at this product of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName + ", pLayerCodeName = " + pLayerCodeName;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pTeamCodeName, pBotCodeName);

        for (i = 0; i < marketFilesPeriods.length; i++) {

            let periodTime = marketFilesPeriods[i][0];
            let periodName = marketFilesPeriods[i][1];

            if (layer.validPeriods.includes(periodName) === true) {

                fileCloud.getMarketFile(product, exchange, pMarket, periodName, onFileReceived);

                function onFileReceived(file) {

                    marketFiles.set(periodTime, file);

                    callBackFunction(); // Note that the call back is called for every file loaded.

                }
            }
        }
    }

  
    function getMarketFile(pPeriod) {

        return marketFiles.get(pPeriod);

    }


    function getFileCursor(pPeriod) {

        return fileCursors.get(pPeriod);

    }

    function setDatetime(newDatetime) {

        datetime = newDatetime;

    }

}