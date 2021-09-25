exports.newDesktopModulesHttpInterface = function newDesktopModulesHttpInterface() {

    /*
    This module represent the HTTP API of the 
    Desktop App. All HTTP request are processed
    by this module.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
    }

    function initialize() {
        /*
        We will create an HTTP Server and leave it running forever.
        */
        SA.nodeModules.http.createServer(onHttpRequest).listen(global.env.DESKTOP_HTTP_INTERFACE_PORT)
        /* Starting the browser now is optional */
        if (process.argv.includes("noBrowser")) {
            //Running Client only with no UI.
        } else {
            SA.nodeModules.open('http://localhost:' + global.env.DESKTOP_HTTP_INTERFACE_PORT)
        }
    }

    function onHttpRequest(httpRequest, httpResponse) {
        try {
            let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
            let requestPath = requestPathAndParameters[0].split('/')
            let endpointOrFile = requestPath[1]

            switch (endpointOrFile) {
                case 'Environment':
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.env), httpResponse)
                    }
                    break
                case 'ProjectsSchema':
                    {
                        let path = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
                        SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
                    }
                    break
                case 'Projects':
                    {
                        let path = ''
                        for (let i = 2; i < 10; i++) {
                            if (requestPath[i] !== undefined) {
                                let parameter = unescape(requestPath[i])
                                path = path + '/' + parameter
                            }

                        }
                        let filePath = global.env.PATH_TO_PROJECTS + path
                        SA.projects.foundations.utilities.httpResponses.respondWithFile(filePath, httpResponse)
                    }
                    break
                case 'Images': // This means the Images folder.
                    {
                        let path = global.env.PATH_TO_DESKTOP + '/WebServer/Images/' + requestPath[2]

                        if (requestPath[3] !== undefined) {
                            path = path + '/' + requestPath[3]
                        }

                        if (requestPath[4] !== undefined) {
                            path = path + '/' + requestPath[4]
                        }

                        if (requestPath[5] !== undefined) {
                            path = path + '/' + requestPath[5]
                        }

                        path = unescape(path)

                        SA.projects.foundations.utilities.httpResponses.respondWithImage(path, httpResponse)
                    }
                    break
                default:
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithWebFile(httpResponse, endpointOrFile, global.env.PATH_TO_DESKTOP)
                    }
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}
