

global.NT = {
    memory: {
        USER_PROFILES: new Map(),       // Here we will store the user profiles and their statistics.
        POSTS: new Map(),               // This are all the posts we are keeping track of.
        EVENTS: new Map(),              // This is the registry of all events received that prevents processing them more than once.
        TIMELINE: []                    // A time ordered list of Posts and Trades.
    },
    modules: {
        EVENT: require('./UserProfile.js'),
        EVENT: require('./Event.js'),
        POST: require('./Post.js'),
        BOT: require('./Bot.js')
    }
}

/*
 We will add this event to the timeline
*/
NT.memory.TIMELINE.push()