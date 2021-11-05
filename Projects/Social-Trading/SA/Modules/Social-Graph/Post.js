exports.newSocialTradingModulesSocialGraphPost = function newSocialTradingModulesSocialGraphPost() {
    /*
    Posts represent a collection of multimedia content sorted somewhere else
    and identified by that content hash. Posts might belong to:
        * a User Profile.
        * a Bot Profile.
    
    Posts might be linked to other posts when they are a reply or quote.
    
    Posts might have:
        * replies, when a user or bot replies to a post.
        * reactions,  when a user or bot reacts to a post.
    */
    let thisObject = {
        /* Parents Ids */
        emitterUserProfileId: undefined,
        targetUserProfileId: undefined,
        emitterBotProfileId: undefined,
        targetBotProfileId: undefined,
        /* Unique Keys */
        emitterPostHash: undefined,
        targetPostHash: undefined,
        /* Post Unique Properties */
        postType: undefined,
        timestamp: undefined,
        /* Maps */
        replies: undefined,
        reactions: undefined,
        /* Reaction Functions */
        addReaction: addReaction,
        removeReactions: removeReaction,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const POST_TYPES = {
        NEW_POST: 0,
        REPLY_TO_POST: 1,
        REPOST_: 2,
        QUOTE_REPOST_: 3
    }

    const REACTION_TYPES = {
        REACTION_LIKE: 0,
        REACTION_LOVE: 1,
        REACTION_HAHA: 2,
        REACTION_WOW: 3,
        REACTION_SAD: 4,
        REACTION_ANGRY: 5,
        REACTION_CARE: 6
    }

    thisObject.replies = new Map()

    thisObject.reactions = new Map()
    thisObject.reactions.set(REACTION_TYPES.REACTION_LIKE, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_LOVE, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_HAHA, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_WOW, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_SAD, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_ANGRY, 0)
    thisObject.reactions.set(REACTION_TYPES.REACTION_CARE, 0)

    return thisObject

    function finalize() {
        thisObject.replies = undefined
        thisObject.reactions = undefined
    }

    function initialize(
        emitterUserProfileId,
        targetUserProfileId,
        emitterBotProfileId,
        targetBotProfileId,
        emitterPostHash,
        targetPostHash,
        postType,
        timestamp
    ) {

        thisObject.emitterUserProfileId = emitterUserProfileId
        thisObject.targetUserProfileId = targetUserProfileId
        thisObject.emitterBotProfileId = emitterBotProfileId
        thisObject.targetBotProfileId = targetBotProfileId
        thisObject.emitterPostHash = emitterPostHash
        thisObject.targetPostHash = targetPostHash
        thisObject.postType = postType
        thisObject.timestamp = timestamp
        /*
        Let's find the Target Post
        */
        if (
            thisObject.postType === POST_TYPES.REPLY_TO_POST ||
            thisObject.postType === POST_TYPES.REPOST_ ||
            thisObject.postType === POST_TYPES.QUOTE_REPOST_
        ) {
            /*
            Validate Target User Profile.
            */
            let targetUserProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(thisObject.targetUserProfileId)
            if (targetUserProfile === undefined) {
                throw ('Target User Profile Not Found.')
            }

            let targetPost = targetUserProfile.posts.get(thisObject.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found.')
            }
            /*
            Let's add this post to the replies of the Target Post
            */
            if (
                thisObject.postType === POST_TYPES.REPLY_TO_POST
            ) {
                targetPost.replies.set(thisObject.targetPostHash, thisObject.targetPostHash)
            }
        }
    }

    function addReaction(reactionType) {
        let reactionCount = thisObject.reactions.get(reactionType)

        if (reactionCount === undefined) {
            throw ('Reaction Type Not Supported.')
        }

        thisObject.reactions.set(reactionType, reactionCount + 1)
    }

    function removeReaction(reactionType) {
        let reactionCount = thisObject.reactions.get(reactionType)

        if (reactionCount === undefined) {
            throw ('Reaction Type Not Supported.')
        }

        thisObject.reactions.set(reactionType, reactionCount - 1)
    }
}