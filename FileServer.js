

/* This module is about to be replaced by FileClound. */

function newFileServer() {

    const EXCHANGE_NAME = "Poloniex";

    const CANDLES_FOLDER_NAME = "Candles";
    const CANDLES_ONE_MIN = "One-Min";

    const VOLUMES_FOLDER_NAME = "Volumes";
    const VOLUMES_ONE_MIN = "One-Min";

    var httpServer;             // This is the object that allows as to make calls to the fileServer.

    var fileServer = {
        getMarkets: getMarkets,
        getMarketFilesCandles: getMarketFilesCandles,
        getMarketIndexVolumes: getMarketIndexVolumes,
        getDailyFile: getDailyFile,
        initialize: initialize
    };

    const account = 'aadata';
    const sas = '?sv=2017-04-17&ss=f&srt=sco&sp=r&se=2018-12-01T00:09:44Z&st=2017-12-01T13:09:44Z&spr=https,http&sig=J60UlQuUqh9Hd1Pm0PqIF6yari3D3TkGEz1fSNQJWks%3D';
    const fileUri = 'https://' + account + '.file.core.windows.net';

    let fileService;

    let charlyFileService;
    let carolFileService;
    let bruceFileService;
    let oliviaFileService;

    const genericBot = {
        account: 'aadata',
        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=r&se=2018-12-01T00:09:44Z&st=2017-12-01T13:09:44Z&spr=https,http&sig=J60UlQuUqh9Hd1Pm0PqIF6yari3D3TkGEz1fSNQJWks%3D',
        fileUri: 'https://' + 'aadata' + '.file.core.windows.net'
    };

    const charlyBot = {
        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=rc&se=2018-12-31T02:33:36Z&st=2018-02-01T18:33:36Z&spr=https&sig=xFTcopdKq0f60wl2iuukbtIpcLwxZVKzlw5BzpJfo5g%3D',
        fileUri: 'https://' + 'aacharly' + '.file.core.windows.net'
    };

    const carolBot = {
        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=r&se=2018-12-01T00:09:44Z&st=2017-12-01T13:09:44Z&spr=https,http&sig=J60UlQuUqh9Hd1Pm0PqIF6yari3D3TkGEz1fSNQJWks%3D',
        fileUri: 'https://' + 'aadata' + '.file.core.windows.net'
    };

    const bruceBot = {
        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=r&se=2018-12-31T02:32:04Z&st=2018-02-01T18:32:04Z&spr=https&sig=SbZI6bvAE1MBxna2NOvfgMroPFZNjAyaHUsAPvh11hg%3D',
        fileUri: 'https://' + 'aabruce' + '.file.core.windows.net'
    };

    const oliviaBot = {
        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=rl&se=2018-12-31T02:34:32Z&st=2018-02-01T18:34:32Z&spr=https,http&sig=24UJjGDVpPrHjhBoZtt3iKj4sxgenfSV4VTJD2v0q1U%3D',
        fileUri: 'https://' + 'aaolivia' + '.file.core.windows.net'
    };

    return fileServer;

    function initialize() {

        httpServer = new XMLHttpRequest();

        fileService = AzureStorage.createFileServiceWithSas(fileUri, sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());

        charlyFileService = AzureStorage.createFileServiceWithSas(charlyBot.fileUri, charlyBot.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());
        carolFileService = AzureStorage.createFileServiceWithSas(carolBot.fileUri, carolBot.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());
        bruceFileService = AzureStorage.createFileServiceWithSas(bruceBot.fileUri, bruceBot.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());
        oliviaFileService = AzureStorage.createFileServiceWithSas(oliviaBot.fileUri, oliviaBot.sas).withFilter(new AzureStorage.ExponentialRetryPolicyFilter());

    }

    function getMarketFilesCandles(exchangeId, marketId, callBackFunction) {

        //let fileName = '' + market.assetA + '_' + market.assetB + '.json';

        let fileName = '' + 'USDT' + '_' + 'BTC' + '.json';
        let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + "/Multi-Period-Market/24-hs";

        oliviaFileService.getFileToText('data', filePath, fileName, undefined, onFileReceived);

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

    function getMarketIndexVolumes(exchangeId, marketId, callBackFunction) {

        //let fileName = '' + market.assetA + '_' + market.assetB + '.json';

        let fileName = '' + 'USDT' + '_' + 'BTC' + '.json';
        let filePath = EXCHANGE_NAME + "/Output/" + VOLUMES_FOLDER_NAME + "/Multi-Period-Market/24-hs";

        oliviaFileService.getFileToText('data', filePath, fileName, undefined, onFileReceived);

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


    function getDailyFile(exchangeId, marketId, date, callBackFunction) {

        let fileName = '' + 'USDT' + '_' + 'BTC' + '.json';

        let dateForPath = date.getUTCFullYear() + '/' + pad(date.getUTCMonth() + 1, 2) + '/' + pad(date.getUTCDate(), 2);

        let filePath = EXCHANGE_NAME + "/Output/" + CANDLES_FOLDER_NAME + '/' + CANDLES_ONE_MIN + '/' + dateForPath;

        bruceFileService.getFileToText('data', filePath, fileName, undefined, onFileReceived);

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




    function getMarkets(exchangeId, callBackFunction) {

        let fileName = "Markets_" + exchangeId + "_USDT_BTC" + ".json";

        fileService.getFileToText('data', 'other-files', fileName, undefined, onFileReceived);

        function onFileReceived(err, text, response) {

            if (err) {

                let data = JSON.parse("[]");
                callBackFunction(data);

            } else {

                var fileString = text;
                let cleanString = fileString;

                /* Dont know why but sometimes files comes with a first characater that is not supposed to be there and you can not see it at the file opened with notepad */

                if (fileString[0] !== "[") {

                    cleanString = '';

                    for (let i = 1; i < fileString.length; i++) {
                        cleanString = cleanString + fileString[i];
                    }
                }

                let data = JSON.parse(cleanString);
                callBackFunction(data);

            }
        }
    }





    function checkResponse(callBackFunction) {

        if (httpServer.status === 404) {

            let data = JSON.parse("[]");

            callBackFunction(data);

        }

        if (httpServer.readyState === 4 && httpServer.status === 200) {

            let data;

            try {

                data = JSON.parse(httpServer.responseText);

            } catch (err) {

                data = JSON.parse("[]");

            }
            
            callBackFunction(data);

        }
    }

}




