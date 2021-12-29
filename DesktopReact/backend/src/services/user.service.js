const getProfiles = async (req, res) => {

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
};


const followProfile = async (userProfileId, eventType, res) => {
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
        return {};
    }
};


const getProfile = async (userProfileId, res) => {
    try {
        let queryMessage = {
            /* TODO Gonza GG boi*/
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
};


module.exports = {
    getProfiles,
    followProfile,
    getProfile
};

