
function newFile() {

    let fileObject = {
        getFile: getFile,
        initialize: initialize
    }

    let fileCloud;
    let file;

    return fileObject;

    function initialize(pTeamCodeName, pBotCodeName, pProductCodeName, pLayerCodeName, pExchange, pMarket, callBackFunction) {

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

        /* Now we will get the file */

        fileCloud.getFile(product, exchange, pMarket, undefined, undefined, onFileReceived);

        function onFileReceived(pFile) {

            file = pFile;

            callBackFunction();

        }

    }

    function getFile() {

        return file;

    }

}