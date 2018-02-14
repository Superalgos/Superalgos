/* This business logic module is responsible for Markets and Assets. */

const MODULE_NAME = "Markets";
var DATA_LAYER_MODULE = require('./Data Layer');


exports.newMarkets = function newMarkets() {

    markets = {
        getMarketsByExchange: getMarketsByExchange,
        getExistingOrNewMarketId: getExistingOrNewMarketId,
        createNewAsset: createNewAsset,
        createNewMarket: createNewMarket,
        initialize: initialize
    };

    var dataLayer;

    return markets;



    function initialize() {

        dataLayer = DATA_LAYER_MODULE.newDataLayer();

    }



    function getMarketsByExchange(exchangeId, callBackFunction) {

        dataLayer.getMarketsByExchange(exchangeId, onResultSetReady);

        function onResultSetReady(resultSet) {

            callBackFunction(resultSet);

        }

    }


    function getExistingOrNewMarketId(marketName, market, exchangeId, callBackFunction) {

        var assets = marketName.split("_");

        var assetCodeA = assets[0];
        var assetCodeB = assets[1];

        var idAssetA;
        var idAssetB;

        var marketId;

        getIdAssetA();

        function getIdAssetA() {

            dataLayer.getAssetIdByCodeName(assetCodeA, onIdReady);

            function onIdReady(resultSet) {

                idAssetA = resultSet.getValue(1, "Id");

                if (idAssetA === undefined) {

                    createNewAsset(assetCodeA, onAssetCreated);

                    function onAssetCreated(resultSet) {

                        idAssetA = resultSet.getValue(1, "Id");
                        getIdAssetB();
                    }

                } else {
                    getIdAssetB();
                }
            }
        }

        function getIdAssetB() {

            dataLayer.getAssetIdByCodeName(assetCodeB, onIdReady);

            function onIdReady(resultSet) {

                idAssetB = resultSet.getValue(1, "Id");

                if (idAssetB === undefined) {

                    createNewAsset(assetCodeB, onAssetCreated);

                    function onAssetCreated(resultSet) {

                        idAssetB = resultSet.getValue(1, "Id");
                        getMarketId();
                    }

                } else {
                    getMarketId();
                }
            }
        }

        function getMarketId() {

            dataLayer.getMarketId(idAssetA, idAssetB, exchangeId, onIdReady);

            function onIdReady(resultSet) {

                marketId = resultSet.getValue(1, "Id");

                if (marketId === undefined) {

                    createNewMarket(exchangeId, idAssetA, idAssetB, onMarketCreated);

                    function onMarketCreated(resultSet) {

                        marketId = resultSet.getValue(1, "Id");
                        respond();
                    }

                } else {
                    respond();
                }
            }
        }

        function respond() {

            callBackFunction(marketName, market, marketId);

        }
    }


    function createNewAsset(assetCode, callBackFunction) {

        dataLayer.newAsset(assetCode, onIdReady);

        function onIdReady(resultSet) {

            callBackFunction(resultSet);

        }

    }



    function createNewMarket(exchangeId, idAssetA, idAssetB, callBackFunction) {

        dataLayer.newMarket(exchangeId, idAssetA, idAssetB, onIdReady);

        function onIdReady(resultSet) {

            callBackFunction(resultSet);

        }

    }

};