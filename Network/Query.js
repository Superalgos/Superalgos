exports.newQuery = function newQuery() {

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
        POST_REPLIES: 3,
        EVENTS: 4

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
                thisObject.query = NT.modules.QUERY_USER_PROFILE_STATS.newUserProfileStats()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.BOT_PROFILE_STATS: {
                thisObject.query = NT.modules.QUERY_BOT_PROFILE_STATS.newBotProfileStats()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.PROFILE_POSTS: {
                thisObject.query = NT.modules.QUERY_PROFILE_POSTS.newProfilePosts()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.POST_REPLIES: {
                thisObject.query = NT.modules.QUERY_POST_REPLIES.newPostReplies()
                query.initialize(queryReceived)
                query.finalize()
                break
            }

            case QUERY_TYPES.maps.EVENTS: {
                thisObject.query = NT.modules.QUERY_EVENTS.newEvents()
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