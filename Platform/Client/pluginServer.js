exports.newPluginServer = function newPluginServer() {

    const MODULE = "Plugin Server"

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run,
        name: 'Plugin Server'
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {
        
     }
}