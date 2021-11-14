exports.newNetworkModulesHttpInterface = function newNetworkModulesHttpInterface() {
    /*
    This module represent the HTTP API of the 
    NNetwork Node. All HTTP request are processed
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
        let port = JSON.parse(NT.networkNode.p2pNetworkNode.node.config).webPort
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
                case 'Signal':
                    {
                        let message = requestPath[2]
                        let response = await thisObject.clientInterface.messageReceived(message)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
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
