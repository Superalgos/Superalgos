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
        socialTradingBotNode: undefined,
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
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.userProfileNode = undefined
        thisObject.socialTradingBotNode = undefined

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
        thisObject.socialTradingBotNode = socialTradingBotNode
        thisObject.handle = handle
        thisObject.blockchainAccount = blockchainAccount

        thisObject.botAsset = botAsset
        thisObject.botExchange = botExchange
        thisObject.botEnabled = botEnabled

        thisObject.following = new Map()
        thisObject.followers = new Map()
        thisObject.posts = new Map()

        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0

    }

    function addPost(
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
        if (thisObject.posts.get(emitterPostHash) !== undefined) {
            throw ('Post Already Exists.')
        } else {
            let post = SA.projects.socialTrading.modules.socialGraphPost.newSocialTradingModulesSocialGraphPost()
            post.initialize(
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
        targetUserProfileId,
        targetBotProfileId
    ) {
        if (thisObject.following.get(targetBotProfileId) === undefined) {
            thisObject.following.set(targetBotProfileId, { targetUserProfileId: targetUserProfileId, targetBotProfileId: targetBotProfileId })
        } else {
            throw ('Already Following.')
        }
    }

    function removeFollowing(
        targetBotProfileId
    ) {
        if (thisObject.following.get(targetBotProfileId) !== undefined) {
            thisObject.following.delete(targetBotProfileId)
        } else {
            throw ('Not Following.')
        }
    }

    function addFollower(
        emitterUserProfileId,
        emitterBotProfileId
    ) {
        if (thisObject.followers.get(emitterBotProfileId) === undefined) {
            thisObject.followers.set(emitterBotProfileId, { emitterUserProfileId: emitterUserProfileId, emitterBotProfileId: emitterBotProfileId })
        }
    }

    function removeFollower(
        emitterBotProfileId
    ) {
        if (thisObject.followers.get(emitterBotProfileId) !== undefined) {
            thisObject.followers.delete(emitterBotProfileId)
        }
    }
}

