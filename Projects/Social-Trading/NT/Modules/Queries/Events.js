exports.newSocialTradingModulesQueriesEvents = function newSocialTradingModulesQueriesEvents() {
    /*
    This is the query executed to fill the timeline of a certain User or Bot Profile.

    */
    let thisObject = {
        profile: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.profile = undefined
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
            to the profile making the query. How it can be related?

            1. The Emitter or Target profile must be the same as the Context Profile.
            2. The Emitter or Target profile must be at the Following map of the Context Profile.
            3. The Emitter or Target post must be belong to any profile at the Following of the Context Profile.

            Any of the above happening, means that indeed it is related.
            */
            let emitterUserProfile = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.emitterSocialPersonaId)
            let emitterBotProfile = emitterUserProfile.bots.get(event.emitterSocialTradingBotId)
            let emitterPost = emitterUserProfile.posts.get(event.emitterPostHash)

            let targetUserProfile = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(event.targetSocialPersonaId)
            let targetBotProfile
            let targetPost

            if (targetUserProfile !== undefined) {
                targetBotProfile = targetUserProfile.bots.get(event.targetSocialTradingBotId)
                targetPost = targetUserProfile.posts.get(event.targetPostHash)
            }
            /*
            Test #1 : The Emitter or Target profile must be the same as the Context Profile.
            */
            if (thisObject.profile.botProfileId === undefined) {
                /*
                The context is a User Profile
                */
                if (emitterUserProfile.userProfileId === thisObject.profile.userProfileId) {
                    addToResponse(event)
                    return
                }
                if (targetUserProfile !== undefined) {
                    if (targetUserProfile.userProfileId === thisObject.profile.userProfileId) {
                        addToResponse(event)
                        return
                    }
                }
            } else {
                /*
                The context is a Bot Profile
                */
                if (emitterBotProfile !== undefined) {
                    if (emitterBotProfile.botProfileId === thisObject.profile.botProfileId) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetBotProfile !== undefined) {
                    if (targetBotProfile.botProfileId === thisObject.profile.botProfileId) {
                        addToResponse(event)
                        return
                    }
                }
            }
            /*
            Test #2 : The Emitter or Target profile must be at the Following map of the Context Profile.
            */
            if (thisObject.profile.botProfileId === undefined) {
                /*
                The context is a User Profile
                */
                if (thisObject.profile.following.get(emitterUserProfile.userProfileId) !== undefined) {
                    addToResponse(event)
                    return
                }
                if (targetUserProfile !== undefined) {
                    if (thisObject.profile.following.get(targetUserProfile.userProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            } else {
                /*
                The context is a Bot Profile
                */
                if (emitterBotProfile !== undefined) {
                    if (thisObject.profile.following.get(emitterBotProfile.botProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetBotProfile !== undefined) {
                    if (thisObject.profile.following.get(targetBotProfile.botProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }
            /*
            Test #3 : The Emitter or Target post must be belong to any profile at the Following of the Context Profile.
            */
            if (thisObject.profile.botProfileId === undefined) {
                /*
                The context is a User Profile
                */
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.emitterSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.targetSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.emitterSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.targetSocialPersonaId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            } else {
                /*
                The context is a Bot Profile
                */
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.emitterSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.targetSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.emitterSocialTradingBotId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.targetSocialTradingBotId) !== undefined) {
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

                if (emitterUserProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.emitterSocialPersonaId })
                    eventResponse.emitterUserProfile = query.execute()
                    query.finalize()
                }

                if (targetUserProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialPersonaStats.newSocialTradingModulesQueriesSocialPersonaStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId })
                    eventResponse.targetUserProfile = query.execute()
                    query.finalize()
                }

                if (emitterBotProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.emitterSocialPersonaId, targetSocialTradingBotId: emitterSocialTradingBotId })
                    eventResponse.emitterBotProfile = query.execute()
                    query.finalize()
                }

                if (targetBotProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesSocialTradingBotStats.newSocialTradingModulesQueriesSocialTradingBotStats()
                    query.initialize({ targetSocialPersonaId: event.targetSocialPersonaId, targetSocialTradingBotId: targetSocialTradingBotId })
                    eventResponse.targetBotProfile = query.execute()
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

                    let profileId
                    if (thisObject.profile.botProfileId !== undefined) {
                        profileId = thisObject.profile.botProfileId
                    } else {
                        profileId = thisObject.profile.userProfileId
                    }

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
                        reaction: post.reactionsByProfile.get(profileId)
                    }
                    return postResponse
                }
            }
        }
    }
}