exports.newDashboardsUIApp = function newDashboardsUIApp() {
    const { spawn: spawnProcess } = require('child_process')

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize () {
        spawnProcess('npm run serve', [], {shell: true, stdio: "inherit"})
    }   

    function finalize () {

    }
}
