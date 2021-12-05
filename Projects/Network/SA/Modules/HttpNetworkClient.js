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

        web3 = undefined
    }

    async function initialize(callerRole, p2pNetworkClientIdentity, p2pNetworkNode) {
        thisObject.callerRole = callerRole
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.p2pNetworkClientCodeName = JSON.parse(thisObject.p2pNetworkClientIdentity.node.config).codeName
        thisObject.p2pNetworkNode = p2pNetworkNode

        web3 = new SA.nodeModules.web3()

        thisObject.host = JSON.parse(thisObject.p2pNetworkNode.node.config).host
        thisObject.port = JSON.parse(thisObject.p2pNetworkNode.node.config).webPort
    }

    async function sendMessage(message) {
        /*
        This function helps a caller to use await syntax while the called
        function uses callbacks, specifically for retrieving files.
        */
        let promise = new Promise((resolve, reject) => {

            let signature = web3.eth.accounts.sign(JSON.stringify(message), SA.secrets.map.get(thisObject.p2pNetworkClientCodeName).privateKey)
        
            let body = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                messageType: 'Request',
                signature: JSON.stringify(signature),
                payload: JSON.stringify(message)
            }

            const axios = require('axios')
            console.log('Sending Message to P2P Network Node')
            axios
                .post('http://localhost:31248/New-Signal', body)
                .then(res => {
                    console.log(`statusCode: ${res.status}`)
                    console.log('Response Received from P2P Network Node: ' + res.data)
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