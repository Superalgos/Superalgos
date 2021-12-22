exports.startExpress = (port, SA, DK) => {
    const cors = require('cors');
    const express = require('express');
    const app = express();
    const webAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface();

    app.use(express.json());
    app.use(cors({
        origin: '*'
    }));

    // define a route handler for the default home page
    app.get('/health-check', (req, res) => {
        res.send("all good");
    });

    app.get('/profiles', async (req, res) => {
        let profiles = await whoToFollow();
        res.json(profiles);
    });

    app.post('/follow', async (req, res) => {
        let follow = await followProfileHandler(req.body.userProfileId, SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE);
        console.log(follow)
        res.send(follow)
    });

    app.post('/unFollow', async (req, res) => {
        let unfollow = await followProfileHandler(req.body.userProfileId, SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE);
        res.send(unfollow)
    });

    app.post('/createPost', async (req, res) => {
        let post = createPost(req.body);
        res.json(post)
    });

    app.get('/getPosts', async (req, res) => {
        let posts = await getPosts();
        res.json(posts)
    });

    app.get('/getGlobaConfig', async (req, res) => {
        let posts = await getGlobalConfig();
        res.json(posts)
    });

    // start the Express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });

    async function getGlobalConfig(){
        return SA.projects.socialTrading.globals;
    }

    async function getPosts() {
        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.EVENTS,
            emitterUserProfileId: undefined,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST,
            amountRequested: 100,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST
        }

        let query = {
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        return await webAppInterface.messageReceived(
            JSON.stringify(query)
        )
    }

    async function createPost(postText) {
        try {
            let eventMessage;
            let event;

            eventMessage = {
                eventType: SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                postText: postText.body,
                timestamp: (new Date()).valueOf()
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            return await webAppInterface.messageReceived(
                JSON.stringify(event)
            );
        } catch (e) {
            console.log(e);
            return {status: 'Ko'};
        }
    }

    async function whoToFollow() {

        try {
            let queryMessage = {
                queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
                amountRequested: 3,
                direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }

            let query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }

            return await webAppInterface.messageReceived(
                JSON.stringify(query)
            );
        } catch (e) {
            console.log(e);
            return {status: 'Ko'};
        }
    }

    async function followProfileHandler(userProfileId, eventType) {
        try {
            let eventMessage = {
                eventType: eventType,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                targetUserProfileId: userProfileId,
                timestamp: (new Date()).valueOf()
            }

            let event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }
            
            return await webAppInterface.messageReceived(
                JSON.stringify(event)
            );
        } catch (e) {
            console.log(e);
            return {status: 'Ko'};
        }
    }
}