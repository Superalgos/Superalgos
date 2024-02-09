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
        originSocialPersonaId: undefined,
        targetSocialPersonaId: undefined,
        originSocialTradingBotId: undefined,
        targetSocialTradingBotId: undefined,
        /* Unique Keys */
        originPostHash: undefined,
        targetPostHash: undefined,
        /* Post Unique Properties */
        postType: undefined,
        fileKeys: undefined, 
        timestamp: undefined,
        /* Maps */
        replies: undefined,
        reactions: undefined,
        reactionsBySocialEntity: undefined,
        /* Reaction Functions */
        addReaction: addReaction,
        removeReactions: removeReaction,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.fileKeys = undefined
        thisObject.replies = undefined
        thisObject.reactions = undefined
        thisObject.reactionsBySocialEntity = undefined
    }

    function initialize(
        originSocialPersonaId,
        targetSocialPersonaId,
        originSocialTradingBotId,
        targetSocialTradingBotId,
        originPostHash,
        targetPostHash,
        postType,
        timestamp,
        fileKeys
    ) {
        /*
        Maps Initialization
        */
        thisObject.replies = new Map()

        thisObject.reactions = new Map()
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_LIKE, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_LOVE, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_SMILE_SMALL_EYES, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_BIG_CHEESING, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_TEARS_OF_JOY, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_HEART_EYES, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_PINOCCHIO, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_CELEBRATION, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_SURPRISED_GHOST, 0)
        thisObject.reactions.set(SA.projects.socialTrading.globals.reactionTypes.REACTION_FRUSTRATED_MONKEY, 0)

        thisObject.reactionsBySocialEntity = new Map()
        /*
        Assimilating Parameters
        */
        thisObject.originSocialPersonaId = originSocialPersonaId
        thisObject.targetSocialPersonaId = targetSocialPersonaId
        thisObject.originSocialTradingBotId = originSocialTradingBotId
        thisObject.targetSocialTradingBotId = targetSocialTradingBotId
        thisObject.originPostHash = originPostHash
        thisObject.targetPostHash = targetPostHash
        thisObject.postType = postType
        thisObject.timestamp = timestamp
        thisObject.fileKeys = fileKeys
        /*
        Let's find the Target Post
        */
        if (
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPLY_TO_POST ||
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPOST ||
            thisObject.postType === SA.projects.socialTrading.globals.postTypes.QUOTE_REPOST
        ) {
            /*
            Validate Target Social Persona.
            */
            let targetSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.targetSocialPersonaId)
            if (targetSocialPersona === undefined) {
                throw ('Target Social Persona Not Found.')
            }

            let targetPost = targetSocialPersona.posts.get(thisObject.targetPostHash)

            if (targetPost === undefined) {
                throw ('Target Post Not Found.')
            }
            /*
            Let's add this post to the replies of the Target Post
            */
            if (
                thisObject.postType === SA.projects.socialTrading.globals.postTypes.REPLY_TO_POST
            ) {
                targetPost.replies.set(thisObject.originPostHash, thisObject.originPostHash)
            }
        }
    }

    function addReaction(reactionType, socialEntityId) {
        /*
        Remember who reacted
        */
        thisObject.reactionsBySocialEntity.set(socialEntityId, reactionType)
        /*
        Increase Counter
        */
        let reactionCount = thisObject.reactions.get(reactionType)

        if (reactionCount === undefined) {
            throw ('Reaction Type Not Supported.')
        }

        thisObject.reactions.set(reactionType, reactionCount + 1)
    }

    function removeReaction(reactionType, socialEntityId) {
        /*
        Forget who reacted
        */
        thisObject.reactionsBySocialEntity.delete(socialEntityId)
        /*
        Decrease Counter
        */
        let reactionCount = thisObject.reactions.get(reactionType)

        if (reactionCount === undefined) {
            throw ('Reaction Type Not Supported.')
        }

        thisObject.reactions.set(reactionType, reactionCount - 1)
    }
}