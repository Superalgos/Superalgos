
function newFile() {  

    let fileObject = {
        getFile: getFile,
        initialize: initialize
    }

    let fileCloud;
    let file;

    return fileObject;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {

        let exchange = ecosystem.getExchange(pProduct, pExchange);

        if (pExchange !== undefined && exchange === undefined) { // We support no exchange as a parameter, but if provided, then it must be at the list of exchanges of that product.

            throw "Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pBot);

        /* Now we will get the file */

        fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, onFileReceived);

        function onFileReceived(pFile) {

            file = pFile;

            callBackFunction();

        }

    }

    function getFile() {

        return file;

    }

}