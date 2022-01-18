exports.newSocialTradingGlobalsEventTypes = function () {

    let thisObject = {
        /* Users Posts and Following Events */
        NEW_SOCIAL_PERSONA_POST: 10,
        REPLY_TO_SOCIAL_PERSONA_POST: 11,
        REPOST_SOCIAL_PERSONA_POST: 12,
        QUOTE_REPOST_SOCIAL_PERSONA_POST: 13,
        REMOVE_USER_POST: 14,
        FOLLOW_USER_PROFILE: 15,
        UNFOLLOW_USER_PROFILE: 16,
        /* Bots Posts and Following Events */
        NEW_SOCIAL_TRADING_BOT_POST: 20,
        REPLY_TO_SOCIAL_TRADING_BOT_POST: 21,
        REPOST_SOCIAL_TRADING_BOT_POST: 22,
        QUOTE_REPOST_SOCIAL_TRADING_BOT_POST: 23,
        REMOVE_BOT_POST: 24,
        FOLLOW_BOT_PROFILE: 25,
        UNFOLLOW_BOT_PROFILE: 26,
        /* Bots Management Events */
        ADD_BOT: 50,
        REMOVE_BOT: 51,
        ENABLE_BOT: 52,
        DISABLE_BOT: 53,
        /* Add Reaction to Posts Events */
        ADD_REACTION_LIKE: 100,
        ADD_REACTION_LOVE: 101,
        ADD_REACTION_HAHA: 102,
        ADD_REACTION_WOW: 103,
        ADD_REACTION_SAD: 104,
        ADD_REACTION_ANGRY: 105,
        ADD_REACTION_CARE: 106,
        /* Remove Reaction to Posts Events */
        REMOVE_REACTION_LIKE: 200,
        REMOVE_REACTION_LOVE: 201,
        REMOVE_REACTION_HAHA: 202,
        REMOVE_REACTION_WOW: 203,
        REMOVE_REACTION_SAD: 204,
        REMOVE_REACTION_ANGRY: 205,
        REMOVE_REACTION_CARE: 206
        /* Add user profile events */
    }

    return thisObject
}