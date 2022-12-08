exports.newSavePluginRoute = function newSavePluginRoute() {
    const thisObject = {
        endpoint: 'SavePlugin',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

        async function processRequest(body) {
            try {
                if(body === undefined) {
                    return
                }

                let plugin = JSON.parse(body)
                let project = requestPath[2]
                let folder = requestPath[3]
                let fileName = requestPath[4]
                let pluginName = global.env.PROJECT_PLUGIN_MAP[project].dir || project
                let filePath = global.env.PATH_TO_PLUGINS + '/' + pluginName + '/' + folder
                let fileContent = JSON.stringify(plugin, undefined, 4)
                const fs = SA.nodeModules.fs
                fs.writeFileSync(filePath + '/' + fileName + '.json', fileContent)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
            } catch(err) {
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> SavePlugin -> Method call produced an error.')
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> SavePlugin -> err.stack = ' + err.stack)
                console.log((new Date()).toISOString(), '[ERROR] httpInterface -> SavePlugin -> Params Received = ' + body)

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