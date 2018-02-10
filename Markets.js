/* This business logic module is responsible for Markets and Assets. */


exports.newMarkets = function newMarkets(BOT) {

    let bot = BOT;
    const ROOT_DIR = '../';

    const MODULE_NAME = "Markets";

    const FOLDER_PATHS = 'data';
    const MARKETS_FOLDER_NAME = "other-files";

    const DEBUG_MODULE = require('./Debug Log');
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;

    const EXCHANGE_ID = 1;
    const fileName = "Markets_" + EXCHANGE_ID + ".json";

    const DATA_OWNER_BOT_NAME = "Carol"

    const markets = {
        DISABLED: 0,
        ENABLED: 1,
        getMarketsByExchange: getMarketsByExchange,
        getExistingOrNewMarketId: getExistingOrNewMarketId,
        createNewAsset: createNewAsset,
        createNewMarket: createNewMarket,
        disableMarket: disableMarket,
        initialize: initialize
    };

    //const dataLayer = DATA_LAYER_MODULE.newDataLayer();

    let marketsArray;

    const AZURE_FILE_STORAGE = require('./Azure File Storage');
    let azureFileStorage = AZURE_FILE_STORAGE.newAzureFileStorage(bot);

    return markets;


    function initialize(callBackFunction) {

        azureFileStorage.initialize(DATA_OWNER_BOT_NAME);

        try {

            azureFileStorage.getTextFile(MARKETS_FOLDER_NAME, fileName, onFileRead);

            function onFileRead(text) {

                try {

                    var fileString = text;
                    let cleanString = fileString;

                    /* Dont know why but sometimes files comes with a first characater that is not supposed to be there and you can not see it at the file opened with notepad */

                    if (fileString[0] !== "[") {

                        cleanString = '';

                        for (let i = 1; i < fileString.length; i++) {
                            cleanString = cleanString + fileString[i];
                        }
                    }

                    marketsArray = JSON.parse(cleanString);
                    callBackFunction();

                }
                catch (err) {
                    const logText = "[ERROR] initialize - onFileRead ' ERROR : " + err.message + " File: " + fileName;
                    console.log(logText);
                    logger.write(logText);
                }

            }
        }
        catch (err) {
            const logText = "[ERROR] initialize - ' ERROR : " + err.message + " File Not Found: " + fileName;
            console.log(logText);
            logger.write(logText);
        }


    }



    function getMarketsByExchange(exchangeId, callBackFunction) {

        try {

            // TODO: Currently the exchange Id is ignored as the class is still working with only one exchange. We must fix this.

            callBackFunction(JSON.stringify(marketsArray));


        } catch (err) {

            const logText = "[ERROR] getMarketsByExchange - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }

    }


    function getExistingOrNewMarketId(marketName, market, exchangeId, callBackFunction) {

        // TODO: At this function is missing the following: If a market does not exists, it must be greated, and Id generated and returned. We automatically discover new markets when this function is called with a market that didn-t previuously existed.

        try {

            for (let i = 0; i < marketsArray.length; i++) {

                if (marketsArray[i][1] + "_" + marketsArray[i][2] === marketName) {

                    callBackFunction(marketName, market, marketsArray[i][0]);
                    return;

                }
            }


        } catch (err) {

            const logText = "[ERROR] getExistingOrNewMarketId - ' ERROR : " + err.message + " marketId = " + marketId + " idAssetA = " + idAssetA + " idAssetB = " + idAssetB;
            console.log(logText);
            logger.write(logText);

        }

    }


    function createNewAsset(assetCode, callBackFunction) {

        // TODO: Upgrade this function in order to update the file containing all assets, not the database that will be deprecated.

        try {

            dataLayer.newAsset(assetCode, onIdReady);

            function onIdReady(resultSet) {

                try {

                    callBackFunction(resultSet);
                    resultSet = [];

                } catch (err) {

                    const logText = "[ERROR] createNewAsset - onIdReady ' ERROR : " + err.message;
                    console.log(logText);
                    logger.write(logText);

                }
            }

        } catch (err) {

            const logText = "[ERROR] createNewAsset - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);

        }

    }



    function createNewMarket(exchangeId, idAssetA, idAssetB, callBackFunction) {

        // TODO: Upgrade this function in order to update the file containing all markets, not the database that will be deprecated.

        try {

            dataLayer.newMarket(exchangeId, idAssetA, idAssetB, onIdReady);

            function onIdReady(resultSet) {

                try {

                    callBackFunction(resultSet);

                } catch (err) {

                    const logText = "[ERROR] createNewMarket - onIdReady ' ERROR : " + err.message;
                    console.log(logText);
                    logger.write(logText);
                }
            }

        } catch (err) {

            const logText = "[ERROR] createNewMarket - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);
        }
    }


    function disableMarket(exchangeId, marketId, callBackFunction) {

        // This function puts the requested market in a DISABLED status.

        // TODO: Currently the exchangeId is ignored.

        try {

            for (let i = 0; i < marketsArray.length; i++) {

                if (marketsArray[i][0] === marketId) {

                    marketsArray[i][3] = markets.DISABLED;
                    break;

                }

            }

            azureFileStorage.createTextFile(MARKETS_FOLDER_NAME, fileName, JSON.stringify(marketsArray), onFileReplaced);

            function onFileReplaced() {

                try {

                    callBackFunction();

                } catch (err) {

                    const logText = "[ERROR] disableMarket - onFileReplaced ' ERROR : " + err.message;
                    console.log(logText);
                    logger.write(logText);
                }
            }

        } catch (err) {

            const logText = "[ERROR] disableMarket - ' ERROR : " + err.message;
            console.log(logText);
            logger.write(logText);
        }
    }

};