
const getPosts = async (userId, res) => {

    
    try {

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
        
    } catch (error) {
        console.log(error);
    }

}

const createPost = async (body, res) => {
    try {
        let eventMessage;
        let event;

        eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.NEW_USER_POST,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            postText: body.postText,
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
};



module.exports = {
    getPosts,
    createPost
  };
