exports.newSavePluginRoute = function newSavePluginRoute() {
    const thisObject = {
        endpoint: 'SavePlugin',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        SA.projects.foundations.utilities.httpRequests.getRequestCompressedBody(httpRequest, httpResponse, processRequest)

        async function processRequest(compressedBody) {
            try {
                if(compressedBody === undefined) {
                    return
                }
                const body = SA.nodeModules.pako.inflate(compressedBody, { to: 'string' })
                let plugin = JSON.parse(body)
                let project = requestPath[2]
                let folder = requestPath[3]
                let fileName = decodeURI(requestPath[4])
                let pluginName = global.env.PROJECT_PLUGIN_MAP[project].dir || project
                let filePath = global.env.PATH_TO_PLUGINS + '/' + pluginName + '/' + folder
                let fileContent = JSON.stringify(plugin, undefined, 4)
                const fs = SA.nodeModules.fs
                fs.writeFileSync(filePath + '/' + fileName + '.json', fileContent)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
            } catch(err) {
                SA.logger.error('httpInterface -> SavePlugin -> Method call produced an error.')
                SA.logger.error('httpInterface -> SavePlugin -> err.stack = ' + err.stack)
                SA.logger.error('httpInterface -> SavePlugin -> gzip length = ' + compressedBody.length)

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