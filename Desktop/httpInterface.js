exports.newHttpInterface = function newHttpInterface() {

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
       SA.nodeModules.http.createServer(onHttpRequest).listen(global.env.CLIENT_HTTP_INTERFACE_PORT)
       /* Starting the browser now is optional */
       if (process.argv.includes("noBrowser")) {
           //Running Client only with no UI.
       } else {
           SA.nodeModules.open('http://localhost:' + global.env.CLIENT_HTTP_INTERFACE_PORT)
       }
    }

    function onHttpRequest(httpRequest, httpResponse) {
        try {
            let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
            let requestPath = requestPathAndParameters[0].split('/')
            let endpointOrFile = requestPath[1]

            switch (endpointOrFile) {
                case 'XXX':
                    {

                    }
                    break
                default:
                    {
                        SA.projects.foundations.utilities.httpResponses.respondWithWebFile(httpResponse, endpointOrFile,  global.env.PATH_TO_CLIENT)
                    }
            }
        } catch (err) {
            console.log(err.stack)
        }
    }
}
