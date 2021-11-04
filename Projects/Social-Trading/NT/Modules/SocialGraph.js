exports.newNetworkModulesSocialGraph = function newNetworkModulesSocialGraph() {
    /*
    This module represents the Social Graph Service that 
    deals with the Social Graph this node maintains.
    The Social Graph is one of the services the Network Node provides.

    This service is responsible for maintaining the whole Social Graph
    or relationships between User and Bot profiles and also between 
    their posts.
    */
    let thisObject = {
        userProfiles: undefined,
        /* Framework Functions */
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