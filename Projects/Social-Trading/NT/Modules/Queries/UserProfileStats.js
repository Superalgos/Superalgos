exports.newSocialTradingModulesQueriesUserProfileStats = function newSocialTradingModulesQueriesUserProfileStats() {

    let thisObject = {
        profile: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.profile = undefined
    }

    function initialize(queryReceived) {
        /*
        Validate User Profile
        */
        if (queryReceived.targetUserProfileId !== undefined) {
            thisObject.profile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(queryReceived.targetUserProfileId)
        } else {
            thisObject.profile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_HANDLE.get(queryReceived.targetUserProfileHandle)
        }
        
        if (thisObject.profile === undefined) {
            throw ('Target User Profile Not Found.')
        }
    }

    function execute() {

        return {
            "userProfileId": thisObject.profile.userProfileId,
            "userProfileHandle": thisObject.profile.userProfileHandle,
            "blockchainAccount": thisObject.profile.blockchainAccount,
            "ranking": thisObject.profile.ranking,
            "followingCount": thisObject.profile.following.size,
            "followersCount": thisObject.profile.followers.size,
            "postsCount": thisObject.profile.posts.size,
            "botsCount": thisObject.profile.bots.size,
            "emitterEventsCount": thisObject.profile.emitterEventsCount,
            "targetEventsCount": thisObject.profile.targetEventsCount
        }
    }
}