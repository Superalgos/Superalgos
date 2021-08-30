exports.newNetworkModulesQuery = function newNetworkModulesQuery() {
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

        USER_PROFILE_STATS: 0,
        BOT_PROFILE_STATS: 1,
        PROFILE_POSTS: 2,
        PROFILE_FOLLOWERS: 3,
        PROFILE_FOLLOWING: 4,
        POST_REPLIES: 5,
        EVENTS: 6

    }

    return thisObject

    function finalize() {
        thisObject.query = undefined
        thisObject.queryType = undefined
    }

    function initialize(queryReceived) {

        thisObject.queryType = queryReceived.queryType

        switch (thisObject.queryType) {
            
            case QUERY_TYPES.USER_PROFILE_STATS: {
                thisObject.query = NT.modules.queriesUserProfileStats.newNetworkModulesQueriesUserProfileStats()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.BOT_PROFILE_STATS: {
                thisObject.query = NT.modules.queriesBotProfileStats.newNetworkModulesQueriesBotProfileStats()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.PROFILE_POSTS: {
                thisObject.query = NT.modules.queriesProfilePosts.newNetworkModulesQueriesProfilePosts()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.POST_REPLIES: {
                thisObject.query = NT.modules.queriesPostReplies.newNetworkModulesQueriesPostReplies()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.PROFILE_FOLLOWERS: {
                thisObject.query = NT.modules.queriesProfileFollowers.newNetworkModulesQueriesProfileFollowers()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.PROFILE_FOLLOWING: {
                thisObject.query = NT.modules.queriesProfileFollowing.newNetworkModulesQueriesProfileFollowing()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.maps.EVENTS: {
                thisObject.query = NT.modules.queriesEvents.newNetworkModulesQueriesEvents()
                query.initialize(queryReceived)
                query.finalize()
                break
            }
            default: throw('Query Type Not Supported.')
        }
    }

    function execute() {
        return thisObject.query.execute()
    }
}