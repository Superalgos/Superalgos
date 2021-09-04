exports.newFoundationsUtilitiesHttpResponses = function () {

    let thisObject = {
        respondWithFile: respondWithFile,
        respondWithContent: respondWithContent,
        respondWithImage: respondWithImage,
        respondWithFont: respondWithFont,
        respondWithEmptyArray: respondWithEmptyArray
    }

    return thisObject

    function respondWithFile(fileName, httpResponse) {
        let fs = SA.nodeModules.fs
        if (fileName.indexOf('undefined') > 0) {
            console.log('[WRN] respondWithFile -> Received httpRequest for undefined file. ')
            respondWithContent(undefined, httpResponse)
        } else {
            try {
                fs.readFile(fileName, onFileRead)

                function onFileRead(err, file) {
                    if (!err) {
                        respondWithContent(file.toString(), httpResponse)
                    } else {
                        //console.log('File requested not found: ' + fileName)
                        respondWithContent(undefined, httpResponse)
                    }
                }
            } catch (err) {
                respondWithEmptyArray()
            }
        }
    }

    function respondWithContent(content, httpResponse, contentType) {
        try {
            httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            httpResponse.setHeader('Expires', '0') // Proxies.
            httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

            if (content !== undefined) {
                if (contentType !== undefined) {
                    httpResponse.writeHead(200, { 'Content-Type': contentType })
                } else {
                    httpResponse.writeHead(200, { 'Content-Type': 'text/html' })
                }
                httpResponse.write(content)
            } else {
                httpResponse.writeHead(404, { 'Content-Type': 'text/html' })
                httpResponse.write('The specified key does not exist.')
            }
            httpResponse.end('\n')
        } catch (err) {
            respondWithEmptyArray(httpResponse)
        }
    }

    function respondWithImage(fileName, httpResponse) {
        let fs = SA.nodeModules.fs
        fs.readFile(fileName, onFileRead)

        function onFileRead(err, file) {
            if (err) {
                console.log('[ERROR] respondWithImage -> Image Not Found: ' + fileName + ' or Error = ' + err.stack)
                return
            }

            httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            httpResponse.setHeader('Expires', '0') // Proxies.
            httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

            httpResponse.writeHead(200, { 'Content-Type': 'image/png' })
            httpResponse.end(file, 'binary')
        }
    }

    function respondWithFont(fileName, httpResponse) {
        let fs = SA.nodeModules.fs
        fs.readFile(fileName, onFileRead)

        function onFileRead(err, file) {
            if (err) {
                console.log('[ERROR] respondWithFont -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
                return
            }
            httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
            httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
            httpResponse.setHeader('Expires', '0') // Proxies.
            httpResponse.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

            if (fileName.indexOf('2') < 0) {
                httpResponse.writeHead(200, { 'Content-Type': 'font/woff' })
            } else {
                httpResponse.writeHead(200, { 'Content-Type': 'font/woff2' })
            }
            httpResponse.end(file, 'binary')
        }
    }

    function respondWithEmptyArray(httpResponse) {
        httpResponse.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
        httpResponse.setHeader('Pragma', 'no-cache') // HTTP 1.0.
        httpResponse.setHeader('Expires', '0') // Proxies.

        httpResponse.writeHead(200, { 'Content-Type': 'text/html' })
        httpResponse.write('[]')
        httpResponse.end('\n')
    }
}