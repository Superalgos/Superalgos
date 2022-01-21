const getProfiles = async (req, res) => {

    try {
        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_SOCIAL_PERSONAS,
            originSocialPersonaId: undefined,
            initialIndex: SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST,
            amountRequested: 3,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        );
    } catch (e) {
        console.log(e);
        return [];
    }
};

const paginateProfiles = async (initialIndex, pagination, res) => {
    try {
        const queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.UNFOLLOWED_SOCIAL_PERSONAS,
            originSocialPersonaId: undefined,
            initialIndex: initialIndex ? initialIndex : 0,
            amountRequested: pagination ? pagination : 3,
            direction: SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP
        }
        const query = {
            networkService: 'Social Graph',
            requestType: 'Query',
            queryMessage: JSON.stringify(queryMessage)
        }
        return webAppInterface.sendMessage(
            JSON.stringify(query)
        )
            .then(rta => rta)
            .catch(e => {
                console.log('catch from webapi', e)
                return (e)
            })
    } catch (e) {
        console.log('error here')
        return (e)
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


const editProfile = async (body, res) => {

    try {
        let eventMessage = {
            eventType: SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY,
            originSocialPersonaId: undefined,
            eventId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            body: body,
            timestamp: (new Date()).valueOf()
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Event',
            eventMessage: JSON.stringify(eventMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
};

const getProfile = async (req, res) => {

    try {
        let profileMessage = {
            queryType: SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY,
            originSocialPersonaId:req.socialPersonaId
            }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        return result

    } catch (error) {
        console.log(error);
    }
};

const loadProfile =  async (userProfileId, username, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY,
            originSocialPersonaId: undefined
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        return result

    } catch (error) {
        console.log(error);
    }
}

const saveProfile =  async (body, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY,
            profileData: JSON.stringify(body),
            originSocialPersonaId: undefined
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        return result

    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    getProfiles,
    followProfile,
    paginateProfiles,
    editProfile,
    getProfile,
    loadProfile,
    saveProfile
};

