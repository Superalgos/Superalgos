exports.newSocialTradingModulesQueriesUserProfiles = function newSocialTradingModulesQueriesUserProfiles() {
    /*
    This query returns a list of user profiles ordered
    by Ranking. It is useful to bootstrap new users
    and provide them with alternative of who to follow.
    */
    let thisObject = {
        array: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.array = undefined
    }

    function initialize(queryReceived) {

        thisObject.array = Array.from(
            NT.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_ID, 
            x => x[1]
            )
        thisObject.array.sort((a, b) => (a["ranking"] > b["ranking"]) ? 1 : -1)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)

    }

    function execute() {

        let response = []

        switch (thisObject.direction) {
            case NT.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case NT.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
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