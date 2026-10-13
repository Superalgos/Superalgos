const fetchBots = async(message, res) => {
    try {
        let profileMessage = {
        profileType: SA.projects.socialTrading.globals.profileTypes.LIST_SOCIAL_ENTITIES,
        socialEntityType: "Social Trading Bot",
        userAppType: "Social Trading Desktop App"
        };

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        };
        
         const result = await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        let response = JSON.parse(result)
        return response
        
        // Your logic to fetch bots
    } catch (error) {
        console.error('Error fetching bots:', error);
    }
};

const createBot = async (body, res) => {
    try {
        let profileMessage = {
            profileType:  SA.projects.socialTrading.globals.profileTypes.CREATE_SOCIAL_ENTITY,
            userAppType: 'Social Trading Desktop App',
            socialEntityType: 'Social Trading Bot',
            socialEntityHandle: body.handle
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        };
        
        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        // Your logic to create a bot
    } catch (error) {
        console.error('Error creating bot:', error);
    }
};

const saveProfile = async (body, res) => {
    try { 
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.SAVE_SOCIAL_ENTITY,
            profileData: JSON.stringify(body),
            socialEntityType: 'bot',
            originSocialPersonaId: body.originSocialPersonaId,
            originSocialTradingBotId: body.originSocialTradingBotId
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        };

        //console.log('query:', query)
        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
    } catch (error) {
        console.error('Error saving profile:', error);
    }
};  

const loadProfile = async (message, res) => {
    try {
        let profileMessage = {
            profileType: SA.projects.socialTrading.globals.profileTypes.LOAD_SOCIAL_ENTITY,
            originSocialPersonaId: message.originSocialPersonaId,
            originSocialTradingBotId: message.originSocialTradingBotId,
            codeName: message.codeName
        }

        let query = {
            networkService: 'Social Graph',
            requestType: 'Profile',
            profileMessage: JSON.stringify(profileMessage)
        }

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        );
       
    } catch (error) {
        console.log(error);
        return {status: 'Ko', message: error};
    }
}
const deleteBot = async (botId) => {
    try {
        let profileMessage = {
            profileType: 'delete',
            userAppType: 'client',
            socialEntityType: 'bot'
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'DELETE',
            profileMessage: profileMessage
        };

        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        
    } catch (error) {
        console.error('Error deleting bot:', error);
    }
};

const sendMessage = async (message) => {
    try {
        let profileMessage = {
            profileType: 'send',
            userAppType: 'client',
            socialEntityType: 'bot'
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'POST',
            profileMessage: profileMessage
        };
        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )
        
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

const updateBot = async (botId, botData) => {
    try {
        let profileMessage = {
            profileType: 'update',
            userAppType: 'client',
            socialEntityType: 'bot'
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'PUT',
            profileMessage: profileMessage
        };
    
        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.error('Error updating bot:', error);
    }
};

const receiveMessage = async (message) => {
    try {
        let profileMessage = {
            profileType: 'receive',
            userAppType: 'client',
            socialEntityType: 'bot'
        };
        let query = {
            networkService: 'Social Graph',
            requestType: 'GET',
            profileMessage: profileMessage
        };
    
        return await webAppInterface.sendMessage(
            JSON.stringify(query)
        )

    } catch (error) {
        console.error('Error receiving message:', error);
    }
};

module.exports = {
    fetchBots,
    createBot,
    deleteBot,
    sendMessage,
    updateBot,
    receiveMessage,
    saveProfile,
    loadProfile
};
