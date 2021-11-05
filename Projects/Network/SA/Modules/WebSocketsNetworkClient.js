exports.newNetworkModulesWebSocketsNetworkClient = function newNetworkModulesWebSocketsNetworkClient() {

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let socketClient

    let web3
    let called = {}
    let onMessageFunctionsMap = new Map()

    return thisObject

    function finalize() {
        socketClient.close()
        socketClient = undefined
        networkInterface = undefined
        peerInterface = undefined

        web3 = undefined
        called = undefined
        onMessageFunctionsMap = undefined
    }

    async function initialize(callerRole, p2pNetworkNode) {

        web3 = new SA.nodeModules.web3()

        let host = JSON.parse(p2pNetworkNode.node.config).host
        let port = JSON.parse(p2pNetworkNode.node.config).webSocketsPort

        socketClient = new SA.nodeModules.ws('ws://' + host + ':' + port)
        await setUpWebsocketClient(callerRole, p2pNetworkNode)
    }

    async function setUpWebsocketClient(callerRole, p2pNetworkNode) {

        return new Promise(connectToNewtwork)

        function connectToNewtwork(resolve, reject) {

            try {

                socketClient.onopen = () => { onConnection() }
                socketClient.onerror = err => { onError(err) }

                function onConnection() {

                    handshakeProcedure()

                    function handshakeProcedure() {

                        let callerTimestamp

                        stepOneRequest()

                        function stepOneRequest() {
                            /*
                            Send Handshake Message Step One:
         
                            At Step One we will just say hello, identify ourselves
                            as a Network Client, and send the Network Node our 
                            User Profile Handle.
         
                            This Handle will be signed by the Network Node to prove
                            it's own identity, and later we will sign it's own handle
                            to prove ours.
                            */
                            socketClient.onmessage = socketMessage => { stepOneResponse(socketMessage) }

                            callerTimestamp = (new Date()).valueOf()

                            let message = {
                                messageType: 'Handshake',
                                callerRole: callerRole,
                                callerProfileHandle: SA.secrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileHandle,
                                callerTimestamp: callerTimestamp,
                                step: 'One'
                            }
                            socketClient.send(JSON.stringify(message))
                        }

                        function stepOneResponse(socketMessage) {
                            let response = JSON.parse(socketMessage.data)

                            if (response.result !== 'Ok') {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> response.message = ' + response.message)
                                reject()
                                return
                            }

                            let signature = JSON.parse(response.signature)
                            called.blockchainAccount = web3.eth.accounts.recover(signature)
                            /*
                            We will check that the signature received produces a valid Blockchain Account.
                            */
                            if (called.blockchainAccount === undefined) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> Signature does not produce a valid Blockchain Account.')
                                reject()
                                return
                            }
                            /*
                            We will check that the blockchain account taken from the signature matches
                            the one we have on record for the user profile of the Network Node we are calling.
                            */
                            if (called.blockchainAccount !== p2pNetworkNode.blockchainAccount) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node called does not have the expected Profile Handle.')
                                reject()
                                return
                            }

                            let signedMessage = JSON.parse(signature.message)
                            /*
                            We will verify that the signature belongs to the signature.message.
                            To do this we will hash the signature.message and see if we get 
                            the same hash of the signature.
                            */
                            let hash = web3.eth.accounts.hashMessage(signature.message)
                            if (hash !== signature.messageHash) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> signature.message Hashed Does Not Match signature.messageHash.')
                                reject()
                                return
                            }
                            /*
                            We will check that the Network Node that responded has the same User Profile Handle
                            that we have on record, otherwise something is wrong and we should not proceed.
                            */
                            if (signedMessage.calledProfileHandle !== p2pNetworkNode.userProfile.userProfileHandle) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node called does not have the expected Profile Handle.')
                                reject()
                                return
                            }
                            /*
                            We will check that the profile handle we sent to the Network Node, is returned at the
                            signed message, to avoid man in the middle attacks.
                            */
                            if (signedMessage.callerProfileHandle !== SA.secrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileHandle) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node callerProfileHandle does not match my own userProfileHandle.')
                                reject()
                                return
                            }
                            /*
                            We will also check that the callerTimestamp we sent to the Network Node, is returned at the
                            signed message, also to avoid man in the middle attacks.
                            */
                            if (signedMessage.callerTimestamp !== callerTimestamp) {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node callerTimestamp does not match my own callerTimestamp.')
                                reject()
                                return
                            }

                            /*
                            All validations passed, it seems we can continue with Step Two.
                            */
                            stepTwoRequest(signedMessage)
                        }

                        function stepTwoRequest(signedMessage) {
                            /*
                            Send Handshake Message Step Two:
         
                            Here we will sign a message with the Network Node profile 
                            handle and timestamp to prove our own identity.
                            */
                            socketClient.onmessage = socketMessage => { stepTwoResponse(socketMessage) }

                            let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), SA.secrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).privateKey)

                            let message = {
                                messageType: 'Handshake',
                                signature: JSON.stringify(signature),
                                step: 'Two'
                            }
                            socketClient.send(JSON.stringify(message))
                        }

                        function stepTwoResponse(socketMessage) {
                            let response = JSON.parse(socketMessage.data)

                            if (response.result !== 'Ok') {
                                console.log('[ERROR] Web Sockets Client -> stepOneResponse -> response.message = ' + response.message)
                                reject()
                                return
                            }
                            /*
                            This was the end of the Handshake procedure. We are connected to the
                            Network Node and from now on, all response messages will be received
                            at this following function.
                            */
                            socketClient.onmessage = socketMessage => { onMenssage(socketMessage) }
                            resolve()
                        }
                    }
                }

                function onError(err) {
                    console.log('[ERROR] Web Sockets Client -> onError -> err.message = ' + err.message)
                    console.log('[ERROR] Web Sockets Client -> onError -> err.stack = ' + err.stack)
                }

            } catch (err) {
                console.log('[ERROR] Web Sockets Client -> setUpWebsocketClient -> err.stack = ' + err.stack)
            }

        }
    }

    function sendMessage(message) {

        return new Promise(sendSocketMessage)

        function sendSocketMessage(resolve, reject) {

            if (socketClient.readyState !== 1) { // 1 means connected and ready.
                console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send message while connection is closed.')
                reject('Websockets Connection Not Ready.')
                return
            }

            let socketMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                messageType: 'Request',
                payload: message
            }
            onMessageFunctionsMap.set(socketMessage.messageId, onMenssageFunction)
            socketClient.send(
                JSON.stringify(socketMessage)
            )

            function onMenssageFunction(response) {
                try {
                    if (response.result === 'Ok') {
                        resolve(response.data)
                    } else {
                        console.log('[ERROR] Web Sockets Client -> onMenssageFunction -> response.message = ' + response.message)
                        reject(response.message)
                    }
                } catch (err) {
                    callbackFunction = undefined
                    console.log('[ERROR] Web Sockets Client -> err.stack = ' + err.stack)
                }
            }
        }
    }

    function onMenssage(socketMessage) {

        let response = JSON.parse(socketMessage.data)
        /*
        We get the function that is going to resolve or reject the promise given.
        */
        onMenssageFunction = onMessageFunctionsMap.get(response.messageId)
        onMessageFunctionsMap.delete(response.messageId)
        onMenssageFunction(response)
    }
}