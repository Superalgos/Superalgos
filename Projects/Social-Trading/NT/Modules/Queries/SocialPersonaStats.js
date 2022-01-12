exports.newSocialTradingModulesQueriesSocialPersonaStats = function newSocialTradingModulesQueriesSocialPersonaStats() {

    let thisObject = {
        socialPersona: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socialPersona = undefined
    }

    function initialize(queryReceived) {
        /*
        Validate User Profile
        */
        if (queryReceived.targetSocialPersonaId !== undefined) {
            thisObject.socialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(queryReceived.targetSocialPersonaId)
        } else {
            thisObject.socialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_HANDLE.get(queryReceived.targetUserProfileHandle)
        }
        
        if (thisObject.socialPersona === undefined) {
            throw ('Target Social Persona Not Found.')
        }
    }

    function execute() {

        return {
            "socialPersonaId": thisObject.socialPersona.id,
            "socialPersonaHandle": thisObject.socialPersona.handle,
            "blockchainAccount": thisObject.socialPersona.blockchainAccount,
            "ranking": thisObject.socialPersona.ranking,
            "followingCount": thisObject.socialPersona.following.size,
            "followersCount": thisObject.socialPersona.followers.size,
            "postsCount": thisObject.socialPersona.posts.size,
            "botsCount": thisObject.socialPersona.bots.size,
            "emitterEventsCount": thisObject.socialPersona.emitterEventsCount,
            "targetEventsCount": thisObject.socialPersona.targetEventsCount
        }
    }
}