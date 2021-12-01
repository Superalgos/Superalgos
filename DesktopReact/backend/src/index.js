exports.startExpress = (port, SA) => {
    const express = require("express");
    const app = express();
    const webAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface();

    app.use(express.json());

    // define a route handler for the default home page
    app.get("/health-check", (req, res) => {
        res.send("all good");
    });

    app.get("/profiles", async (req, res) => {
        let profiles = await whoToFollow();
        console.log(profiles)
        res.send(profiles);
    });

    app.post("/follow", async (req, res) => {
        let follow = followProfile(req.body.userProfileId, SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE);
        res.send("Followed")
    });

    app.post("/unFollow", async (req, res) => {
        let follow = followProfile(req.body.userProfileId, SA.projects.socialTrading.globals.eventTypes.UNFOLLOW_USER_PROFILE);
        res.send("UnFollow")
    });


    app.post("/post", async (req, res) => {
        console.log(req)
        let post = createPost(req);
        res.send(post)
    });

    // start the Express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });

    async function createPost(postText) {
        try {
            let eventMessage;
            let event;

            eventMessage = {
                eventType: SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST,
                eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                postText: postText,
                timestamp: (new Date()).valueOf()
            }

            event = {
                requestType: 'Event',
                eventMessage: JSON.stringify(eventMessage)
            }

            return await webAppInterface.sendMessage(
                JSON.stringify(event)
            );
        } catch (e) {
            console.log(e);
            return {};
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
            return [];
        }
    }

    async function followProfile(userProfileId, eventType) {

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
            return {};
        }
    }
}