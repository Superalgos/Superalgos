exports.newNetworkModulesHttpInterface = function newNetworkModulesHttpInterface() {
    /*
    This module represent the HTTP API of the 
    NNetwork Node. All HTTP request are processed
    by this module.
    */
    let thisObject = {
        incomingSignals: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.incomingSignals.finalize()
        thisObject.incomingSignals = undefined
    }

    function initialize() {
        /*
        Setup Web 3 Library
        */
        web3 = new SA.nodeModules.web3()
        /*
        Setup the module that will process incoming signals.
        */
        thisObject.incomingSignals = NT.projects.network.modules.incomingSignals.newNetworkModulesIncomingSignals()
        thisObject.incomingSignals.initialize()

        let port = NT.networkNode.p2pNetworkNode.node.config.webPort
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

            switch (endpointOrFile) {
                case 'New-Signal':
                    {
                        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                        async function processRequest(bodyString) {
                            try {
                                if (bodyString === undefined) {
                                    return
                                }

                                let signalMessage = JSON.parse(bodyString)

                                let response = await thisObject.incomingSignals.newSignal(signalMessage)
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
