exports.newSocialGraph = function newSocialGraph() {
    /*
    This module represents the Social Graph that 
    whis node mantains. The Social Graph is one
    of the services the Network Node provides.
    */
    let thisObject = {
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        let bootstrapProcess = NT.modules.bootstrap.newBootstrap()
        bootstrapProcess.initialize()
    }
}