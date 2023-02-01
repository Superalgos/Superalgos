exports.newHttpInterface = function newHttpInterface() {

    /*
    IMPORTANT: If you are reviewing the code of the project please note 
    that this file is the single file in the whole system that accumulated
    more technical debt by far. I did not have the time yet to pay the 
    technical debt, and therefore there is a lot to reorganize in here. 
    I will remove this note once this job is done.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let routeMap

    return thisObject

    function finalize() {
        routeMap = undefined
    }

    function initialize(initialWorkspace) {
        /*
        We will create an HTTP Server and leave it running forever.
        */
        routeMap = require('./Http-Routes/index').newHttpRoutes()
        SA.nodeModules.http.createServer(onHttpRequest).listen(global.env.PLATFORM_HTTP_INTERFACE_PORT)
        /* Starting the browser now is optional */
        if (process.argv.includes("noBrowser")) {
            //Running Client only with no UI.
        } else {
            let queryString = ''
            if (initialWorkspace.name !== undefined) {
                queryString = '/?initialWorkspaceName=' + initialWorkspace.name + '&initialWorkspaceProject=' + initialWorkspace.project + '&initialWorkspaceType=' + initialWorkspace.type
            }
            SA.nodeModules.open('http://localhost:' + global.env.PLATFORM_HTTP_INTERFACE_PORT + queryString)
        }
    }

    function onHttpRequest(httpRequest, httpResponse) {
        try {
            let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
            let requestPath = requestPathAndParameters[0].split('/')
            let endpointOrFile = requestPath[1]

            if(routeMap.has(endpointOrFile)) {
                const routeFunc = routeMap.get(endpointOrFile)
                routeFunc(httpRequest, httpResponse)
            } else {
                const routeFunc = routeMap.get('default')
                routeFunc(httpRequest, httpResponse)
            }
        } catch (err) {
            if (err.stack !== undefined) {
                SA.logger.error(err.stack)
            }
            if (err.message !== undefined) {
                SA.logger.error('onHttpRequest -> err.message = ' + err.message)
            }
        }
    }
}
