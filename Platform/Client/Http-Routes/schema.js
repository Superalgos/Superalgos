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
                        let fileName = nameSplitted[1]
                        for(let i = 0; i < 10; i++) {
                            fileName = fileName.replace('\\', '/')
                        }
                        let fileToRead = filePath + folder + fileName

                        let fileContent = fs.readFileSync(fileToRead)
                        let schemaDocument
                        try {
                            schemaDocument = JSON.parse(fileContent)
                        } catch(err) {
                            PL.logger.warn('sendSchema -> Error Parsing JSON File: ' + fileToRead + ' .Error = ' + err.stack)
                            continue
                        }
                        schemaArray.push(schemaDocument)
                    }
                    let schema = JSON.stringify(schemaArray)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(schema, httpResponse)
                }
            } catch(err) {
                if(err.message.indexOf('no such file or directory') < 0) {
                    PL.logger.error('Could not send Schema:', filePath, schemaType)
                    PL.logger.error(err.stack)
                }
                SA.projects.foundations.utilities.httpResponses.respondWithContent("[]", httpResponse)
            }
        }
    }
}