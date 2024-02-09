exports.newDefaultRoute = function newDefaultRoute() {
    const thisObject = {
        endpoint: 'default',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let endpointOrFile = requestPath[1]
        SA.projects.foundations.utilities.httpResponses.respondWithWebFile(httpResponse, endpointOrFile, global.env.PATH_TO_PLATFORM)
    }
}