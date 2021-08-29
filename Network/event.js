exports.newEvent = function newEvent() {

    let thisObject = {
        eventId: undefined,
        emitterUserProfileId: undefined,
        targetUserProfileId: undefined,
        emitterBotProfileId: undefined,
        targetBotProfileId: undefined,
        emitterPostHash: undefined,
        targetPostHash: undefined,
        timestamp: undefined,
        botId: undefined,
        botAsset: undefined,
        botExchange: undefined,
        botEnabled: undefined,
        initialize: initialize,
        finalize: finalize
    }

    const EVENT_TYPES = {

        NEW_USER_POST: 10,
        REPLY_TO_USER_POST: 11,
        REPOST_USER_POST: 12,
        QUOTE_REPOST_USER_POST: 13,
        REMOVE_USER_POST: 14,
        FOLLOW_USER_PROFILE: 15,
        UNFOLLOW_USER_PROFILE: 16,

        NEW_BOT_POST: 20,
        REPLY_TO_BOT_POST: 21,
        REPOST_BOT_POST: 22,
        QUOTE_REPOST_BOT_POST: 23,
        REMOVE_BOT_POST: 24,
        FOLLOW_BOT_PROFILE: 25,
        UNFOLLOW_BOT_PROFILE: 26,

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
        emitterUserProfile = undefined
        targetUserProfile = undefined
    }

    function initialize(eventReceived) {
        /*
        Store the message properties into this object properties.
        */
        thisObject.eventId = eventReceived.eventId
        thisObject.emitterUserProfileId = eventReceived.emitterUserProfileId
        thisObject.targetUserProfileId = eventReceived.targetUserProfileId
        thisObject.emitterBotProfileId = eventReceived.emitterBotProfileId
        thisObject.targetBotProfileId = eventReceived.targetBotProfileId
        thisObject.emitterPostHash = eventReceived.emitterPostHash
        thisObject.targetPostHash = eventReceived.targetPostHash
        thisObject.timestamp = eventReceived.timestamp
        thisObject.botId = eventReceived.botId
        thisObject.botAsset = eventReceived.botAsset
        thisObject.botExchange = eventReceived.botExchange
        thisObject.botEnabled = eventReceived.botEnabled
        /*
        Validate Emitter User Profile.
        */
        let emitterUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(thisObject.emitterUserProfileId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        emitterUserProfile.emitterEventsCount++
        /*
        Validate Target User Profile.
        */
        let targetUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(thisObject.targetUserProfileId)
        if (targetUserProfile === undefined) {
            /* We thow an exception when it does not have a target user profile and is required*/
            if (
                thisObject.eventType !== EVENT_TYPES.NEW_USER_POST &&
                thisObject.eventType !== EVENT_TYPES.NEW_BOT_POST
            ) {
                throw ('Target User Profile Not Found.')
            }
        } else {
            targetUserProfile.targetEventsCount++
        }
        /*
        Validate Emitter Bot Profile.
        */
        if (emitterBotProfileId !== undefined) {
            let botProfile = emitterUserProfile.bots.get(emitterBotProfileId)
            if (
                botProfile === undefined
            ) {
                throw ('Emitter BOt Profile Not Found.')
            }
        }
        /*
        Is is related to Posting?
        */
        if (
            thisObject.eventType === EVENT_TYPES.NEW_USER_POST ||
            thisObject.eventType === EVENT_TYPES.REPLY_TO_USER_POST ||
            thisObject.eventType === EVENT_TYPES.REPOST_USER_POST ||
            thisObject.eventType === EVENT_TYPES.QUOTE_REPOST_USER_POST ||
            thisObject.eventType === EVENT_TYPES.NEW_BOT_POST ||
            thisObject.eventType === EVENT_TYPES.REPLY_TO_BOT_POST ||
            thisObject.eventType === EVENT_TYPES.REPOST_BOT_POST ||
            thisObject.eventType === EVENT_TYPES.QUOTE_REPOST_BOT_POST
        ) {
            /*
            New User Post
            */
            if (
                thisObject.eventType === EVENT_TYPES.NEW_USER_POST ||
                thisObject.eventType === EVENT_TYPES.REPLY_TO_USER_POST ||
                thisObject.eventType === EVENT_TYPES.REPOST_USER_POST ||
                thisObject.eventType === EVENT_TYPES.QUOTE_REPOST_USER_POST
            ) {
                emitterUserProfile.addPost(
                    thisObject.emitterUserProfileId,
                    thisObject.targetUserProfileId,
                    thisObject.emitterBotProfileId,
                    thisObject.targetBotProfileId,
                    thisObject.emitterPostHash,
                    thisObject.targetPostHash,
                    thisObject.eventType - 10,
                    thisObject.timestamp
                )
                return
            }
            /*
            New Bot Post
            */
            if (
                thisObject.eventType === EVENT_TYPES.NEW_BOT_POST ||
                thisObject.eventType === EVENT_TYPES.REPLY_TO_BOT_POST ||
                thisObject.eventType === EVENT_TYPES.REPOST_BOT_POST ||
                thisObject.eventType === EVENT_TYPES.QUOTE_REPOST_BOT_POST
            ) {
                emitterBotProfile.addPost(
                    thisObject.emitterUserProfileId,
                    thisObject.targetUserProfileId,
                    thisObject.emitterBotProfileId,
                    thisObject.targetBotProfileId,
                    thisObject.emitterPostHash,
                    thisObject.targetPostHash,
                    thisObject.eventType - 20,
                    thisObject.timestamp
                )
                return
            }
            /*
            Remove User Post
            */
            if (
                thisObject.eventType === EVENT_TYPES.REMOVE_USER_POST
            ) {
                emitterUserProfile.removePost(
                    thisObject.emitterPostHash
                )
                return
            }
            /*
            Remove Bot Post
            */
            if (
                thisObject.eventType === EVENT_TYPES.REMOVE_USER_POST
            ) {
                emitterBotProfile.removePost(
                    thisObject.emitterPostHash
                )
                return
            }
        }
        /*
        Is is a following?
        */
        if (
            thisObject.eventType === EVENT_TYPES.FOLLOW_USER_PROFILE ||
            thisObject.eventType === EVENT_TYPES.UNFOLLOW_USER_PROFILE ||
            thisObject.eventType === EVENT_TYPES.FOLLOW_BOT_PROFILE ||
            thisObject.eventType === EVENT_TYPES.UNFOLLOW_BOT_PROFILE
        ) {
            switch (thisObject.eventType) {
                case EVENT_TYPES.FOLLOW_USER_PROFILE: {
                    emitterUserProfile.addFollowing(
                        targetUserProfileId
                    )
                    targetUserProfile.addFollower(
                        emitterUserProfileId
                    )
                    break
                }
                case EVENT_TYPES.UNFOLLOW_USER_PROFILE: {
                    emitterUserProfile.removeFollowing(
                        targetUserProfileId
                    )
                    targetUserProfile.removeFollower(
                        emitterUserProfileId
                    )
                    break
                }
                case EVENT_TYPES.FOLLOW_BOT_PROFILE: {
                    emitterUserProfile.addTradePostsFollowing(
                        targetBotProfileId
                    )
                    targetUserProfile.addTradePostsFollower(
                        emitterUserProfileId
                    )
                    break
                }
                case EVENT_TYPES.UNFOLLOW_BOT_PROFILE: {
                    emitterUserProfile.removeTradePostsFollowing(
                        targetBotProfileId
                    )
                    targetUserProfile.removeTradePostsFollower(
                        emitterBotProfileId
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
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_LIKE ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_LOVE ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_HAHA ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_WOW ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_SAD ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_ANGRY ||
            thisObject.eventType === EVENT_TYPES.ADD_REACTION_HUG
        ) {
            let targetPost = NT.memory.maps.POSTS.get(thisObject.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found')
            }

            targetPost.addReaction(thisObject.eventType - 100)
            return
        }
        if (
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_LIKE ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_LOVE ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_HAHA ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_WOW ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_SAD ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_ANGRY ||
            thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_HUG
        ) {
            let targetPost = NT.memory.maps.POSTS.get(thisObject.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found')
            }

            targetPost.removeReaction(thisObject.eventType - 200)
            return
        }
        /*
        Is is a Bot?
        */
        if (
            thisObject.eventType === EVENT_TYPES.ADD_BOT ||
            thisObject.eventType === EVENT_TYPES.REMOVE_BOT ||
            thisObject.eventType === EVENT_TYPES.ENABLE_BOT ||
            thisObject.eventType === EVENT_TYPES.DISABLE_BOT
        ) {
            switch (thisObject.eventType) {
                case EVENT_TYPES.ADD_BOT: {
                    emitterUserProfile.addBot(
                        thisObject.botId,
                        thisObject.botAsset,
                        thisObject.botExchange,
                        thisObject.botEnabled
                    )
                    break
                }
                case EVENT_TYPES.REMOVE_BOT: {
                    emitterUserProfile.removeBot(
                        thisObject.botId
                    )
                    break
                }
                case EVENT_TYPES.ENABLE_BOT: {
                    emitterUserProfile.enableBot(
                        thisObject.botId
                    )
                    break
                }
                case EVENT_TYPES.DISABLE_BOT: {
                    emitterUserProfile.disableBot(
                        thisObject.botId
                    )
                    break
                }
            }
            return
        }
    }
}