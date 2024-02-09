exports.newEnvironmentRoute = function newEnvironmentRoute() {
    const thisObject = {
        endpoint: 'Environment',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.env), httpResponse)
    }
}