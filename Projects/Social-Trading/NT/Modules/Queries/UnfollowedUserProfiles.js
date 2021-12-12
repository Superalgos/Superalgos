exports.newSocialTradingModulesQueriesUnfollowedUserProfiles = function newSocialTradingModulesQueriesUnfollowedUserProfiles() {
    /*
    This query returns a list of user profiles ordered
    by Ranking. It filters out all the profiles that 
    are already followed by the Emitter User Profile.
    */
    let thisObject = {
        emitterUserProfile: undefined,
        profiles: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.profiles = undefined
        thisObject.emitterUserProfile = undefined
    }

    function initialize(queryReceived) {

        thisObject.emitterUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(queryReceived.emitterUserProfileId)
        if (thisObject.emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }

        thisObject.profiles = Array.from(
            SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID,
            x => x[1]
        )
        thisObject.profiles.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.profiles)

    }

    function execute() {

        let response = []

        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP: {
                let i = thisObject.initialIndex
                let foundCount = 0
                while (
                    foundCount < thisObject.amountRequested &&
                    i < thisObject.profiles.length
                ) {
                    let profile = thisObject.profiles[i]
                    if (
                        thisObject.emitterUserProfile.following.get(profile.userProfileId) === undefined &&
                        thisObject.emitterUserProfile.userProfileId !== profile.userProfileId
                        ) {
                        addToResponse(profile)
                        foundCount++
                    }
                    i++
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
                let i = thisObject.initialIndex
                let foundCount = 0
                while (
                    foundCount < thisObject.amountRequested &&
                    i >= 0
                ) {
                    let profile = thisObject.profiles[i]
                    if (
                        thisObject.emitterUserProfile.following.get(profile.userProfileId) === undefined &&
                        thisObject.emitterUserProfile.userProfileId !== profile.userProfileId
                        ) {
                        addToResponse(profile)
                        foundCount++
                    }
                    i--
                }                
                break
            }
        }
        return response

        function addToResponse(profile) {
            let postResponse = {
                "userProfileId": profile.userProfileId,
                "userProfileHandle": profile.userProfileHandle,
                "blockchainAccount": profile.blockchainAccount,
                "ranking": profile.ranking,
                "followingCount": profile.following.size,
                "followersCount": profile.followers.size,
                "postsCount": profile.posts.size,
                "botsCount": profile.bots.size,
                "emitterEventsCount": profile.emitterEventsCount,
                "targetEventsCount": profile.targetEventsCount
            }
            response.push(postResponse)
        }
    }
}