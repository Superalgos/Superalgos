exports.newSocialTradingModulesQueriesUserProfiles = function newSocialTradingModulesQueriesUserProfiles() {
    /*
    This query returns a list of user profiles ordered
    by Ranking. It is useful to bootstrap new users
    and provide them with alternative of who to follow.
    */
    let thisObject = {
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
    }

    function initialize(queryReceived) {

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
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let profile = thisObject.profiles[i]
                    if (profile === undefined) { break }
                    addToResponse(profile)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let profile = thisObject.profiles[i]
                    if (profile === undefined) { break }
                    addToResponse(profile)
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