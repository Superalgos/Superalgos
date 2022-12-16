exports.newSaveWorkspaceRoute = function newSaveWorkspaceRoute() {
    const thisObject = {
        endpoint: 'SaveWorkspace',
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
                let fileName = unescape(requestPath[2])
                let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'
                
                let workspace = JSON.parse(body)
                let fileContent = JSON.stringify(workspace, undefined, 4)
                let fs = SA.nodeModules.fs
                let dir = global.env.PATH_TO_MY_WORKSPACES;

                /* Create Dir if it does not exist */
                if(!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {recursive: true});
                }

                fs.writeFile(filePath, fileContent, onFileWritten)

                function onFileWritten(err) {
                    if(err) {
                        PL.logger.error('SaveWorkspace -> onFileWritten -> Error writing the Workspace file. fileName = ' + fileName)
                        PL.logger.error('SaveWorkspace -> onFileWritten -> err.stack = ' + err.stack)
                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    } else {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                    }
                }

            } catch(err) {
                PL.logger.error('SaveWorkspace -> Error writing the Workspace file. fileName = ' + fileName)
                PL.logger.error('SaveWorkspace -> err.stack = ' + err.stack)
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