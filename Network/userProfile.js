exports.newUserProfile = function newUserProfile() {

    let thisObject = {
        userProfieId: undefined,
        githubUsername: undefined,
        blockchainAccount: undefined,
        postFollowing: undefined,
        postFollowers: undefined,
        tradeFollowing: undefined,
        tradeFollowers: undefined,
        ranking: undefined,
        events: undefined,
        postFollowingCount: undefined,
        postFollowersCount: undefined,
        tradeFollowingCount: undefined,
        tradeFollowersCount: undefined,
        eventsCount: undefined,
        postsCount: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

        thisObject.postFollowing = new Map()
        thisObject.postFollowers = new Map()

        thisObject.tradeFollowing = new Map()
        thisObject.tradeFollowers = new Map()

        thisObject.events = []

        thisObject.postFollowingCount = 0
        thisObject.postFollowersCount = 0
        thisObject.tradeFollowingCount = 0
        thisObject.tradeFollowersCount = 0
        thisObject.eventsCount = 0
        thisObject.postsCount = 0

    }
}