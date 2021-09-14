exports.newSocialTradingModulesWebAppInterface = function newSocialTradingModulesWebAppInterface() {
    /*
    This module handles the incomming messages from the Web App.
    At it's current iteration, it will jusr forward those messages
    to the Network Node it is connected to.
    */
    let thisObject = {
        messageReceived: messageReceived,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    async function messageReceived(message) {
        let messageHeader
        try {
            messageHeader = JSON.parse(message)
        } catch (err) {
            let response = {
                result: 'Error',
                message: 'messageHeader Not Coorrect JSON Format.'
            }
            return JSON.stringify(response)
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                let queryMessage
                try {
                    queryMessage = JSON.parse(messageHeader.queryMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'queryMessage Not Coorrect JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                queryMessage.emitterUserProfileId = DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID
                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Query Processed.',
                    data: await DK.running.webSocketsClient.sendMessage(JSON.stringify(messageHeader))
                }
                return response
            }
            case 'Event': {
                let eventMessage
                try {
                    eventMessage = JSON.parse(messageHeader.eventMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'eventMessage Not Coorrect JSON Format.'
                    }
                    return JSON.stringify(response)
                }

                if (
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.REPLY_TO_USER_POST ||
                    eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.REPOST_USER_POST
                ) {
                    /*
                    We need to save the post at the User's storage and remove the text from the message 
                    going to the Network Node.
                    */
                    let commitMessage
                    switch (eventMessage.eventType) {
                        case SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST: {
                            commitMessage = "New Post"
                            break
                        }
                        case SA.projects.socialTrading.globals.eventTypes.REPLY_TO_USER_POST: {
                            commitMessage = "Reply to User Post"
                            break
                        }
                        case SA.projects.socialTrading.globals.eventTypes.REPOST_USER_POST: {
                            commitMessage = "Repost User Post"
                            break
                        }
                    }
                    /*
                    The post text is eliminated, since it is now at the user's storage,
                    and a hash of the content was generated, and that is what is going to
                    the Network Node.
                    */
                    eventMessage.emitterPostHash = await savePostAtStorage(eventMessage.text, commitMessage, eventMessage.timestamp)
                    eventMessage.text = undefined
                }

                eventMessage.emitterUserProfileId = DK.TEST_NETWORK_CLIENT_USER_PROFILE_ID
                messageHeader.eventMessage = JSON.stringify(eventMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Event Processed.',
                    data: await DK.running.webSocketsClient.sendMessage(JSON.stringify(messageHeader))
                }
                return response
            }
            default: {
                let response = {
                    result: 'Error',
                    message: 'requestType Not Supported.'
                }
                return JSON.stringify(response)
            }
        }
    }

    async function savePostAtStorage(text, commitMessage, timestamp) {
        const { createHash } = await import('crypto')
        const hash = createHash('sha256')
        let post = {
            timestamp: timestamp,
            text: text
        }

        const fileContent = JSON.stringify(post, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json"

        let filePath = './My-Social-Trading-Data/User-Posts/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDate(timestamp) 

        SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)

        const options = {
            baseDir: process.cwd() + '/My-Social-Trading-Data',
            binary: 'git',
            maxConcurrentProcesses: 6,
        }
        const git = SA.nodeModules.simpleGit(options)

        await git.add('./*')
        await git.commit(commitMessage)
        await git.push('origin')

        return fileHash
    }
}