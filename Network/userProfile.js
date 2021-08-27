exports.newUserProfile = function newUserProfile() {

    let thisObject = {
        userProfieId: undefined,
        userProfileHandle: undefined,
        blockchainAccount: undefined,
        ranking: undefined,
        following: undefined,
        followers: undefined,
        followingCount: undefined,
        followersCount: undefined,
        emitterEventsCount: undefined,
        targetEventsCount: undefined,
        postsCount: undefined,
        botsCount: undefined,
        bots: undefined,
        posts: undefined,
        addPost: addPost,
        removePost: removePost,
        addFollowing: addFollowing,
        removeFollowing: removeFollowing,
        addFollower: addFollower,
        removeFollower: removeFollower,
        addBot: addBot,
        removeBot: removeBot,
        enableBot: enableBot,
        disableBot: disableBot,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.following = undefined
        thisObject.followers = undefined

        thisObject.posts = undefined
        thisObject.bots = undefined
    }

    function initialize() {

        thisObject.following = new Map()
        thisObject.followers = new Map()

        thisObject.followingCount = 0
        thisObject.followersCount = 0

        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0
        thisObject.postsCount = 0
        thisObject.botsCount = 0

        thisObject.posts = []
        thisObject.bots = []
    }

    function addPost(
        emitterUserProfileId,
        targetUserProfileId,
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
            emitterUserProfileId,
            targetUserProfileId,
            undefined,
            undefined,
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

    function addFollowing(
        userProfile
    ) {
        if (thisObject.following.get(userProfile.id) === undefined) {
            thisObject.following.set(userProfile.id, userProfile)
            thisObject.followingCount++
        }
    }

    function removeFollowing(
        userProfile
    ) {
        if (thisObject.following.get(userProfile.id) !== undefined) {
            thisObject.following.delete(userProfile.id)
            thisObject.followingCount--
        }
    }

    function addFollower(
        userProfile
    ) {
        if (thisObject.followers.get(userProfile.id) === undefined) {
            thisObject.followers.set(userProfile.id, userProfile)
            thisObject.followersCount++
        }
    }

    function removeFollower(
        userProfile
    ) {
        if (thisObject.followers.get(userProfile.id) !== undefined) {
            thisObject.followers.delete(userProfile.id)
            thisObject.followersCount--
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