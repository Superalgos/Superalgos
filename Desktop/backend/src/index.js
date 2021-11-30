exports.startExpress = (port, SA, UI) => {
    const express = require("express");
    const app = express();
    const newSocialTradingModulesWebAppInterface = DK.projects.socialTrading.modules.webAppInterface.newSocialTradingModulesWebAppInterface();

// define a route handler for the default home page
    app.get("/health-check", (req, res) => {
        res.send("all good");
    });

    app.get("/profiles", async (req, res) => {
        let userProfileTimeLine = loadUserProfileTimeline(SA, UI);
        res.send(userProfileTimeLine);
    })

// start the Express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port} `);
    });


    async function loadUserProfileTimeline(SA, UI) {

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

        let profiles = await newSocialTradingModulesWebAppInterface.messageReceived(
            JSON.stringify(query)
        );
        return profiles;
    }
}