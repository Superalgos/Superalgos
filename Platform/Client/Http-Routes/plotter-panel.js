exports.newPlotterPanelRoute = function newPlotterPanelRoute() {
    const thisObject = {
        endpoint: 'PlotterPanel.js',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_PLATFORM + '/WebServer/PlotterPanel.js', httpResponse)
    }
}