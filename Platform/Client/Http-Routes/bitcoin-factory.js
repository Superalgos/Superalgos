exports.newBitCoinFactoryRoute = function newBitCoinFactoryRoute() {
    const thisObject = {
        endpoint: 'Bitcoin-Factory',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

        function processRequest(body) {
            try {
                if(body === undefined) {
                    return
                }
                let params = JSON.parse(body)

                switch(params.method) {
                    case 'updateForecastedCandles': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.updateForecastedCandles(
                            params.forecastedCandles
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        break
                    }
                    case 'getTestClientInstanceId': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.getTestClientInstanceId(
                            params.networkCodeName,
                            params.userProfile,
                            params.clientName
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        break
                    }
                    case 'getUserProfileFilesList': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.getUserProfileFilesList(
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        break
                    }
                    case 'getUserProfileFile': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.getUserProfileFile(
                            params.fileName
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        break
                    }
                    case 'getIndicatorFile': {

                        let serverResponse = PL.servers.BITCOIN_FACTORY_SERVER.getIndicatorFile(
                            params.dataMine,
                            params.indicator,
                            params.product,
                            params.exchange,
                            params.baseAsset,
                            params.quotedAsset,
                            params.dataset,
                            params.timeFrameLabel
                        )

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(serverResponse), httpResponse)
                        break
                    }
                    default: {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify({error: 'Method ' + params.method + ' is invalid.'}), httpResponse)
                    }
                }
            } catch(err) {
                SA.logger.error('httpInterface -> Bitcoin-Factory -> Method call produced an error.')
                SA.logger.error('httpInterface -> Bitcoin-Factory -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> Bitcoin-Factory -> Params Received = ' + body)

                let error = {
                    result: 'Fail Because',
                    message: err.message,
                    stack: err.stack
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
            }
        }
    }
}