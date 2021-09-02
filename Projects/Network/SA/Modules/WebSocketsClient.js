exports.newNetworkModulesWebSocketsClient = function newNetworkModulesWebSocketsClient() {

    let thisObject = {
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let socketClient
    let callbackFunction

    let web3 = new SA.nodeModules.web3()
    let called = {}
    let selectedNetworkNode // This is a Network Node we pick to try to connect to.

    return thisObject

    function finalize() {
        socketClient.close()
        socketClient = undefined
        networkInterface = undefined
        peerInterface = undefined

        web3 = undefined
        called = undefined
    }

    function initialize() {
        /*
        Here we will pick a Network Node from all users profiles available that do have a Network Node running. // TODO
        */
        selectedNetworkNode = {
            userProfileId: "qeqdqxex1qexqexqwxeqweqxeqweqe",
            userProfileHandle: "Luis-Fernando-Molina",
            blockchainAccount: "asdasdasdasdasdasdasdaasdasdasdasdasdasdsd",
            ranking: 0,
            host: "localhost",
            port: global.env.NETWORK_WEB_SOCKETS_INTERFACE_PORT
        }

        socketClient = new SA.nodeModules.ws('ws://' + selectedNetworkNode.host + ':' + selectedNetworkNode.port)
        //networkInterface = SA.projects.socialTrading.modules.networkInterface.newSocialTradingModulesNetworkInterface()

        setUpWebsocketClient()
    }

    function setUpWebsocketClient() {
        try {
            let handshakeDone = false

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
                        it's ouwn identity, and later we will sign it's own handle
                        to prove ours.
                        */
                        socketClient.onmessage = socketMessage => { stepOneResponse(socketMessage) }

                        callerTimestamp = (new Date()).valueOf()

                        let message = {
                            messageType: 'Handshake',
                            callerRole: 'Network Client',
                            userProfileHandle: DK.NETWORK_CLIENT_USER_PROFILE_HANDLE,
                            callerTimestamp: callerTimestamp,
                            step: 'One'
                        }
                        socketClient.send(message)
                    }

                    function stepOneResponse(socketMessage) {
                        let response = JSON.parse(socketMessage.data)

                        if (response.result !== 'Ok') {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> response.message = ' + response.message)
                            return
                        }

                        let signature = JSON.parse(response.signature)
                        called.blockchainAccount = web3.eth.accounts.recover(signature)
                        /*
                        We will check that the signature received produces a valid Blockchain Account.
                        */
                        if (called.blockchainAccount === undefined) {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> Signature does not produce a valid Blockchain Account.')
                            return
                        }
                        /*
                        We will check that the blockchain account taken from the signature matches
                        the one we have on record for the user profile of the Network Node we are calling.
                        */
                        if (called.blockchainAccount !== selectedNetworkNode.blockchainAccount) {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node called does not have the expected Profile Handle.')
                            return
                        }

                        let signedMessage = JSON.parse(signature.message)

                        /*
                        We will check that the Network Node that responded has the same User Profile Handle
                        that we have on record, otherwise something is wrong and we should not proceed.
                        */
                        if (signedMessage.calledProfileHandle !== selectedNetworkNode.userProfileHandle) {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node called does not have the expected Profile Handle.')
                            return
                        }
                        /*
                        We will check that the profile handle we sent to the Network Node, is returned at the
                        signed message, to avoid man in the middle attackts.
                        */
                        if (signedMessage.callerProfileHandle !== DK.NETWORK_CLIENT_USER_PROFILE_HANDLE) {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node callerProfileHandle does not match my own userProfileHandle.')
                            return
                        }
                        /*
                        We will also check that the callerTimestamp we sent to the Network Node, is returned at the
                        signed message, also to avoid man in the middle attackts.
                        */
                        if (signedMessage.callerTimestamp !== callerTimestamp) {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> The Network Node callerTimestamp does not match my own callerTimestamp.')
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

                        let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), DK.NETWORK_CLIENT_USER_PROFILE_PRIVATE_KEY)

                        let message = {
                            messageType: 'Handshake',
                            signature: JSON.stringify(signature),
                            step: 'Two'
                        }
                        socketClient.send(message)
                    }

                    function stepTwoResponse(socketMessage) {
                        let response = JSON.parse(socketMessage.data)

                        if (response.result !== 'Ok') {
                            console.log('[ERROR] Web Sockets Client -> stepOneResponse -> response.message = ' + response.message)
                            return
                        }
                        /*
                        This was the end of the Handshake producere. We are connected to the 
                        Network Node and from now on, all response messages will be received
                        at this following function.
                        */
                        socketClient.onmessage = socketMessage => { onMenssage(socketMessage) }
                    }
                }
            }

            async function onMenssage(socketMessage) {
                try {

                    let response = JSON.parse(socketMessage.data)
                    /*
                    Chack if we are waiting for the Handshake response.
                    */
                    if (handshakeDone === false) {
                        if (response.result === 'Ok') {
                            handshakeDone = true
                            return
                        } else {
                            console.log('[ERROR] Web Sockets Client -> onMenssage -> handshakeDone -> response.message = ' + response.message)
                            return
                        }
                    }

                    callbackFunction.receiveResponse(message)
                    callbackFunction = undefined

                } catch (err) {
                    callbackFunction = undefined
                    console.log('[ERROR] Web Sockets Client -> err.stack = ' + err.stack)
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

    function sendMessage(message, callback) {
        if (callbackFunction !== undefined) {
            console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send more messages while waiting for a response.')
            return false
        }

        if (socketClient.readyState !== 1) { // 1 means connected and ready.
            console.log('[ERROR] Web Sockets Client -> sendMessage -> Cannot send message while connection is closed.')
            return false
        }

        try {
            callbackFunction = callback
            socketClient.send(message)
            return true
        } catch (err) {
            callbackFunction = false
            console.log('[ERROR] Web Sockets Client -> sendMessage -> err.stack = ' + err.stack)
            return false
        }
    }
}