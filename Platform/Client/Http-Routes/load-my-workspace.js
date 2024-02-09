exports.newLoadMyWorkspaceRoute = function newLoadMyWorkspaceRoute() {
    const thisObject = {
        endpoint: 'LoadMyWorkspace',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let fileName = unescape(requestPath.splice(2).join('/'))
        let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'

        respondWithFile(filePath, httpResponse)
    }
    
    function respondWithFile(fileName, httpResponse) {
        if (fileName.indexOf('undefined') > 0) {
            SA.logger.warn('respondWithFile -> Received httpRequest for undefined file. ')
            SA.projects.foundations.utilities.httpResponses.respondWithContent(undefined, httpResponse)
        } else {
            try {
                SA.nodeModules.fs.readFile(fileName, onFileRead)
                
                function onFileRead(err, file) {
                    if (!err) {
                        let workspace = PL.projects.foundations.utilities.credentials.loadExchangesCredentials(PL.projects.foundations.utilities.credentials.loadGithubCredentials(JSON.parse(file.toString())))
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(workspace), httpResponse)
                    } else {
                        //SA.logger.info('File requested not found: ' + fileName)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(undefined, httpResponse)
                    }
                }
            } catch (err) {
                SA.projects.foundations.utilities.httpResponses.respondWithEmptyArray(httpResponse)
            }
        }
    }
}