exports.newSocialTradingModulesQueriesEvents = function newSocialTradingModulesQueriesEvents() {
    /*
    This is the query executed to fill the timeline of a certain Social Persona or Social Trading Bot.
    */
    let thisObject = {
        socialEntity: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socialEntity = undefined
    }

    function initialize(queryReceived) {

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, NT.projects.network.globals.memory.arrays.EVENTS)

    }

    function execute() {
        let response = []
        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let event = NT.projects.network.globals.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    checkEventContext(event)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let event = NT.projects.network.globals.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    checkEventContext(event)
                }
                break
            }
        }
        return response

        function checkEventContext(event) {
            /*
            For an event to be returned at the response of this query, it needs to be related
            to the socialEntity making the query. How it can be related?

            1. The Emitter or Target socialEntity must be the same as the Context Profile.
            2. The Emitter or Target socialEntity must be at the Following map of the Context Profile.
            3. The Emitter or Target post must be belong to any socialEntity at the Following of the Context Profile.

            Any of the above happening, means that indeed it is related.
            */
            let emitterSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.emitterSocialPersonaId)
            let emitterSocialTradingBot = emitterSocialPersona.bots.get(event.emitterSocialTradingBotId)
            let emitterPost = emitterSocialPersona.posts.get(event.emitterPostHash)

            let targetSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.targetSocialPersonaId)
            let targetSocialTradingBot
            let targetPost

            if (targetSocialPersona !== undefined) {
                targetSocialTradingBot = targetSocialPersona.bots.get(event.targetSocialTradingBotId)
                targetPost = targetSocialPersona.posts.get(event.targetPostHash)
            }
            /*
            Test #1 : The Emitter or Target socialEntity must be the same as the Context Profile.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (emitterSocialPersona.userProfileId === thisObject.socialEntity.userProfileId) {
                    addToResponse(event)
                    return
                }
                if (targetSocialPersona !== undefined) {
                    if (targetSocialPersona.userProfileId === thisObject.socialEntity.userProfileId) {
                        addToResponse(event)
                        return
                    }
                }
            }
            if (thisObject.socialEntity.node.type === 'Social Trading Bot') {
                /*
                The context is a Social Trading Bot
                */
                if (emitterSocialTradingBot !== undefined) {
                    if (emitterSocialTradingBot.botProfileId === thisObject.socialEntity.botProfileId) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetSocialTradingBot !== undefined) {
                    if (targetSocialTradingBot.botProfileId === thisObject.socialEntity.botProfileId) {
                        addToResponse(event)
                        return
                    }
                }
            }
            /*
            Test #2 : The Emitter or Target socialEntity must be at the Following map of the Context Profile.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (thisObject.socialEntity.following.get(emitterSocialPersona.userProfileId) !== undefined) {
                    addToResponse(event)
                    return
                }
                if (targetSocialPersona !== undefined) {
                    if (thisObject.socialEntity.following.get(targetSocialPersona.userProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }
            if (thisObject.socialEntity.node.type === 'Social Trading Bot') {
                /*
                The context is a Social Trading Bot
                */
                if (emitterSocialTradingBot !== undefined) {
                    if (thisObject.socialEntity.following.get(emitterSocialTradingBot.botProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetSocialTradingBot !== undefined) {
                    if (thisObject.socialEntity.following.get(targetSocialTradingBot.botProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }
            /*
            Test #3 : The Emitter or Target post must be belong to any socialEntity at the Following of the Context Profile.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (emitterPost !== undefined) {
                    if (thisObject.socialEntity.following.get(emitterPost.emitterSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.socialEntity.following.get(emitterPost.targetSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.emitterSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.targetSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }
            if (thisObject.socialEntity.node.type === 'Social Trading Bot') {
                /*
                The context is a Social Trading Bot
                */
                if (emitterPost !== undefined) {
                    if (thisObject.socialEntity.following.get(emitterPost.emitterSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.socialEntity.following.get(emitterPost.targetSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.emitterSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.targetSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }

            function addToResponse(event) {

                let eventResponse = {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    emitterSocialPersonaId: event.emitterSocialPersonaId,
                    targetSocialPersonaId: event.targetSocialPersonaId,
                    emitterSocialTradingBotId: event.emitterSocialTradingBotId,
                    targetSocialTradingBotId: event.targetSocialTradingBotId,
                    emitterPostHash: event.emitterPostHash,
                    targetPostHash: event.targetPostHash,
                    timestamp: event.timestamp,
                    botAsset: event.botAsset,
                    botExchange: event.botExchange,
                    botEnabled: event.botEnabled
                }

                if (emitterSocialPersona !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.emitterSocialPersonaId })
                    eventResponse.emitterSocialPersona = query.execute()
                    query.finalize()
                }

                if (targetSocialPersona !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId })
                    eventResponse.targetSocialPersona = query.execute()
                    query.finalize()
                }

                if (emitterSocialTradingBot !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.emitterSocialPersonaId, targetSocialTradingBotId: emitterSocialTradingBotId })
                    eventResponse.emitterSocialTradingBot = query.execute()
                    query.finalize()
                }

                if (targetSocialTradingBot !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId, targetSocialTradingBotId: targetSocialTradingBotId })
                    eventResponse.targetSocialTradingBot = query.execute()
                    query.finalize()
                }

                if (emitterPost !== undefined) {
                    eventResponse.emitterPost = addPost(emitterPost)
                }

                if (targetPost !== undefined) {
                    eventResponse.targetPost = addPost(targetPost)
                }

                response.push(eventResponse)

                function addPost(post) {

                    let postResponse = {
                        emitterSocialPersonaId: post.emitterSocialPersonaId,
                        targetSocialPersonaId: post.targetSocialPersonaId,
                        emitterSocialTradingBotId: post.emitterSocialTradingBotId,
                        targetSocialTradingBotId: post.targetSocialTradingBotId,
                        emitterPostHash: post.emitterPostHash,
                        targetPostHash: post.targetPostHash,
                        postType: post.postType,
                        timestamp: post.timestamp,
                        repliesCount: post.replies.size,
                        reactions: Array.from(post.reactions),
                        reaction: post.reactionsByProfile.get(socialEntity.id)
                    }
                    return postResponse
                }
            }
        }
    }
}