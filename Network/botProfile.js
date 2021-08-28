exports.newUserProfile = function newUserProfile() {

    let thisObject = {
        botProfileId: undefined,
        botProfileHandle: undefined,
        botAsset: undefined,
        botExchange: undefined,
        enabled: undefined,
        following: undefined,
        followers: undefined,
        followingCount: undefined,
        followersCount: undefined,
        emitterEventsCount: undefined,
        targetEventsCount: undefined,
        postsCount: undefined,
        posts: undefined,
        addPost: addPost,
        removePost: removePost,
        addFollowing: addFollowing,
        removeFollowing: removeFollowing,
        addFollower: addFollower,
        removeFollower: removeFollower,
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

        thisObject.followingCount = 0
        thisObject.followersCount = 0

        thisObject.emitterEventsCount = 0
        thisObject.targetEventsCount = 0
        thisObject.postsCount = 0

        thisObject.posts = []
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
        if (NT.memory.maps.POSTS.get(emitterPostHash) !== undefined) {
            throw ('Post Already Exists.')
        }

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

        thisObject.posts.push(post)
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
        botProfile
    ) {
        if (thisObject.following.get(botProfile.id) === undefined) {
            thisObject.following.set(botProfile.id, botProfile)
            thisObject.followingCount++
        }
    }

    function removeFollowing(
        botProfile
    ) {
        if (thisObject.following.get(botProfile.id) !== undefined) {
            thisObject.following.delete(botProfile.id)
            thisObject.followingCount--
        }
    }

    function addFollower(
        botProfile
    ) {
        if (thisObject.followers.get(botProfile.id) === undefined) {
            thisObject.followers.set(botProfile.id, botProfile)
            thisObject.followersCount++
        }
    }

    function removeFollower(
        botProfile
    ) {
        if (thisObject.followers.get(botProfile.id) !== undefined) {
            thisObject.followers.delete(botProfile.id)
            thisObject.followersCount--
        }
    }
}
