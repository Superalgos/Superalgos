exports.newTradingSignalsModulesClientInterface = function newTradingSignalsModulesClientInterface() {
    /*
    This module process all incoming signals.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }
    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    async function messageReceived(messageHeader, socketMessage) {
        SA.logger.debug('Trading-Signals -> Client Interface -> Message Received')

        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Provided.'
            }
            SA.logger.error('Trading-Signals -> Client Interface -> Message Received -> Client Interface requestType Not Provided.')
            return response
        }

        switch (messageHeader.requestType) {
            case 'Signal': {
                /*
                At this point we have a new signal that have come directly from the broadcaster.
                We will run some validations on it before forwarding it to other P2P Network Nodes or recipients.
                */
                let response = SA.projects.tradingSignals.utilities.signalSignatureValidations.validateSignatures(messageHeader)

                /* Determine by which Social Trading Bot this signal was signed */
                let senderBlockchainAccount = web3.eth.accounts.recover(messageHeader.signature)
                let senderUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(senderBlockchainAccount)
                let sendingBot = SA.projects.tradingSignals.utilities.signalSignatureValidations.getSigningNode(senderUserProfile, senderBlockchainAccount)

                return await signalReceived(socketMessage, sendingBot)
            }
            case 'Follow': {
                /* A caller has requested subscription to a signal. */
                let caller = socketMessage
                let userProfile = caller.userProfile
                let listeningBotId = messageHeader.queryMessage.listeningBotId
                let followedBotReferenceId = messageHeader.queryMessage.followedBotReferenceId
                let followedBotRequest = messageHeader.queryMessage.followedBotRequest
                let listeningBot
                let followedBotReference

                /* Verify if the listening bot belongs to the caller. */
                let userSocialBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile, 'Social Trading Bot')
                for (let i = 0; i < userSocialBots.length; i++) {
                    if (listeningBotId === userSocialBots[i].id) {
                        listeningBot = userSocialBots[i]
                    }
                }
                if (listeningBot === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'Listening Social Trading Bot was not found within the User Profile.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                    return response
                }
                if (listeningBot.signingAccount?.config?.signature === undefined) {
                    let response = {
                        result: 'Error',
                        message: 'Listening Social Trading Bot has no Signing Account attached.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                    return response
                }

                /* Verify if the caller fulfills the minimum token power requirement to follow the sender. */
                /* First, get the sender's min token requirements. */
                let senderUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(followedBotRequest.followedBotBlockchainAccount)
                let sendingBot = SA.projects.tradingSignals.utilities.signalSignatureValidations.getSigningNode(senderUserProfile, followedBotRequest.followedBotBlockchainAccount)
                let followerMinTokenPower = sendingBot.config.followerMinTokenPower || 0
                let allocatedTokenPower = 0

                /* Second, check if we have Token Power allocated to the Followed Bot Reference. */
                /* We assume 0 as default for now, even if no Followed Bot Reference can be found. */
                let followedBotReferences = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(listeningBot, 'Followed Bot Reference')
                for (let i = 0; i < followedBotReferences.length; i++) {
                    if (followedBotReferenceId === followedBotReferences[i].id) {
                        followedBotReference = followedBotReferences[i]
                    }
                }
                if (followedBotReference?.payload?.tokenPower !== undefined) {
                    allocatedTokenPower = parseFloat(followedBotReference.payload.tokenPower.toFixed(0))
                }

                if (allocatedTokenPower < followerMinTokenPower) {
                    let response = {
                        result: 'Error',
                        message: 'Bot requires minimum ' + SA.projects.governance.utilities.balances.toTokenPowerString(followerMinTokenPower) + ' Token Power to follow.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                    return response
                }

                /* Double-check if sender and follower are still talking about the same node ID */
                if (followedBotRequest.id !== sendingBot.id) {
                    let response = {
                        result: 'Error',
                        message: 'The requested Social Trading Bot is no longer available behind the linked blockchain account. Please update your client.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                    return response
                }

                /* Constructing this to enable progress also when the Network Node is not aware of the Followed Bot Reference yet (zero Token Power requirement only) */
                let followerReference = {
                    id: followedBotReferenceId,
                    tokenPower: allocatedTokenPower
                }

                let response
                if (await NT.networkApp.webSocketsInterface.socketInterfaces.addFollower(caller, followerReference, listeningBot, sendingBot, senderUserProfile) !== true) {
                    response = {
                        result: 'Error',
                        message: 'Error while adding follower relationship on Network Node.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                } else {
                    response = {
                        result: 'Ok',
                        message: 'Successfully subscribed.',
                        followedBotReferenceId: followedBotReferenceId
                    }
                }
                return response
                break
            }
            case 'Unfollow': {
                break
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'Client Interface requestType Not Supported.'
                }
                SA.logger.error('Trading-Signals -> Client Interface -> Message Received -> Client Interface requestType does not have a case match.')
                return response
            }
        }

        if (messageHeader.requestType !== 'Signal') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            SA.logger.error('Trading-Signals -> Client Interface -> Message Received -> Client Interface requestType (' + messageHeader.requestType + ') Not Supported: ')
            return response
        }

        async function signalReceived(socketMessage, sendingBot) {
            /*
            Broadcast the Signal to all clients connected to this Network Node.
            */
            let response
            if (await NT.networkApp.webSocketsInterface.socketInterfaces.broadcastSignalsToFollowers(socketMessage, sendingBot) !== true) {
                response = {
                    result: 'Error',
                    message: 'Signal Could Not be Broadcasted to Network Clients.'
                }
                SA.logger.error('Trading-Signals -> Client Interface -> Message Received -> Signal Could Not be Broadcasted to Network Clients.')
            }

            if (response === undefined) {
                response = {
                    result: 'Ok',
                    message: 'Signal Accepted & Broadcasted.'
                }
                SA.logger.debug('Trading-Signals -> Client Interface -> Message Received -> Signal Accepted & Broadcast.')
            }
            return response
        }
    }
}