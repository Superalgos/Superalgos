exports.newNetworkModulesSocketNetworkClients = function newNetworkModulesSocketNetworkClients() {
    /*
    Here is all the common code used by web sockets and web RTC at the client side
    of the Network.
    */
    let thisObject = {
        id: undefined,
        socket: undefined,
        callerRole: undefined,
        p2pNetworkClient: undefined,
        p2pNetworkNode: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkClientCodeName: undefined,
        onConnectionClosedCallBack: undefined,
        handshakeProcedure: handshakeProcedure,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let web3
    let called = {}
    let onMessageFunctionsMap = new Map()
    return thisObject

    function finalize() {
        thisObject.socket.close()
        thisObject.socket = undefined
        thisObject.id = undefined
        thisObject.callerRole = undefined
        thisObject.p2pNetworkNode = undefined
        thisObject.p2pNetworkClient = undefined
        thisObject.p2pNetworkClientIdentity = undefined
        thisObject.onConnectionClosedCallBack = undefined

        web3 = undefined
        called = undefined
        onMessageFunctionsMap = undefined
    }

    async function initialize(
        socket,
        callerRole,
        p2pNetworkClientIdentity,
        p2pNetworkNode,
        p2pNetworkClient,
        onConnectionClosedCallBack
    ) {

        thisObject.socket = socket
        thisObject.callerRole = callerRole
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.p2pNetworkClientCodeName = thisObject.p2pNetworkClientIdentity.node.config.codeName
        thisObject.p2pNetworkNode = p2pNetworkNode
        thisObject.p2pNetworkClient = p2pNetworkClient
        thisObject.onConnectionClosedCallBack = onConnectionClosedCallBack

        web3 = new SA.nodeModules.web3()

        thisObject.id = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
    }

    function handshakeProcedure(resolve, reject) {

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
            thisObject.socket.onmessage = socketMessage => { stepOneResponse(socketMessage) }

            callerTimestamp = (new Date()).valueOf()

            let message = {
                messageType: 'Handshake',
                callerRole: thisObject.callerRole,
                callerProfileHandle: SA.secrets.signingAccountSecrets.map.get(thisObject.p2pNetworkClientCodeName).userProfileHandle,
                callerTimestamp: callerTimestamp,
                step: 'One'
            }
            thisObject.socket.send(JSON.stringify(message))
        }

        function stepOneResponse(socketMessage) {
            let response = JSON.parse(socketMessage.data)

            if (response.result !== 'Ok') {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> response.message = ' + response.message)
                reject('Socket Network Clients -> stepOneResponse -> response.message = ' + response.message)
                return
            }

            let signature = JSON.parse(response.signature)
            called.blockchainAccount = web3.eth.accounts.recover(signature)
            /*
            We will check that the signature received produces a valid Blockchain Account.
            */
            if (called.blockchainAccount === undefined) {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> Signature does not produce a valid Blockchain Account.')
                reject('Socket Network Clients -> stepOneResponse -> Signature does not produce a valid Blockchain Account.')
                return
            }
            /*
            We will check that the blockchain account taken from the signature matches
            the one we have on record for the user profile of the Network Node we are calling.
            */
            if (called.blockchainAccount !== thisObject.p2pNetworkNode.blockchainAccount) {
                /*
                DEBUG NOTE: If you are having trouble undestanding why you can not connect to a certain network node, then you can activate the following Console Logs, otherwise you keep them commented out.
                */
                /*
                SA.logger.warn('Socket Network Clients -> stepOneResponse -> The Network Node called does not have the expected Blockchain Account.')
                SA.logger.warn('Socket Network Clients -> stepOneResponse -> Not possible to connect to node belonging to ' + thisObject.p2pNetworkNode.userProfile.name)
                SA.logger.warn('Socket Network Clients -> stepOneResponse -> This error happens when 1) This network node is configured to run on localhost and at localhost you are running your own network node instead. 2) The user profile that owns the Network Node you are connecting to, it is not up-to-date at your machine. Run an app.update to get the latest version of all User Profile plugins and try again. 3) The Network Node you are trying to connect to does not have in memory the latest version of the User Profile Plugin that owns that Network Node. The Network Node updates itself every 5 minutes, so you should wait at least that time and try again.')
                */
                reject('blockchainAccounts do not match')
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
                SA.logger.error('Socket Network Clients -> stepOneResponse -> signature.message Hashed Does Not Match signature.messageHash.')
                reject('Socket Network Clients -> stepOneResponse -> signature.message Hashed Does Not Match signature.messageHash.')
                return
            }
            /*
            We will check that the Network Node that responded has the same User Profile Handle
            that we have on record, otherwise something is wrong and we should not proceed.
            */
            if (signedMessage.calledProfileHandle !== thisObject.p2pNetworkNode.userProfile.config.codeName) {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> The Network Node called does not have the expected Profile codeName.')
                reject('Socket Network Clients -> stepOneResponse -> The Network Node called does not have the expected Profile codeName.')
                return
            }
            /*
            We will check that the profile handle we sent to the Network Node, is returned at the
            signed message, to avoid man in the middle attacks.
            */
            if (signedMessage.callerProfileHandle !== SA.secrets.signingAccountSecrets.map.get(thisObject.p2pNetworkClientCodeName).userProfileHandle) {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> The Network Node callerProfileHandle does not match my own userProfileHandle.')
                reject('Socket Network Clients -> stepOneResponse -> The Network Node callerProfileHandle does not match my own userProfileHandle.')
                return
            }
            /*
            We will also check that the callerTimestamp we sent to the Network Node, is returned at the
            signed message, also to avoid man in the middle attacks.
            */
            if (signedMessage.callerTimestamp !== callerTimestamp) {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> The Network Node callerTimestamp does not match my own callerTimestamp.')
                reject('Socket Network Clients -> stepOneResponse -> The Network Node callerTimestamp does not match my own callerTimestamp.')
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
            thisObject.socket.onmessage = socketMessage => { stepTwoResponse(socketMessage) }

            let signature = web3.eth.accounts.sign(JSON.stringify(signedMessage), SA.secrets.signingAccountSecrets.map.get(thisObject.p2pNetworkClientCodeName).privateKey)

            let message = {
                messageType: 'Handshake',
                signature: JSON.stringify(signature),
                step: 'Two'
            }
            thisObject.socket.send(JSON.stringify(message))
        }

        function stepTwoResponse(socketMessage) {
            let response = JSON.parse(socketMessage.data)

            if (response.result !== 'Ok') {
                SA.logger.error('Socket Network Clients -> stepOneResponse -> response.message = ' + response.message)
                reject('Socket Network Clients -> stepOneResponse -> response.message = ' + response.message)
                return
            }
            /*
            This was the end of the Handshake procedure. We are connected to the
            Network Node and from now on, all response messages will be received
            at this following function.
            */
            thisObject.socket.onmessage = socketMessage => { onMessage(socketMessage) }
            resolve()
        }
    }

    function sendMessage(message, responseHandler) {

        return new Promise(sendSocketMessage)

        function sendSocketMessage(resolve, reject) {

            if (thisObject.socket.readyState !== 1) { // 1 means connected and ready.
                SA.logger.error('Socket Network Clients -> sendMessage -> Cannot send message while connection is closed.')
                let response = {
                    result: 'Error',
                    message: 'Websockets Connection Not Ready.'
                }
                resolve(response)
                return
            }

            let socketMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                messageType: 'Request',
                payload: message
            }
            
            if (responseHandler === undefined) { 
                responseHandler = onMessageFunction 
            }
            onMessageFunctionsMap.set(socketMessage.messageId, responseHandler)
            thisObject.socket.send(
                JSON.stringify(socketMessage)
            )

            function onMessageFunction(response) {
                try {
                    if (response.result === 'Ok' || response.result === 'Warning') {
                        if (response.data !== undefined) {
                            resolve(response.data)
                        } else {
                            resolve(response)
                        }
                    } else {
                        SA.logger.error('Socket Network Clients -> onMessageFunction -> response.message = ' + response.message)
                        reject(response.message)
                    }
                } catch (err) {
                    callbackFunction = undefined
                    SA.logger.error('Socket Network Clients -> err.stack = ' + err.stack)
                }
            }
        }
    }

    function onMessage(socketMessage) {

        let messageHeader = JSON.parse(socketMessage.data)
        /*
        We get the function that is going to resolve or reject the promise given.
        */
        let onMessageFunction = onMessageFunctionsMap.get(messageHeader.messageId)

        if (onMessageFunction !== undefined) {
            processAnswerToARequest(messageHeader)
        } else {
            processNotification(messageHeader)
        }

        function processAnswerToARequest(messageHeader) {
            /*
            The message received is a response to a message sent.
            */
            onMessageFunctionsMap.delete(messageHeader.messageId)
            onMessageFunction(messageHeader)
        }

        function processNotification(messageHeader) {
            /*
            The message received is a not response to a message sent.
            That means that it is a notification received from the Network Node
            of an event or signal that happened at some other Client of the Network.

            This can only happen when this module is running at an APP like 
            the Social Trading App, Platform App, or Task Server App.
            */
            let payload
            try {
                payload = JSON.parse(messageHeader.payload)
            } catch (err) {
                SA.logger.warn('Socket Network Clients -> Payload Not Correct JSON Format.')
            }
            switch (payload.networkService) {
                case 'Social Graph': {
                    if (thisObject.p2pNetworkClient.socialGraphNetworkServiceClient !== undefined) {
                        thisObject.p2pNetworkClient.socialGraphNetworkServiceClient.p2pNetworkInterface.messageReceived(
                            messageHeader.payload,
                            thisObject.p2pNetworkClient.eventReceivedCallbackFunction
                        )
                    } else {
                        SA.logger.warn('Socket Network Clients -> Social Graph Network Service Client Not Running')
                    }
                    break
                }
                case 'Trading Signals': {
                    if (thisObject.p2pNetworkClient.tradingSignalsNetworkServiceClient !== undefined) {
                        /*
                        Send the signal to the Service Network Interface.
                        */
                        thisObject.p2pNetworkClient.tradingSignalsNetworkServiceClient.p2pNetworkInterface.messageReceived(
                            messageHeader.payload,
                            thisObject.p2pNetworkClient.eventReceivedCallbackFunction,
                            messageHeader.rankingStats
                        )
                    } else {
                        SA.logger.warn('Socket Network Clients -> Trading Signals Network Service Client Not Running')
                    }
                    break
                }
                default: {
                    SA.logger.warn('Socket Network Clients -> Network Service Not Supported -> messageHeader.networkService = ' + messageHeader.networkService)
                }
            }
        }
    }
}