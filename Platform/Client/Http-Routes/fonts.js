exports.newFontsRoute = function newFontsRoute() {
    const thisObject = {
        endpoint: 'Fonts',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        SA.projects.foundations.utilities.httpResponses.respondWithFont(global.env.PATH_TO_FONTS + '/' + requestPath[2], httpResponse)
    }
}