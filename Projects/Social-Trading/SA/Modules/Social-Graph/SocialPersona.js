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
        node: undefined,        
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
        originEventsCount: undefined,
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
        thisObject.node = undefined

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
        thisObject.node = socialPersonaNode
        thisObject.handle = handle
        thisObject.blockchainAccount = blockchainAccount
        thisObject.ranking = ranking
        thisObject.id = socialPersonaNode.id

        thisObject.following = new Map()
        thisObject.followers = new Map()
        thisObject.posts = new Map()
        thisObject.bots = new Map()

        thisObject.originEventsCount = 0
        thisObject.targetEventsCount = 0
    }

    function addPost(
        originSocialPersonaId,
        targetSocialPersonaId,
        originPostHash,
        targetPostHash,
        postType,
        timestamp,
        fileKeys
    ) {
        if (thisObject.posts.get(originPostHash) !== undefined) {
            throw ('Post Already Exists.')
        } else {
            let post = SA.projects.socialTrading.modules.socialGraphPost.newSocialTradingModulesSocialGraphPost()
            post.initialize(
                originSocialPersonaId,
                targetSocialPersonaId,
                undefined,
                undefined,
                originPostHash,
                targetPostHash,
                postType,
                timestamp,
                fileKeys
            )

            thisObject.posts.set(originPostHash, post)
            SA.projects.socialTrading.globals.memory.maps.POSTS.set(originPostHash, post)
        }
    }

    function removePost(
        originSocialPersonaId,
        targetSocialPersonaId,
        originPostHash,
        targetPostHash,
        postType,
        timestamp,
        fileKeys
    ) {
        if (thisObject.posts.get(originPostHash) === undefined) {
            throw ('Post Does Not Exist.')
        } else {
            let post = SA.projects.socialTrading.modules.socialGraphPost.newSocialTradingModulesSocialGraphPost()
            post.initialize(
                originSocialPersonaId,
                targetSocialPersonaId,
                undefined,
                undefined,
                originPostHash,
                targetPostHash,
                postType,
                timestamp,
                fileKeys
            )
            post = thisObject.posts.get(originPostHash)
            post.finalize()
            thisObject.posts.delete(originPostHash)
            SA.projects.socialTrading.globals.memory.maps.POSTS.delete(originPostHash)
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
        originSocialPersonaId
    ) {
        if (thisObject.followers.get(originSocialPersonaId) === undefined) {
            thisObject.followers.set(originSocialPersonaId, originSocialPersonaId)
        }
    }

    function removeFollower(
        originSocialPersonaId
    ) {
        if (thisObject.followers.get(originSocialPersonaId) !== undefined) {
            thisObject.followers.delete(originSocialPersonaId)
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
