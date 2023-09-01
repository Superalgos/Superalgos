exports.newListUtilitiesFilesRoute = function newListUtilitiesFilesRoute() {
    const thisObject = {
        endpoint: 'ListUtilitiesFiles',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Utilities', 'UI')
    }
}