exports.newNetworkModulesIncomingSignals = function newNetworkModulesIncomingSignals() {
    /*
    This module process all incoming signals.
    */
    let thisObject = {
        newSignal: newSignal,
        initialize: initialize,
        finalize: finalize
    }

    let web3

    return thisObject

    function finalize() {
        web3 = undefined
    }

    function initialize() {
        web3 = new SA.nodeModules.web3()
    }

    function newSignal(signalMessage) {
        /*
        At this point we have a new signal that might have come directly from the broadcaster
        of from other P2P Network Node. In any case, we will run some validations on it before
        forwarding it to other P2P Network Nodes or recipients.
        */

        /*
        We check that the entities sending the Signal belong to some User Profile,
        by extracting the blockchain accounts of the signatures.
        */
        let userAppBLockchainAccount = web3.eth.accounts.recover(signalMessage.signatures.userApp)

        if (userAppBLockchainAccount === undefined) {
            let response = {
                result: 'Error',
                message: 'User App Bad Signature.'
            }
            return response
        }

        if (SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(userAppBLockchainAccount) === undefined) {
            let response = {
                result: 'Error',
                message: 'User App Not Linked to User Profile.'
            }
            return response
        }

        let socialTradingBotBLockchainAccount = web3.eth.accounts.recover(signalMessage.signatures.socialTradingBot)

        if (socialTradingBotBLockchainAccount === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Trading Bot Bad Signature.'
            }
            return response
        }

        if (SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(socialTradingBotBLockchainAccount) === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Trading Bot Not Linked to User Profile.'
            }
            return response
        }
        /*
        Validate that the Signed Message is the same as the Signal received.
        */
        let signedMessage = JSON.stringify(signalMessage.signal)
        if (
            signedMessage !== signalMessage.signatures.userApp.message ||
            signedMessage !== signalMessage.signatures.socialTradingBot.message
        ) {
            let response = {
                result: 'Error',
                message: 'Signal Message Does Not Match Signature Message.'
            }
            return response
        }
        /*
        We will verify that the signatures belongs to the signal contained at the message.
        To do this we will hash the signature.message and see if we get 
        the same hash of the signature.
        */

        let hash = web3.eth.accounts.hashMessage(signedMessage)
        if (
            hash !== signalMessage.signatures.userApp.messageHash ||
            hash !== signalMessage.signatures.socialTradingBot.messageHash
        ) {
            let response = {
                result: 'Error',
                message: 'Signal Hash Does Not Match Signature Hash.'
            }
            return response
        }

        let response = {
            result: 'Ok',
            message: 'Signal Accepted.'
        }
        return response
    }
}