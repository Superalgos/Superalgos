exports.newFoundationsUtilitiesHttpRequests = function () {

    let thisObject = {
        getRequestBody: getRequestBody
    }

    return thisObject

    function getRequestBody(httpRequest, httpResponse, callback) { // Gets the de body from a POST httpRequest to the web server
        try {

            let body = ''

            httpRequest.on('data', function (data) {
                body += data
                // Too much POST data
                //if (body.length > 1e6) {
                //    httpRequest.connection.destroy()
                //}
            })

            httpRequest.on('end', function () {
                callback(body)
            })

            httpRequest.on('error', function (err) {
                console.log('[ERROR] getBody -> err.stack = ' + err.stack)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                callback()
            })
        } catch (err) {
            console.log('[ERROR] getBody -> err.stack = ' + err.stack)
            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
            callback()
        }
    }
}