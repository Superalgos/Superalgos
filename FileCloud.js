
function newFileCloud() {

    var fileCloud = {
        getMarketFile: getMarketFile,
        initialize: initialize
    };

    let fileService;

    return fileCloud;

    function initialize(pTeamCodeName, pBotCodeName) {

        let bot = ecosystem.getBot(ecosystem.getTeam(pTeamCodeName), pBotCodeName);

        fileService = AzureStorage.createFileServiceWithSas(bot.storage.fileUri, bot.storage.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());

    }

    function getMarketFile(pProduct, pExchange, pMarket, pPeriodName, callBackFunction) {

        let fileName = pProduct.fileName;
        let filePath = pProduct.filePath;

        fileName.replace("@AssetA", pMarket.assetA);
        fileName.replace("@AssetB", pMarket.assetB);

        filePath.replace("@Exchange", pExchange.name);
        filePath.replace("@Period", pPeriodName);

        fileService.getFileToText('data', filePath, fileName, undefined, onFileReceived);

        function onFileReceived(err, text, response) {

            let data;

            if (err) {

                data = JSON.parse("[]");

            } else {

                try {

                    data = JSON.parse(text);

                } catch (err) {

                    data = JSON.parse("[]");

                }
            }

            callBackFunction(data);

        }
    }
}




