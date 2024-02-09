exports.newLegacyPlotterRoute = function newLegacyPlotterRoute() {
    const thisObject = {
        endpoint: 'LegacyPlotter.js',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/LegacyPlotter.js', httpResponse)
    }
}