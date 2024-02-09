exports.newPlottersRoute = function newPlottersRoute() {
    const thisObject = {
        endpoint: 'Plotters',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let project = requestPath[2]
        let dataMine = requestPath[3]
        let codeName = requestPath[4]
        let moduleName = requestPath[5]
        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/' + 'Bots-Plotters-Code' + '/' + dataMine + '/plotters/' + codeName + '/' + moduleName
        SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
    }
}