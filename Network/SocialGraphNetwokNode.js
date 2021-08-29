

global.NT = {
    memory: {
        maps: {
            USER_PROFILES_BY_ID: new Map(),         // Here we will store the user profiles by User Profile Id.
            USER_PROFILES_BY_HANDLE: new Map(),     // Here we will store the user profiles by User Profile Handle.
            EVENTS: new Map(),                      // This is the registry of all events received that prevents processing them more than once.
        },
        arrays: {
            NETWORK_CLIENTS: [],                    // These are the Network Clients connected to this Network Node ordered by Ranking.
            NETWORK_PEERS: [],                      // These are the Network Peers connected to this Network Node ordered by Ranking.
        }
    },
    modules: {
        EVENT: require('./Event.js'),
        USER_PROFILE: require('./UserProfile.js'),
        BOT_PROFILE: require('./BotProfile.js'),
        POST: require('./Post.js'),
        QUERY: require('./Query.js'),
        QUERY_USER_PROFILE_STATS: require('./Queries/UserProfileStats.js'),
        QUERY_BOT_PROFILE_STATS: require('./Queries/BotProfileStats.js'),
        QUERY_PROFILE_POSTS: require('./Queries/ProfilePosts.js'),
        QUERY_PROFILE_FOLLOWERS: require('./Queries/ProfileFollowers.js'),
        QUERY_PROFILE_FOLLOWING: require('./Queries/ProfileFollowing.js'),
        QUERY_POST_REPLIES: require('./Queries/PostReplies.js'),
        QUERY_EVENTS: require('./Queries/Events.js')
    },
    utilities: {
        queriesValidations: require('./Utilities/QueriesValidations.js').newProfileQueries()
    },
    globals: {
        constants: {
            queries: {
                INITIAL_INDEX_FIRST: 'First',
                INITIAL_INDEX_LAST: 'Last',
                MIN_AMOUNT_REQUESTED: 1,
                MAX_AMOUNT_REQUESTED: 100,
                DIRECTION_FUTURE: 'Future',
                DIRECTION_PAST: 'Past'
            }
        }
    }
}

