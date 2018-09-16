function newExchangeAPI() {  

    const INFO_LOG = true;
    const LOG_FILE_CONTENT = true;

    const MODULE_NAME = "CloudVM -> Poloniex Client API";

    let thisObject = {
        API: {
            analizeResponse: analizeResponse,
            returnOpenOrders: returnOpenOrders,
            returnOrderTrades: returnOrderTrades,
            buy: buy,
            sell: sell,
            moveOrder: moveOrder,
            returnTicker: returnTicker
        }
    };

    return thisObject;

    function returnOpenOrders(pMarketAssetA, pMarketAssetB, callBackFunction) {

        let path = "ExchangeAPI" + "/" 
            + "returnOpenOrders" + "/" 
            + window.SESSION_TOKEN + "/"
            + pMarketAssetA + "/"
            + pMarketAssetB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }

    function returnOrderTrades(pPositionId, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "returnOrderTrades" + "/"
            + window.SESSION_TOKEN + "/"
            + pPositionId
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }

    function buy(pMarketAssetA, pMarketAssetB, pRate, pAmountB, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "buy" + "/"
            + window.SESSION_TOKEN + "/"
            + pMarketAssetA + "/"
            + pMarketAssetB + "/"
            + pRate + "/"
            + pAmountB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }

    function sell(pMarketAssetA, pMarketAssetB, pRate, pAmountB, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "sell" + "/"
            + window.SESSION_TOKEN + "/"
            + pMarketAssetA + "/"
            + pMarketAssetB + "/"
            + pRate + "/"
            + pAmountB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }

    function moveOrder(pPositionId, pNewRate, pPositionAmountB, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "moveOrder" + "/"
            + window.SESSION_TOKEN + "/"
            + pPositionId + "/"
            + pNewRate + "/"
            + pPositionAmountB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }

    function returnTicker(callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "returnTicker" + "/"
            + window.SESSION_TOKEN
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response.err, response.exchangeResponse);

        }
    }
}
