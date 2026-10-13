import axios from 'axios';

const http = axios.create({
    baseURL: "http://localhost:33248",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});


async function fetchBots()  {
    return http.get('/bots/social-entities')
        .then(response => {
           // console.log('Bots:', response);
            if (response.data.result === "Ok") {
                return response.data
            }
        });
}

//______________________SAVE BOT PROFILE___________________________//
// This function saves the Bot Profile in the store.
async function saveBotProfile(body)  {
    console.log('Bot Profile:', body);
    return http.post('/bots/saveBotProfile', body)
        .then(response => {
            if (response.data.result === "Ok") {
                return response.data
            }
        });
}

async function getProfile(message) {
    console.log('Get Profiles:', message);
    return http.get('/bots/profile', { params: message })
        .then(response => {
            
            const parsedData = JSON.parse(response.data); // Convert string to object
            return parsedData
            
        });
        
}

async function createBot(body)  {
    return http.post('/bots/createBot', body )
        .then(response => {
           // console.log('Bots:', response);
            if (response.data.result === "Ok") {
                return response.data
            }
        }
    );
};

async function deleteBot(botId)  {
    try {
        const response = await http.delete(`${API_URL}/${botId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting bot:', error);
        throw error;
    }
};

async function updateBot(botId, botData)  {
    try {
        const response = await http.put(`${API_URL}/${botId}`, botData);
        return response.data;
    } catch (error) {
        console.error('Error updating bot:', error);
        throw error;
    }
};

async function BotSendMessage (message)  {
    console.log('Bot Message:', message);
};


export {
    fetchBots,
    createBot,
    deleteBot,
    updateBot,
    BotSendMessage,
    saveBotProfile,
    getProfile
}
