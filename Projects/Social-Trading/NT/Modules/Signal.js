exports.newSocialTradingModulesSignal = function newSocialTradingModulesSignal() {
    /*
    An Signal is an action taken by users that triggers a
    change at the social graph. 

    An Signal (in contrast to a Query) produces a change
    on the state of the social graph. 
    */
    let thisObject = {
        /* Unique Key */
        signalId: undefined,
        /* Referenced Entities Unique Keys */
        emitterUserProfileId: undefined,
        targetUserProfileId: undefined,
        emitterBotProfileId: undefined,
        targetBotProfileId: undefined,
        emitterPostHash: undefined,
        targetPostHash: undefined,
        /* Signal Unique Properties */
        signalType: undefined,
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

    function initialize(signalReceived) {
        /*
        Store the message properties into this object properties.
        */
        thisObject.signalId = signalReceived.signalId
        thisObject.emitterUserProfileId = signalReceived.emitterUserProfileId
        thisObject.targetUserProfileId = signalReceived.targetUserProfileId
        thisObject.emitterBotProfileId = signalReceived.emitterBotProfileId
        thisObject.targetBotProfileId = signalReceived.targetBotProfileId
        thisObject.emitterPostHash = signalReceived.emitterPostHash
        thisObject.targetPostHash = signalReceived.targetPostHash
        thisObject.signalType = signalReceived.signalType
        thisObject.timestamp = signalReceived.timestamp
        thisObject.botAsset = signalReceived.botAsset
        thisObject.botExchange = signalReceived.botExchange
        thisObject.botEnabled = signalReceived.botEnabled
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
        emitterUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(thisObject.emitterUserProfileId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        /*
        Validate Target User Profile.
        */
        if (thisObject.targetUserProfileId !== undefined) {
            targetUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(thisObject.targetUserProfileId)
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

        if (postingSignals()) { 
            signalCounters()
            return 
        }
        if (followingSignals()) { 
            signalCounters()
            return 
        }
        if (reactionSignals()) { 
            signalCounters()
            return 
        }
        if (botSignals()) { 
            signalCounters()
            return 
        }

        function postingSignals() {
            /*
            Is is related to Posting?
            */
            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.NEW_USER_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPLY_TO_USER_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPOST_USER_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.QUOTE_REPOST_USER_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.NEW_BOT_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPLY_TO_BOT_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPOST_BOT_POST ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.QUOTE_REPOST_BOT_POST
            ) {
                /*
                New User Post
                */
                if (
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.NEW_USER_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPLY_TO_USER_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPOST_USER_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.QUOTE_REPOST_USER_POST
                ) {
                    emitterUserProfile.addPost(
                        thisObject.emitterUserProfileId,
                        thisObject.targetUserProfileId,
                        thisObject.emitterPostHash,
                        thisObject.targetPostHash,
                        thisObject.signalType - 10,
                        thisObject.timestamp
                    )
                    return true
                }
                /*
                New Bot Post
                */
                if (
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.NEW_BOT_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPLY_TO_BOT_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REPOST_BOT_POST ||
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.QUOTE_REPOST_BOT_POST
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
                        thisObject.signalType - 20,
                        thisObject.timestamp
                    )
                    return true
                }
                /*
                Remove User Post
                */
                if (
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_USER_POST
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
                    thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_BOT_POST
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

        function followingSignals() {
            /*
            Is is a following?
            */
            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.FOLLOW_USER_PROFILE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.UNFOLLOW_USER_PROFILE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.FOLLOW_BOT_PROFILE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.UNFOLLOW_BOT_PROFILE
            ) {
                switch (thisObject.signalType) {
                    case SA.projects.socialTrading.globals.signalTypes.FOLLOW_USER_PROFILE: {

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
                    case SA.projects.socialTrading.globals.signalTypes.UNFOLLOW_USER_PROFILE: {

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
                    case SA.projects.socialTrading.globals.signalTypes.FOLLOW_BOT_PROFILE: {

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
                    case SA.projects.socialTrading.globals.signalTypes.UNFOLLOW_BOT_PROFILE: {

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

        function reactionSignals() {
            /*
            Is is a Reaction?
            */
            let targetPost

            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_LIKE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_LOVE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_HAHA ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_WOW ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_SAD ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_ANGRY ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_REACTION_CARE
            ) {

                if (targetBotProfile !== undefined) {
                    targetPost = targetBotProfile.posts.get(thisObject.targetPostHash)
                } else {
                    targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.addReaction(thisObject.signalType - 100)
                return  true
            }
            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_LIKE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_LOVE ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_HAHA ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_WOW ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_SAD ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_ANGRY ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_REACTION_CARE
            ) {

                if (targetBotProfile !== undefined) {
                    targetPost = targetBotProfile.posts.get(thisObject.targetPostHash)
                } else {
                    targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.removeReaction(thisObject.signalType - 200)
                return  true
            }
        }

        function botSignals() {
            /*
            Is is a Bot?
            */
            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ADD_BOT ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.REMOVE_BOT ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.ENABLE_BOT ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.DISABLE_BOT
            ) {
                switch (thisObject.signalType) {
                    case SA.projects.socialTrading.globals.signalTypes.ADD_BOT: {
                        emitterUserProfile.addBot(
                            thisObject.emitterUserProfileId,
                            thisObject.emitterBotProfileId,
                            thisObject.botAsset,
                            thisObject.botExchange,
                            thisObject.botEnabled
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.signalTypes.REMOVE_BOT: {
                        emitterUserProfile.removeBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.signalTypes.ENABLE_BOT: {
                        emitterUserProfile.enableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.signalTypes.DISABLE_BOT: {
                        emitterUserProfile.disableBot(
                            thisObject.emitterBotProfileId
                        )
                        break
                    }
                }
                return  true
            }
        }

        function signalCounters() {
            emitterUserProfile.emitterSignalsCount++
            if (targetUserProfile !== undefined) {
                targetUserProfile.targetSignalsCount++
            }
            if (emitterBotProfile !== undefined) {
                emitterUserProfile.emitterSignalsCount++
            }
            if (targetBotProfile !== undefined) {
                targetBotProfile.targetSignalsCount++
            }
        }
    }
}