exports.newUserProfile = function newUserProfile() {

    let thisObject = {
        userProfieId: undefined,
        githubUsername: undefined,
        blockchainAccount: undefined,
        multiMediaPostsFollowing: undefined,
        multiMediaPostsFollowers: undefined,
        tradePostsFollowing: undefined,
        tradePostsFollowers: undefined,
        ranking: undefined,
        events: undefined,
        multiMediaPostFollowingCount: undefined,
        multiMediaPostFollowersCount: undefined,
        tradePostsFollowingCount: undefined,
        tradePostsFollowersCount: undefined,
        eventsCount: undefined,
        postsCount: undefined,
        addMultiMediaPostsFollowing: addMultiMediaPostsFollowing, 
        removeMultiMediaPostsFollowing: removeMultiMediaPostsFollowing, 
        addTradePostsFollowing: addTradePostsFollowing, 
        removeTradePostsFollowing: removeTradePostsFollowing,
        addMultiMediaPostsFollower: addMultiMediaPostsFollower,
        removeMultiMediaPostsFollower: removeMultiMediaPostsFollower,
        addTradePostsFollower: addTradePostsFollower,
        removeTradePostsFollower: removeTradePostsFollower,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

        thisObject.multiMediaPostsFollowing = new Map()
        thisObject.multiMediaPostsFollowers = new Map()

        thisObject.tradePostsFollowing = new Map()
        thisObject.tradePostsFollowers = new Map()

        thisObject.events = [] // Dont know what this is

        thisObject.multiMediaPostFollowingCount = 0
        thisObject.multiMediaPostFollowersCount = 0
        thisObject.tradePostsFollowingCount = 0
        thisObject.tradePostsFollowersCount = 0
        thisObject.eventsCount = 0
        thisObject.postsCount = 0

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
}