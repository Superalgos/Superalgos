exports.newSocialTradingModulesSocialGraphPost = function newSocialTradingModulesSocialGraphPost() {
    /*
    Posts represent a collection of multimedia content stored somewhere else
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
        /* Signal Related Properties */
        signalType: undefined,
        signalData: undefined,        
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

    thisObject.replies = new Map()

    thisObject.reactions = new Map()
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_LIKE, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_LOVE, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_HAHA, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_WOW, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_SAD, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_ANGRY, 0)
    thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_CARE, 0)

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
        timestamp,
        signalType,
        signalData
    ) {

        thisObject.emitterUserProfileId = emitterUserProfileId
        thisObject.targetUserProfileId = targetUserProfileId
        thisObject.emitterBotProfileId = emitterBotProfileId
        thisObject.targetBotProfileId = targetBotProfileId
        thisObject.emitterPostHash = emitterPostHash
        thisObject.targetPostHash = targetPostHash
        thisObject.postType = postType
        thisObject.timestamp = timestamp
        thisObject.signalType = signalType
        thisObject.signalData = signalData        
        /*
        Let's find the Target Post
        */
        if (
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPLY_TO_POST ||
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPOST ||
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.QUOTE_REPOST
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
                thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPLY_TO_POST
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