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
            let fileName = unescape(requestPath.splice(2).join('/'))
            try {
                if(compressedBody === undefined) {
                    return
                }
                const body = SA.nodeModules.pako.inflate(compressedBody, { to: 'string' })
                let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'
                
                let workspace = PL.projects.foundations.utilities.credentials.storeExchangesCredentials(PL.projects.foundations.utilities.credentials.storeGithubCredentials(JSON.parse(body)))
                let fileContent = JSON.stringify(workspace, undefined, 4)
                let fs = SA.nodeModules.fs
                let dirParts = filePath.split('/');
                dirParts.pop()
                let dir = dirParts.join('/')

                /* Create Dir if it does not exist */
                if(!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, {recursive: true});
                }

                fs.writeFile(filePath, fileContent, onFileWritten)

                function onFileWritten(err) {
                    if(err) {
                        SA.logger.error('SaveWorkspace -> onFileWritten -> Error writing the Workspace file. fileName = ' + fileName)
                        SA.logger.error('SaveWorkspace -> onFileWritten -> err.stack = ' + err.stack)
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
                SA.logger.error('SaveWorkspace -> Error writing the Workspace file. fileName = ' + fileName)
                SA.logger.error('SaveWorkspace -> err.stack = ' + err.stack)
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