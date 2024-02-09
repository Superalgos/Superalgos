exports.newProjectsRoute = function newProjectsRoute() {
    const thisObject = {
        endpoint: 'Projects',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let path = ''
        for(let i = 2; i < 10; i++) {
            if(requestPath[i] !== undefined) {
                let parameter = unescape(requestPath[i])
                path = path + '/' + parameter
            }

        }
        let filePath = global.env.PATH_TO_PROJECTS + path
        SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
    }
}