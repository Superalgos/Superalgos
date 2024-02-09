exports.newStorageRoute = function newStorageRoute() {
    const thisObject = {
        endpoint: 'Storage',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let pathToFile = httpRequest.url.substring(9)
        /* Unsaving # */
        for(let i = 0; i < 10; i++) {
            pathToFile = pathToFile.replace('_HASHTAG_', '#')
        }
        SA.projects.foundations.utilities.httpResponses.respondWithFile(global.env.PATH_TO_DATA_STORAGE + '/' + pathToFile, httpResponse)
    }
}