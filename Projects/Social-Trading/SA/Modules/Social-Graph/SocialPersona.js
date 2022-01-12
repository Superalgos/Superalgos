exports.newSocialTradingModulesSocialGraphSocialPersona = function newSocialTradingModulesSocialGraphSocialPersona() {
    /*
    Users can have a Social Persona that can:

        * follow other social personas.
        * be followed by other social personas.
        * have posts linked to their social persona.
        * have bots linked to their social persona.
    */
    let thisObject = {
        /* References */
        userProfileNode: undefined,
        socialPersonaNode: undefined,        
        /* Unique Keys */
        id: undefined,        
        handle: undefined,
        /* User Unique Properties */
        blockchainAccount: undefined,
        /* SA Reputation + SA Token Balance */
        ranking: undefined,
        /* Maps */
        following: undefined,
        followers: undefined,
        posts: undefined,
        bots: undefined,
        /* Stats */
        emitterEventsCount: undefined,
        targetEventsCount: undefined,
        /* Post Functions */
        addPost: addPost,
        removePost: removePost,
        /* Follow - Unfollow Functions */
        addFollowing: addFollowing,
        removeFollowing: removeFollowing,
        addFollower: addFollower,
        removeFollower: removeFollower,
        /* Bot Functions */
        addBot: addBot,
        removeBot: removeBot,
        enableBot: enableBot,
        disableBot: disableBot,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

        thisObject.userProfileNode = undefined
        thisObject.socialPersonaNode = undefined

        thisObject.following = undefined
        thisObject.followers = undefined
        thisObject.posts = undefined
        thisObject.bots = undefined

    }

    function initialize(
        userProfileNode,
        socialPersonaNode,
        handle,
        blockchainAccount,
        ranking
    ) {

        thisObject.userProfileNode = userProfileNode
        thisObject.socialPersonaNode = socialPersonaNode
        thisObject.handle = handle
        thisObject.blockchainAccount = blockchainAccount
        thisObject.ranking = ranking
        thisObject.id = socialPersonaNode.id

        thisObject.following = new Map()
        thisObject.followers = new Map()
        thisObject.posts = new Map()
        thisObject.bots = new Map()

        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0
    }

    function addPost(
        emitterSocialPersonaId,
        targetSocialPersonaId,
        emitterPostHash,
        targetPostHash,
        postType,
        timestamp
    ) {
        if (thisObject.posts.get(emitterPostHash) !== undefined) {
            throw ('Post Already Exists.')
        } else {
            let post = SA.projects.socialTrading.modules.socialGraphPost.newSocialTradingModulesSocialGraphPost()
            post.initialize(
                emitterSocialPersonaId,
                targetSocialPersonaId,
                undefined,
                undefined,
                emitterPostHash,
                targetPostHash,
                postType,
                timestamp
            )

            thisObject.posts.set(emitterPostHash, post)
        }
    }

    function removePost(
        emitterPostHash
    ) {
        if (thisObject.posts.get(emitterPostHash) === undefined) {
            throw ('Post Does Not Exist.')
        } else {
            let post = thisObject.posts.get(emitterPostHash)
            post.finalize()
            thisObject.posts.delete(emitterPostHash)
        }
    }

    function addFollowing(
        targetSocialPersonaId
    ) {
        if (thisObject.following.get(targetSocialPersonaId) === undefined) {
            thisObject.following.set(targetSocialPersonaId, targetSocialPersonaId)
        } else {
            throw ('Already Following.')
        }
    }

    function removeFollowing(
        targetSocialPersonaId
    ) {
        if (thisObject.following.get(targetSocialPersonaId) !== undefined) {
            thisObject.following.delete(targetSocialPersonaId)
        } else {
            throw ('Not Following.')
        }
    }

    function addFollower(
        emitterSocialPersonaId
    ) {
        if (thisObject.followers.get(emitterSocialPersonaId) === undefined) {
            thisObject.followers.set(emitterSocialPersonaId, emitterSocialPersonaId)
        }
    }

    function removeFollower(
        emitterSocialPersonaId
    ) {
        if (thisObject.followers.get(emitterSocialPersonaId) !== undefined) {
            thisObject.followers.delete(emitterSocialPersonaId)
        }
    }

    function addBot(
        userProfileId,
        botProfileId,
        botAsset,
        botExchange,
        botEnabled
    ) {
        let bot = thisObject.bots.get(botProfileId)
        if (bot !== undefined) {
            throw ('Bot Already Exists.')
        } else {
            let bot = NT.projects.socialTrading.modules.BOTS.newBot()
            bot.initialize(
                userProfileId,
                botProfileId,
                botAsset,
                botExchange,
                botEnabled
            )
            thisObject.bots.set(botProfileId, bot)
        }
    }

    function removeBot(
        botProfileId
    ) {
        let bot = thisObject.bots.get(botProfileId)
        if (bot === undefined) {
            throw ('Bot Does Not Exist.')
        } else {
            thisObject.bots.get(botProfileId).finalize()
            thisObject.bots.delete(botProfileId)
        }
    }

    function enableBot(
        botProfileId
    ) {
        let bot = thisObject.bots.get(botProfileId)
        if (bot === undefined) {
            throw ('Bot Does Not Exist.')
        }
        if (bot.botEnabled === true) {
            throw ('Bot Already Enabled.')
        }
        bot.botEnabled = true
    }

    function disableBot(
        botProfileId
    ) {
        let bot = thisObject.bots.get(botProfileId)
        if (bot === undefined) {
            throw ('Bot Does Not Exist.')
        }
        if (bot.botEnabled === false) {
            throw ('Bot Already Disabled.')
        }
        bot.botEnabled = false
    }
}