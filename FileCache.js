
/*

This module will acts as a dinamic file cache for each market. It works like this:

1.  It is always listening to the DATETIME the user is browsing and dinamically adjusts the cache according to that, meaning that it loads more files or
    unload files that at far in time and unlikely to be needed.

2.  It is always listening to the PERIOD of candles and other visual objects to dinamically adjust the cache loading or unloading files according to that.

3.  It is also listening to the Layers Panel to only keep in the cache the files of visible layers.

*/

function newFileCache() {

    const FILE_TYPES = {
        candles: {
            layers: ["candles"],
            periods: [PERIOD_24_HS, PERIOD_12_HS, PERIOD_06_HS, PERIOD_03_HS, PERIOD_01_HS]
        },
        volumes: {
            layers: ["volumes"],
            periods: [PERIOD_24_HS, PERIOD_12_HS, PERIOD_06_HS, PERIOD_03_HS, PERIOD_01_HS]
        }
    }

    let fileCache = {
        getFile: getFile,
        initialize: initialize
    }

    let exchange;
    let market;

    let files = new Map;
    
    return fileCache;

    function initialize(pExchange, pMarket, callBackFunction) {

        exchange = pExchange;
        market = pMarket;
        
        let server;

        server = newFileServer();
        server.initialize();

        server.getMarketIndexCandles(exchangeId, marketId, onCandlesReady);

        function onCandlesReady(data) {

            dataCache.candles = data;

            server.getMarketIndexVolumes(exchangeId, marketId, onVolumesReady);

            function onVolumesReady(data) {

                dataCache.volumes = data;

                callBackFunction();

            }
        }
    }

    function getFile(pName, pPeriod, pDatetime) {




    }
}