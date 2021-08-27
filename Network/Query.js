exports.newQuery = function newQuery() {

    let thisObject = {
        query: undefined,
        queryType: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    const QUERY_TYPES = {

        PROFILE_STATS: 0,
        PROFILE_POSTS: 1,
        POST_REPLIES: 2,
        EVENTS: 3

    }

    return thisObject

    function finalize() {
        thisObject.query = undefined
        thisObject.queryType = undefined
    }

    function initialize(queryReceived) {

        thisObject.queryType = queryReceived.queryType

        switch (thisObject.queryType) {
            
            case QUERY_TYPES.PROFILE_STATS: {
                thisObject.query = NT.modules.QUERY_PROFILE_STATS.newProfileStats()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.PROFILE_POSTS: {
                thisObject.query = NT.modules.QUERY_PROFILE_POSTS.newProfilePosts()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.POST_REPLIES: {
                thisObject.query = NT.modules.QUERY_POST_REPLIES.newPostReplies()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.maps.EVENTS: {
                thisObject.query = NT.modules.QUERY_EVENTS.newEvents()
                query.initialize(queryReceived)
                break
            }
            default: throw('Query Type Not Supported.')
        }
    }

    function execute() {
        return thisObject.query.execute()
    }
}