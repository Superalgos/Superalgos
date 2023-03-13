exports.newSocialBotsRoute = function newSocialBotsRoute() {
    const thisObject = {
        endpoint: 'Social-Bots',
        command: command
    }

    return thisObject

    function command(httpRequest, httpResponse) {
        let requestPathAndParameters = httpRequest.url.split('?') // Remove version information
        let requestPath = requestPathAndParameters[0].split('/')
        switch (requestPath[2]) {
            case 'Discord-Test-Message':
                SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                    .then(body => {
                        let config = JSON.parse(body)
                        let text = config.text
                        let socialBot = SA.projects.socialBots.botModules.discordBot.newSocialBotsBotModulesDiscordBot()
                        socialBot.initialize(config)
                            .then(response => {
                                SA.logger.info('httpInterface > Discord Bot >', response)
                                socialBot.sendMessage(text)
                                    .then(response => {
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                                    })
                                    .catch(err => {
                                        SA.logger.error(err)
                                        SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                                    })
                            })
                            .catch(err => {
                                SA.logger.error('error initializing discord bot', err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                    })
                break
            case 'Slack-Test-Message':
                SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                    .then(body => {
                        let config = JSON.parse(body)
                        let text = config.text
                        let socialBot = SA.projects.socialBots.botModules.slackBot.newSocialBotsBotModulesSlackBot()
                        socialBot.initialize(config)
                        socialBot.sendMessage(text)
                            .then(response => {
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                            })
                            .catch(err => {
                                SA.logger.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                    })
                break
            case 'Twitter-Test-Message':
                SA.projects.foundations.utilities.httpRequests.getRequestBodyAsync(httpRequest, httpResponse)
                    .then(body => {
                        config = JSON.parse(body)
                        let message = config.text
                        let socialBot = SA.projects.socialBots.botModules.twitterBot.newSocialBotsBotModulesTwitterBot(0)
                        socialBot.initialize(config)
                        socialBot.sendMessage(message)
                            .then(response => {
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(response), httpResponse)
                            })
                            .catch(err => {
                                SA.logger.error(err)
                                SA.projects.foundations.utilities.httpResponses.respondWithContent(JSON.stringify(global.DEFAULT_FAIL_RESPONSE), httpResponse)
                            })
                    })
                    .catch(err => {
                        SA.logger.error(err)
                    })
                break
        }
    }
}