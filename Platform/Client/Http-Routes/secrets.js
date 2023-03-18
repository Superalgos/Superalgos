exports.newSecretsRoute = function newSecretsRoute() {
    const thisObject = {
        endpoint: 'Secrets',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')

        switch (requestPath[2]) { // switch by command
            case 'Save-Singing-Accounts-Secrets-File': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                async function processRequest(body) {
                    try {

                        let filePath = global.env.PATH_TO_SECRETS + '/'
                        let fileName = "SigningAccountsSecrets.json"

                        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, body)

                        SA.logger.info('[SUCCESS] ' + filePath + '/' + fileName + '  created.')

                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)

                    } catch (err) {
                        SA.logger.error('httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> Method call produced an error.')
                        SA.logger.error('httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> err.stack = ' + err.stack)
                        SA.logger.error('httpInterface -> Secrets -> Save-Singing-Accounts-Secrets-File -> Params Received = ' + body)

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
    }
}