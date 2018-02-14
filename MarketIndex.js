

function newMarketIndex() {

    let marketIndex = {
        candles: undefined,
        volumes: undefined,
        maxRate: maxRate,
        maxVolume: maxVolume,
        initialize: initialize
    }

    let marketId;
    let exchangeId;

    return marketIndex;

    function initialize(exchange, market, callBackFunction) {

        marketId = market;
        exchangeId = exchange;

        let server;

        server = newFileServer();
        server.initialize();

        server.getMarketIndexCandles(exchangeId, marketId, onCandlesReady);

        function onCandlesReady(data) {

            marketIndex.candles = data;

            server.getMarketIndexVolumes(exchangeId, marketId, onVolumesReady);

            function onVolumesReady(data) {

                marketIndex.volumes = data;

                callBackFunction();

            }
        }
    }

    function maxRate() {

        let maxValue = 0;

        for (var i = 0; i < marketIndex.candles.length; i++) {

            let currentMax = marketIndex.candles[i][1];

            if (maxValue < currentMax) {
                maxValue = currentMax;
            }
        }

       return maxValue;
    }

    function maxVolume() {

        let maxValue = 0;

        for (var i = 0; i < marketIndex.volumes.length; i++) {

            let currentMax = marketIndex.volumes[i][0] + marketIndex.volumes[i][1];

            if (maxValue < currentMax) {
                maxValue = currentMax;
            }
        }

        return maxValue;
    }


}