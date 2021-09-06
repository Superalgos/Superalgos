

function newAppPostLoader() {

    let thisObject = {
        start: start
    }
    return thisObject

    function start() {
        try {

            setupProjectsSchema()

            function setupProjectsSchema() {
                httpRequest(undefined, 'ProjectsSchema', onResponse)

                function onResponse(err, file) {
                    PROJECTS_SCHEMA = JSON.parse(file)
                    webApp = newWebApp()
                    webApp.initialize()
                }
            }
        } catch (err) {
            console.log('[ERROR] err.stack = ' + err.stack)
        }
    }
}
