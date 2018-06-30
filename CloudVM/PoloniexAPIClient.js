function newPoloniexAPIClient() {  

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

    function analizeResponse(logger, exchangeErr, exchangeResponse, notOkCallBack, okCallBack) {

        /* IMPORTANT> This function is an exact copy of the one running at the cloud, with a browsery applied. In this case it means the world global -> window. */

        /* This function analizes the different situations we might encounter trying to access Poloniex and returns appropiate standard errors. */

        try {

            let stringExchangeResponse = JSON.stringify(exchangeResponse);
            let stringExchangeErr = JSON.stringify(exchangeErr);

            if (INFO_LOG === true) { logger.write( MODULE_NAME, "[INFO] analizeResponse -> stringExchangeErr = " + stringExchangeErr); }
            if (LOG_FILE_CONTENT === true) { logger.write( MODULE_NAME, "[INFO] analizeResponse -> exchangeResponse = " + stringExchangeResponse); }
       
            if (stringExchangeErr.indexOf("ETIMEDOUT") > 0 ||
                stringExchangeErr.indexOf("ENOTFOUND") > 0 ||
                stringExchangeErr.indexOf("ECONNREFUSED") > 0 ||
                stringExchangeErr.indexOf("ESOCKETTIMEDOUT") > 0 ||
                stringExchangeErr.indexOf("ECONNRESET") > 0 ||
                (stringExchangeResponse !== undefined && (
                    stringExchangeResponse.indexOf("Connection timed out") > 0 ||
                    stringExchangeResponse.indexOf("Connection Error") > 0 ||
                    stringExchangeResponse.indexOf("Bad gateway") > 0 ||
                    stringExchangeResponse.indexOf("Internal error. Please try again") > 0))) {

                logger.write( MODULE_NAME, "[WARN] analizeResponse -> Timeout reached or connection problem while trying to access the Exchange API. Requesting new execution later.");
                notOkCallBack(window.DEFAULT_RETRY_RESPONSE);
                return;

            } else {

                if (exchangeResponse !== null && exchangeResponse !== undefined) {

                    if (JSON.stringify(exchangeResponse).indexOf("error") > 0) {

                        logger.write( MODULE_NAME, "[ERROR] analizeResponse -> Unexpected response from the Exchange.");
                        logger.write( MODULE_NAME, "[ERROR] analizeResponse -> exchangeResponse = " + stringExchangeResponse);
                        notOkCallBack(window.DEFAULT_FAIL_RESPONSE);
                        return;
                    }
                }

                if (exchangeErr) {

                    logger.write( MODULE_NAME, "[ERROR] analizeResponse -> Unexpected error trying to contact the Exchange.");
                    notOkCallBack(window.DEFAULT_FAIL_RESPONSE);
                    return;

                } else {

                    logger.write( MODULE_NAME, "[INFO] analizeResponse -> No problem found.");
                    okCallBack();
                    return;
                }
            }

        } catch (err) {
            logger.write( MODULE_NAME, "[ERROR] analizeResponse -> err.message = " + err.message);
            notOkCallBack(window.DEFAULT_FAIL_RESPONSE);
            return;
        }
    }

    function returnOpenOrders(pMarketAssetA, pMarketAssetB, callBackFunction) {

        let path = "PoloniexAPIClient" + "/" 
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

        let path = "PoloniexAPIClient" + "/"
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

        let path = "PoloniexAPIClient" + "/"
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

        let path = "PoloniexAPIClient" + "/"
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

        let path = "PoloniexAPIClient" + "/"
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

        let path = "PoloniexAPIClient" + "/"
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
