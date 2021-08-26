exports.newEvent = function newEvent() {

    let thisObject = {
        eventId: undefined,
        eventType: undefined,
        emitterUserProfile: undefined,
        targetUserProfile: undefined,
        asset: undefined,
        timestamp: undefined,
        initialize: initialize,
        finalize: finalize
    }

    const EVENT_TYPES = {

        NEW_MULTI_MEDIA_POST: 10,
        REPLY_TO_MULTI_MEDIA_POST: 11,
        REPOST_MULTI_MEDIA: 12,
        QUOTE_REPOST_MULTI_MEDIA: 13,
        FOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS: 14,
        UNFOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS: 15,

        NEW_TRADE_POST: 20,
        REPLY_TO_TRADE_POST: 21,
        RE_POST_TRADE: 22,
        QUOTE_REPOST_TRADE: 23,
        FOLLOW_USER_PROFILE_TRADE_POSTS: 24,
        UNFOLLOW_USER_PROFILE_TRADE_POSTS: 25,

        ADD_BOT: 50,
        REMOVE_BOT: 51,
        ENABLE_BOT: 52,
        DISABLE_BOT: 53,

        ADD_REACTION_LIKE: 100,
        ADD_REACTION_LOVE: 101,
        ADD_REACTION_HAHA: 102,
        ADD_REACTION_WOW: 103,
        ADD_REACTION_SAD: 104,
        ADD_REACTION_ANGRY: 105,
        ADD_REACTION_HUG: 106,

        REMOVE_REACTION_LIKE: 200,
        REMOVE_REACTION_LOVE: 201,
        REMOVE_REACTION_HAHA: 202,
        REMOVE_REACTION_WOW: 203,
        REMOVE_REACTION_SAD: 204,
        REMOVE_REACTION_ANGRY: 205,
        REMOVE_REACTION_HUG: 206
    }

    return thisObject

    function finalize() {
        thisObject.emitterUserProfile = undefined
        thisObject.targetUserProfile = undefined
    }

    function initialize(eventReceived) {

        thisObject.emitterUserProfile = NT.memory.USER_PROFILES_BY_ID.get(eventReceived.emitterUserProfileId)
        if (thisObject.emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        thisObject.emitterUserProfile.emitterEventsCount++

        thisObject.targetUserProfile = NT.memory.USER_PROFILES_BY_ID.get(eventReceived.targetUserProfileId)
        if (thisObject.targetUserProfile === undefined) {
            /* We thow an exception when it does not have a target user profile and is required*/
            if (
                eventReceived.eventType !== EVENT_TYPES.NEW_MULTI_MEDIA_POST &&
                eventReceived.eventType !== EVENT_TYPES.NEW_TRADE_POST
            ) {
                throw ('Target User Profile Not Found.')
            }
        } else {
            thisObject.targetUserProfile.targetEventsCount++
        }

        thisObject.eventId = eventReceived.eventId
        thisObject.eventType = eventReceived.eventType
        thisObject.asset = eventReceived.asset
        thisObject.timestamp = eventReceived.timestamp
        /*
        Is is a new post?
        */
        if (
            eventReceived.eventType === EVENT_TYPES.NEW_MULTI_MEDIA_POST ||
            eventReceived.eventType === EVENT_TYPES.REPLY_TO_MULTI_MEDIA_POST ||
            eventReceived.eventType === EVENT_TYPES.REPOST_MULTI_MEDIA ||
            eventReceived.eventType === EVENT_TYPES.QUOTE_REPOST_MULTI_MEDIA ||
            eventReceived.eventType === EVENT_TYPES.NEW_TRADE_POST ||
            eventReceived.eventType === EVENT_TYPES.REPLY_TO_TRADE_POST ||
            eventReceived.eventType === EVENT_TYPES.RE_POST_TRADE ||
            eventReceived.eventType === EVENT_TYPES.QUOTE_REPOST_TRADE
        ) {
            if (
                eventReceived.eventType === EVENT_TYPES.NEW_MULTI_MEDIA_POST ||
                eventReceived.eventType === EVENT_TYPES.REPLY_TO_MULTI_MEDIA_POST ||
                eventReceived.eventType === EVENT_TYPES.REPOST_MULTI_MEDIA ||
                eventReceived.eventType === EVENT_TYPES.QUOTE_REPOST_MULTI_MEDIA 
            ) {
                thisObject.emitterUserProfile.addPost(
                    eventReceived.emitterPostHash,
                    eventReceived.targetPostHash,
                    thisObject.eventType,
                    thisObject.emitterUserProfile,
                    thisObject.timestamp
                )
            }

            return
        }
        /*
        Is is a following?
        */
        if (
            eventReceived.eventType === EVENT_TYPES.FOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS ||
            eventReceived.eventType === EVENT_TYPES.UNFOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS ||
            eventReceived.eventType === EVENT_TYPES.FOLLOW_USER_PROFILE_TRADE_POSTS ||
            eventReceived.eventType === EVENT_TYPES.UNFOLLOW_USER_PROFILE_TRADE_POSTS
        ) {
            switch (eventReceived.eventType) {
                case EVENT_TYPES.FOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS: {
                    thisObject.emitterUserProfile.addMultiMediaPostsFollowing(
                        thisObject.targetUserProfile
                    )
                    thisObject.targetUserProfile.addMultiMediaPostsFollower(
                        thisObject.emitterUserProfile
                    )
                    break
                }
                case EVENT_TYPES.UNFOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS: {
                    thisObject.emitterUserProfile.removeMultiMediaPostsFollowing(
                        thisObject.targetUserProfile
                    )
                    thisObject.targetUserProfile.removeMultiMediaPostsFollower(
                        thisObject.emitterUserProfile
                    )
                    break
                }
                case EVENT_TYPES.FOLLOW_USER_PROFILE_TRADE_POSTS: {
                    thisObject.emitterUserProfile.addTradePostsFollowing(
                        thisObject.targetUserProfile
                    )
                    thisObject.targetUserProfile.addTradePostsFollower(
                        thisObject.emitterUserProfile
                    )
                    break
                }
                case EVENT_TYPES.UNFOLLOW_USER_PROFILE_TRADE_POSTS: {
                    thisObject.emitterUserProfile.removeTradePostsFollowing(
                        thisObject.targetUserProfile
                    )
                    thisObject.targetUserProfile.removeTradePostsFollower(
                        thisObject.emitterUserProfile
                    )
                    break
                }
            }
            return
        }
        /*
        Is is a Reaction?
        */
        if (
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_LIKE ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_LOVE ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_HAHA ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_WOW ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_SAD ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_ANGRY ||
            eventReceived.eventType === EVENT_TYPES.ADD_REACTION_HUG
        ) {
            let targetPost = NT.memory.POSTS.get(eventReceived.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found')
            }

            targetPost.addReaction(eventReceived.eventType - 100)
            return
        }
        if (
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_LIKE ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_LOVE ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_HAHA ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_WOW ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_SAD ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_ANGRY ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_REACTION_HUG
        ) {
            let targetPost = NT.memory.POSTS.get(eventReceived.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found')
            }

            targetPost.removeReaction(eventReceived.eventType - 200)
            return
        }
        /*
        Is is a Bot?
        */
        if (
            eventReceived.eventType === EVENT_TYPES.ADD_BOT ||
            eventReceived.eventType === EVENT_TYPES.REMOVE_BOT ||
            eventReceived.eventType === EVENT_TYPES.ENABLE_BOT ||
            eventReceived.eventType === EVENT_TYPES.DISABLE_BOT
        ) {
            switch (eventReceived.eventType) {
                case EVENT_TYPES.ADD_BOT: {
                    thisObject.emitterUserProfile.addBot(
                        thisObject.botId,
                        thisObject.botAsset,
                        thisObject.botExchange
                    )
                    break
                }
                case EVENT_TYPES.REMOVE_BOT: {
                    thisObject.emitterUserProfile.removeBot(
                        thisObject.botId
                    )
                    break
                }
                case EVENT_TYPES.ENABLE_BOT: {
                    thisObject.emitterUserProfile.enableBot(
                        thisObject.botId
                    )
                    break
                }
                case EVENT_TYPES.DISABLE_BOT: {
                    thisObject.emitterUserProfile.disableBot(
                        thisObject.botId
                    )
                    break
                }
            }
            return
        }
    }
}