exports.newSocialTradingModulesSocialGraph = function newSocialTradingModulesSocialGraph() {
    /*
    This module mantains in memory the personal social graph for
    the user profile of the user of the Desktop App. A personal social
    graph is very similar to the one mantained at a Netwrok Node,
    the mainn difference is that it only includes information relevant
    to this particular user, and not for al the users in the system
    as in the Network Node.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }
}