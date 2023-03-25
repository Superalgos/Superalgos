exports.newIconNamesRoute = function newIconNamesRoute() {
    const thisObject = {
        endpoint: 'IconNames',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.icons.retrieveIcons((icons) => SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(icons), httpResponse))
    }
}