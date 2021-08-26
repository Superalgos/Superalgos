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
        TIMELINE_CHUNK: 3

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
                thisObject.query = NT.modules.PROFILE_STATS_QUERY.newProfileStatsQuery()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.PROFILE_POSTS: {
                thisObject.query = NT.modules.PROFILE_POSTS_QUERY.newProfileStatsQuery()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.POST_REPLIES: {
                thisObject.query = NT.modules.POST_REPLIES_QUERY.newProfileStatsQuery()
                query.initialize(queryReceived)
                break
            }

            case QUERY_TYPES.TIMELINE_CHUNK: {
                thisObject.query = NT.modules.TIMELINE_CHUNK_QUERY.newProfileStatsQuery()
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