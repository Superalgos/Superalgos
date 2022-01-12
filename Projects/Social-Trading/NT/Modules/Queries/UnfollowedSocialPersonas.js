exports.newSocialTradingModulesQueriesUnfollowedSocialPersonas = function newSocialTradingModulesQueriesUnfollowedSocialPersonas() {
    /*
    This query returns a list of user socialPersonas ordered
    by Ranking. It filters out all the socialPersonas that 
    are already followed by the Emitter Social Persona.
    */
    let thisObject = {
        emitterSocialPersona: undefined,
        socialPersonas: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socialPersonas = undefined
        thisObject.emitterSocialPersona = undefined
    }

    function initialize(queryReceived) {

        thisObject.emitterSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(queryReceived.emitterSocialPersonaId)
        if (thisObject.emitterSocialPersona === undefined) {
            throw ('Emitter Social Persona Not Found.')
        }

        thisObject.socialPersonas = Array.from(
            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID,
            x => x[1]
        )
        thisObject.socialPersonas.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.socialPersonas)

    }

    function execute() {

        let response = []

        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP: {
                let i = thisObject.initialIndex
                let foundCount = 0
                while (
                    foundCount < thisObject.amountRequested &&
                    i < thisObject.socialPersonas.length
                ) {
                    let socialPersona = thisObject.socialPersonas[i]
                    if (
                        thisObject.emitterSocialPersona.following.get(socialPersona.userProfileId) === undefined &&
                        thisObject.emitterSocialPersona.userProfileId !== socialPersona.userProfileId
                        ) {
                        addToResponse(socialPersona)
                        foundCount++
                    }
                    i++
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
                let i = thisObject.initialIndex
                let foundCount = 0
                while (
                    foundCount < thisObject.amountRequested &&
                    i >= 0
                ) {
                    let socialPersona = thisObject.socialPersonas[i]
                    if (
                        thisObject.emitterSocialPersona.following.get(socialPersona.userProfileId) === undefined &&
                        thisObject.emitterSocialPersona.userProfileId !== socialPersona.userProfileId
                        ) {
                        addToResponse(socialPersona)
                        foundCount++
                    }
                    i--
                }                
                break
            }
        }
        return response

        function addToResponse(socialPersona) {
            let postResponse = {
                "socialPersonaId": socialPersona.id,
                "socialPersonaHandle": socialPersona.handle,
                "blockchainAccount": socialPersona.blockchainAccount,
                "ranking": socialPersona.ranking,
                "followingCount": socialPersona.following.size,
                "followersCount": socialPersona.followers.size,
                "postsCount": socialPersona.posts.size,
                "botsCount": socialPersona.bots.size,
                "emitterEventsCount": socialPersona.emitterEventsCount,
                "targetEventsCount": socialPersona.targetEventsCount
            }
            response.push(postResponse)
        }
    }
}