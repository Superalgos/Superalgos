const createError = require('http-errors');

exports.newSocialTradingModulesWebAppInterface = function newSocialTradingModulesWebAppInterface() {
    /*
    This module handles the incoming messages from the Web App.
    At it's current version, it will just forward those messages
    to the Network Node it is connected to.

    Later, it will try to use the personal social graph as a cache,
    so as to minimize the requests to Network Nodes.
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
                message: 'messageHeader Not Correct JSON Format.'
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
                        message: 'queryMessage Not Correct JSON Format.'
                    }
                    return JSON.stringify(response)
                }
                queryMessage.emitterUserProfileId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId
                messageHeader.queryMessage = JSON.stringify(queryMessage)

                let response

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Message Received', JSON.stringify(queryMessage))

                if(queryMessage.queryType === SA.projects.socialTrading.globals.queryTypes.USER_PROFILE_DATA){

                    if(!queryMessage.userProfileId & !queryMessage.username){
                        queryMessage.userProfileId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId;
                        queryMessage.username =SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileHandle;
                    }

                    response = await getUserProfileData(queryMessage.username,queryMessage.userProfileId)
                }  else if (queryMessage.queryType !== SA.projects.socialTrading.globals.queryTypes.EVENTS) {
                    response = {
                        result: 'Ok',
                        message: 'Web App Interface Query Processed.',
                        data: await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
                    }
                }
                else{
                    let events = await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
                    for (let i = 0; i < events.length; i++) {
                        let event = events[i]
                        if (event.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST) {
                            event.postText = await getPostText(event.emitterUserProfile.userProfileHandle, event.emitterPost.emitterPostHash, event.timestamp)
                        }
                    }

                    response = {
                        result: 'Ok',
                        message: 'Web App Interface Query Processed.',
                        data: events
                    }
                }

                // console.log((new Date()).toISOString(), '- Web App Interface', '- Query Response Sent', JSON.stringify(response))

                return response
            }
            case 'Event': {
                let eventMessage
                try {
                    eventMessage = JSON.parse(messageHeader.eventMessage)
                } catch (err) {
                    let response = {
                        result: 'Error',
                        message: 'eventMessage Not Correct JSON Format.'
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
                    eventMessage.emitterPostHash = await savePostAtStorage(eventMessage.postText, commitMessage, eventMessage.timestamp)
                    eventMessage.postText = undefined
                }
                 else if(eventMessage.eventType === SA.projects.socialTrading.globals.eventTypes.NEW_USER_PROFILE)
                 {
                    let commitMessage = "Edit User Profile";
                    eventMessage.emitterPostHash = await saveUserAtStorage(SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId, eventMessage.body, commitMessage)
            }

                eventMessage.emitterUserProfileId = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_APP_SIGNING_ACCOUNT).userProfileId
                messageHeader.eventMessage = JSON.stringify(eventMessage)

                let response = {
                    result: 'Ok',
                    message: 'Web App Interface Event Processed.',
                    data: await DK.desktopApp.p2pNetworkPeers.sendMessage(JSON.stringify(messageHeader))
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

    async function savePostAtStorage(postText, commitMessage, timestamp) {
        /*
        Each user, has a git repository that acts as his publicly accessible
        storage for posts.

        They way we store post there is first saving the data at the local disk
        which has a clone of the remote git repository, and once done, we push
        the changes to the public git repo.
        */
        const { createHash } = await import('crypto')
        const hash = createHash('sha256')
        let post = {
            timestamp: timestamp,
            postText: postText
        }

        const fileContent = JSON.stringify(post, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json"
        const filePath = './My-Social-Trading-Data/User-Posts/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDate(timestamp)

        console.log(filePath)

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

    async function saveUserAtStorage(userProfileId, profileData, commitMessage) {
        /*
        Each user, has a git repository that acts as his publicly accessible
        storage for posts.

        They way we store post there is first saving the data at the local disk
        which has a clone of the remote git repository, and once done, we push
        the changes to the public git repo.
        */
        const { createHash } = await import('crypto')
        const hash = createHash('sha256')

        const fileContent = JSON.stringify(userProfileId, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json"
        const filePath = './My-Social-Trading-Data/User-Profile/';

        SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(profileData))

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

    async function getPostText(userProfileHandle, postHash, timestamp) {
        /*
        When the Web App makes a query that includes Post text as responses,
        we need to fetch the text from the public git repositories, since
        the Network Nodes do not store that info themselves, they just
        store the structure of the social graph.
        */
        let promise = new Promise((resolve, reject) => {

            const fileName = postHash + ".json"
            const filePath = 'My-Social-Trading-Data/main/User-Posts/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDate(timestamp)

            const fetch = SA.nodeModules.nodeFetch
            let url = 'https://raw.githubusercontent.com/' + userProfileHandle + '/' + filePath + '/' + fileName;

            fetch(url)
                .then((response) => {

                    if (response.status != 200) {
                        console.log("getPostText", 'Github.com responded with status ' , response.status, 'url',url )
                        throw new createError.NotFound();
                    }

                    response.text().then(body => {
                        post = JSON.parse(body)
                        resolve(post.postText)
                    })
                })
                .catch(err => {
                    resolve('Post Text could not be fetched. ' + err.message)
                })

        }
        )

        return promise
    }

    async function getUserProfileData(userProfileHandle,userProfileId) {

        const { createHash } = await import('crypto')
        const hash = createHash('sha256')
        const fileContent = JSON.stringify(userProfileId, undefined, 4)
        const fileHash = hash.update(fileContent).digest('hex')
        const fileName = fileHash + ".json";

        /*
        When the Web App makes a query that includes User Profile Data as responses,
        we need to fetch the text from the public git repositories, since
        the Network Nodes do not store that info themselves, they just
        store the structure of the social graph.
        */
        let promise = new Promise((resolve, reject) => {

            const filePath = 'My-Social-Trading-Data/main/User-Profile/'

            const fetch = SA.nodeModules.nodeFetch
            let url = 'https://raw.githubusercontent.com/' + userProfileHandle + '/' + filePath + '/' + fileName

            fetch(url)
                .then((response) => {

                    if (response.status != 200) {
                        console.log("getUserProfileData", 'Github.com responded with status ' , response.status, 'url',url )
                        throw new createError.NotFound();
                    }

                    response.text().then(body => {
                        userProfile = JSON.parse(body);
                        userProfile.userProfileId = userProfileId;
                        userProfile.username = userProfileHandle;
                        resolve(responseData('Ok','Web App Interface Query Processed.',userProfile))
                    })
                })
                .catch(err => {
                    const response  = { userProfileId: userProfileId , username:userProfileHandle }
                    resolve(responseData('Ok','Web App Interface Query Processed.',response,err));
                })

        }
        )

        return promise
    }

    async function responseData(result, message, data, error){
        return {
            result: result,
            message: message,
            data: data,
            error: error
        };
    }
}