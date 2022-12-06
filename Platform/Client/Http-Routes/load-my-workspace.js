exports.newLoadMyWorkspaceRoute = function newLoadMyWorkspaceRoute() {
    const thisObject = {
        endpoint: 'LoadMyWorkspace',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let fileName = unescape(requestPath[2])
        let filePath = global.env.PATH_TO_MY_WORKSPACES + '/' + fileName + '.json'
        SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
    }
}