exports.newDirContentRoute = function newDirContentRoute() {
    const thisObject = {
        endpoint: 'DirContent',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        let folderPath = unescape(requestPath[2])
        if(requestPath[3] !== undefined) {
            folderPath = folderPath + '/' + requestPath[3]
        }

        if(requestPath[4] !== undefined) {
            folderPath = folderPath + '/' + requestPath[4]
        }

        if(requestPath[5] !== undefined) {
            folderPath = folderPath + '/' + requestPath[5]
        }
        let folder
        if(requestPath[2] === 'Root') {
            folder = folderPath.replace('Root', '../Superalgos/')
        } else {
            folder = global.env.PATH_TO_PROJECTS + '/' + folderPath
        }

        SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(folder, onFilesReady)

        function onFilesReady(files) {
            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(files), httpResponse)
        }
    }
}