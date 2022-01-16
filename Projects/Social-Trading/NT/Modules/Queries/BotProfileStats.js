exports.newSocialTradingModulesQueriesBotProfileStats = function newSocialTradingModulesQueriesBotProfileStats() {

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
        let userProfile
        if (queryReceived.targetUserProfileId !== undefined) {
            userProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(queryReceived.targetUserProfileId)
        } else {
            userProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_HANDLE.get(queryReceived.targetUserProfileHandle)
        }

        if (userProfile === undefined) {
            throw ('Target User Profile Not Found.')
        }
        /*
        Validate Bot Profile
        */
        thisObject.profile = userProfile.bots.get(queryReceived.targetBotProfileId)
        if (thisObject.profile === undefined) {
            throw ('Target Bot Profile Not Found.')
        }
    }

    function execute() {

        return {
            "userProfileId": thisObject.profile.userProfileId,
            "botProfileId": thisObject.profile.botProfileId,
            "botProfileHandle": thisObject.profile.botProfileHandle,
            "followingCount": thisObject.profile.following.size,
            "followersCount": thisObject.profile.followers.size,
            "postsCount": thisObject.profile.posts.size,
            "emitterEventsCount": thisObject.profile.emitterEventsCount,
            "targetEventsCount": thisObject.profile.targetEventsCount            
        }
    }
}