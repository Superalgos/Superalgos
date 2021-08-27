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
            queryReceived.initialIndex = thisObject.profile.maps.POSTS.length - 1
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
                    let post = thisObject.profile.maps.POSTS[i]
                    if (post === undefined) { break }
                    addPostToResponse(post)
                }
            }
            case DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let post = thisObject.profile.maps.POSTS[i]
                    if (post === undefined) { break }
                    addPostToResponse(post)
                }
            }
        }
        return response

        function addPostToResponse(post) {
            let postResponse = {
                "emitterPostHash": post.emitterPostHash,
                "targetPostHash": post.targetPostHash,
                "postType": post.postType,
                "userProfile": post.userProfile.userProfieId,
                "timestamp": post.timestamp,
                "repliesCount": post.replies.length,
                "targetPostHash": post.targetPost.emitterPostHash,
                "reactionsCount": []
            }

            for (let i = 0; i < post.reactionTypesCount; i++) {
                postResponse.reactionsCount.push(post.reactionsCount.get(i))
            }

            response.push(postResponse)
        }
    }
}