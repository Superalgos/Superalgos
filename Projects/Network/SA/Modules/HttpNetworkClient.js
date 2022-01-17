exports.newNetworkModulesHttpNetworkClient = function newNetworkModulesHttpNetworkClient() {

    let thisObject = {
        callerRole: undefined,
        host: undefined,
        port: undefined,
        p2pNetworkNode: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkClientCodeName: undefined,
        sendMessage: sendMessage,
        sendTestMessage: sendTestMessage,
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
            const TIMEOUT_FOR_NETWORK_NODE_TO_RESPOND = 10000
            let promiseStatus = 'Pending'
            setTimeout(checkPromise, TIMEOUT_FOR_NETWORK_NODE_TO_RESPOND)
            message.callerRole = "Network Client"
            const axios = SA.nodeModules.axios
            axios
                .post('http://' + thisObject.host + ':' + thisObject.port + '/New-Message', message)
                .then(res => {
                    //console.log(`statusCode: ${res.status}`)
                    //console.log('Response Received from P2P Network Node: ' + JSON.stringify(res.data))
                    // TODO : Do something when Network Node could not process this signal.
                    promiseStatus = 'Resolved'
                    resolve()
                })
                .catch(error => {
                    console.error('[ERROR] Error trying to send message to the P2P Network node via its http interface -> Error = ' + error)
                    promiseStatus = 'Rejected'
                    reject()
                })
            function checkPromise() {
                if (promiseStatus === 'Pending') {
                    reject()
                }
            }
        })

        return promise
    }

    async function sendTestMessage(networkServide) {
        /*
        This function us to check if a network node is online and will 
        receive an http request when needed.
        */
        let promise = new Promise((resolve, reject) => {
            const TIMEOUT_FOR_NETWORK_NODE_TO_RESPOND = 10000
            let promiseStatus = 'Pending'
            setTimeout(checkPromise, TIMEOUT_FOR_NETWORK_NODE_TO_RESPOND)
            const axios = SA.nodeModules.axios
            axios
                .post('http://' + thisObject.host + ':' + thisObject.port + '/Ping/' + networkServide)
                .then(res => {
                    if (res.data.indexOf("Pong") >= 0) {
                        console.log('Http Client Detected Network Node is Online .................................. Connected to ' + thisObject.p2pNetworkNode.userProfile.config.codeName + ' -> ' + thisObject.p2pNetworkNode.node.name + ' -> ' + thisObject.host + ':' + thisObject.port)
                        promiseStatus = 'Resolved'
                        resolve()
                    } else {
                        promiseStatus = 'Rejected'
                        reject()
                    }
                })
                .catch(error => {
                    promiseStatus = 'Rejected'
                    reject()
                })

            function checkPromise() {
                if (promiseStatus === 'Pending') {
                    reject()
                }
            }

        })
        return promise
    }
}