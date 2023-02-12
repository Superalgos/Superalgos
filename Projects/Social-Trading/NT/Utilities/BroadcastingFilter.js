exports.newSocialTradingUtilitiesBroadcastingFilter = function newSocialTradingUtilitiesBroadcastingFilter() {
    /*
    This module helps us filter which user profiles needs to be notified.
    */
    let thisObject = {
        filterFollowersFromUserProfiles: filterFollowersFromUserProfiles
    }

    return thisObject

    function filterFollowersFromUserProfiles(
        connectedEntities,
        originSocialEntity
    ) {
        let boradcastTo = []

        for (let i = 0; i < connectedEntities.length; i++) {
            let connectedEntity = connectedEntities[i]
            let userProfile = connectedEntity.userProfile
            /*
            For each connected user profile, we need an array of Social Personas and Social Trading Bots
            belonging to that User Profile. 
            */
            let socialPersonas = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.socialPersonas, 'Social Persona')
            let socialTradingBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userBots, 'Social Trading Bot')
            /*
            We check for each social entity if it follows the social entity producing this event.
            */
            let atLeastOneFound = findWhoIsFollowing(socialPersonas)
            if (atLeastOneFound === true) { continue }
            findWhoIsFollowing(socialTradingBots)

            function findWhoIsFollowing(socialEntities) {
                for (let j = 0; j < socialEntities.length; j++) {
                    let socialEntity = socialEntities[j]

                    if (socialEntity.id === originSocialEntity.id) { continue }

                    let follower = originSocialEntity.followers.get(socialEntity.id)
                    if (follower !== undefined) {
                        boradcastTo.push(connectedEntity)
                        return true
                    }
                }
            }
        }
        return boradcastTo
    }
}