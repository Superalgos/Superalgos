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
        originSocialPersonaId: undefined,
        targetSocialPersonaId: undefined,
        originSocialTradingBotId: undefined,
        targetSocialTradingBotId: undefined,
        originPostHash: undefined,
        targetPostHash: undefined,
        /* Event Unique Properties */
        eventType: undefined,
        timestamp: undefined,
        /* Post Related Properties */
        fileKeys: undefined,
        /* Bot Related Properties */
        botAsset: undefined,
        botExchange: undefined,
        botEnabled: undefined,
        /* Framework Functions */
        run: run,
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
        thisObject.originSocialPersonaId = eventReceived.originSocialPersonaId
        thisObject.targetSocialPersonaId = eventReceived.targetSocialPersonaId
        thisObject.originSocialTradingBotId = eventReceived.originSocialTradingBotId
        thisObject.targetSocialTradingBotId = eventReceived.targetSocialTradingBotId
        thisObject.originPostHash = eventReceived.originPostHash
        thisObject.targetPostHash = eventReceived.targetPostHash
        thisObject.eventType = eventReceived.eventType
        thisObject.timestamp = eventReceived.timestamp
        thisObject.fileKeys = eventReceived.fileKeys
        thisObject.botAsset = eventReceived.botAsset
        thisObject.botExchange = eventReceived.botExchange
        thisObject.botEnabled = eventReceived.botEnabled

    }

    function run() {
        /*
        Local Variables
        */
        let originSocialPersona
        let targetSocialPersona
        let originSocialTradingBot
        let targetSocialTradingBot
        /*
        Validate Origin Social Persona.
        */
        if (thisObject.originSocialPersonaId === undefined) {
            throw ('Origin Social Persona Id Not Provided.')
        }
        originSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.originSocialPersonaId)
        if (originSocialPersona === undefined) {
            throw ('Origin Social Persona Not Found.')
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
        Validate Origin Social Trading Bot.
        */
        if (thisObject.originSocialTradingBotId !== undefined) {
            originSocialTradingBot = originSocialPersona.bots.get(thisObject.originSocialTradingBotId)
            if (originSocialTradingBot === undefined) {
                throw ('Origin Social Trading Bot Not Found.')
            }
        }
        /*
        Validate Target Social Trading Bot.
        */
        if (thisObject.targetSocialTradingBotId !== undefined) {
            targetSocialTradingBot = originSocialPersona.bots.get(thisObject.targetSocialTradingBotId)
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
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_PERSONA_POST ||
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
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_PERSONA_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_SOCIAL_PERSONA_POST ||
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.QUOTE_REPOST_SOCIAL_PERSONA_POST
                ) {
                    originSocialPersona.addPost(
                        thisObject.originSocialPersonaId,
                        thisObject.targetSocialPersonaId,
                        thisObject.originPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 10,
                        thisObject.timestamp,
                        thisObject.fileKeys
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
                    if (originSocialTradingBot === undefined) {
                        throw ('Origin Social Trading Bot Id Not Provided.')
                    }

                    originSocialTradingBot.addPost(
                        thisObject.originSocialPersonaId,
                        thisObject.targetSocialPersonaId,
                        thisObject.originSocialTradingBotId,
                        thisObject.targetSocialTradingBotId,
                        thisObject.originPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 20,
                        thisObject.timestamp,
                        thisObject.fileKeys
                    )
                    return true
                }
                /*
                Remove Social Persona Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_SOCIAL_PERSONA_POST
                ) {
                    originSocialPersona.removePost(
                        thisObject.originSocialPersonaId,
                        thisObject.targetSocialPersonaId,
                        thisObject.originSocialTradingBotId,
                        thisObject.targetSocialTradingBotId,
                        thisObject.originPostHash,
                        thisObject.targetPostHash,
                        thisObject.eventType - 14,
                        thisObject.timestamp,
                        thisObject.fileKeys
                    )
                    return true
                }
                /*
                Remove Social Trading Bot Post
                */
                if (
                    thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT_POST
                ) {
                    if (originSocialTradingBot === undefined) {
                        throw ('Origin Social Trading Bot Id Not Provided.')
                    }

                    originSocialTradingBot.removePost(
                        thisObject.originPostHash
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

                        if (thisObject.originSocialPersonaId === undefined) {
                            throw ('Origin Social Persona Id Not Provided.')
                        }

                        if (thisObject.targetSocialPersonaId === undefined) {
                            throw ('Target Social Persona Id Not Provided.')
                        }

                        originSocialPersona.addFollowing(
                            thisObject.targetSocialPersonaId
                        )
                        targetSocialPersona.addFollower(
                            thisObject.originSocialPersonaId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE: {

                        if (thisObject.originSocialPersonaId === undefined) {
                            throw ('Origin Social Persona Id Not Provided.')
                        }

                        if (thisObject.targetSocialPersonaId === undefined) {
                            throw ('Target Social Persona Id Not Provided.')
                        }

                        originSocialPersona.removeFollowing(
                            thisObject.targetSocialPersonaId
                        )
                        targetSocialPersona.removeFollower(
                            thisObject.originSocialPersonaId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.FOLLOW_BOT_PROFILE: {

                        if (thisObject.originSocialTradingBotId === undefined) {
                            throw ('Origin Social Trading Bot Id Not Provided.')
                        }

                        if (thisObject.targetSocialTradingBotId === undefined) {
                            throw ('Target Social Trading Bot Id Not Provided.')
                        }

                        originSocialTradingBot.addFollowing(
                            thisObject.targetSocialPersonaId,
                            thisObject.targetSocialTradingBotId
                        )
                        targetSocialTradingBot.addFollower(
                            thisObject.originSocialPersonaId,
                            thisObject.originSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_BOT_PROFILE: {

                        if (thisObject.originSocialTradingBotId === undefined) {
                            throw ('Origin Social Trading Bot Id Not Provided.')
                        }

                        if (thisObject.targetSocialTradingBotId === undefined) {
                            throw ('Target Social Trading Bot Id Not Provided.')
                        }

                        originSocialTradingBot.removeFollowing(
                            thisObject.targetSocialTradingBotId
                        )
                        targetSocialTradingBot.removeFollower(
                            thisObject.originSocialTradingBotId
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
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_SMILE_SMALL_EYES ||
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_BIG_CHEESING || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_TEARS_OF_JOY || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_HEART_EYES || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_PINOCCHIO || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_CELEBRATION || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_SURPRISED_GHOST || 
                thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_FRUSTRATED_MONKEY 

                //TODO handle old reactions...
                // thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_HAHA ||
                // thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_WOW ||
                // thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_SAD ||
                // thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_ANGRY ||
                // thisObject.eventType === SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_CARE
            ) {

                let socialEntityId
                if (targetSocialTradingBot !== undefined) {
                    targetPost = targetSocialTradingBot.posts.get(thisObject.targetPostHash)
                    socialEntityId = targetSocialTradingBot.id
                } else {
                    targetPost = targetSocialPersona.posts.get(thisObject.targetPostHash)
                    socialEntityId = targetSocialPersona.id
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.addReaction(thisObject.eventType - 700, socialEntityId)

                return true
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

                let socialEntityId
                if (targetSocialTradingBot !== undefined) {
                    targetPost = targetSocialTradingBot.posts.get(thisObject.targetPostHash)
                    socialEntityId = targetSocialTradingBot.id
                } else {
                    targetPost = targetSocialPersona.posts.get(thisObject.targetPostHash)
                    socialEntityId = targetSocialPersona.id
                }

                if (targetPost === undefined) {
                    throw ('Target Post Not Found')
                }

                targetPost.removeReaction(thisObject.eventType - 100, socialEntityId)

                return true
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
                        originSocialPersona.addBot(
                            thisObject.originSocialPersonaId,
                            thisObject.originSocialTradingBotId,
                            thisObject.botAsset,
                            thisObject.botExchange,
                            thisObject.botEnabled
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.REMOVE_BOT: {
                        originSocialPersona.removeBot(
                            thisObject.originSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.ENABLE_BOT: {
                        originSocialPersona.enableBot(
                            thisObject.originSocialTradingBotId
                        )
                        break
                    }
                    case SA.projects.socialTrading.globals.eventTypes.DISABLE_BOT: {
                        originSocialPersona.disableBot(
                            thisObject.originSocialTradingBotId
                        )
                        break
                    }
                }
                return true
            }
        }

        function eventCounters() {
            originSocialPersona.originEventsCount++
            if (targetSocialPersona !== undefined) {
                targetSocialPersona.targetEventsCount++
            }
            if (originSocialTradingBot !== undefined) {
                originSocialPersona.originEventsCount++
            }
            if (targetSocialTradingBot !== undefined) {
                targetSocialTradingBot.targetEventsCount++
            }
        }
    }
}
