
function newFileCloud() {

    var fileCloud = {
        getFile: getFile,
        initialize: initialize
    };

    let fileService;

    return fileCloud;

    function initialize(pTeamCodeName, pBotCodeName) {

        let bot = ecosystem.getBot(ecosystem.getTeam(pTeamCodeName), pBotCodeName);

        fileService = AzureStorage.createFileServiceWithSas(bot.storage.fileUri, bot.storage.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());

    }

    function getFile(pSet, pExchange, pMarket, pPeriodName, pDatetime, callBackFunction) {

        let fileName = pSet.fileName;
        let filePath = pSet.filePath;

        if (fileName === undefined) {

            console.log("Inconsistant data. Check the following. ");
            console.log(JSON.stringify(pSet));
            console.log(JSON.stringify(pExchange));
            console.log(JSON.stringify(pMarket));
            console.log(JSON.stringify(pPeriodName));

            throw ("Inconsistant data received.");
        }

        fileName = fileName.replace("@AssetA", pMarket.assetA);
        fileName = fileName.replace("@AssetB", pMarket.assetB);

        filePath = filePath.replace("@Exchange", pExchange.name);
        filePath = filePath.replace("@Period", pPeriodName);

        if (pDatetime !== undefined) {

            filePath = filePath.replace("@Year", pDatetime.getUTCFullYear());
            filePath = filePath.replace("@Month", pad(pDatetime.getUTCMonth() + 1, 2));
            filePath = filePath.replace("@Day", pad(pDatetime.getUTCDate(), 2));
            filePath = filePath.replace("@Hour", pad(pDatetime.getUTCHours(), 2));
            filePath = filePath.replace("@Minute", pad(pDatetime.getUTCMinutes(), 2));

        }

        fileService.getFileToText('data', filePath, fileName, undefined, onFileReceived);

        //console.log("File Requested > " + filePath);

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




