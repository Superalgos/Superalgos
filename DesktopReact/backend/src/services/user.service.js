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

const paginateProfiles = async(initialIndex, pagination, res) => {
        try{
            const queryMessage = {
                queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_USER_PROFILES,
                emitterUserProfileId: undefined,
                initialIndex: initialIndex ? initialIndex : 0 ,
                amountRequested: pagination ? pagination : 3,
                direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
            }
            const  query = {
                requestType: 'Query',
                queryMessage: JSON.stringify(queryMessage)
            }
            return webAppInterface.messageReceived(
                JSON.stringify(query)
            )
            .then(rta => rta)
            .catch(e =>{
                console.log('catch from webapi', e)
                return(e)
            })
        }catch(e) {
            console.log('error here')
            return (e)
        }
        
}


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


const editProfile = async (body, res) => {

    try {
        let eventMessage = {
            eventType: SA.projects.socialTrading.globals.eventTypes.NEW_USER_PROFILE,
            emitterUserProfileId: undefined,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            body:body,
            timestamp: (new Date()).valueOf()
        }
    
        let query = {
            requestType: 'Event',
            eventMessage: JSON.stringify(eventMessage)
        }
    
        return await webAppInterface.messageReceived(
            JSON.stringify(query)
        )
        
    } catch (error) {
        console.log(error);
    }
};

const getProfile = async (userProfileId, username,res) => {

    try {
        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.USER_PROFILE_DATA,
            emitterUserProfileId: undefined,
            userProfileId: userProfileId,
            username:username
        }
    
        let query = {
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        const result = await webAppInterface.messageReceived(
            JSON.stringify(query)
        )
        return result
        
    } catch (error) {
        console.log(error);
    }
};


module.exports = {
    getProfiles,
    followProfile,
    paginateProfiles,
    editProfile,
    getProfile
};

