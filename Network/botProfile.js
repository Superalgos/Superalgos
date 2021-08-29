exports.newBotProfile = function newBotProfile() {

    let thisObject = {
        /* Unique Keys */
        botProfileId: undefined,
        botProfileHandle: undefined,
        /* Bot Unitque Properties */
        botAsset: undefined,
        botExchange: undefined,
        enabled: undefined,
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

        thisObject.following = undefined
        thisObject.followers = undefined
        thisObject.posts = undefined

    }

    function initialize() {

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
        timestamp
    ) {
        if (thisObject.posts.get(emitterPostHash) !== undefined) {
            throw ('Post Already Exists.')
        } else {
            let post = NT.modules.POST.newPost()
            post.initialize(
                emitterUserProfileId,
                targetUserProfileId,
                emitterBotProfileId,
                targetBotProfileId,
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
}

