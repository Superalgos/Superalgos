exports.newNetworkModulesHttpNetworkClient = function newNetworkModulesHttpNetworkClient() {

    let thisObject = {
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

    async function initialize(p2pNetworkClientIdentity, p2pNetworkNode) {
        thisObject.callerRole = callerRole
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.p2pNetworkClientCodeName = JSON.parse(thisObject.p2pNetworkClientIdentity.node.config).codeName
        thisObject.p2pNetworkNode = p2pNetworkNode

        web3 = new SA.nodeModules.web3()

        thisObject.host = JSON.parse(thisObject.p2pNetworkNode.node.config).host
        thisObject.port = JSON.parse(thisObject.p2pNetworkNode.node.config).webPort
    }

    function sendMessage(message) {
        return new Promise(sendHttpMessage)

        function sendHttpMessage(resolve, reject) {
            try {
                let signature = web3.eth.accounts.sign(JSON.stringify(message), SA.secrets.map.get(thisObject.p2pNetworkClientCodeName).privateKey)

                let body = {
                    messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    messageType: 'Request',
                    signature: JSON.stringify(signature),
                    payload: message
                }

                const response = await fetch('https://' + thisObject.host + ':' + thisObject.port + '/' + 'New-Signal', {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: { 'Content-Type': 'application/json' }
                });
                const data = await response.json();
                resolve(data)
            } catch (err) {
                console.log('[ERROR] Http Network Client -> err.message = ' + err.message)
                reject(err.description)
            }
        }
    }
}