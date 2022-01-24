exports.newSocialTradingModulesQueriesSocialPersonas = function newSocialTradingModulesQueriesSocialPersonas() {
    /*
    This query returns a list of social personas ordered
    by Ranking. It is useful to bootstrap new users
    and provide them with a list of who to follow.
    */
    let thisObject = {
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
    }

    function initialize(queryReceived) {

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
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let socialPersona = thisObject.socialPersonas[i]
                    if (socialPersona === undefined) { break }
                    addToResponse(socialPersona)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested && i >= 0; i--) {
                    let socialPersona = thisObject.socialPersonas[i]
                    if (socialPersona === undefined) { break }
                    addToResponse(socialPersona)
                }
                break
            }
        }
        return response

        function addToResponse(socialPersona) {
            let postResponse = {
                "socialPersonaId": thisObject.socialPersona.id,
                "socialPersonaHandle": thisObject.socialPersona.handle,
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