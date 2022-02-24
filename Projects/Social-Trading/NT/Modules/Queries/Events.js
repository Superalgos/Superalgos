exports.newSocialTradingModulesQueriesEvents = function newSocialTradingModulesQueriesEvents() {
    /*
    This is the query executed to fill the timeline of a certain Social Persona or Social Trading Bot.
    */
    let thisObject = {
        socialEntity: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.socialEntity = undefined
    }

    function initialize(queryReceived) {

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, SA.projects.socialTrading.globals.memory.arrays.EVENTS)

    }

    function run() {
        let response = []
        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let event = SA.projects.socialTrading.globals.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    checkEventContext(event, i)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested && i >= 0; i--) {
                    let event = SA.projects.socialTrading.globals.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    checkEventContext(event, i)
                }
                break
            }
        }
        return response

        function checkEventContext(event, index) {
            /*
            For an event to be returned at the response of this query, it needs to be related
            to the socialEntity making the query. How it can be related?

            1. The Origin or Target socialEntity of the event must be the same as the Origin Social Entity.
            2. The Origin or Target socialEntity of the event must be at the Following map of the Origin Social Entity.
            3. The Origin or Target post must be belong to any socialEntity at the Following of the Origin Social Entity.

            Any of the above happening, means that indeed it is related.
            */
            let originSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.originSocialPersonaId)
            let originSocialTradingBot = originSocialPersona.bots.get(event.originSocialTradingBotId)
            let originPost = originSocialPersona.posts.get(event.originPostHash)

            let targetSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.targetSocialPersonaId)
            let targetSocialTradingBot
            let targetPost

            if (targetSocialPersona !== undefined) {
                targetSocialTradingBot = targetSocialPersona.bots.get(event.targetSocialTradingBotId)
                targetPost = targetSocialPersona.posts.get(event.targetPostHash)
            }
            /*
            Test #1 : The Origin or Target socialEntity of the event must be the same as the Origin Social Entity.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (originSocialPersona.id === thisObject.socialEntity.id) {
                    addToResponse(event)
                    return
                }
                if (targetSocialPersona !== undefined) {
                    if (targetSocialPersona.id === thisObject.socialEntity.id) {
                        addToResponse(event)
                        return
                    }
                }
            }
            if (thisObject.socialEntity.node.type === 'Social Trading Bot') {
                /*
                The context is a Social Trading Bot
                */
                if (originSocialTradingBot !== undefined) {
                    if (originSocialTradingBot.botProfileId === thisObject.socialEntity.botProfileId) {
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
            Test #2 : The Origin or Target socialEntity of the event must be at the Following map of the Origin Social Entity.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (thisObject.socialEntity.following.get(originSocialPersona.id) !== undefined) {
                    addToResponse(event)
                    return
                }
                if (targetSocialPersona !== undefined) {
                    if (thisObject.socialEntity.following.get(targetSocialPersona.id) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }
            if (thisObject.socialEntity.node.type === 'Social Trading Bot') {
                /*
                The context is a Social Trading Bot
                */
                if (originSocialTradingBot !== undefined) {
                    if (thisObject.socialEntity.following.get(originSocialTradingBot.botProfileId) !== undefined) {
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
            Test #3 : The Origin or Target post must be belong to any socialEntity at the Following of the Origin Social Entity.
            */
            if (thisObject.socialEntity.node.type === 'Social Persona') {
                /*
                The context is a Social Persona
                */
                if (originPost !== undefined) {
                    if (thisObject.socialEntity.following.get(originPost.originSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (originPost !== undefined) {
                    if (thisObject.socialEntity.following.get(originPost.targetSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.originSocialPersonaId) !== undefined) {
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
                if (originPost !== undefined) {
                    if (thisObject.socialEntity.following.get(originPost.originSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (originPost !== undefined) {
                    if (thisObject.socialEntity.following.get(originPost.targetSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.socialEntity.following.get(targetPost.originSocialTradingBotId) !== undefined) {
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
                    index: index,
                    eventId: event.eventId,
                    eventType: event.eventType,
                    originSocialPersonaId: event.originSocialPersonaId,
                    targetSocialPersonaId: event.targetSocialPersonaId,
                    originSocialTradingBotId: event.originSocialTradingBotId,
                    targetSocialTradingBotId: event.targetSocialTradingBotId,
                    originPostHash: event.originPostHash,
                    targetPostHash: event.targetPostHash,
                    timestamp: event.timestamp,
                    fileKeys: event.fileKeys,
                    botAsset: event.botAsset,
                    botExchange: event.botExchange,
                    botEnabled: event.botEnabled
                }

                if (originSocialPersona !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.originSocialPersonaId })
                    eventResponse.originSocialPersona = query.run()
                    query.finalize()
                }

                if (targetSocialPersona !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId })
                    eventResponse.targetSocialPersona = query.run()
                    query.finalize()
                }

                if (originSocialTradingBot !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.originSocialPersonaId, targetSocialTradingBotId: originSocialTradingBotId })
                    eventResponse.originSocialTradingBot = query.run()
                    query.finalize()
                }

                if (targetSocialTradingBot !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId, targetSocialTradingBotId: targetSocialTradingBotId })
                    eventResponse.targetSocialTradingBot = query.run()
                    query.finalize()
                }

                if (originPost !== undefined) {
                    eventResponse.originPost = addPost(originPost)
                }

                if (targetPost !== undefined) {
                    eventResponse.targetPost = addPost(targetPost)
                }

                response.push(eventResponse)

                function addPost(post) {

                    let postResponse = {
                        originSocialPersonaId: post.originSocialPersonaId,
                        targetSocialPersonaId: post.targetSocialPersonaId,
                        originSocialTradingBotId: post.originSocialTradingBotId,
                        targetSocialTradingBotId: post.targetSocialTradingBotId,
                        originPostHash: post.originPostHash,
                        targetPostHash: post.targetPostHash,
                        postType: post.postType,
                        timestamp: post.timestamp,
                        fileKeys: post.fileKeys,
                        repliesCount: post.replies.size,
                        reactions: Array.from(post.reactions),
                        reaction: post.reactionsBySocialEntity.get(thisObject.socialEntity.id)
                    }
                    return postResponse
                }
            }
        }
    }
}