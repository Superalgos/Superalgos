

function newWebAppPostLoader() {

    let thisObject = {
        start: start
    }
    return thisObject

    function start() {
        try {

            setupEnvironment()

            function setupEnvironment() {
                httpRequest(undefined, 'Environment', onResponse)

                function onResponse(err, file) {
                    ENVIRONMENT = JSON.parse(file)
                    setupProjectsSchema()
                }
            }

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
