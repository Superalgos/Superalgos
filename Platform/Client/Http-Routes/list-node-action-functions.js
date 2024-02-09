exports.newListNodeActionFunctionsRoute = function newListNodeActionFunctionsRoute() {
    const thisObject = {
        endpoint: 'ListNodeActionFunctions',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        SA.projects.foundations.utilities.httpResponses.respondWithProjectFolderFileList(httpResponse, 'Node-Action-Functions', 'UI')
    }
}