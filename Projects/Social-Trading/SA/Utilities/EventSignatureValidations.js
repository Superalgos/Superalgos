exports.newSocialTradingUtilitiesEventSignatureValidations = function newSocialTradingUtilitiesEventSignatureValidations() {
    /*
    This module have a few functions that are often needed at Queries Modules.
    */
    let thisObject = {
        signatureValidations: signatureValidations
    }

    return thisObject

    function signatureValidations(eventReceived, signature) {
        
        let web3 = new SA.nodeModules.web3()
        /*
        We will check the signature at the message. 
        */
        if (signature === undefined) {
            let response = {
                result: 'Error',
                message: 'Event Signature Not Provided.'
            }
            return response
        }

        let socialEntityBlockchainAccount = web3.eth.accounts.recover(signature)

        if (socialEntityBlockchainAccount === undefined) {
            let response = {
                result: 'Error',
                message: 'Event Bad Signature.'
            }
            return response
        }
        /*
        The signature gives us the blockchain account, and the account the user profile.
        */
        let userProfileByBlockchainAccount = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_BLOKCHAIN_ACCOUNT.get(socialEntityBlockchainAccount)

        if (userProfileByBlockchainAccount === undefined) {
            let response = {
                result: 'Error',
                message: 'Event Signature Not Linked to User Profile.'
            }
            return response
        }
        
        /*
        We will verify that the signature belongs to the event message.
        To do this we will hash the event message and see if we get 
        the same hash of the signature.
        */
        let eventMessage = JSON.stringify(eventReceived)
        let hash = web3.eth.accounts.hashMessage(eventMessage)
        if (hash !== signature.messageHash) {
            let response = {
                result: 'Error',
                message: 'Event Message Hashed Does Not Match signature.messageHash.'
            }
            return response
        }
        /*
        The user profile based on the blockchain account, based on the signature,
        it is our witness user profile, to validate the social entity id received
        we need to get which is the User Profile that social entity id is linked to.
        */
        let userProfileBySocialEntityId
        if (eventReceived.originSocialPersonaId !== undefined) {
            let socialEntityId = eventReceived.originSocialPersonaId
            userProfileBySocialEntityId = SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.get(socialEntityId)
        }
        if (eventReceived.originSocialTradingBotId !== undefined) {
            let socialEntityId = eventReceived.originSocialTradingBotId
            userProfileBySocialEntityId = SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.get(socialEntityId)
        }
        if (userProfileBySocialEntityId === undefined) {
            let response = {
                result: 'Error',
                message: 'Social Entity Id Not Linked to User Profile.'
            }
            return response
        }
        /*
        Check that the user profile we got from the signature, is the same as the user profile
        we got from the social entity id.
        */
        if (userProfileByBlockchainAccount.id !== userProfileBySocialEntityId.id) {
            let response = {
                result: 'Error',
                message: 'Social Entity Id User Profile Does Not Match Signature Profile.'
            }
            return response
        }
    }
}