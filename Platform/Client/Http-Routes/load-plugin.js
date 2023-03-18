exports.newLoadPluginRoute = function newLoadPluginRoute() {
    const thisObject = {
        endpoint: 'LoadPlugin',
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
                let fileName = unescape(requestPath[4])

                /*Refactoring Code: Remove this before releasing 1.0.0*/
                if(fileName === 'Superalgos-CL.json') {
                    fileName = 'Superalgos-PL.json'
                }

                await SA.projects.communityPlugins.utilities.plugins.getPluginFileContent(
                    project,
                    folder,
                    fileName
                )
                    .then(response => {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(response, httpResponse)
                    }
                    )
                    .catch(err => {
                        let error = {
                            result: 'Fail Because',
                            message: err
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                        return
                    })

            } catch(err) {
                SA.logger.error('httpInterface -> LoadPlugin -> Method call produced an error.')
                SA.logger.error('httpInterface -> LoadPlugin -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> LoadPlugin -> Params Received = ' + body)

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