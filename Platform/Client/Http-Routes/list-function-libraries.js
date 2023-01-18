exports.newListFunctionLibrariesRoute = function newListFunctionLibrariesRoute() {
    const thisObject = {
        endpoint: 'ListFunctionLibraries',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Function-Libraries', 'UI')
    }
}