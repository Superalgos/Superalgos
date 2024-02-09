exports.newPNGsRoute = function newPNGsRoute() {
    const thisObject = {
        endpoint: 'PNGs',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let path = global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/PNGs'

        if(requestPath[3] !== undefined) {
            path = path + '/' + requestPath[3]
        }

        if(requestPath[4] !== undefined) {
            path = path + '/' + requestPath[4]
        }

        if(requestPath[5] !== undefined) {
            path = path + '/' + requestPath[5]
        }

        path = unescape(path)
        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
    }
}