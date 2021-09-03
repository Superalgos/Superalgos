exports.newSocialTradingModulesQuery = function newSocialTradingModulesQuery() {
    /*
    A Query is a call from a Network Client to 
    a Network Node with the purpose to get 
    relevant information from the Social Graph.

    A Query does not produce changes
    on the state of the Social Graph. 
    */
    let thisObject = {
        query: undefined,
        queryType: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    const QUERY_TYPES = {

        USER_PROFILES: 0,
        USER_PROFILE_STATS: 1,
        BOT_PROFILE_STATS: 2,
        PROFILE_POSTS: 3,
        PROFILE_FOLLOWERS: 4,
        PROFILE_FOLLOWING: 5,
        POST_REPLIES: 6,
        EVENTS: 7

    }

    return thisObject

    function finalize() {
        thisObject.query = undefined
        thisObject.queryType = undefined
    }

    function initialize(queryReceived) {

        thisObject.queryType = queryReceived.queryType

        switch (thisObject.queryType) {

            case QUERY_TYPES.USER_PROFILES: {
                thisObject.query = NT.projects.socialTrading.modules.queriesUserProfiles.newSocialTradingModulesQueriesUserProfiles()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.USER_PROFILE_STATS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesUserProfileStats.newSocialTradingModulesQueriesUserProfileStats()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.BOT_PROFILE_STATS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesBotProfileStats.newSocialTradingModulesQueriesBotProfileStats()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.PROFILE_POSTS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesProfilePosts.newSocialTradingModulesQueriesProfilePosts()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.POST_REPLIES: {
                thisObject.query = NT.projects.socialTrading.modules.queriesPostReplies.newSocialTradingModulesQueriesPostReplies()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.PROFILE_FOLLOWERS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesProfileFollowers.newSocialTradingModulesQueriesProfileFollowers()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.PROFILE_FOLLOWING: {
                thisObject.query = NT.projects.socialTrading.modules.queriesProfileFollowing.newSocialTradingModulesQueriesProfileFollowing()
                thisObject.query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.maps.EVENTS: {
                thisObject.query = NT.projects.socialTrading.modules.queriesEvents.newSocialTradingModulesQueriesEvents()
                thisObject.query.initialize(queryReceived)
                break
            }
            default: throw ('Query Type Not Supported.')
        }
    }

    function execute() {
        let response = thisObject.query.execute()
        thisObject.query.finalize()
        return response
    }
}