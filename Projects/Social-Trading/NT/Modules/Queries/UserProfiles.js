exports.newSocialTradingModulesQueriesUserProfiles = function newSocialTradingModulesQueriesUserProfiles() {
    /*
    This query returns a list of user profiles ordered
    by Ranking. It is useful to bootstrap new users
    and provide them with alternative of who to follow.
    */
    let thisObject = {
<<<<<<< HEAD
        array: undefined,
=======
        profiles: undefined,
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
<<<<<<< HEAD
        thisObject.array = undefined
=======
        thisObject.profiles = undefined
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
    }

    function initialize(queryReceived) {

<<<<<<< HEAD
        thisObject.array = Array.from(
            NT.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_ID, 
            x => x[1]
            )
        thisObject.array.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)
=======
        thisObject.profiles = Array.from(
            NT.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_ID, 
            x => x[1]
            )
        thisObject.profiles.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.profiles)
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef

    }

    function execute() {

        let response = []

        switch (thisObject.direction) {
<<<<<<< HEAD
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
=======
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
>>>>>>> d641a7e3b4a9f76cadee3d5dc0a02ed29d6b88ef
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