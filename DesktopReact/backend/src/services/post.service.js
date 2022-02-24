const getFeed = async (req, res) => {
    try {
        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.EVENTS,
            originSocialPersonaId: req.originSocialPersonaId,
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

const getPosts = async (body, res) => {

    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.POSTS,
            originSocialPersonaId: body?.originSocialPersonaId,
            targetSocialPersonaId: body?.targetSocialPersonaId,
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
const getPost = async (body, res) => {

    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.POST,
            originSocialPersonaId: undefined,
            targetSocialPersonaId: body?.targetSocialPersonaId,
            targetPostHash: body?.targetPostHash,
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

const createPost = async (body, res) => {
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


const getReplies = async (body, res) => {
    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.POST_REPLIES,
            originSocialPersonaId: undefined,
            targetSocialPersonaId: body.targetSocialPersonaId,
            targetPostHash: body.targetPostHash,
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

const createReply = async (body, res) => {

    try {
        let eventMessage;
        let event;

        eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.REPLY_TO_SOCIAL_PERSONA_POST,
            targetPostHash: body.postHash,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            postText: body.postText,
            targetSocialPersonaId: body.targetSocialPersonaId
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


const postReactions = async (body, res) => {
    try {

        let eventMessage;
        let event;

        eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.ADD_REACTION_LIKE,
            originSocialPersonaId: body.originSocialPersonaId,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            targetPostHash: body.postHash,
        }

        event = {
            networkService: 'Social Graph',
            requestType: 'Event',
            eventMessage: JSON.stringify(eventMessage)
        }
        let response = await NT.projects.socialTrading.modules.event.newSocialTradingModulesEvent(event);
        return await webAppInterface.sendMessage(
            JSON.stringify(event)
        );
    } catch (e) {
        console.log(e);
        return {status: 'Ko'};
    }
}


module.exports = {
    getPosts,
    createPost,
    getFeed,
    getReplies,
    createReply,
    getPost,
    postReactions
};
