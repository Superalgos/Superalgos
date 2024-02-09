exports.newListSystemActionFunctionsRoute = function newListSystemActionFunctionsRoute() {
    const thisObject = {
        endpoint: 'ListSystemActionFunctions',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'System-Action-Functions', 'UI')
    }
}