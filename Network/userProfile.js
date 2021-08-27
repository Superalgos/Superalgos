exports.newUserProfile = function newUserProfile() {

    let thisObject = {
        userProfieId: undefined,
        userProfileHandle: undefined,
        blockchainAccount: undefined,
        multiMediaPostsFollowing: undefined,
        multiMediaPostsFollowers: undefined,
        tradePostsFollowing: undefined,
        tradePostsFollowers: undefined,
        ranking: undefined,
        multiMediaPostFollowingCount: undefined,
        multiMediaPostFollowersCount: undefined,
        tradePostsFollowingCount: undefined,
        tradePostsFollowersCount: undefined,
        emitterEventsCount: undefined,
        targetEventsCount: undefined,
        postsCount: undefined,
        botsCount: undefined,
        bots: undefined,
        posts: undefined,
        addPost: addPost,
        removePost: removePost,
        addMultiMediaPostsFollowing: addMultiMediaPostsFollowing,
        removeMultiMediaPostsFollowing: removeMultiMediaPostsFollowing,
        addTradePostsFollowing: addTradePostsFollowing,
        removeTradePostsFollowing: removeTradePostsFollowing,
        addMultiMediaPostsFollower: addMultiMediaPostsFollower,
        removeMultiMediaPostsFollower: removeMultiMediaPostsFollower,
        addTradePostsFollower: addTradePostsFollower,
        removeTradePostsFollower: removeTradePostsFollower,
        addBot: addBot,
        removeBot: removeBot,
        enableBot: enableBot,
        disableBot: disableBot,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.multiMediaPostsFollowing = undefined
        thisObject.multiMediaPostsFollowers = undefined

        thisObject.tradePostsFollowing = undefined
        thisObject.tradePostsFollowers = undefined

        thisObject.posts = undefined
        thisObject.bots = undefined
    }

    function initialize() {

        thisObject.multiMediaPostsFollowing = new Map()
        thisObject.multiMediaPostsFollowers = new Map()

        thisObject.tradePostsFollowing = new Map()
        thisObject.tradePostsFollowers = new Map()

        thisObject.multiMediaPostFollowingCount = 0
        thisObject.multiMediaPostFollowersCount = 0
        thisObject.tradePostsFollowingCount = 0
        thisObject.tradePostsFollowersCount = 0
        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0
        thisObject.postsCount = 0
        thisObject.botsCount = 0

        thisObject.posts = []
        thisObject.bots = undefined
    }

    function addPost(
        emitterPostHash,
        targetPostHash,
        postType,
        userProfile,
        timestamp
    ) {
        if (NT.memory.maps.POSTS.get(emitterPostHash) !== undefined) {
            throw ('Post Already Exists.')
        }

        let post = NT.modules.POST.newPost()
        post.initialize(
            emitterPostHash,
            targetPostHash,
            postType,
            userProfile,
            timestamp
        )

        thisObject.maps.POSTS.push(post)
        NT.memory.maps.POSTS.set(emitterPostHash, post)
        thisObject.postsCount++
    }

    function removePost(
        emitterPostHash
    ) {
        if (NT.memory.maps.POSTS.get(emitterPostHash) === undefined) {
            throw ('Post Does Not Exist.')
        }

        let post = thisObject.posts.get(emitterPostHash)
        post.finalize()

        for (let i = thisObject.posts.length - 1; i >= 0; i--) {
            if (thisObject.posts[i].emitterPostHash === emitterPostHash) {
                thisObject.posts.splice(i, 1)
                break
            }
        }
        NT.memory.maps.POSTS.delete(emitterPostHash)
        thisObject.postsCount--
    }

    function addMultiMediaPostsFollowing(
        userProfile
    ) {
        if (thisObject.multiMediaPostsFollowing.get(userProfile.id) === undefined) {
            thisObject.multiMediaPostsFollowing.set(userProfile.id, userProfile)
            thisObject.multiMediaPostFollowingCount++
        }
    }

    function removeMultiMediaPostsFollowing(
        userProfile
    ) {
        if (thisObject.multiMediaPostsFollowing.get(userProfile.id) !== undefined) {
            thisObject.multiMediaPostsFollowing.delete(userProfile.id)
            thisObject.multiMediaPostFollowingCount--
        }
    }

    function addTradePostsFollowing(
        userProfile
    ) {
        if (thisObject.tradePostsFollowingCount.get(userProfile.id) === undefined) {
            thisObject.tradePostsFollowingCount.set(userProfile.id, userProfile)
            thisObject.tradePostsFollowingCount++
        }
    }

    function removeTradePostsFollowing(
        userProfile
    ) {
        if (thisObject.tradePostsFollowingCount.get(userProfile.id) !== undefined) {
            thisObject.tradePostsFollowingCount.delete(userProfile.id)
            thisObject.tradePostsFollowingCount--
        }
    }

    function addMultiMediaPostsFollower(
        userProfile
    ) {
        if (thisObject.multiMediaPostsFollowers.get(userProfile.id) === undefined) {
            thisObject.multiMediaPostsFollowers.set(userProfile.id, userProfile)
            thisObject.multiMediaPostFollowersCount++
        }
    }

    function removeMultiMediaPostsFollower(
        userProfile
    ) {
        if (thisObject.multiMediaPostsFollowers.get(userProfile.id) !== undefined) {
            thisObject.multiMediaPostsFollowers.delete(userProfile.id)
            thisObject.multiMediaPostFollowersCount--
        }
    }

    function addTradePostsFollower(
        userProfile
    ) {
        if (thisObject.tradePostsFollowers.get(userProfile.id) === undefined) {
            thisObject.tradePostsFollowers.set(userProfile.id, userProfile)
            thisObject.tradePostsFollowersCount++
        }
    }

    function removeTradePostsFollower(
        userProfile
    ) {
        if (thisObject.tradePostsFollowers.get(userProfile.id) !== undefined) {
            thisObject.tradePostsFollowers.delete(userProfile.id)
            thisObject.tradePostsFollowersCount--
        }
    }

    function addBot(
        botId,
        botAsset,
        botExchange
    ) {
        if (thisObject.bots.get(botId) !== undefined) {
            throw ('Bot Already Exists.')
        }

        let bot = NT.modules.BOTS.newBot()
        bot.initialize(
            botId,
            botAsset,
            botExchange
        )
        thisObject.bots.set(botId, bot)
        thisObject.botsCount++
    }

    function removeBot(
        botId
    ) {
        if (thisObject.bots.get(botId) === undefined) {
            throw ('Bot Does Not Exist.')
        }
        thisObject.bots.get(botId).finalize()
        thisObject.bots.delete(botId)
        thisObject.botsCount--
    }

    function enableBot(
        botId
    ) {
        let bot = thisObject.bots.get(botId)
        if (bot === undefined) {
            throw ('Bot Does Not Exist.')
        }

        if (bot.enabled === true) {
            throw ('Bot Already Enabled.')
        }

        bot.enabled = true
    }

    function disableBot(
        botId
    ) {
        let bot = thisObject.bots.get(botId)
        if (bot === undefined) {
            throw ('Bot Does Not Exist.')
        }

        if (bot.enabled === false) {
            throw ('Bot Already Disabled.')
        }

        bot.enabled = false
    }
}