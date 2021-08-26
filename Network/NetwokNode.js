

global.NT = {
    memory: {
        USER_PROFILES: new Map(),       // Here we will store the user profiles and their statistics.
        POSTS: new Map(),               // This are all the posts we are keeping track of.
        EVENTS: new Map(),              // This is the registry of all events received that prevents processing them more than once.
        TIMELINE: [],                   // A time ordered list of Posts and Trades.
        NETWORK_CLIENTS: [],            // These are the Network Clients connected to this Network Node.
        NETWORK_PEERS: [],              // These are the Network Peers connected to this Network Node.
    },
    modules: {
        USER_PROFILE: require('./UserProfile.js'),
        EVENT: require('./Event.js'),
        POST: require('./Post.js'),
        BOT: require('./Bot.js'),
        QUERY: require('./Query.js'),
        PROFILE_STATS_QUERY: require('./ProfileStatsQuery.js'),
        PROFILE_POSTS_QUERY: require('./ProfilePostsQuery.js'),
        POST_REPLIES_QUERY: require('./ProfileRepliesQuery.js'),
        TIMELINE_CHUNK_QUERY: require('./TimelineChunkQuery.js')
    }
}