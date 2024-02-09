exports.newExternalScriptsRoute = function newExternalScriptsRoute() {
    const thisObject = {
        endpoint: 'externalScripts',
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

        /**
         *  Sometimes libs will call fonts/images etc. by themselves thus we should have a filter for file type to respond with the correct content and headers, but from the externalScripts folder
         *  This code should be improved when needed with specific file types
         */

        let requestedFileExtension = requestPath[requestPath.length - 1].split('.').pop()
        switch(requestedFileExtension) {
            case 'otf':
            case 'ttf':
            case 'eot':
            case 'woff':
            case 'woff2':
                SA.projects.foundations.utilities.httpResponses.respondWithFont(global.env.PATH_TO_PLATFORM + '/WebServer/externalScripts/' + fullPath, httpResponse)
                break
            default:
                SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/externalScripts/' + fullPath, httpResponse)
        }
    }
}