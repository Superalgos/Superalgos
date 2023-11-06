exports.newProjectsMenuRoute = function newProjectsMenuRoute() {
    const thisObject = {
        endpoint: 'ProjectsMenu',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsMenu.json'
        SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
    }
}