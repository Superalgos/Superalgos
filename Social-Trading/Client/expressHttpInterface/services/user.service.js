const getSocialPersonaId = async (req, res) => {
    let response = {};
    try {
        let socialPersona = SA.secrets.signingAccountSecrets.map.get(global.env.SOCIALTRADING_DEFAULT_SOCIAL_PERSONA);
        response.nodeCodeName = socialPersona.nodeCodeName;
        response.nodeId = socialPersona.nodeId;
        response.blockchainAccount = socialPersona.blockchainAccount;
        response.userProfileId = socialPersona.userProfileId;
        response.userProfileHandle = socialPersona.userProfileHandle;
        response.bannerPic = socialPersona.bannerPic;
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
            JSON.stringify(query))
            .then(rta => rta)
            .catch(e => {
                console.log('catch from webapi', e)
                return (e)
            })
    } catch (error) {
        console.log(error);
        return {status: 'Ko', message: error};
    }

}

const loadProfile = async (message, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY,
            originSocialPersonaId: message.targetSocialPersonaId
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
        return {status: 'Ko', message: error};
    }
}

const loadProfileData = async (message, res) => {

    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.GET_USER_PROFILE_INFO,
            originSocialPersonaId: message.originSocialPersonaId
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

        let resultData = JSON.parse(result)

        let response = {}
        response.data = resultData.profileData;
        response.result = resultData.result;

        return response

        //return {status: 'Ko', message: 'functionality not implemented'}

    } catch (error) {
        console.log(error);
        return {status: 'Ko', message: error};
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
        return {status: 'Ko', message: error};
    }
}

const createProfile = async (body, res) => {

        console.log(JSON.stringify(body))
    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.CREATE_USER_PROFILE,
            storageProviderName: "Github",
            storageProviderUsername: body.storageProviderUsername,
            storageProviderToken: body.storageProviderToken,
            userAppType: "Social Trading Desktop App",
            userSignature: body.userSignature
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
        return {status: 'Ko', message: error};
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
        return {status: 'Ko', message: error};
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
        return {status: 'Ko', message: error};
    }
}

const getSocialStats = async (body) => {

    try {

        let queryMessage = {
            queryType: SA.projects.socialTrading.globals.queryTypes.SOCIAL_PERSONA_STATS,
            originSocialPersonaId: body?.originSocialPersonaId,
            targetSocialPersonaId: body?.targetSocialPersonaId,
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
        return {status: 'Ko', message: error};
    }

}


module.exports = {
    paginateProfiles,
    loadProfile,
    saveProfile,
    getSocialPersonaId,
    createProfile,
    listSocialEntities,
    createSocialPersona,
    loadProfileData,
    getSocialStats
};

