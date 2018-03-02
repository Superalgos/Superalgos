
function newFileCache() {

    let fileCache = {
        getFile: getFile,
        initialize: initialize
    }

    let fileCloud;

    let files = new Map;

    let datetime;
    
    return fileCache;

    function initialize(pTeamCodeName, pBotCodeName, pProductCodeName, pSetCodeName, pExchange, pMarket, callBackFunction) {

        let product = ecosystem.getProduct(ecosystem.getBot(ecosystem.getTeam(pTeamCodeName), pBotCodeName), pProductCodeName);

        if (product === undefined) {

            throw "Product not found at this bot of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName;

        }

        let exchange = ecosystem.getExchange(product, pExchange);

        if (exchange === undefined) {

            throw "Exchange not supoorted by this product of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName + ", pExchange = " + pExchange;

        }

        let productSet = ecosystem.getSet(product, pSetCodeName);

        if (productSet === undefined) {

            throw "Set not found at this product of the ecosystem! - pTeamCodeName = " + pTeamCodeName + ", pBotCodeName = " + pBotCodeName + ", pProductCodeName = " + pProductCodeName + ", pSetCodeName = " + pSetCodeName;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pTeamCodeName, pBotCodeName);

        /* Now we will get the market files */

        for (i = 0; i < marketFilesPeriods.length; i++) {

            let periodTime = marketFilesPeriods[i][0];
            let periodName = marketFilesPeriods[i][1];

            if (productSet.validPeriods.includes(periodName) === true) {

                fileCloud.getFile(productSet, exchange, pMarket, periodName, undefined, onFileReceived);

                function onFileReceived(file) {

                    files.set(periodTime, file);

                    callBackFunction(); // Note that the call back is called for every file loaded.

                }
            }
        }
    }
  
    function getFile(pPeriod) {

        return files.get(pPeriod);

    }

}