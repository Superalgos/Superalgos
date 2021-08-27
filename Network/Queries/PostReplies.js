exports.newPostReplies = function newPostReplies() {

    let thisObject = {
        post: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    const INITIAL_REPLY_INDEX_FIRST = 'First'
    const INITIAL_REPLY_INDEX_LAST = 'Last'
    const MIN_AMOUNT_REQUESTED = 1
    const MAX_AMOUNT_REQUESTED = 100
    const DIRECTION_FUTURE = 'Future'
    const DIRECTION_PAST = 'Past'

    return thisObject

    function finalize() {
        thisObject.post = undefined
    }

    function initialize(queryReceived) {
        /*
        Validate Post
        */
        thisObject.post = NT.memory.maps.POSTS.get(queryReceived.targetPostHash)

        if (thisObject.post === undefined) {
            throw ('Target Post Not Found.')
        }
        /* 
        Validate Initial Index 
        */
        if (queryReceived.initialIndex === undefined) {
            throw ('Initial Index Undefined.')
        }

        if (queryReceived.initialIndex === INITIAL_REPLY_INDEX_LAST) {
            queryReceived.initialIndex = thisObject.poat.replies.length - 1
        }

        if (queryReceived.initialIndex === INITIAL_REPLY_INDEX_FIRST) {
            queryReceived.initialIndex = 0
        }

        if (isNaN(queryReceived.initialIndex) === true) {
            throw ('Initial Reply Is Not a Number.')
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
                    let post = thisObject.post.replies[i]
                    if (post === undefined) { break }
                    addToResponse(post)
                }
                break
            }
            case DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let post = thisObject.post.replies[i]
                    if (post === undefined) { break }
                    addToResponse(post)
                }
                break
            }
        }
        return response

        function addToResponse(post) {
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

            response.push(postResponse)
        }
    }
}