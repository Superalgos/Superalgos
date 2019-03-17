 ﻿function newExchangeAPI () {
   const INFO_LOG = true
   const LOG_FILE_CONTENT = true

   const MODULE_NAME = 'CloudVM -> Exchange API'

   const SERVER_URL = window.canvasApp.urlPrefix + 'ExchangeAPI/'

   let thisObject = {
     initialize: initialize,
     getTicker: getTicker,
     getOpenPositions: getOpenPositions,
     getExecutedTrades: getExecutedTrades,
     putPosition: putPosition,
     movePosition: movePosition,
     getPublicTradeHistory: getPublicTradeHistory
   }

   return thisObject

   function initialize (callBackFunction) {
        /* When this initialized is called from the Browser, there is no need to send it to the server since the server will
        anyways initialize this library at each method call. */

     callBackFunction(window.DEFAULT_OK_RESPONSE)
   }

   function getTicker (pMarket, callBackFunction) {
     let authToken = window.localStorage.getItem('access_token')

        let path = SERVER_URL
            + "getTicker" + "/"
            + authToken

     callServer(undefined, path + '/NO-LOG', onServerResponse)

     function onServerResponse (pServerResponse) {
       let response = JSON.parse(pServerResponse)
       if (response.result === window.DEFAULT_FAIL_RESPONSE.result) {
         callBackFunction(window.DEFAULT_FAIL_RESPONSE)
       } else {
         callBackFunction(window.DEFAULT_OK_RESPONSE, response)
       }
     }
   }

   function getOpenPositions (pMarket, callBackFunction) {
        let authToken = window.localStorage.getItem('access_token');

        let path = SERVER_URL
            + "getOpenPositions" + "/"
            + authToken
        
        callServer(undefined, path + '/NO-LOG', onServerResponse)

        function onServerResponse(pServerResponse) {
            let response = JSON.parse(pServerResponse);
            if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
                callBackFunction(window.DEFAULT_FAIL_RESPONSE);
            else
                callBackFunction(window.DEFAULT_OK_RESPONSE, response);
        }
    }

    function getExecutedTrades(pPositionId, callBackFunction) {

        let authToken = window.localStorage.getItem('access_token');

        let path = SERVER_URL
            + "getExecutedTrades" + "/"
            + authToken + "/"
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

        let authToken = window.localStorage.getItem('access_token');

        let path = SERVER_URL
            + "putPosition" + "/"
            + authToken + "/"
            + pType + "/"
            + pRate + "/"
            + pAmountA + "/"
            + pAmountB
            ;

     callServer(undefined, path + '/NO-LOG', onServerResponse)

     function onServerResponse (pServerResponse) {
       let response = JSON.parse(pServerResponse)
       if (response.result === window.DEFAULT_FAIL_RESPONSE.result) {
         callBackFunction(window.DEFAULT_FAIL_RESPONSE)
       } else {
         callBackFunction(window.DEFAULT_OK_RESPONSE, response)
       }
     }
   }
   
   function getPublicTradeHistory (pMarket, startTime, endTime, callBackFunction) {
     let authToken = window.localStorage.getItem('access_token')

     let path = SERVER_URL
            + CURRENT_BOT_CODE_NAME + '/'
            + 'getPublicTradeHistory' + '/'
            + authToken + '/'
            + startTime + '/'
            + endTime

     callServer(undefined, path + '/NO-LOG', onServerResponse)

      function onServerResponse(pServerResponse) {
          let response = JSON.parse(pServerResponse);
          if (response.result === window.DEFAULT_FAIL_RESPONSE.result)
              callBackFunction(window.DEFAULT_FAIL_RESPONSE);
          else
              callBackFunction(window.DEFAULT_OK_RESPONSE, response);
      }
    }
}
