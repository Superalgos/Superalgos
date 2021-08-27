

global.NT = {
    memory: {
        maps: {
            USER_PROFILES_BY_ID: new Map(),         // Here we will store the user profiles by User Profile Id.
            USER_PROFILES_BY_HANDLE: new Map(),     // Here we will store the user profiles by User Profile Handle.
            POSTS: new Map(),                       // This are all the posts we are keeping track of.
            EVENTS: new Map(),                      // This is the registry of all events received that prevents processing them more than once.
        },
        arrays: {
            EVENTS: [],                             // A time ordered list of events.
            NETWORK_CLIENTS: [],                    // These are the Network Clients connected to this Network Node ordered by Ranking.
            NETWORK_PEERS: [],                      // These are the Network Peers connected to this Network Node ordered by Ranking.
        }
    },
    modules: {
        USER_PROFILE: require('./UserProfile.js'),
        BOT: require('./BotProfile.js'),
        EVENT: require('./Event.js'),
        POST: require('./Post.js'),
        QUERY: require('./Query.js'),
        QUERY_PROFILE_STATS: require('./Queries/ProfileStats.js'),
        QUERY_PROFILE_POSTS: require('./Queries/ProfilePosts.js'),
        QUERY_POST_REPLIES: require('./Queries/ProfileReplies.js'),
        QUERY_EVENTS: require('./Queries/Events.js')
    }
}