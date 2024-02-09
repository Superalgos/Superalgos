exports.newTradingSignalsModulesTradingSignalsNetworkServiceClient = function newTradingSignalsModulesTradingSignalsNetworkServiceClient() {
    /*
    This module represents the Client of the Trading Signals Network Service
    running inside P2P Network Nodes.
    */
    let thisObject = {
        userAppSigningAccountCodeName: undefined,
        tradingSignalsNetworkServiceProxy: undefined,
        p2pNetworkInterface: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        clearInterval(thisObject.timer)
        thisObject.timer = undefined
        thisObject.userAppSigningAccountCodeName = undefined
        thisObject.tradingSignalsNetworkServiceProxy = undefined
        thisObject.p2pNetworkInterface = undefined
        thisObject.p2pNetworkNodesConnectedTo = undefined
        thisObject.openConnections = undefined
        thisObject.socialTradingBotReference = undefined
    }

    function initialize(
        userAppSigningAccountCodeName,
        tradingSignalsNetworkServiceProxy,
        p2pNetworkNodesConnectedTo,
        socialTradingBotReference
    ) {
        thisObject.userAppSigningAccountCodeName = userAppSigningAccountCodeName
        thisObject.tradingSignalsNetworkServiceProxy = tradingSignalsNetworkServiceProxy
        thisObject.p2pNetworkNodesConnectedTo = p2pNetworkNodesConnectedTo
        thisObject.openConnections = thisObject.p2pNetworkNodesConnectedTo.length
        thisObject.socialTradingBotReference = socialTradingBotReference
        /*
        This is where we will process all the signals comming from the p2p network.
        */
        thisObject.p2pNetworkInterface = SA.projects.tradingSignals.modules.p2pNetworkInterface.newTradingSignalsModulesP2PNetworkInterface()
        thisObject.p2pNetworkInterface.initialize()

        if (thisObject.p2pNetworkNodesConnectedTo.peers.length > 0) {
            followSignals(thisObject.socialTradingBotReference)
        }
        thisObject.timer = setInterval(monitorConnection, 1000)
    }

    function monitorConnection() {
        if (thisObject.p2pNetworkNodesConnectedTo.peers.length !== thisObject.openConnections) {
            thisObject.openConnections = thisObject.p2pNetworkNodesConnectedTo.peers.length
            if (thisObject.openConnections > 0) { followSignals(thisObject.socialTradingBotReference) }
        }
    }
    
    
    async function followSignals(socialTradingBotReference) {
        /*
        If we have a Social Trading Bot referenced, verify if we want to follow someone and initiate subscription to the sender's signals
        */
        if (socialTradingBotReference === undefined) { return }
        if (socialTradingBotReference.referenceParent === undefined) { return }
        if (socialTradingBotReference.referenceParent.followedBotReference === undefined || socialTradingBotReference.referenceParent.followedBotReference.length === 0) { return }
        let listeningBotId = socialTradingBotReference.referenceParent.id
        let web3 = new SA.nodeModules.web3()
        const networkNodeUserProfile = undefined

        /* Send a subscription request for each Social Trading Bot we are following */
        let response
        for (let i = 0; i < socialTradingBotReference.referenceParent.followedBotReference.length; i++) {
            let followedBotReference = socialTradingBotReference.referenceParent.followedBotReference[i]
            if (followedBotReference.referenceParent === undefined) { continue }
            if (followedBotReference.referenceParent.signingAccount.config.signature !== undefined) {
                let blockchainAccount = web3.eth.accounts.recover(followedBotReference.referenceParent.signingAccount.config.signature)
                let message = {
                    messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    listeningBotId: listeningBotId,
                    followedBotReferenceId: followedBotReference.id,
                    followedBotRequest: {
                        followedBotBlockchainAccount: blockchainAccount,
                        id: followedBotReference.referenceParent.id
                    }
                }
                let messageHeader = {
                    networkService: 'Trading Signals',
                    requestType: 'Follow',
                    queryMessage: message
                }
                try {
                    response = await thisObject.p2pNetworkNodesConnectedTo.sendMessage(JSON.stringify(messageHeader), networkNodeUserProfile, onFollowRequestResponse)
                } catch (err) {
                    SA.logger.error('Trading Signals Network Service Client -> followSignals -> error: ' + err.stack)
                }

            }
        }

        return response
    }

    function onFollowRequestResponse(response) {
        /* This function interprets responses to the follow request coming from the network node */
        if (response === undefined) { return }
        if (response.result === undefined) { return }
        let followedBotReference
        if (response.followedBotReferenceId !== undefined) {
            for (let i = 0; i < thisObject.socialTradingBotReference.referenceParent.followedBotReference.length; i++) {
                if (thisObject.socialTradingBotReference.referenceParent.followedBotReference[i].id === response.followedBotReferenceId) {
                    followedBotReference = thisObject.socialTradingBotReference.referenceParent.followedBotReference[i]
                    break
                }
            }
        }   
        if (response.result === 'Ok') {
            SA.logger.info('Signal Follow Request to ' + followedBotReference?.name + ': ' + response.message)
        } else {
            SA.logger.error('Signal Follow Request to ' + followedBotReference?.name + ' failed: ' + response.message)
            TS.projects.foundations.functionLibraries.taskFunctions.taskHearBeat("Error while following Signal, stopping...", false)
            SA.logger.error('Stopping task: ' + TS.projects.foundations.globals.taskConstants.TASK_NODE.name)
            TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess()
        }
    }
    
    async function sendMessage(messageHeader) {

        switch (messageHeader.requestType) {
            case 'Signal': {
                let signalMessage
                try {
                    signalMessage = JSON.parse(messageHeader.signalMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'signalMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                /*
                We need the Origin Social Entity so as to be able to sign this signal. And for Post related
                signals in order to locate the Available Storage. 
                */
                let socialEntity
                if (signalMessage.originSocialPersonaId !== undefined) {
                    let socialEntityId = signalMessage.originSocialPersonaId
                    socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(socialEntityId)
                }
                if (signalMessage.originSocialTradingBotId !== undefined) {
                    let socialEntityId = signalMessage.originSocialTradingBotId
                    socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_ID.get(socialEntityId)
                }
                /*
                Some Validations
                */
                if (socialEntity === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'Cannot Locate the Origin Social Entity. Check if you have added the Social Graph Network Service.'
                    }
                    return response
                }
                /*
                Timestamp is required so that the Signature is not vulnerable to Man in the Middle attacks.
                */
                if (signalMessage.timestamp === undefined) {
                    signalMessage.timestamp = (new Date()).valueOf()
                }
                messageHeader.signalMessage = JSON.stringify(signalMessage)
                /*
                Social Entity Signature is required in order for this signal to be considered at all 
                nodes of the P2P network and not only at the one we are connected to.
                */
                let web3 = new SA.nodeModules.web3()
                messageHeader.signature = web3.eth.accounts.sign(messageHeader.signalMessage, SA.secrets.signingAccountSecrets.map.get(socialEntity.node.config.codeName).privateKey)
                /*
                At this point we are going to send the message via this Proxy to the Social Graph Network Service
                */
                let response = {
                    result: 'Ok',
                    message: 'Signal Processed.',
                    data: await thisObject.tradingSignalsNetworkServiceProxy.sendMessage(messageHeader)
                }
                return response
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'requestType Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }
}