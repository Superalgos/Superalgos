exports.newNetworkModulesHttpNetworkClient = function newNetworkModulesHttpNetworkClient() {

    let thisObject = {
        callerRole: undefined,
        host: undefined,
        port: undefined,
        p2pNetworkNode: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkClientCodeName: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let web3

    return thisObject

    function finalize() {
        thisObject.host = undefined
        thisObject.port = undefined

        thisObject.p2pNetworkNode = undefined
        thisObject.p2pNetworkClientIdentity = undefined
    }

    async function initialize(callerRole, p2pNetworkClientIdentity, p2pNetworkNode) {
        thisObject.callerRole = callerRole
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.p2pNetworkClientCodeName = thisObject.p2pNetworkClientIdentity.node.config.codeName
        thisObject.p2pNetworkNode = p2pNetworkNode        

        thisObject.host = thisObject.p2pNetworkNode.node.config.host
        thisObject.port = thisObject.p2pNetworkNode.node.config.webPort
    }

    async function sendMessage(message) {
        /*
        This function helps a caller to use await syntax while the called
        function uses callbacks, specifically for retrieving files.
        */
        let promise = new Promise((resolve, reject) => {

            const axios = require('axios')
            console.log('Sending Message to P2P Network Node')
            axios
                .post('http://localhost:31248/New-Signal', message)
                .then(res => {
                    //console.log(`statusCode: ${res.status}`)
                    console.log('Response Received from P2P Network Node: ' + JSON.stringify(res.data))
                    resolve()
                })
                .catch(error => {
                    console.error('[ERROR] Error trying to send message to the P2P Network node via its http interface -> Error = ' + error)
                    reject()
                })
        })

        return promise
    }
}