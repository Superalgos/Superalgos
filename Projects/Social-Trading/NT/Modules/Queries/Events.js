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

        NT.projects.socialTrading.utilities.queriesValidations.profilesValidations(queryReceived, thisObject)
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
            let emitterUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(event.emitterUserProfileId)
            let emitterBotProfile = emitterUserProfile.bots.get(event.emitterBotProfileId)
            let emitterPost = emitterUserProfile.posts.get(event.emitterPostHash)

            let targetUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(event.targetUserProfileId)
            let targetBotProfile
            let targetPost

            if (targetUserProfile !== undefined) {
                targetBotProfile = targetUserProfile.bots.get(event.targetBotProfileId)
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
                    if (thisObject.profile.following.get(emitterPost.emitterUserProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.targetUserProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.emitterUserProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.targetUserProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            } else {
                /*
                The context is a Bot Profile
                */
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.emitterBotProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (emitterPost !== undefined) {
                    if (thisObject.profile.following.get(emitterPost.targetBotProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.emitterBotProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
                if (targetPost !== undefined) {
                    if (thisObject.profile.following.get(targetPost.targetBotProfileId) !== undefined) {
                        addToResponse(event)
                        return
                    }
                }
            }

            function addToResponse(event) {

                let eventResponse = {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    emitterUserProfileId: event.emitterUserProfileId,
                    targetUserProfileId: event.targetUserProfileId,
                    emitterBotProfileId: event.emitterBotProfileId,
                    targetBotProfileId: event.targetBotProfileId,
                    emitterPostHash: event.emitterPostHash,
                    targetPostHash: event.targetPostHash,
                    timestamp: event.timestamp,
                    botAsset: event.botAsset,
                    botExchange: event.botExchange,
                    botEnabled: event.botEnabled
                }

                if (emitterUserProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesUserProfileStats.newSocialTradingModulesQueriesUserProfileStats()
                    query.initialize({ targetUserProfileId: event.emitterUserProfileId })
                    eventResponse.emitterUserProfile = query.execute()
                    query.finalize()
                }

                if (targetUserProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesUserProfileStats.newSocialTradingModulesQueriesUserProfileStats()
                    query.initialize({ targetUserProfileId: event.targetUserProfileId })
                    eventResponse.targetUserProfile = query.execute()
                    query.finalize()
                }

                if (emitterBotProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesBotProfileStats.newSocialTradingModulesQueriesBotProfileStats()
                    query.initialize({ targetUserProfileId: event.emitterUserProfileId, targetBotProfileId: emitterBotProfileId })
                    eventResponse.emitterBotProfile = query.execute()
                    query.finalize()
                }

                if (targetBotProfile !== undefined) {
                    let query = NT.projects.socialTrading.modules.queriesBotProfileStats.newSocialTradingModulesQueriesBotProfileStats()
                    query.initialize({ targetUserProfileId: event.targetUserProfileId, targetBotProfileId: targetBotProfileId })
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
                    let postResponse = {
                        emitterUserProfileId: post.emitterUserProfileId,
                        targetUserProfileId: post.targetUserProfileId,
                        emitterBotProfileId: post.emitterBotProfileId,
                        targetBotProfileId: post.targetBotProfileId,
                        emitterPostHash: post.emitterPostHash,
                        targetPostHash: post.targetPostHash,
                        postType: post.postType,
                        timestamp: post.timestamp,
                        repliesCount: post.replies.size,
                        reactions: Array.from(post.reactions)
                    }
                    return postResponse
                }
            }
        }
    }
}