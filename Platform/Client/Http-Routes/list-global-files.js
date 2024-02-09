exports.newListGlobalFilesRoute = function newListGlobalFilesRoute() {
    const thisObject = {
        endpoint: 'ListGlobalFiles',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Globals', 'UI')
    }
}