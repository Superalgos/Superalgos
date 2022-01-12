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
        emitterSocialPersonaId: undefined,
        targetSocialPersonaId: undefined,
        emitterSocialTradingBotId: undefined,
        targetSocialTradingBotId: undefined,
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
        thisObject.emitterSocialPersonaId = eventReceived.emitterSocialPersonaId
        thisObject.targetSocialPersonaId = eventReceived.targetSocialPersonaId
        thisObject.emitterSocialTradingBotId = eventReceived.emitterSocialTradingBotId
        thisObject.targetSocialTradingBotId = eventReceived.targetSocialTradingBotId
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
        let emitterSocialPersona
        let targetSocialPersona
        let emitterSocialTradingBot
        let targetSocialTradingBot
        /*
        Validate Emitter Social Persona.
        */
        if (thisObject.emitterSocialPersonaId === undefined) {
            throw ('Emitter Social Persona Id Not Provided.')
        }
        emitterSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.emitterSocialPersonaId)
        if (emitterSocialPersona === undefined) {
            throw ('Emitter Social Persona Not Found.')
        }
        /*
        Validate Target Social Persona.
        */
        if (thisObject.targetSocialPersonaId !== undefined) {
            targetSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.targetSocialPersonaId)
            if (targetSocialPersona === undefined) {
                throw ('Target Social Persona Not Found.')
            }
        }
        /*
        Validate Emitter Social Trading Bot.
        */
        if (thisObject.emitterSocialTradingBotId !== undefined) {
            emitterSocialTradingBot = emitterSocialPersona.bots.get(thisObject.emitterSocialTradingBotId)
            if (emitterSocialTradingBot === undefined) {
                throw ('Emitter Social Trading Bot Not Found.')
            }
        }
        /*
        Validate Target Social Trading Bot.
        */
        if (thisObject.targetSocialTradingBotId !== undefined) {
            targetSocialTradingBot = emitterSocialPersona.bots.get(thisObject.targetSocialTradingBotId)
            if (targetSocialTradingBot === undefined) {
                throw ('Target Social Trading Bot Not Found.')
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
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_SOCIAL_PERSONA_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_PERSONA_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_TRADING_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_TRADING_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_SOCIAL_TRADING_BOT_POST ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_TRADING_BOT_POST
            ) {
                /*
                New Social Persona Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_USER_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_SOCIAL_PERSONA_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_PERSONA_POST
                ) {
                    emitterSocialPersona.addPost(
                        thisObject.emitterSocialPersonaId,
                        thisObject.targetSocialPersonaId,
                        thisObject.emitterPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 10,
                        thisObject.timestamp
                    )
                    return true
                }
                /*
                New Social Trading Bot Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_TRADING_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_TRADING_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_SOCIAL_TRADING_BOT_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_TRADING_BOT_POST
                ) {
                    if (emitterSocialTradingBot === undefined) {
                        throw ('Emitter Social Trading Bot Id Not Provided.')
                    }

                    emitterSocialTradingBot.addPost(
                        thisObject.emitterSocialPersonaId,
                        thisObject.targetSocialPersonaId,
                        thisObject.emitterSocialTradingBotId,
                        thisObject.targetSocialTradingBotId,
                        thisObject.emitterPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 20,
                        thisObject.timestamp
                    )
                    return true
                }
                /*
                Remove Social Persona Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_USER_POST
                ) {
                    emitterSocialPersona.removePost(
                        thisObject.emitterPostHash
                    )
                    return true
                }
                /*
                Remove Social Trading Bot Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT_POST
                ) {
                    if (emitterSocialTradingBot === undefined) {
                        throw ('Emitter Social Trading Bot Id Not Provided.')
                    }

                    emitterSocialTradingBot.removePost(
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

                        if (thisObject.emitterSocialPersonaId === undefined) {
                            throw ('Emitter Social Persona Id Not Provided.')
                        }

                        if (thisObject.targetSocialPersonaId === undefined) {
                            throw ('Target Social Persona Id Not Provided.')
                        }

                        emitterSocialPersona.addFollowing(
                            thisObject.targetSocialPersonaId
                        )
                        targetSocialPersona.addFollower(
                            thisObject.emitterSocialPersonaId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE: {

                        if (thisObject.emitterSocialPersonaId === undefined) {
                            throw ('Emitter Social Persona Id Not Provided.')
                        }

                        if (thisObject.targetSocialPersonaId === undefined) {
                            throw ('Target Social Persona Id Not Provided.')
                        }

                        emitterSocialPersona.removeFollowing(
                            thisObject.targetSocialPersonaId
                        )
                        targetSocialPersona.removeFollower(
                            thisObject.emitterSocialPersonaId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.FOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterSocialTradingBotId === undefined) {
                            throw ('Emitter Social Trading Bot Id Not Provided.')
                        }

                        if (thisObject.targetSocialTradingBotId === undefined) {
                            throw ('Target Social Trading Bot Id Not Provided.')
                        }

                        emitterSocialTradingBot.addFollowing(
                            thisObject.targetSocialPersonaId,
                            thisObject.targetSocialTradingBotId
                        )
                        targetSocialTradingBot.addFollower(
                            thisObject.emitterSocialPersonaId,
                            thisObject.emitterSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_BOT_PROFILE: {

                        if (thisObject.emitterSocialTradingBotId === undefined) {
                            throw ('Emitter Social Trading Bot Id Not Provided.')
                        }

                        if (thisObject.targetSocialTradingBotId === undefined) {
                            throw ('Target Social Trading Bot Id Not Provided.')
                        }

                        emitterSocialTradingBot.removeFollowing(
                            thisObject.targetSocialTradingBotId
                        )
                        targetSocialTradingBot.removeFollower(
                            thisObject.emitterSocialTradingBotId
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

                let profileId 
                if (targetSocialTradingBot !== undefined) {
                    targetPost = targetSocialTradingBot.posts.get(thisObject.targetPostHash)
                    profileId = targetSocialTradingBot.botProfileId
                } else {
                    targetPost = targetSocialPersona.posts.get(thisObject.targetPostHash)
                    profileId = targetSocialPersona.userProfileId
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.addReaction(thisObject.eventType - 100, profileId)               
                
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

                let profileId 
                if (targetSocialTradingBot !== undefined) {
                    targetPost = targetSocialTradingBot.posts.get(thisObject.targetPostHash)
                    profileId = targetSocialTradingBot.botProfileId
                } else {
                    targetPost = targetSocialPersona.posts.get(thisObject.targetPostHash)
                    profileId = targetSocialPersona.userProfileId
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.removeReaction(thisObject.eventType - 100, profileId) 

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
                        emitterSocialPersona.addBot(
                            thisObject.emitterSocialPersonaId,
                            thisObject.emitterSocialTradingBotId,
                            thisObject.botAsset,
                            thisObject.botExchange,
                            thisObject.botEnabled
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT: {
                        emitterSocialPersona.removeBot(
                            thisObject.emitterSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.ENABLE_BOT: {
                        emitterSocialPersona.enableBot(
                            thisObject.emitterSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.DISABLE_BOT: {
                        emitterSocialPersona.disableBot(
                            thisObject.emitterSocialTradingBotId
                        )
                        break
                    }
                }
                return  true
            }
        }

        function eventCounters() {
            emitterSocialPersona.emitterEventsCount++
            if (targetSocialPersona !== undefined) {
                targetSocialPersona.targetEventsCount++
            }
            if (emitterSocialTradingBot !== undefined) {
                emitterSocialPersona.emitterEventsCount++
            }
            if (targetSocialTradingBot !== undefined) {
                targetSocialTradingBot.targetEventsCount++
            }
        }
    }
}