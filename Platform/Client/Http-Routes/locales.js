exports.newLocalesRoute = function newLocalesRoute() {
    const thisObject = {
        endpoint: 'locales',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        // This allows to have sub-folders in externalScripts
        let fullPath = ''
        for(let i = 2; i < requestPath.length; i++) {
            fullPath += requestPath[i]
            if(i !== requestPath.length - 1) {
                fullPath += '/'
            }
        }
        SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/locales/' + fullPath, httpResponse)
    }
}