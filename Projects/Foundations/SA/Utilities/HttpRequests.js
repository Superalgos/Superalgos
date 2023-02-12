exports.newFoundationsUtilitiesHttpRequests = function () {

    let thisObject = {
        getRequestBody: getRequestBody,
        getRequestBodyAsync: getRequestBodyAsync,
        getRequestCompressedBody: getRequestCompressedBody
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
                SA.logger.error('getBody -> err.stack = ' + err.stack)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                callback()
            })
        } catch (err) {
            SA.logger.error('getBody -> err.stack = ' + err.stack)
            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
            callback()
        }
    }

    function getRequestBodyAsync(httpRequest, httpResponse) {
        return new Promise((resolve, reject) => {
            let body = []
            httpRequest.on('error', (err) => {
                SA.logger.error('getRequestBodyAync -> err.stack = ', err.stack)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                reject(err)
            }).on('data', (chunk) => {
                body.push(chunk)
            }).on('end', () => {
                body = Buffer.concat(body).toString()
                resolve(body)
            })
        })
    }

    function getRequestCompressedBody(httpRequest, httpResponse, callback) { 
        try {
            let body;
            httpRequest.on('data', function(data) {
                if(body === undefined) {
                    body = data
                }
                else {
                    var mergedArray = new Uint8Array(body.length + data.length);
                    mergedArray.set(body);
                    mergedArray.set(data, body.length);
                    body = mergedArray
                }
            })
    
            httpRequest.on('end', function() {
                callback(body)
            })
    
            httpRequest.on('error', function(err) {
                SA.logger.error('getBody -> err.stack = ' + err.stack)
                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(DEFAULT_FAIL_RESPONSE), httpResponse)
                callback()
            })
        } catch(err) {
            SA.logger.error('getBody -> err.stack = ' + err.stack)
            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(DEFAULT_FAIL_RESPONSE), httpResponse)
            callback()
        }
    }
}
