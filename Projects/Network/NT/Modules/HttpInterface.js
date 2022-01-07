exports.newNetworkModulesHttpInterface = function newNetworkModulesHttpInterface() {
    /*
    This module represent the HTTP API of the           TODO: Implement that Trading Signals are also sent to other nodes.
    Network Node. All HTTP request are processed        TODO: Implement mechanism to send only the trading signals to the guys that are following the emitter.
    by this module.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /*
        Setup Web 3 Library
        */
        web3 = new SA.nodeModules.web3()

        let port = NT.networkApp.p2pNetworkNode.node.config.webPort
        /*
        We will create an HTTP Server and leave it running forever.
        */
        SA.nodeModules.http.createServer(onHttpRequest).listen(port)
    }

    async function onHttpRequest(httpRequest, httpResponse) {
        try {
            let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
            let requestPath = requestPathAndParameters[0].split('/')
            let endpointOrFile = requestPath[1]

            // TODO: Authenticate the app sending this request

            let caller = {
                userProfile: undefined,
                node: undefined
            }
    
            switch (endpointOrFile) {
                case 'New-Message':
                    {
                        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                        async function processRequest(bodyString) {
                            try {
                                let messageHeader = JSON.parse(bodyString)
                                if (bodyString === undefined) {
                                    return
                                }

                                switch (messageHeader.callerRole) {
                                    case 'Network Client': {
                                        switch (messageHeader.networkService) {
                                            case 'Trading Signals': {
                                                if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                                    response = await NT.networkApp.tradingSignalsNetworkService.clientInterface.messageReceived(messageHeader.payload, caller.userProfile)
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                                } else {
                                                    let response = {
                                                        result: 'Error',
                                                        message: 'Trading Signals Network Service Not Running.'
                                                    }
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                                    return
                                                }
                                                break
                                            }
                                        }
                                        break
                                    }
                                    case 'Network Peer': {
                                        switch (messageHeader.networkService) {
                                            case 'Trading Signals': {
                                                if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                                    response = await NT.networkApp.tradingSignalsNetworkService.peerInterface.messageReceived(messageHeader.payload, caller.userProfile)
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                                } else {
                                                    let response = {
                                                        result: 'Error',
                                                        message: 'Trading Signals Network Service Not Running.'
                                                    }
                                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                                    return
                                                }
                                                break
                                            }
                                        }
                                        break
                                    }
                                }

                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)

                            } catch (err) {
                                console.log('[ERROR] P2P Node -> httpInterface -> Method call produced an error.')
                                console.log('[ERROR] P2P Node -> httpInterface -> err.stack = ' + err.stack)
                                console.log('[ERROR] P2P Node -> httpInterface -> Body Received = ' + bodyString)

                                let error = {
                                    result: 'Fail Because',
                                    message: err.message,
                                    stack: err.stack
                                }
                                try {
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                                } catch (err) {
                                    // we just try to respond but maybe the response has already been sent.
                                }
                            }
                        }
                    }
                    break
                case 'Ping':
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent("Pong", httpResponse)
                    }
                    break
                case 'Stats':
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify([]), httpResponse)
                    }
                    break
                default:
                    {
                    }
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}
