exports.newNetworkModulesHttpInterface = function newNetworkModulesHttpInterface() {
    /*
    This module represent the HTTP API of the           TODO: Implement that Trading Signals are also sent to other nodes.
    Network Node. All HTTP request are processed        TODO: Implement mechanism to send only the trading signals to the guys that are following the origin social entity.
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

        let port = NT.networkApp.p2pNetworkNode.node.networkInterfaces.httpNetworkInterface.config.httpPort
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

                                if (bodyString === undefined) {
                                    return
                                }
                                let socketMessage = JSON.parse(bodyString)
                                /*
                                Validate the User App Signature
                                */
                                let userAppBlockchainAccount = web3.eth.accounts.recover(socketMessage.signature)

                                if (userAppBlockchainAccount === undefined) {
                                    let response = {
                                        result: 'Error',
                                        message: 'User App Bad Signature.'
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                    return
                                }

                                let userProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(userAppBlockchainAccount)

                                if (userProfile === undefined) {
                                    let response = {
                                        result: 'Error',
                                        message: 'User App Not Linked to User Profile.'
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                    return
                                }
                                let payload
                                try {
                                    payload = JSON.parse(socketMessage.payload)
                                } catch (err) {
                                    let response = {
                                        result: 'Error',
                                        message: 'Payload Not Correct JSON Format.'
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                    return
                                }

                                if (payload.networkService === undefined) {
                                    let response = {
                                        result: 'Error',
                                        message: 'Network Service Undifined.'
                                    }
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                    return
                                }
                                /*
                                We will check that if we are a node of a Permissioned Network, that whoever
                                is connecting to us, has the permission to do so.
                                */
                                if (NT.networkApp.p2pNetworkNode.node.p2pNetworkReference.referenceParent.type === "Permissioned P2P Network") {
                                    let userProfileWithPermission = SA.projects.network.globals.memory.maps.PERMISSIONS_GRANTED_BY_USER_PRFILE_ID.get(userProfile.id)
                                    if (userProfileWithPermission === undefined) {
                                        let response = {
                                            result: 'Error',
                                            message: 'User Profile Does Not Have Permission to This Permissioned P2P Network.'
                                        }
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                        return
                                    }
                                }

                                switch (socketMessage.callerRole) {
                                    case 'Network Client': {
                                        switch (socketMessage.networkService) {
                                            case 'Trading Signals': {
                                                if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                                    SA.logger.debug('Network Http Client -> Network Client -> Message Received')
                                                    response = await NT.networkApp.tradingSignalsNetworkService.clientInterface.messageReceived(payload, socketMessage)
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
                                        switch (socketMessage.networkService) {
                                            case 'Trading Signals': {
                                                if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                                    SA.logger.debug('Network Http Client -> Network Peer -> Message Received')
                                                    response = await NT.networkApp.tradingSignalsNetworkService.peerInterface.messageReceived(socketMessage.payload, caller.userProfile)
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

                            } catch (err) {
                                SA.logger.error('P2P Node -> httpInterface -> Method call produced an error.')
                                SA.logger.error('P2P Node -> httpInterface -> err.stack = ' + err.stack)
                                SA.logger.error('P2P Node -> httpInterface -> Body Received = ' + bodyString)

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
                        let networkService = unescape(requestPath[2])

                        switch (networkService) {
                            case 'Trading Signals': {
                                if (NT.networkApp.tradingSignalsNetworkService !== undefined) {
                                    SA.logger.debug('Network Http Client -> Trading Signals -> Ping Received')
                                    SA.projects.foundations.utilities.httpResponses.respondWithContent("Pong" + "/"  + NT.networkApp.p2pNetworkNode.userProfile.config.codeName + "/" + NT.networkApp.p2pNetworkNode.node.config.codeName  , httpResponse)
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
                    }
                    break
                case 'Stats':
                    {
                        let networkService = unescape(requestPath[2])

                        switch (networkService) {
                            case 'Machine Learning': {
                                if (NT.networkApp.machineLearningNetworkService !== undefined) {
                                    response = await NT.networkApp.machineLearningNetworkService.clientInterface.getStats()
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
                    }
                    break
                default:
                    {
                    }
            }
        } catch (err) {
            SA.logger.error(err.stack)
        }
    }
}
