

const getAllUsers = async (originSocialPersonaId, res) => {
    console.log("TRYING TO GET ALL USERS NOW")
    try {
        console.log("Trying to get all Users")
        let queryMessage = {
            originSocialPersonaId: originSocialPersonaId.originSocialPersonaId,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
            amountRequested: SA.projects.socialTrading.globals.queryConstants.MAX_AMOUNT_REQUESTED,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP,
            queryType: SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONAS,
            timestamp: (new Date()).valueOf()
        }
        console.log("QUERY MESSAGE SENT = " + JSON.stringify(queryMessage))

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        );

        console.log("RESULT = " + result)
        let response = {}
        response.data = result;
        response.result = result.result;

        return response

    } catch (e) {
        console.log(e);
        console.log("ERROR CATCH")
        return {};
    }
}



const followProfile = async (userProfileId, eventType, res) => {
    try {
        let eventMessage = {
            eventType: eventType,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            targetSocialPersonaId: userProfileId,
            timestamp: (new Date()).valueOf()
        }

        let event = {
            networkService: 'Social Graph',
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
};



module.exports = {
    getAllUsers,
    followProfile
};