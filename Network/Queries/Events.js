exports.newEvents = function newEvents() {
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
        /*
        Validate User Profile
        */
        if (queryReceived.emitterUserProfileId !== undefined) {
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_ID.get(queryReceived.emitterUserProfileId)
        } else {
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_HANDLE.get(queryReceived.emitterUserProfileHandle)
        }

        if (thisObject.profile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        /* 
        Validate Initial Index 
        */
        if (queryReceived.initialIndex === undefined) {
            throw ('Initial Index Undefined.')
        }

        if (queryReceived.initialIndex === NT.globals.constants.queries.INITIAL_INDEX_LAST) {
            queryReceived.initialIndex = thisObject.profile.posts.length - 1
        }

        if (queryReceived.initialIndex === NT.globals.constants.queries.INITIAL_INDEX_FIRST) {
            queryReceived.initialIndex = 0
        }

        if (isNaN(queryReceived.initialIndex) === true) {
            throw ('Initial Event Is Not a Number.')
        }

        thisObject.initialIndex = queryReceived.initialIndex
        /* 
        Validate Amount Requested 
        */
        if (queryReceived.amountRequested === undefined) {
            throw ('Amount Requested Undefined.')
        }

        if (isNaN(queryReceived.amountRequested) === true) {
            throw ('Amount Requested Is Not a Number.')
        }

        if (queryReceived.amountRequested < NT.globals.constants.queries.MIN_AMOUNT_REQUESTED) {
            throw ('Amount Requested Below Min.')
        }

        if (queryReceived.amountRequested > NT.globals.constants.queries.MAX_AMOUNT_REQUESTED) {
            throw ('Amount Requested Above Max.')
        }
        /* 
        Validate Direction
        */
        if (queryReceived.direction === undefined) {
            throw ('Direction Undefined.')
        }

        if (queryReceived.direction !== NT.globals.constants.queries.DIRECTION_FUTURE && queryReceived.direction !== NT.globals.constants.queries.DIRECTION_PAST) {
            throw ('Direction Not Supported.')
        }

        thisObject.direction = queryReceived.direction

    }

    function execute() {
        let response = []
        switch (thisObject.direction) {
            case NT.globals.constants.queries.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let event = NT.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    checkEventContext(event)
                }
                break
            }
            case NT.globals.constants.queries.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let event = NT.memory.arrays.EVENTS[i]
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

            1. The Emitter or Target profile must be the same as the Query Profile.
            2. The Emitter or Traget profile must be at the Following map of the Query Profile.
            3. The Emmiter or Target post must be belong to any profile at the Following of the Query Profile.

            Any of the above happening, means that indeed it is related.
            */
            let emitterUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(eventReceived.emitterUserProfileId)
            let targetUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(eventReceived.targetUserProfileId)
            let emitterPost = NT.memory.maps.POSTS.get(eventReceived.emitterPostHash)
            let targetPost = NT.memory.maps.POSTS.get(eventReceived.targetPostHash)
            /*
            Test #1 : The Emitter or Target profile must be the same as the Query Profile.
            */
            if (emitterUserProfile !== undefined) {
                if (emitterUserProfile.userProfileId === thisObject.profile.userProfileId) {
                    addToResponse(event)
                    return
                }
            }
            if (targetUserProfile !== undefined) {
                if (targetUserProfile.userProfileId === thisObject.profile.userProfileId) {
                    addToResponse(event)
                    return
                }
            }
            /*
            Test #2 : The Emitter or Traget profile must be at the Following map of the Query Profile.
            */
            if (emitterUserProfile !== undefined) {
                if (thisObject.profile.following.get(emitterUserProfile.userProfileId) !== undefined) {
                    addToResponse(event)
                    return
                }
            }
            if (targetUserProfile !== undefined) {
                if (thisObject.profile.following.get(targetUserProfile.userProfileId) !== undefined) {
                    addToResponse(event)
                    return
                }
            }
            /*
            Test #3 : The Emmiter or Target post must be belong to any profile at the Following of the Query Profile.
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

            function addToResponse(event) {

                let eventResponse = {
                    eventId: event.eventId,
                    eventType: event.eventType,
                    emitterUserProfileId: event.emitterUserProfileId,
                    targetUserProfileId: event.targetUserProfileId,
                    emitterPostHash: event.emitterPostHash,
                    targetPostHash: event.targetPostHash,
                    timestamp: event.timestamp,
                    botId: event.botId,
                    botAsset: event.botAsset,
                    botExchange: event.botExchange
                }

                if (emitterUserProfile !== undefined) {
                    let query = NT.modules.QUERY_PROFILE_STATS.newUserProfileStats()
                    query.initialize({ targetUserProfileId: event.emitterUserProfileId })
                    eventResponse.emitterUserProfile = query.execute()
                    query.finalize()
                }

                if (targetUserProfile !== undefined) {
                    let query = NT.modules.QUERY_PROFILE_STATS.newUserProfileStats()
                    query.initialize({ targetUserProfileId: event.targetUserProfileId })
                    eventResponse.targetUserProfile = query.execute()
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
                        emitterPostHash: post.emitterPostHash,
                        targetPostHash: post.targetPostHash,
                        postType: post.postType,
                        timestamp: post.timestamp,
                        repliesCount: post.replies.length,
                        reactions: Array.from(post.reactions)
                    }
                    return postResponse
                }
            }
        }
    }
}