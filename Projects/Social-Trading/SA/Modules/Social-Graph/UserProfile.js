exports.newSocialTradingModulesSocialGraphUserProfile = function newSocialTradingModulesSocialGraphUserProfile() {
    /*
    Users can have a Profile that can:
        * follow other user profiles.
        * be followed by other user profiles.
        * have posts linked to the profile.
        * have bots linked to the profile.
    */
    let thisObject = {
        /* Unique Keys */
        userProfileId: undefined,
        userProfileHandle: undefined,
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

        thisObject.following = undefined
        thisObject.followers = undefined
        thisObject.posts = undefined
        thisObject.bots = undefined

    }

    function initialize(
        userProfileId,
        userProfileHandle,
        blockchainAccount,
        ranking
    ) {

        thisObject.userProfileId = userProfileId
        thisObject.userProfileHandle = userProfileHandle
        thisObject.blockchainAccount = blockchainAccount
        thisObject.ranking = ranking

        thisObject.following = new Map()
        thisObject.followers = new Map()
        thisObject.posts = new Map()
        thisObject.bots = new Map()

        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0

    }

    function addPost(
        emitterUserProfileId,
        targetUserProfileId,
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
                emitterUserProfileId,
                targetUserProfileId,
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
        targetUserProfileId
    ) {
        if (thisObject.following.get(targetUserProfileId) === undefined) {
            thisObject.following.set(targetUserProfileId, targetUserProfileId)
        } else {
            throw ('Already Following.')
        }
    }

    function removeFollowing(
        targetUserProfileId
    ) {
        if (thisObject.following.get(targetUserProfileId) !== undefined) {
            thisObject.following.delete(targetUserProfileId)
        } else {
            throw ('Not Following.')
        }
    }

    function addFollower(
        emitterUserProfileId
    ) {
        if (thisObject.followers.get(emitterUserProfileId) === undefined) {
            thisObject.followers.set(emitterUserProfileId, emitterUserProfileId)
        }
    }

    function removeFollower(
        emitterUserProfileId
    ) {
        if (thisObject.followers.get(emitterUserProfileId) !== undefined) {
            thisObject.followers.delete(emitterUserProfileId)
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