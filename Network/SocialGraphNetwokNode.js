

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
        BOT_PROFILE: require('./BotProfile.js'),
        EVENT: require('./Event.js'),
        POST: require('./Post.js'),
        QUERY: require('./Query.js'),
        QUERY_USER_PROFILE_STATS: require('./Queries/UserProfileStats.js'),
        QUERY_BOT_PROFILE_STATS: require('./Queries/BotProfileStats.js'),
        QUERY_PROFILE_POSTS: require('./Queries/ProfilePosts.js'),
        QUERY_PROFILE_FOLLOWERS: require('./Queries/ProfileFollowers.js'),
        //QUERY_PROFILE_FOLLOWING: require('./Queries/ProfileFollowing.js'),
        //QUERY_POST_REPLIES: require('./Queries/ProfileReplies.js'),
        QUERY_EVENTS: require('./Queries/Events.js')
    }
}

const map = new Map([[1, { a: 2 }], [2, { a: 4 }], [4, { a: 8 }]])
map.set(3, { a: 6 })
map.delete(2)
map.set(2, { a: 12 })
let array = Array.from(map)

console.log(JSON.stringify(array))