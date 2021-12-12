exports.newSocialTradingModulesEvent = function newSocialTradingModulesEvent() {
    /*
    An Event is an action taken by users that triggers a
    change at the social graph. 

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
        /* Event Unique Properties */
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
        if (thisObject.emitterUserProfileId === undefined) {
            throw ('Emitter User Profile Id Not Provided.')
        }
        emitterUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(thisObject.emitterUserProfileId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        /*
        Validate Target User Profile.
        */
        if (thisObject.targetUserProfileId !== undefined) {
            targetUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(thisObject.targetUserProfileId)
            if (targetUserProfile === undefined) {
                throw ('Target User Profile Not Found.')
            }
        }
        /*
        Validate Emitter Bot Profile.
        */
        if (thisObject.emitterBotProfileId !== undefined) {
            emitterBotProfile = emitterUserProfile.bots.get(thisObject.emitterBotProfileId)
            if (emitterBotProfile === undefined) {
                throw ('Emitter Bot Profile Not Found.')
            }
        }
        /*
        Validate Target Bot Profile.
        */
        if (thisObject.targetBotProfileId !== undefined) {
            targetBotProfile = emitterUserProfile.bots.get(thisObject.targetBotProfileId)
            if (targetBotProfile === undefined) {
                throw ('Target Bot Profile Not Found.')
            }
        }

        if (postingEvents()) { 
            eventCounters()
            return 
        }
        if (followingEvents()) { 
            eventCounters()
            return 
        }
        if (reactionEvents()) { 
            eventCounters()
            return 
        }
        if (botEvents()) { 
            eventCounters()
            return 
        }

        function postingEvents() {
            /*
            Is it related to Posting?
            */
            if (
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_USER_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_USER_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_USER_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_BOT_POST
            ) {
                /*
                New User Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_USER_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_USER_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_USER_POST
                ) {
                    emitterUserProfile.addPost(
                        thisObject.emitterUserProfileId,
                        thisObject.targetUserProfileId,
                        thisObject.emitterPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 10,
                        thisObject.timestamp
                    )
                    return true
                }
                /*
                New Bot Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_BOT_POST
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
                    return true
                }
                /*
                Remove User Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_USER_POST
                ) {
                    emitterUserProfile.removePost(
                        thisObject.emitterPostHash
                    )
                    return true
                }
                /*
                Remove Bot Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT_POST
                ) {
                    if (emitterBotProfile === undefined) {
                        throw ('Emitter Bot Profile Id Not Provided.')
                    }

                    emitterBotProfile.removePost(
                        thisObject.emitterPostHash
                    )
                    return true
                }
            }
        }

        function followingEvents() {
            /*
            Is it a following?
            */
            if (
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.FOLLOW_BOT_PROFILE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_BOT_PROFILE
            ) {
                switch (thisObject.eventType) {
                    case SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE: {

                        if (thisObject.emitterUserProfileId === undefined) {
                            throw ('Emitter User Profile Id Not Provided.')
                        }

                        if (thisObject.targetUserProfileId === undefined) {
                            throw ('Target User Profile Id Not Provided.')
                        }

                        emitterUserProfile.addFollowing(
                            thisObject.targetUserProfileId
                        )
                        targetUserProfile.addFollower(
                            thisObject.emitterUserProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE: {

                        if (thisObject.emitterUserProfileId === undefined) {
                            throw ('Emitter User Profile Id Not Provided.')
                        }

                        if (thisObject.targetUserProfileId === undefined) {
                            throw ('Target User Profile Id Not Provided.')
                        }

                        emitterUserProfile.removeFollowing(
                            thisObject.targetUserProfileId
                        )
                        targetUserProfile.removeFollower(
                            thisObject.emitterUserProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.FOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterBotProfileId === undefined) {
                            throw ('Emitter Bot Profile Id Not Provided.')
                        }

                        if (thisObject.targetBotProfileId === undefined) {
                            throw ('Target Bot Profile Id Not Provided.')
                        }

                        emitterBotProfile.addFollowing(
                            thisObject.targetUserProfileId,
                            thisObject.targetBotProfileId
                        )
                        targetBotProfile.addFollower(
                            thisObject.emitterUserProfileId,
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterBotProfileId === undefined) {
                            throw ('Emitter Bot Profile Id Not Provided.')
                        }

                        if (thisObject.targetBotProfileId === undefined) {
                            throw ('Target Bot Profile Id Not Provided.')
                        }

                        emitterBotProfile.removeFollowing(
                            thisObject.targetBotProfileId
                        )
                        targetBotProfile.removeFollower(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                }
                return true
            }
        }

        function reactionEvents() {
            /*
            Is it a Reaction?
            */
            let targetPost

            if (
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_LIKE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_LOVE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_HAHA ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_WOW ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_SAD ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_ANGRY ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_CARE
            ) {

                if (targetBotProfile !== undefined) {
                    targetPost = targetBotProfile.posts.get(thisObject.targetPostHash)
                } else {
                    targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.addReaction(thisObject.eventType - 100)
                return  true
            }
            if (
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_LIKE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_LOVE ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_HAHA ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_WOW ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_SAD ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_ANGRY ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_REACTION_CARE
            ) {

                if (targetBotProfile !== undefined) {
                    targetPost = targetBotProfile.posts.get(thisObject.targetPostHash)
                } else {
                    targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.removeReaction(thisObject.eventType - 200)
                return  true
            }
        }

        function botEvents() {
            /*
            Is it a Bot?
            */
            if (
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_BOT ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ENABLE_BOT ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.DISABLE_BOT
            ) {
                switch (thisObject.eventType) {
                    case SA.projects.socialTrading.globals.eventTypes.ADD_BOT: {
                        emitterUserProfile.addBot(
                            thisObject.emitterUserProfileId,
                            thisObject.emitterBotProfileId,
                            thisObject.botAsset,
                            thisObject.botExchange,
                            thisObject.botEnabled
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT: {
                        emitterUserProfile.removeBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.ENABLE_BOT: {
                        emitterUserProfile.enableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.DISABLE_BOT: {
                        emitterUserProfile.disableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                }
                return  true
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