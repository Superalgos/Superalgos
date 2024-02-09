exports.newDocsRoute = function newDocsRoute() {
    const thisObject = {
        endpoint: 'Docs',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        switch(requestPath[2]) { // switch by command
            case 'Save-Node-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Nodes'

                        if(checkAllSchmemaDocuments('Node', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Node-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Node-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Node-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }

            case 'Save-Concept-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Concepts'

                        if(checkAllSchmemaDocuments('Concept', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Concept-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Concept-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Concept-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }

            case 'Save-Topic-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Topics'

                        if(checkAllSchmemaDocuments('Topic', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Topic-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Topic-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Topic-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }

            case 'Save-Tutorial-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Tutorials'

                        if(checkAllSchmemaDocuments('Tutorial', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Tutorial-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Tutorial-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Tutorial-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }

            case 'Save-Review-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Reviews'

                        if(checkAllSchmemaDocuments('Review', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Review-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Review-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Review-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }

            case 'Save-Book-Schema': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {
                        if(body === undefined) {
                            return
                        }

                        let docsSchema = JSON.parse(body)
                        let project = requestPath[3]
                        let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/Docs-Books'

                        if(checkAllSchmemaDocuments('Book', docsSchema, filePath) === true) {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                        } else {
                            SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        }

                    } catch(err) {
                        SA.logger.error('httpInterface -> Docs -> Save-Book-Schema -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Docs -> Save-Book-Schema -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Docs -> Save-Book-Schema -> Params Received = ' + body)

                        let error = {
                            result: 'Fail Because',
                            message: err.message,
                            stack: err.stack
                        }
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(error), httpResponse)
                    }
                }

                break
            }
        }

        function checkAllSchmemaDocuments(category, docsSchema, filePath) {
            const fs = SA.nodeModules.fs
            let noErrorsDuringSaving = true

            for(let i = 0; i < docsSchema.length; i++) {
                let schemaDocument = docsSchema[i]
                /*
                For some type of schemas we will save the file at an extra
                folder derived from the document's type.
                */
                let fileName = schemaDocument.type.toLowerCase()
                for(let j = 0; j < 10; j++) {
                    fileName = cleanFileName(fileName)
                }
                let pageNumber = '00' + schemaDocument.pageNumber
                let newFilepath = filePath
                switch(category) {
                    case 'Topic': {
                        fileName = schemaDocument.topic.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                        fileName = cleanFileName(fileName)
                        newFilepath = createPrefixDirectories(filePath, schemaDocument.topic)
                        break
                    }
                    case 'Tutorial': {
                        fileName = schemaDocument.tutorial.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                        fileName = cleanFileName(fileName)
                        newFilepath = createPrefixDirectories(filePath, schemaDocument.tutorial)
                        break
                    }
                    case 'Review': {
                        fileName = schemaDocument.review.toLowerCase() + '-' + pageNumber.substring(pageNumber.length - 3, pageNumber.length) + '-' + schemaDocument.type.toLowerCase()
                        fileName = cleanFileName(fileName)
                        newFilepath = createPrefixDirectories(filePath, schemaDocument.review)
                        break
                    }
                    case 'Node': {
                        newFilepath = createPrefixDirectories(filePath, schemaDocument.type)
                        break
                    }
                    case 'Concept': {
                        newFilepath = createPrefixDirectories(filePath, schemaDocument.type)
                        break
                    }
                }

                function createPrefixDirectories(filePath, schemaTextToUse) {
                    let firstLetter = schemaTextToUse.substring(0, 1)
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath + '/' + firstLetter)
                    let extraWord = schemaTextToUse.split(' ')[0]
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath + '/' + firstLetter + '/' + extraWord)
                    return filePath + '/' + firstLetter + '/' + extraWord + '/' + cleanFileName(schemaTextToUse)
                }

                fileName = fileName + '.json'

                if(schemaDocument.deleted === true) {
                    try {
                        fs.unlinkSync(newFilepath + '/' + fileName)
                        SA.logger.info('[SUCCESS] ' + newFilepath + '/' + fileName + ' deleted.')
                    } catch(err) {
                        noErrorsDuringSaving = false
                        SA.logger.error('httpInterface -> Docs -> Delete -> ' + newFilepath + '/' + fileName + ' could not be deleted.')
                        SA.logger.error('httpInterface -> Docs -> Delete -> Resolve the issue that is preventing the Client to delete this file. Look at the error message below as a guide. At the UI you will need to delete this page again in order for the Client to retry next time you execute the docs.save command.')
                        SA.logger.error('httpInterface -> Docs -> Delete -> err.stack = ' + err.stack)
                    }
                } else {
                    if(schemaDocument.updated === true || schemaDocument.created === true) {
                        try {
                            let created = schemaDocument.created
                            let updated = schemaDocument.updated
                            schemaDocument.updated = undefined
                            schemaDocument.created = undefined
                            let fileContent = JSON.stringify(schemaDocument, undefined, 4)
                            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(newFilepath)
                            fs.writeFileSync(newFilepath + '/' + fileName, fileContent)
                            if(created === true) {
                                SA.logger.info('[SUCCESS] ' + newFilepath + '/' + fileName + '  created.')
                            } else {
                                if(updated === true) {
                                    SA.logger.info('[SUCCESS] ' + newFilepath + '/' + fileName + '  updated.')
                                }
                            }
                        } catch(err) {
                            noErrorsDuringSaving = false
                            SA.logger.error('httpInterface -> Docs -> Save -> ' + newFilepath + '/' + fileName + ' could not be created / updated.')
                            SA.logger.error('httpInterface -> Docs -> Save -> err.stack = ' + err.stack)
                        }
                    }
                }
            }

            return noErrorsDuringSaving
        }

        function cleanFileName(fileName) {
            for(let i = 0; i < 100; i++) {
                fileName = fileName
                    .replace(' ', '-')
                    .replace('--', '-')
                    .replace('?', '')
                    .replace('#', '')
                    .replace('$', '')
                    .replace('%', '')
                    .replace('^', '')
                    .replace('&', '')
                    .replace('*', '')
                    .replace('(', '')
                    .replace(')', '')
                    .replace('!', '')
                    .replace('..', '.')
                    .replace(',', '')
                    .replace('\'', '')
                    .replace(':', '')
                    .replace('|', '')
                    .replace('"', '')
                    .replace('<', '')
                    .replace('>', '')
                    .replace(';', '')
                    .replace('=', '')
            }
            return fileName
        }
    }
}