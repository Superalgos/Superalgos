exports.newPost = function newPost() {

    let thisObject = {
        postHash: undefined,
        postType: undefined,
        userProfile: undefined,
        asset: undefined,
        timestamp: undefined,
        replies: undefined,
        targetPost: undefined,
        initialize: initialize,
        finalize: finalize
    }

    const POST_TYPES = {
        NEW_MULTI_MEDIA_POST: 10,
        REPLY_TO_MULTI_MEDIA_POST: 11,
        REPOST_MULTI_MEDIA: 12,
        QUOTE_REPOST_MULTI_MEDIA: 13,
        NEW_TRADE_POST: 20,
        REPLY_TO_TRADE_POST: 21,
        RE_POST_TRADE: 22,
        QUOTE_REPOST_TRADE: 23
    }

    return thisObject

    function finalize() {
        thisObject.postHash = undefined
        thisObject.postType = undefined
        thisObject.userProfile = undefined
        thisObject.asset = undefined
        thisObject.timestamp = undefined
        thisObject.replies = undefined
        thisObject.targetPost = undefined
    }

    function initialize(
        emitterPostHash,
        targetPostHash,
        postType,
        userProfile,
        asset,
        timestamp
    ) {

        thisObject.emitterPostHash = emitterPostHash
        thisObject.targetPostHash = targetPostHash
        thisObject.postType = postType
        thisObject.userProfile = userProfile
        thisObject.asset = asset
        thisObject.timestamp = timestamp
        /*
        Let's find the Target Post
        */
        if (
            event.eventType === EVENT_TYPES.REPLY_TO_MULTI_MEDIA_POST ||
            event.eventType === EVENT_TYPES.REPOST_MULTI_MEDIA ||
            event.eventType === EVENT_TYPES.QUOTE_REPOST_MULTI_MEDIA ||
            event.eventType === EVENT_TYPES.REPLY_TO_TRADE_POST ||
            event.eventType === EVENT_TYPES.RE_POST_TRADE ||
            event.eventType === EVENT_TYPES.QUOTE_REPOST_TRADE
        ) {
            thisObject.targetPost = NT.memory.POSTS.get(thisObject.targetPostHash)

            if (thisObject.targetPost === undefined) {
                throw ('Target Post Not Found.')
            }
        }
        /*
         Let's add this post to the replies of the Target Post
         */
        if (
            event.eventType === EVENT_TYPES.REPLY_TO_MULTI_MEDIA_POST ||
            event.eventType === EVENT_TYPES.REPLY_TO_TRADE_POST
        ) {
            thisObject.targetPost.replies.push(thisObject)
        }
    }
}