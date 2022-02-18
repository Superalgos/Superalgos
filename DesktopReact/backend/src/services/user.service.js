const getSocialPersonaId = async (req, res) => {
    let response = {};
    try {
        let socialPersona = SA.secrets.signingAccountSecrets.map.get(global.env.DESKTOP_DEFAULT_SOCIAL_PERSONA);
        response.nodeCodeName = socialPersona.nodeCodeName;
        response.nodeId = socialPersona.nodeId;
        response.blockchainAccount = socialPersona.blockchainAccount;
        response.userProfileId = socialPersona.userProfileId;
        response.userProfileHandle = socialPersona.userProfileHandle;
    } catch (error) {
        console.log(error);
        response = {error: "Could not fetch Social Persona"}
    }
    return response;

}

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

const loadProfile = async (socialPersonaId, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY,
            originSocialPersonaId: socialPersonaId
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

        let response = {}
        response.data = result.profileData;
        response.result = result.result;

        return response

    } catch (error) {
        console.log(error);
    }
}

const saveProfile = async (body, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY,
            profileData: JSON.stringify(body),
            originSocialPersonaId: body.originSocialPersonaId
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
}

const createProfile = async (body, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.CREATE_USER_PROFILE,
            storageProviderName: "Github",
            storageProviderUsername: body.username,
            storageProviderToken: body.token,
            userAppType: "Social Trading Desktop App"
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
}

const listSocialEntities = async (req, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.LIST_SOCIAL_ENTITIES,
            socialEntityType: "Social Persona",
            userAppType: "Social Trading Desktop App"
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
}

const createSocialPersona = async (body, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.CREATE_SOCIAL_ENTITY,
            socialEntityHandle: body.name,
            socialEntityType: "Social Persona",
            userAppType: "Social Trading Desktop App"
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    followProfile,
    paginateProfiles,
    loadProfile,
    saveProfile,
    getSocialPersonaId,
    createProfile,
    listSocialEntities,
    createSocialPersona
};

