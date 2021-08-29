exports.newUserProfileStats = function newUserProfileStats() {

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
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_ID.get(queryReceived.targetUserProfileId)
        } else {
            thisObject.profile = NT.memory.maps.USER_PROFILES_BY_HANDLE.get(queryReceived.targetUserProfileHandle)
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
            "followingCount": thisObject.profile.followingCount,
            "followersCount": thisObject.profile.followersCount,
            "emitterEventsCount": thisObject.profile.emitterEventsCount,
            "targetEventsCount": thisObject.profile.targetEventsCount,
            "postsCount": thisObject.profile.postsCount,
            "botsCount": thisObject.profile.botsCount
        }
    }
}