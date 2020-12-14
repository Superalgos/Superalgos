function newEthereumUtilitiesRouteToClient() {
    thisObject = {
        buildRouteToClient: buildRouteToClient
    }

    return thisObject

    function buildRouteToClient(networkClient) {
        let config = JSON.parse(networkClient.config)
        if (config.host === undefined) {
            networkClient.payload.uiObject.setErrorMessage('Property host not defined at node config.')
            return
        }
        if (config.httpPort === undefined && config.webSocketsPort === undefined) {
            networkClient.payload.uiObject.setErrorMessage('Property httpPort or webSocketsPort must be defined at node config.')
            return
        }

        /* Web Sockets would be the default protocol */
        let clientPort
        let clientInterface
        if (config.webSocketsPort !== undefined) {
            clientInterface = 'ws'
            clientPort = config.webSocketsPort
        } else {
            clientInterface = 'http'
            clientPort = config.httpPort
        }

        let params = {
            host: config.host,
            port: clientPort,
            interface: clientInterface
        }

        /*
        Next, we will check which Superalgos Network Node we need as a gateway
        to the Ethereum Client. We will use the current node reference parent for that. 
        */
        if (networkClient.payload.referenceParent === undefined) {
            networkClient.payload.uiObject.setErrorMessage('You need to reference a Superalgos Network Node so that it acts as a gateway to the Ethereum Client.')
            return
        }

        let networkNodeConfig = JSON.parse(networkClient.payload.referenceParent.config)
        let url = 'http://' + networkNodeConfig.host + ':' + networkNodeConfig.webPort + '/' + 'WEB3'

        return {
            params: params,
            url: url
        }
    }
}