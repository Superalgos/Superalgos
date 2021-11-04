exports.newSocialTradingModulesSocialGraph = function newSocialTradingModulesSocialGraph() {
    /*
    This module maintains in memory the personal social graph for
    the user profile of the user of the Desktop App. A personal social
    graph is very similar to the one maintained at a Network Node,
    the main difference is that it only includes information relevant
    to this particular user, and not for all Superalgos users
    as in the Network Node.

    Why we need this?

    Because we need to minimize the calls to the network. There might be
    information that the web app needs that we already have, so there is
    no need to ask it to a network node.
    */
    let thisObject = {
        userProfiles: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    async function initialize() {
        thisObject.userProfiles = SA.projects.network.modules.userProfiles.newNetworkModulesUserProfiles()
        await thisObject.userProfiles.initialize()
    }
}