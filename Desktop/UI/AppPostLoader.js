

function newAppPostLoader() {

    let thisObject = {
        start: start
    }
    return thisObject

    function start() {
        try {
            webApp = newWebApp()
            webApp.initialize()
        } catch (err) {
            console.log('[ERROR] err.stack = ' + err.stack)
        }
    }
}
