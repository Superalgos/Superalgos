

const getAllUsers = async (originSocialPersonaId, res) => {
    try {
        let queryMessage = {
            originSocialPersonaId: originSocialPersonaId.originSocialPersonaId,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
            amountRequested: SA.projects.socialTrading.globals.queryConstants.MAX_AMOUNT_REQUESTED,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP,
            queryType: SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONAS,
            timestamp: (new Date()).valueOf()
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        );

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



const followProfile = async (message, res) => {
    try {
        let eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.FOLLOW_USER_PROFILE,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            originSocialPersonaId: message.originSocialPersonaId,
            targetSocialPersonaId: message.targetSocialPersonaId,
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

// TODO Update FOLLOWERS queryType to new FOLLOWERS_AND_FOLLOWING queryType. Will finish changes when functional.
const getProfileFollowersAndFollowing = async (message, res) => {
    try {
        let queryMessage = {
            originSocialPersonaId: message.originSocialPersonaId,
            targetSocialPersonaId: message.targetSocialPersonaId,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP,
            queryType: SA.projects.socialTrading.globals.queryTypes.FOLLOWERS,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
            timestamp: (new Date()).valueOf()
        }


        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        ).then(results => {
            return results
            
        })

        let response = {}
            response.data = result;
            response.result = result.result

            return response


    } catch (e) {
        console.log(e);
        console.log("ERROR CATCH")
        return {};
    
    }
}



module.exports = {
    getAllUsers,
    followProfile,
    getProfileFollowersAndFollowing
};