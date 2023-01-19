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
                    SA.logger.error('httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                })

                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)

            } catch(err) {
                SA.logger.error('httpInterface -> PluginFileNames -> Method call produced an error.')
                SA.logger.error('httpInterface -> PluginFileNames -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> PluginFileNames -> Params Received = ' + body)

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