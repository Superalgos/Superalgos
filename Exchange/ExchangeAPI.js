function newExchangeAPI() {  

    const INFO_LOG = true;
    const LOG_FILE_CONTENT = true;

    const MODULE_NAME = "CloudVM -> Exchange API";
    
    let thisObject = {
        initialize: initialize,
        getTicker: getTicker,
        getOpenPositions: getOpenPositions,
        getExecutedTrades: getExecutedTrades,
        putPosition: putPosition,
        movePosition: movePosition,
        getPublicTradeHistory: getPublicTradeHistory
    };

    return thisObject;

    function initialize(callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "initialize" + "/"
            + window.SESSION_TOKEN
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }

    function getTicker(pMarket, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "getTicker" + "/"
            + window.SESSION_TOKEN
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }

    function getOpenPositions(pMarket, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "getOpenPositions" + "/"
            + window.SESSION_TOKEN
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }

    function getExecutedTrades(pPositionId, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "getExecutedTrades" + "/"
            + window.SESSION_TOKEN + "/"
            + pPositionId
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }
    
    function putPosition(pMarket, pType, pRate, pAmountA, pAmountB, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "putPosition" + "/"
            + window.SESSION_TOKEN + "/"
            + pType + "/"
            + pRate + "/"
            + pAmountA + "/"
            + pAmountB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }

    function movePosition(pPositionId, pNewRate, pPositionAmountB, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "movePosition" + "/"
            + window.SESSION_TOKEN + "/"
            + pPositionId + "/"
            + pNewRate + "/"
            + pPositionAmountB
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }

    function getPublicTradeHistory(pMarket, startTime, endTime, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "getPublicTradeHistory" + "/"
            + window.SESSION_TOKEN + "/"
            + startTime + "/"
            + endTime
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {

            let response = JSON.parse(pServerResponse);
            callBackFunction(response);

        }
    }
}
