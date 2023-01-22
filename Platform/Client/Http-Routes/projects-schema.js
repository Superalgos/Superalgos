exports.newProjectsSchemaRoute = function newProjectsSchemaRoute() {
    const thisObject = {
        endpoint: 'ProjectsSchema',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
        SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
    }
}