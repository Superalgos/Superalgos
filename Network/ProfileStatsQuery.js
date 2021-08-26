exports.newProfileStatsQuery = function newProfileStatsQuery() {

    let thisObject = {
        profile: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize(queryReceived) {

        thisObject.profile = NT.memory.PROFILES.get(queryReceived.targetUserProfileId)

        if (thisObject.profile === undefined) {
            throw ('Target User Profile Not Found.')
        }

    }

    function execute() {

        return {
            "userProfieId": thisObject.profile.userProfieId,
            "githubUsername": thisObject.profile.githubUsername,
            "blockchainAccount": thisObject.profile.blockchainAccount,
            "ranking": thisObject.profile.ranking,
            "multiMediaPostFollowingCount": thisObject.profile.multiMediaPostFollowingCount,
            "multiMediaPostFollowersCount": thisObject.profile.multiMediaPostFollowersCount,
            "tradePostsFollowingCount": thisObject.profile.tradePostsFollowingCount,
            "tradePostsFollowersCount": thisObject.profile.tradePostsFollowersCount,
            "emitterEventsCount": thisObject.profile.emitterEventsCount,
            "targetEventsCount": thisObject.profile.targetEventsCount,
            "postsCount": thisObject.profile.postsCount,
            "botsCount": thisObject.profile.botsCount
        }
    }
}