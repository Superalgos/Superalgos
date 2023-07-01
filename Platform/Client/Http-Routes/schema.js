exports.newSchemaRoute = function newSchemaRoute() {
    const thisObject = {
        endpoint: 'Schema',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        sendSchema(global.env.PATH_TO_PROJECTS + '/' + requestPath[2] + '/Schemas/', requestPath[3])

        function sendSchema(filePath, schemaType) {
            let fs = SA.nodeModules.fs
            try {
                let folder = ''
                switch(schemaType) {
                    case 'AppSchema': {
                        folder = 'App-Schema'
                        break
                    }
                    case 'DocsNodeSchema': {
                        folder = 'Docs-Nodes'
                        break
                    }
                    case 'DocsConceptSchema': {
                        folder = 'Docs-Concepts'
                        break
                    }
                    case 'DocsTopicSchema': {
                        folder = 'Docs-Topics'
                        break
                    }
                    case 'DocsTutorialSchema': {
                        folder = 'Docs-Tutorials'
                        break
                    }
                    case 'DocsReviewSchema': {
                        folder = 'Docs-Reviews'
                        break
                    }
                    case 'DocsBookSchema': {
                        folder = 'Docs-Books'
                        break
                    }
                }
                SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

                function onFilesReady(files) {

                    let schemaArray = []
                    for(let k = 0; k < files.length; k++) {
                        let name = files[k]
                        let nameSplitted = name.split(folder)
                        let fileName = nameSplitted[1].replaceAll(SA.nodeModules.path.sep, '/') // runs a regex replace against all versions of the file separator
                        let fileToRead = filePath + folder + fileName
                        if(fileToRead.indexOf('.DS_Store') > -1) {
                            continue
                        }
                        let fileContent = fs.readFileSync(fileToRead)
                        try {
                            let schemaDocument = JSON.parse(fileContent)
                            schemaArray.push(schemaDocument)
                        } catch(err) {
                            SA.logger.warn('sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                        }
                    }
                    let schema = JSON.stringify(schemaArray)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(schema, httpResponse)
                }
            } catch(err) {
                if(err.message.indexOf('no such file or directory') < 0) {
                    SA.logger.error('Could not send Schema:', filePath, schemaType)
                    SA.logger.error(err.stack)
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent("[]", httpResponse)
            }
        }
    }
}