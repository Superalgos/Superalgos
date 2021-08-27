exports.newProfilePosts = function newProfilePosts() {

    let thisObject = {
        profile: undefined,
        initialPostIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    const INITIAL_POST_INDEX_FIRST = 'First'
    const INITIAL_POST_INDEX_LAST = 'Last'
    const MIN_AMOUNT_REQUESTED = 1
    const MAX_AMOUNT_REQUESTED = 100
    const DIRECTION_FUTURE = 'Future'
    const DIRECTION_PAST = 'Past'

    return thisObject

    function finalize() {

    }

    function initialize(queryReceived) {
        /*
        Validate User Profile
        */
        if (queryReceived.targetUserProfileId !== undefined) {
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_ID.get(queryReceived.targetUserProfileId)
        } else {
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_HANDLE.get(queryReceived.targetUserProfileHandle)
        }

        if (thisObject.profile === undefined) {
            throw ('Target User Profile Not Found.')
        }
        /* 
        Validate Initial Post Index 
        */
        if (queryReceived.initialPostIndex === undefined) {
            throw ('Initial Post Index Undefined.')
        }

        if (queryReceived.initialPostIndex === INITIAL_POST_INDEX_LAST) {
            queryReceived.initialPostIndex = thisObject.profile.maps.POSTS.length - 1
        }

        if (queryReceived.initialPostIndex === INITIAL_POST_INDEX_FIRST) {
            queryReceived.initialPostIndex = 0
        }

        if (isNaN(queryReceived.initialPostIndex) === true) {
            throw ('Initial Post Is Not a Number.')
        }

        thisObject.initialPostIndex = queryReceived.initialPostIndex
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
                for (let i = thisObject.initialPostIndex; i < thisObject.initialPostIndex + thisObject.amountRequested; i++) {
                    let post = thisObject.profile.maps.POSTS[i]
                    if (post === undefined) { break }
                    addPostToResponse(post)
                }
            }
            case DIRECTION_PAST: {
                for (let i = thisObject.initialPostIndex; i > thisObject.initialPostIndex - thisObject.amountRequested; i--) {
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