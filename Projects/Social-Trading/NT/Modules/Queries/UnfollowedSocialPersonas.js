exports.newSocialTradingModulesQueriesUnfollowedSocialPersonas = function newSocialTradingModulesQueriesUnfollowedSocialPersonas() {
    /*
    This query returns a list of user socialPersonas ordered
    by Ranking. It filters out all the socialPersonas that 
    are already followed by the Origin Social Persona.
    */
    let thisObject = {
        originSocialPersona: undefined,
        socialPersonas: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socialPersonas = undefined
        thisObject.originSocialPersona = undefined
    }

    function initialize(queryReceived) {

        thisObject.originSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(queryReceived.originSocialPersonaId)
        if (thisObject.originSocialPersona === undefined) {
            throw ('Origin Social Persona Not Found.')
        }

        thisObject.socialPersonas = Array.from(
            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID,
            x => x[1]
        )
        thisObject.socialPersonas.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.socialPersonas)

    }

    function run() {

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
                        thisObject.originSocialPersona.following.get(socialPersona.id) === undefined &&
                        thisObject.originSocialPersona.id !== socialPersona.id
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
                        thisObject.originSocialPersona.following.get(socialPersona.id) === undefined &&
                        thisObject.originSocialPersona.id !== socialPersona.id
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
                "originEventsCount": socialPersona.originEventsCount,
                "targetEventsCount": socialPersona.targetEventsCount
            }
            response.push(postResponse)
        }
    }
}