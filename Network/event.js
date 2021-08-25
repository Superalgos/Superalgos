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
        REACTION_LIKE: 100,
        REACTION_LOVE: 101,
        REACTION_HAHA: 102,
        REACTION_WOW: 103,
        REACTION_SAD: 104,
        REACTION_ANGRY: 105,
        REACTION_HUG: 106
    }

    return thisObject

    function finalize() {
        thisObject.emitterUserProfile = undefined
        thisObject.targetUserProfile = undefined
    }

    function initialize(eventMessage) {
        /*
        We expect here a JSON string with the following properties:

        {
            "eventId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "eventType": 10, 
            "emitterUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetUserProfileId": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "emitterPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "targetPostHash": "a8de78f0-c3e4-4a2a-b7e8-f659073969db",
            "asset": "BTC",
            "timestamp": 124234234234
        }
        */

        let event = JSON.parse(eventMessage)

        thisObject.emitterUserProfile = NT.memory.USER_PROFILES.get(event.emitterUserProfileId)
        if (thisObject.emitterUserProfile === undefined) {
            /* The message is ignored */
            return
        }

        thisObject.targetUserProfile = NT.memory.USER_PROFILES.get(event.targetUserProfileId)
        if (thisObject.targetUserProfile === undefined) {
            /* We thow an exception when it does not have a target user profile and is required*/
            if (
                event.eventType !== EVENT_TYPES.NEW_MULTI_MEDIA_POST &&
                event.eventType !== EVENT_TYPES.NEW_TRADE_POST
            )
                throw ('Target User Profile Not Found.')
        }

        thisObject.eventId = event.eventId
        thisObject.eventType = event.eventType
        thisObject.asset = event.asset
        thisObject.timestamp = event.timestamp

        /*
        Is is a new post?
        */
        if (
            event.eventType === EVENT_TYPES.NEW_MULTI_MEDIA_POST ||
            event.eventType === EVENT_TYPES.REPLY_TO_MULTI_MEDIA_POST ||
            event.eventType === EVENT_TYPES.REPOST_MULTI_MEDIA ||
            event.eventType === EVENT_TYPES.QUOTE_REPOST_MULTI_MEDIA ||
            event.eventType === EVENT_TYPES.NEW_TRADE_POST ||
            event.eventType === EVENT_TYPES.REPLY_TO_TRADE_POST ||
            event.eventType === EVENT_TYPES.RE_POST_TRADE ||
            event.eventType === EVENT_TYPES.QUOTE_REPOST_TRADE
        ) {
            let post = NT.modules.POST.newPost()
            post.initialize(
                event.emitterPostHash,
                event.targetPostHash,
                thisObject.eventType,
                thisObject.emitterUserProfile,
                thisObject.asset,
                thisObject.timestamp
            )
            return
        }
        /*
        Is is a following?
        */
        if (
            event.eventType === EVENT_TYPES.FOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS ||
            event.eventType === EVENT_TYPES.UNFOLLOW_USER_PROFILE_MULTI_MEDIA_POSTS ||
            event.eventType === EVENT_TYPES.FOLLOW_USER_PROFILE_TRADE_POSTS ||
            event.eventType === EVENT_TYPES.UNFOLLOW_USER_PROFILE_TRADE_POSTS
        ) {
            switch (event.eventType) {
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
    }
}