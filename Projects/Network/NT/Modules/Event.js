exports.newNetworkModulesEvent = function newNetworkModulesEvent() {
    /*
    An Event is anything that happens system wide that 
    needs to be delivered to relevant entities via
    the Superalgos Network.

    An Event (in contrast to a Query) produces a change
    on the state of the social graph. 
    */
    let thisObject = {
        /* Unique Key */
        eventId: undefined,
        /* Referenced Entities Unique Keys */
        emitterUserProfileId: undefined,
        targetUserProfileId: undefined,
        emitterBotProfileId: undefined,
        targetBotProfileId: undefined,
        emitterPostHash: undefined,
        targetPostHash: undefined,
        /* Event Unitque Properties */
        eventType: undefined,
        timestamp: undefined,
        /* Bot Related Properties */
        botAsset: undefined,
        botExchange: undefined,
        botEnabled: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const EVENT_TYPES = {
        /* Users Posts and Following Events */
        NEW_USER_POST: 10,
        REPLY_TO_USER_POST: 11,
        REPOST_USER_POST: 12,
        QUOTE_REPOST_USER_POST: 13,
        REMOVE_USER_POST: 14,
        FOLLOW_USER_PROFILE: 15,
        UNFOLLOW_USER_PROFILE: 16,
        /* Bots Posts and Following Events */
        NEW_BOT_POST: 20,
        REPLY_TO_BOT_POST: 21,
        REPOST_BOT_POST: 22,
        QUOTE_REPOST_BOT_POST: 23,
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
    }

    return thisObject

    function finalize() {

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
        thisObject.eventType = eventReceived.eventType
        thisObject.timestamp = eventReceived.timestamp
        thisObject.botAsset = eventReceived.botAsset
        thisObject.botExchange = eventReceived.botExchange
        thisObject.botEnabled = eventReceived.botEnabled
        /*
        Local Variables
        */
        let emitterUserProfile
        let targetUserProfile
        let emitterBotProfile
        let targetBotProfile
        /*
        Validate Emitter User Profile.
        */
        if (emitterUserProfileId === undefined) {
            throw ('Emitter User Profile Id Not Provided.')
        }
        emitterUserProfile = NT.globals.memory.maps.USER_PROFILES_BY_ID.get(thisObject.emitterUserProfileId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        /*
        Validate Target User Profile.
        */
        if (thisObject.targetUserProfileId !== undefined) {
            targetUserProfile = NT.globals.memory.maps.USER_PROFILES_BY_ID.get(thisObject.targetUserProfileId)
            if (targetUserProfile === undefined) {
                throw ('Target User Profile Not Found.')
            }
        }
        /*
        Validate Emitter Bot Profile.
        */
        if (emitterBotProfileId !== undefined) {
            emitterBotProfile = emitterUserProfile.bots.get(emitterBotProfileId)
            if (emitterBotProfile === undefined) {
                throw ('Emitter Bot Profile Not Found.')
            }
        }
        /*
        Validate Target Bot Profile.
        */
        if (targetBotProfileId !== undefined) {
            targetBotProfile = emitterUserProfile.bots.get(targetBotProfileId)
            if (targetBotProfile === undefined) {
                throw ('Target Bot Profile Not Found.')
            }
        }

        postingEvents()
        followingEvents()
        reactionEvents()
        botEvents()
        eventCounters()

        function postingEvents() {
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
                    if (emitterBotProfile === undefined) {
                        throw ('Emitter Bot Profile Id Not Provided.')
                    }

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
                    thisObject.eventType === EVENT_TYPES.REMOVE_BOT_POST
                ) {
                    if (emitterBotProfile === undefined) {
                        throw ('Emitter Bot Profile Id Not Provided.')
                    }

                    emitterBotProfile.removePost(
                        thisObject.emitterPostHash
                    )
                    return
                }
            }
        }

        function followingEvents() {
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

                        if (thisObject.emitterUserProfileId === undefined) {
                            throw ('Emitter User Profile Id Not Provided.')
                        }

                        if (thisObject.targetUserProfileId === undefined) {
                            throw ('Target User Profile Id Not Provided.')
                        }

                        emitterUserProfile.addFollowing(
                            targetUserProfileId
                        )
                        targetUserProfile.addFollower(
                            emitterUserProfileId
                        )
                        break
                    }
                    case EVENT_TYPES.UNFOLLOW_USER_PROFILE: {

                        if (thisObject.emitterUserProfileId === undefined) {
                            throw ('Emitter User Profile Id Not Provided.')
                        }

                        if (thisObject.targetUserProfileId === undefined) {
                            throw ('Target User Profile Id Not Provided.')
                        }

                        emitterUserProfile.removeFollowing(
                            targetUserProfileId
                        )
                        targetUserProfile.removeFollower(
                            emitterUserProfileId
                        )
                        break
                    }
                    case EVENT_TYPES.FOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterBotProfileId === undefined) {
                            throw ('Emitter Bot Profile Id Not Provided.')
                        }

                        if (thisObject.targetBotProfileId === undefined) {
                            throw ('Target Bot Profile Id Not Provided.')
                        }

                        emitterBotProfile.addFollowing(
                            targetUserProfileId,
                            targetBotProfileId
                        )
                        targetBotProfile.addFollower(
                            emitterUserProfileId,
                            emitterBotProfileId
                        )
                        break
                    }
                    case EVENT_TYPES.UNFOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterBotProfileId === undefined) {
                            throw ('Emitter Bot Profile Id Not Provided.')
                        }

                        if (thisObject.targetBotProfileId === undefined) {
                            throw ('Target Bot Profile Id Not Provided.')
                        }

                        emitterBotProfile.removeFollowing(
                            targetBotProfileId
                        )
                        targetBotProfile.removeFollower(
                            emitterBotProfileId
                        )
                        break
                    }
                }
                return
            }
        }

        function reactionEvents() {
            /*
            Is is a Reaction?
            */
            let targetPost

            if (targetBotProfile !== undefined) {
                targetPost = targetBotProfile.posts.get(thisObject.targetPostHash)
            } else {
                targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)
            }

            if (targetPost === undefined) {
                throw ('Target Post Not Found')
            }

            if (
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_LIKE ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_LOVE ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_HAHA ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_WOW ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_SAD ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_ANGRY ||
                thisObject.eventType === EVENT_TYPES.ADD_REACTION_CARE
            ) {
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
                thisObject.eventType === EVENT_TYPES.REMOVE_REACTION_CARE
            ) {
                targetPost.removeReaction(thisObject.eventType - 200)
                return
            }
        }

        function botEvents() {
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
                            thisObject.emitterUserProfileId,
                            thisObject.emitterBotProfileId,
                            thisObject.botAsset,
                            thisObject.botExchange,
                            thisObject.botEnabled
                        )
                        break
                    }
                    case EVENT_TYPES.REMOVE_BOT: {
                        emitterUserProfile.removeBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case EVENT_TYPES.ENABLE_BOT: {
                        emitterUserProfile.enableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case EVENT_TYPES.DISABLE_BOT: {
                        emitterUserProfile.disableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                }
                return
            }
        }

        function eventCounters() {
            emitterUserProfile.emitterEventsCount++
            if (targetUserProfile !== undefined) {
                targetUserProfile.targetEventsCount++
            }
            if (emitterBotProfile !== undefined) {
                emitterUserProfile.emitterEventsCount++
            }
            if (targetBotProfile !== undefined) {
                targetBotProfile.targetEventsCount++
            }
        }
    }
}