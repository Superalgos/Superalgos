exports.newEvents = function newEvents() {

    let thisObject = {
        profile: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    const INITIAL_EVENT_INDEX_FIRST = 'First'
    const INITIAL_EVENT_INDEX_LAST = 'Last'
    const MIN_AMOUNT_REQUESTED = 1
    const MAX_AMOUNT_REQUESTED = 100
    const DIRECTION_FUTURE = 'Future'
    const DIRECTION_PAST = 'Past'

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

        if (queryReceived.initialIndex === INITIAL_EVENT_INDEX_LAST) {
            queryReceived.initialIndex = thisObject.profile.posts.length - 1
        }

        if (queryReceived.initialIndex === INITIAL_EVENT_INDEX_FIRST) {
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

        if (queryReceived.amountRequested < MIN_AMOUNT_REQUESTED) {
            throw ('Amount Requested Below Min.')
        }

        if (queryReceived.amountRequested > MAX_AMOUNT_REQUESTED) {
            throw ('Amount Requested Above Max.')
        }
        /* 
        Validate Direction
        */
        if (queryReceived.direction === undefined) {
            throw ('Direction Undefined.')
        }

        if (queryReceived.direction !== DIRECTION_FUTURE && queryReceived.direction !== DIRECTION_PAST) {
            throw ('Direction Not Supported.')
        }

        thisObject.direction = queryReceived.direction

    }

    function execute() {
        let response = []
        switch (thisObject.direction) {
            case DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let event = NT.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    addToResponse(event)
                }
            }
            case DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let event = NT.memory.arrays.EVENTS[i]
                    if (event === undefined) { break }
                    addToResponse(event)
                }
            }
        }
        return response

        function addToResponse(event) {

            let emitterUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(eventReceived.emitterUserProfileId)
            let targetUserProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(eventReceived.targetUserProfileId)
            let emitterPost = NT.memory.maps.POSTS.get(eventReceived.emitterPostHash)
            let targetPost = NT.memory.maps.POSTS.get(eventReceived.targetPostHash)

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
                let query = NT.modules.QUERY_PROFILE_STATS.newProfileStats()
                query.initialize({ targetUserProfileId: event.emitterUserProfileId })
                eventResponse.emitterUserProfile = query.execute()
            }

            if (targetUserProfile !== undefined) {
                let query = NT.modules.QUERY_PROFILE_STATS.newProfileStats()
                query.initialize({ targetUserProfileId: event.targetUserProfileId })
                eventResponse.targetUserProfile = query.execute()
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
                    emitterPostHash: post.emitterPostHash,
                    targetPostHash: post.targetPostHash,
                    postType: post.postType,
                    userProfile: post.userProfile.userProfieId,
                    timestamp: post.timestamp,
                    repliesCount: post.replies.length,
                    targetPostHash: post.targetPost.emitterPostHash,
                    reactionsCount: []
                }

                for (let i = 0; i < post.reactionTypesCount; i++) {
                    postResponse.reactionsCount.push(post.reactionsCount.get(i))
                }

                return postResponse
            }
        }
    }
}