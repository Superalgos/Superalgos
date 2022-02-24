exports.newTradingSignalsUtilitiesSignalSignatureValidations = function () {

    let thisObject = {
        validateSignatures: validateSignatures
    }

    return thisObject

    function validateSignatures(messageHeader) {

        let web3 = new SA.nodeModules.web3()
        /*
        We check that the entities sending the Signal belong to some User Profile,
        by extracting the blockchain accounts of the signatures.
        */
        let socialTradingBotBLockchainAccount = web3.eth.accounts.recover(messageHeader.signature)

        if (socialTradingBotBLockchainAccount === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Trading Bot Bad Signature.'
            }
            return response
        }

        if (SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(socialTradingBotBLockchainAccount) === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Trading Bot Not Linked to User Profile.'
            }
            return response
        }
        /*
        Validate that the Signed Message is the same as the Signal received.
        */
        let signedMessage = messageHeader.signalMessage
        if (
            signedMessage !== messageHeader.signature.message
        ) {
            let response = {
                result: 'Error',
                message: 'Signal Message Does Not Match Signature Message.'
            }
            return response
        }
        /*
        We will verify that the signatures belongs to the signalMessage contained at the message.
        To do this we will hash the signature.message and see if we get 
        the same hash of the signature.
        */
        let hash = web3.eth.accounts.hashMessage(signedMessage)
        if (
            hash !== messageHeader.signature.messageHash
        ) {
            let response = {
                result: 'Error',
                message: 'Signal Hash Does Not Match Signature Hash.'
            }
            return response
        }
    }
}