exports.newEvent = function newEvent() {

    let thisObject = {
        id: undefined,
        githubUsername: undefined,
        blockchainAccount: undefined,
        following: undefined,
        followers: undefined,
        followingCount: undefined,
        followersCount: undefined,
        tradeCopying: undefined,
        tradeCopiers: undefined,
        tradeCopyingCount: undefined,
        tradeCopiersCount: undefined,
        ranking: undefined,
        joined: undefined,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.following = new Map()
    thisObject.followers = new Map()

    thisObject.tradeCopying = new Map()
    thisObject.tradeCopiersCount = new Map()

    return thisObject

    function finalize() {

    }

    function initialize() {

    }
}