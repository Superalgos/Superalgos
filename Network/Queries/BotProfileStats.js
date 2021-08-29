exports.newBotProfileStats = function newBotProfileStats() {

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
        Validate Bot Profile
        */
        let userProfile
        if (queryReceived.targetBotProfileId !== undefined) {
            userProfile = NT.memory.maps.USER_PROFILES_BY_ID.get(queryReceived.targetUserProfileId)
        } else {
            userProfile = NT.memory.maps.USER_PROFILES_BY_HANDLE.get(queryReceived.targetUserProfileId)
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
            "botProfileId": thisObject.profile.botProfileId,
            "botProfileHandle": thisObject.profile.botProfileHandle,
            "followingCount": thisObject.profile.followingCount,
            "followersCount": thisObject.profile.followersCount,
            "emitterEventsCount": thisObject.profile.emitterEventsCount,
            "targetEventsCount": thisObject.profile.targetEventsCount,
            "postsCount": thisObject.profile.postsCount
        }
    }
}