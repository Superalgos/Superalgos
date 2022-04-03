exports.newSocialTradingModulesQueriesPostReplies = function newSocialTradingModulesQueriesPostReplies() {
    /*
    Each Post regardless if it is authored by a Social Persona or Social Trading Bot,
    can have replies. This query is designed for Social Entities to 
    fetch the posts metadata that are replies to a certain post.

    This is the query executed at the Social Trading App to fill the page
    of a certain post, with all its replies.
    */
    let thisObject = {
        array: undefined,
        socialEntity: undefined,
        post: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.array = undefined
        thisObject.socialEntity = undefined
        thisObject.post = undefined
    }

    function initialize(queryReceived) {

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)


        NT.projects.socialTrading.utilities.queriesValidations.postValidations(queryReceived, thisObject)

        thisObject.array = Array.from(thisObject.post.replies)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)
    }

    function run() {

        let response = []


        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (thisObject.post === undefined) {
                        break
                    }
                    addToResponse(arrayItem[1], i)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested && i >= 0; i--) {
                    let arrayItem = thisObject.array[i]
                    if (thisObject.post === undefined) {
                        break
                    }
                    addToResponse(arrayItem[1], i)
                }
                break
            }
        }
        return response

        function addToResponse(postHash, index) {
            let post = SA.projects.socialTrading.globals.memory.maps.POSTS.get(postHash);

            if (post === undefined) return;

            let postResponse = {
                index: index,
                originSocialPersonaId: post.originSocialPersonaId,
                targetSocialPersonaId: post.targetSocialPersonaId,
                originSocialTradingBotId: post.originSocialTradingBotId,
                targetSocialTradingBotId: post.targetSocialTradingBotId,
                originPostHash: post.originPostHash,
                targetPostHash: post.targetPostHash,
                postType: post.postType,
                timestamp: post.timestamp,
                fileKeys: post.fileKeys,
                repliesCount: post.replies.size,
                reactions: Array.from(post.reactions),
                reaction: post.reactionsBySocialEntity.get(thisObject.socialEntity.id)
            }

            let originSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(postResponse.originSocialPersonaId)
            let originSocialTradingBot = SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_ID.get(postResponse.originSocialTradingBotId)

            if (originSocialPersona !== undefined) {
                let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                query.initialize({targetSocialPersonaId: originSocialPersona.id})
                postResponse.originSocialPersona = query.run()
                query.finalize()
            }

            if (originSocialTradingBot !== undefined) {
                let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                query.initialize({
                    targetSocialPersonaId: originSocialPersona.id,
                    targetSocialTradingBotId: originSocialTradingBot.id
                })
                postResponse.originSocialTradingBot = query.run()
                query.finalize()
            }

            response.push(postResponse)
        }
    }
}