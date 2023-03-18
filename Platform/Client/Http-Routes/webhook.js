exports.newWebhookRoute = function newWebhookRoute() {
    const thisObject = {
        endpoint: 'Webhook',
        command: command
    }

    let webhook = new Map()

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        switch (requestPath[2]) { // switch by command
            case 'Fetch-Messages': {
                let exchange = requestPath[3]
                let market = requestPath[4]

                /* Some validations */
                if (exchange === undefined) {
                    SA.logger.warn('httpInterface -> Webhook -> Fetch-Messages -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    return
                }
                if (market === undefined) {
                    SA.logger.warn('httpInterface -> Webhook -> Fetch-Messages -> Message with no market received -> messageReceived = ' + messageReceived)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                    return
                }

                let key = exchange + '-' + market

                let webhookMessages = webhook.get(key)
                if (webhookMessages === undefined) {
                    webhookMessages = []
                }

                SA.logger.info('httpInterface -> Webhook -> Fetch-Messages -> Exchange-Market = ' + exchange + '-' + market)
                SA.logger.info('httpInterface -> Webhook -> Fetch-Messages -> Messages Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)

                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(webhookMessages), httpResponse)
                webhookMessages = []

                webhook.set(key, webhookMessages)
                break
            }
            case 'New-Message': {
                SA.projects.foundations.utilities.httpRequests.getRequestBody(httpRequest, httpResponse, processRequest)

                function processRequest(messageReceived) {
                    if (messageReceived === undefined) {
                        return
                    }

                    let timestamp = (new Date()).valueOf()
                    let source = requestPath[3]
                    let exchange = requestPath[4]
                    let market = requestPath[5]

                    /* Some validations */
                    if (source === undefined) {
                        SA.logger.warn('httpInterface -> Webhook -> New-Message -> Message with no Source received -> messageReceived = ' + messageReceived)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        return
                    }
                    if (exchange === undefined) {
                        SA.logger.warn('httpInterface -> Webhook -> New-Message -> Message with no Exchange received -> messageReceived = ' + messageReceived)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        return
                    }
                    if (market === undefined) {
                        SA.logger.warn('httpInterface -> Webhook -> New-Message -> Message with no market received -> messageReceived = ' + messageReceived)
                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                        return
                    }

                    let key = exchange + '-' + market

                    let webhookMessages = webhook.get(key)
                    if (webhookMessages === undefined) {
                        webhookMessages = []
                    }

                    webhookMessages.push([timestamp, source, messageReceived])
                    webhook.set(key, webhookMessages)

                    SA.logger.info('httpInterface -> Webhook -> New-Message -> Exchange-Market = ' + exchange + '-' + market)
                    SA.logger.info('httpInterface -> Webhook -> New-Message -> messageReceived = ' + messageReceived)
                    SA.logger.info('httpInterface -> Webhook -> New-Message -> Messages waiting to be Fetched by Webhooks Sensor Bot = ' + webhookMessages.length)
                    SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_OK_RESPONSE), httpResponse)
                }

                break
            }
        }
    }
}