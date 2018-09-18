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

        /* When this initialized is called from the Browser, there is no need to send it to the server since the server will
        anyways initialize this library at each method call. */

        callBackFunction(window.DEFAULT_OK_RESPONSE);
       
    }

    function getTicker(pMarket, callBackFunction) {

        let path = "ExchangeAPI" + "/"
            + "getTicker" + "/"
            + window.SESSION_TOKEN
            ;

        callServer(undefined, path + "/NO-LOG", onServerResponse);

        function onServerResponse(pServerResponse) {                        
            let response = JSON.parse(pServerResponse);
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
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
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
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
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
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
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
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
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
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
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
        }
    }
}
