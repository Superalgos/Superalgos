exports.newCCXTRoute = function newCCXTRoute() {
    const thisObject = {
        endpoint: 'CCXT',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

        async function processRequest(body) {
            try {
                if(body === undefined) {
                    return
                }
                let params = JSON.parse(body)

                switch(params.method) {
                    case 'fetchMarkets': {

                        const exchangeClass = SA.nodeModules.ccxt[params.exchangeId]
                        const exchangeConstructorParams = {
                            'timeout': 30000,
                            'enableRateLimit': true,
                            verbose: false
                        }

                        let ccxtExchange = new exchangeClass(exchangeConstructorParams)
                        let ccxtMarkets = []

                        if(ccxtExchange.has.fetchMarkets === true) {
                            ccxtMarkets = await ccxtExchange.fetchMarkets()
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(ccxtMarkets), httpResponse)
                        return
                    }
                    case 'listExchanges': {
                        let exchanges = []
                        for(let i = 0; i < SA.nodeModules.ccxt.exchanges.length; i++) {
                            let exchangeId = SA.nodeModules.ccxt.exchanges[i]

                            const exchangeClass = SA.nodeModules.ccxt[exchangeId]
                            const exchangeConstructorParams = {
                                'timeout': 30000,
                                'enableRateLimit': true,
                                verbose: false
                            }
                            let ccxtExchange
                            try {
                                ccxtExchange = new exchangeClass(exchangeConstructorParams)
                            } catch(err) {
                            }
                            if(ccxtExchange === undefined) {
                                continue
                            }


                            if(ccxtExchange.has.fetchOHLCV === params.has.fetchOHLCV) {
                                if(ccxtExchange.has.fetchMarkets === params.has.fetchMarkets) {
                                    if(ccxtExchange.timeframes['1m'] !== undefined) {
                                        let exchange = {
                                            name: ccxtExchange.name,
                                            id: ccxtExchange.id
                                        }
                                        exchanges.push(exchange)
                                    }
                                }
                            }
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(exchanges), httpResponse)
                        return
                    }
                }

                let content = {
                    err: global.DEFAULT_FAIL_RESPONSE // method not supported
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(content), httpResponse)

            } catch(err) {
                SA.logger.info('httpInterface -> CCXT FetchMarkets -> Could not fetch markets.')
                let error = {
                    result: 'Fail Because',
                    message: err.message
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
            }
        }
    }
}