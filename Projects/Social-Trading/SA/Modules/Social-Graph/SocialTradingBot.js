exports.newSocialTradingModulesSocialGraphSocialTradingBot = function newSocialTradingModulesSocialGraphSocialTradingBot() {
    /*
    Users can have a Social Trading Bot that can:

        * follow other social trading bots.
        * be followed by other social trading bots.
        * have posts linked to their social trading bots.
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
        /* Bot Unique Properties */
        botAsset: undefined,
        botExchange: undefined,
        botEnabled: undefined,
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

    }

    function initialize(
        userProfileNode,
        socialTradingBotNode, 
        handle,
        blockchainAccount,
        ranking,
        botAsset,
        botExchange,
        botEnabled
    ) {
        thisObject.userProfileNode = userProfileNode
        thisObject.node = socialTradingBotNode
        thisObject.handle = handle
        thisObject.blockchainAccount = blockchainAccount
        thisObject.ranking = ranking
        thisObject.id = socialTradingBotNode.id

        thisObject.botAsset = botAsset
        thisObject.botExchange = botExchange
        thisObject.botEnabled = botEnabled

        thisObject.following = new Map()
        thisObject.followers = new Map()
        thisObject.posts = new Map()

        thisObject.originEventsCount = 0
        thisObject.targetEventsCount = 0

    }

    function addPost(
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
        if (thisObject.posts.get(originPostHash) !== undefined) {
            throw ('Post Already Exists.')
        } else {
            let post = SA.projects.socialTrading.modules.socialGraphPost.newSocialTradingModulesSocialGraphPost()
            post.initialize(
                originSocialPersonaId,
                targetSocialPersonaId,
                originSocialTradingBotId,
                targetSocialTradingBotId,
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
        originPostHash
    ) {
        if (thisObject.posts.get(originPostHash) === undefined) {
            throw ('Post Does Not Exist.')
        } else {
            let post = thisObject.posts.get(originPostHash)
            post.finalize()
            thisObject.posts.delete(originPostHash)
            SA.projects.socialTrading.globals.memory.maps.POSTS.delete(originPostHash)
        }
    }

    function addFollowing(
        targetSocialPersonaId,
        targetSocialTradingBotId
    ) {
        if (thisObject.following.get(targetSocialTradingBotId) === undefined) {
            thisObject.following.set(targetSocialTradingBotId, { targetSocialPersonaId: targetSocialPersonaId, targetSocialTradingBotId: targetSocialTradingBotId })
        } else {
            throw ('Already Following.')
        }
    }

    function removeFollowing(
        targetSocialTradingBotId
    ) {
        if (thisObject.following.get(targetSocialTradingBotId) !== undefined) {
            thisObject.following.delete(targetSocialTradingBotId)
        } else {
            throw ('Not Following.')
        }
    }

    function addFollower(
        originSocialPersonaId,
        originSocialTradingBotId
    ) {
        if (thisObject.followers.get(originSocialTradingBotId) === undefined) {
            thisObject.followers.set(originSocialTradingBotId, { originSocialPersonaId: originSocialPersonaId, originSocialTradingBotId: originSocialTradingBotId })
        }
    }

    function removeFollower(
        originSocialTradingBotId
    ) {
        if (thisObject.followers.get(originSocialTradingBotId) !== undefined) {
            thisObject.followers.delete(originSocialTradingBotId)
        }
    }
}

