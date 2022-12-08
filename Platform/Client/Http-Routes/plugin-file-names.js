exports.newPluginFileNamesRoute = function newPluginFileNamesRoute() {
    const thisObject = {
        endpoint: 'PluginFileNames',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        processRequest()

        async function processRequest(body) {
            try {
                let project = unescape(requestPath[2])
                let folder = unescape(requestPath[3])

                let response = await SA.projects.communityPlugins.utilities.plugins.getPluginFileNames(
                    project,
                    folder
                ).catch(err => {
                    console.log((new Date()).toISOString(), '[ERROR] httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                })

                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)

            } catch(err) {
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> PluginFileNames -> Method call produced an error.')
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> PluginFileNames -> Params Received = ' + body)

                let error = {
                    result: 'Fail Because',
                    message: err.message,
                    stack: err.stack
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
            }
        }
    }
}