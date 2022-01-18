exports.newSocialTradingModulesQuery = function newSocialTradingModulesQuery() {
    /*
    A Query is a call from a Social Trading App to 
    the Social Graph Network Service with the purpose to get 
    relevant information from the Social Graph.

    A Query does not produce changes
    on the state of the Social Graph. 
    */
    let thisObject = {
        query: undefined,
        queryType: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.query = undefined
        thisObject.queryType = undefined
    }

    function initialize(queryReceived) {

        thisObject.queryType = queryReceived.queryType

        switch (thisObject.queryType) {

            case SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONAS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesSocialPersonas.newSocialTradingModulesQueriesSocialPersonas()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_SOCIAL_PERSONAS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesUnfollowedSocialPersonas.newSocialTradingModulesQueriesUnfollowedSocialPersonas()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONA_STATS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.SOCIAL_TRADING_BOT_STATS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.POSTS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesPosts.newSocialTradingModulesQueriesPosts()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.POST_REPLIES: {
                thisObject.query = NT.projects.socialTrading.modules.queriesPostReplies.newSocialTradingModulesQueriesPostReplies()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.FOLLOWERS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesFollowers.newSocialTradingModulesQueriesFollowers()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.FOLLOWING: {
                thisObject.query = NT.projects.socialTrading.modules.queriesFollowing.newSocialTradingModulesQueriesFollowing()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.EVENTS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesEvents.newSocialTradingModulesQueriesEvents()
                thisObject.query.initialize(queryReceived)
                break
            }

            case SA.projects.socialTrading.globals.queryTypes.POST: {
                thisObject.query = NT.projects.socialTrading.modules.queriesPost.newSocialTradingModulesQueriesPost()
                thisObject.query.initialize(queryReceived)
                break
            }

            default: throw ('Query Type Not Supported.')
        }
    }

    function run() {
        let response = thisObject.query.run()
        thisObject.query.finalize()
        return response
    }
}