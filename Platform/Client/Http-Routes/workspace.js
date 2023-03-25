exports.newWorkspaceRoute = function newWorkspaceRoute() {
    const thisObject = {
        endpoint: 'Workspace.js',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let fs = SA.nodeModules.fs

        try {
            let filePath = global.env.PATH_TO_DEFAULT_WORKSPACE + '/Getting-Started-Tutorials.json'
            fs.readFile(filePath, onFileRead)
        } catch(e) {
            SA.logger.error('Error reading the Workspace.', e)
        }

        function onFileRead(err, workspace) {
            if(err) {
                SA.projects.foundations.utilities.httpResponses.respondWithContent(undefined, httpResponse)
            } else {
                let responseContent = 'function getWorkspace(){ return ' + workspace + '}'
                SA.projects.foundations.utilities.httpResponses.respondWithContent(responseContent, httpResponse)
            }
        }
    }
}