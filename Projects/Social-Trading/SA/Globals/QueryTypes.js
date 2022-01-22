exports.newSocialTradingGlobalsQueryTypes = function () {

    let thisObject = {
        SOCIAL_PERSONAS: 0,                 // List of Social Personas orderd by ranking desc.
        UNFOLLOWED_SOCIAL_PERSONAS: 1,      // List of Social Personas that are nor being followed by the Origin Social Entity.
        SOCIAL_PERSONA_STATS: 2,            // Statistics of a Social Persona.
        SOCIAL_TRADING_BOT_STATS: 3,        // Statistics of a Social Trading Bot.
        POSTS: 4,                           // List the Posts of a certain social entity.
        FOLLOWERS: 5,                       // List the Followers of a certain Social Entity
        FOLLOWING: 6,                       // List the who a certain Social Entity is Following
        POST_REPLIES: 7,                    // List the replies, which are posts, of a certain given Post.
        EVENTS: 8,                          // List events related to the Origin Social Entity, meaning events where social entities followed by the origin are either the origin or target at those event.
        POST: 9                             // Retrieves the text info of a post together with relevant stats. 
    }

    return thisObject
}