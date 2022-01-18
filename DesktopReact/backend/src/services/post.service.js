const getFeed = async (req, res) => {
    try {
        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.EVENTS,
            originSocialPersonaId: undefined,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST,
            amountRequested: 20,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
}

const getPosts = async (postHash, res) => {

    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.POSTS,
            originSocialPersonaId: undefined,
            targetSocialPersonaId: postHash,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST,
            amountRequested: 20,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }

}

const createPost =  async (body, res) => {
    try {
        let eventMessage;
        let event;

        eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.NEW_SOCIAL_PERSONA_POST,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            postText: body.postText,
            timestamp: (new Date()).valueOf()
        }

        event = {
            networkService: 'Social Graph',
            requestType: 'Event',
            eventMessage: JSON.stringify(eventMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(event)
        );
    } catch (e) {
        console.log(e);
        return {status: 'Ko'};
    }
};


const getReplies = async(postHash,res) =>{
    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.POST_REPLIES,
            originSocialPersonaId: undefined,
            targetSocialPersonaId: postHash,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST,
            amountRequested: 20,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getPosts,
    createPost,
    getFeed,
    getReplies
};
