exports.newFoundationsUtilitiesHttpResponses = function () {

    let thisObject = {
        respondWithFile: respondWithFile,
        respondWithContent: respondWithContent,
        respondWithImage: respondWithImage,
        respondWithFont: respondWithFont,
        respondWithEmptyArray: respondWithEmptyArray,
        respondWithStyleSheet: respondWithStyleSheet,
        respondWithProjectFolderFileList: respondWithProjectFolderFileList,
        respondWithWebFile: respondWithWebFile
    }

    return thisObject

    function respondWithFile(fileName, httpResponse) {
        let fs = SA.nodeModules.fs
        if (fileName.indexOf('undefined') > 0) {
            SA.logger.warn('respondWithFile -> Received httpRequest for undefined file. ')
            respondWithContent(undefined, httpResponse)
        } else {
            try {
                fs.readFile(fileName, onFileRead)

                function onFileRead(err, file) {
                    if (!err) {
                        respondWithContent(file.toString(), httpResponse)
                    } else {
                        //SA.logger.info('File requested not found: ' + fileName)
                        respondWithContent(undefined, httpResponse)
                    }
                }
            } catch (err) {
                respondWithEmptyArray(httpResponse)
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
                SA.logger.error('respondWithImage -> Image Not Found: ' + fileName + ' or Error = ' + err.stack)
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
                SA.logger.error('respondWithFont -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
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

    function respondWithStyleSheet(httpResponse, pathToApp, fileName) {
        let fs = SA.nodeModules.fs
        let filePath = pathToApp + '/WebServer/css/' + fileName
        fs.readFile(filePath, onFileRead)

        function onFileRead(err, file) {
            try {
                let fileContent = file.toString()

                SA.projects.foundations.utilities.httpResponses.respondWithContent(fileContent, httpResponse, 'text/css')
            } catch (err) {
                SA.logger.error('respondWithStyleSheet -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
            }
        }
    }

    function respondWithProjectFolderFileList(httpResponse, projectFolderName, rootObjectName) {
        {
            let allLibraries = []
            let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
            let projectsCount = 0

            for (let i = 0; i < projects.length; i++) {
                let project = projects[i]

                let dirPath = global.env.PATH_TO_PROJECTS + '/' + project + '/' + rootObjectName + '/' + projectFolderName
                try {
                    let fs = SA.nodeModules.fs
                    fs.readdir(dirPath, onDirRead)

                    function onDirRead(err, fileList) {
                        let updatedFileList = []
                        if (err) {
                            /*
                            If we have a problem reading this folder we will assume that it is
                            because this project does not need this folder and that's it.
                            */
                        } else {
                            for (let i = 0; i < fileList.length; i++) {
                                let name = fileList[i]
                                updatedFileList.push([project, name])
                            }
                        }
                        allLibraries = allLibraries.concat(updatedFileList)
                        projectsCount++
                        if (projectsCount === projects.length) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(allLibraries), httpResponse)
                        }
                    }
                } catch (err) {
                    SA.logger.error('returnProjectFolderFileList -> Error reading a directory content. filePath = ' + dirPath)
                    SA.logger.error('returnProjectFolderFileList -> err.stack = ' + err.stack)

                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    return
                }
            }
        }
    }

    function respondWithWebFile(httpResponse, fileNameReceived, pathToApp) {

        if (fileNameReceived === '') {
            /*
            When there is no endpoint specified we will respond with this app's Home Page.
            */
            let fs = SA.nodeModules.fs

            let fileName = pathToApp + '/WebServer/index.html'
           
            fs.readFile(fileName, onFileRead)

            function onFileRead(err, file) {

                let fileContent = file.toString()

                SA.projects.foundations.utilities.httpResponses.respondWithContent(fileContent, httpResponse)
            }
        } else {
            /*
            When there is a parameter but it does not match any of the available endpoints, we 
            will serve the file with the same name at at a location that depends on it's file extension.
            */
            let completeFileName = fileNameReceived
            let fileExtension = completeFileName.split('.')[1]

            switch (fileExtension) {
                case 'js': {
                    let path = pathToApp + '/UI/' + completeFileName
                    SA.projects.foundations.utilities.httpResponses.respondWithFile(path, httpResponse)
                    break
                }
                case 'css': {
                    SA.projects.foundations.utilities.httpResponses.respondWithStyleSheet(httpResponse, pathToApp, completeFileName)
                    break
                }
            }
        }
    }
}