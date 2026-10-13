import { fetchBots, createBot, saveBotProfile, getProfile } from '../../services/BotsService';


const state = {
    socialBots: {},
    selectedBot: {},
    showBot: false,
    showBotProfile: {},
};

const actions = {
    
  //______________________SUPERALGOS___________________________// 
    async fetchSocialBots({ commit, dispatch }) {
        try {
            const response = await fetchBots();
            console.log('My Bots:', response)
            const socialEntities = response.socialEntities;
                
            // Create social personas from social entities
            const bots = socialEntities.map(bot => {
            const joined = bot.joined ? bot.joined : '';
            return {
                id: bot.id,
                handle: bot.handle,
                bio: bot.bio || '',
                avatar: bot.avatar || '',
                joined: joined,
                codeName: bot.codeName,
                location: 'Live on the internet',
            };
            });
            commit('SET_SOCIAL_BOTS', bots);
            dispatch('getMyProfiles', bots);
        } catch (error) {
            console.error('Failed to fetch social bots:', error);
        }
    },

    //______________________BOTS___________________________// 
    async addNewBot({ commit, dispatch }, newBot) {
        try {
            
            let newBotResponse = await createBot(newBot)
            console.log('Response from New Bot', newBotResponse)

            if (newBotResponse) {
                dispatch('fetchSocialBots')
            }
           
        } catch (error) {
            console.log(error)
        }
    },

//______________________SHOW MY BOT's PROFILE___________________________//
  
    showBot({commit}, bot) {
        commit('SET_SHOW_BOT', bot);
    },
    showBotProfile({ commit }, showBotProfile) {
        console.log('you want to show Trading Bot Profile in sB Module', showBotProfile)
        commit('SET_SHOW_BOT_PROFILE', showBotProfile);
    },
    async createBotProfile({ commit }, payload) {
        console.log("Received payload:", payload);  // Check structure
        if (!payload) {
            console.error("Error: Payload is undefined");
            return;
        }
        
        const { bot, activePersona } = payload;
    
        console.log("Received bot:", bot); 
        console.log("Received activePersona:", activePersona);
    
        if (!bot) {
            console.error("Error: Bot is undefined inside Vuex action");
            return;
        }
        if (!activePersona) {
            console.error("Error: activePersona is undefined inside Vuex action");
            return;
        }
    
        let body = {
            originSocialPersonaId: activePersona.originSocialPersonaId,
            originSocialTradingBotId: bot.id,
            handle: bot.handle,
            bio: bot.bio,   
            avatar: bot.avatar,
            codeName: bot.codeName,
            bannerPic: bot.bannerPic,
            joined: bot.joined,
            location: bot.location
        };
    
        const response = await saveBotProfile(body);
        console.log('Bot Profile Created:', response);
    
        // commit('addSocialBot', bot);
    },

    async getMyProfiles({ commit, rootState }, bots) {
        console.log('Getting Profiles');
    
        for (let i = 0; i < bots.length; i++) {
            const bot = bots[i];
            const botId = bot.id;
            const codeName = bot.codeName;
            let profileFound = false; // Track if a profile is found
    
            console.log(`Fetching profile for bot: ${codeName} (ID: ${botId})`);
    
            const socialPersonas = Object.values(rootState.personas.socialPersonas);
    
            for (let j = 0; j < socialPersonas.length; j++) {
                const persona = socialPersonas[j];
                const originSocialPersonaId = persona.originSocialPersonaId;
    
                try {
                    const message = {
                        originSocialPersonaId,
                        originSocialTradingBotId: botId,
                        codeName
                    };
    
                    const response = await getProfile(message);
    
                    // Ensure response structure
                    if (!response || typeof response !== 'object') {
                        console.error(`Invalid response for bot ${codeName}:`, response);
                        continue;
                    }
    
                    if (response.result === 'Ok' && response.message === 'Social Entity Profile Found') {
                        console.log(`Profile found for bot ${codeName} under persona ${persona.handle}`);
                        commit('SET_MY_PROFILES', response);
                        profileFound = true;
                        break; // Stop checking other personas for this bot
                    }
                } catch (e) {
                    console.error(`Error fetching profile for bot ${codeName} under persona ${persona.handle}:`, e);
                }
            }
    
            // Only commit an error if no persona returned a profile
            if (!profileFound) {
                console.log(`No profile found for bot ${codeName}`);
                commit('SET_MY_PROFILES_ERROR', { botId, error: `No profile found for bot ${codeName}` });
            }
        }
    
        console.log('Finished fetching bot profiles');
    },
    setSelectedBot({commit}, bot) {
        commit('setSocialBots', bot);
    },
}
function getAllBots(state) {
    console.log('Getting all Bots')
   return Object.values(state.socialBots);
 }

const getters = {
    allSocialBots: (state) => getAllBots(state),
    socialBotById: (state) => (id) => state.socialBots.find(bot => bot.id === id),
    selectedBot: (state) => state.selectedBot,
    showBot: (state) => state.showBot,
    showBotProfile: (state) => state.showBotProfile,


    getBotById: (state) => (id) => state.socialBots[id]
};

const mutations = {
    setSocialBots: (state, bot) => (state.selectedBot = bot),
    addSocialBot: (state, socialBot) => state.socialBots.push(socialBot),
    updateSocialBot: (state, updatedBot) => {
        const index = state.socialBots.findIndex(bot => bot.id === updatedBot.id);
        if (index !== -1) {
            state.socialBots.splice(index, 1, updatedBot);
        }
    },
    removeSocialBot: (state, id) => {
        state.socialBots = state.socialBots.filter(bot => bot.id !== id);
    },
    SET_SOCIAL_BOTS(state, sociaBots) {
        sociaBots.forEach(bot => {
          // Use persona.id as the key to create a sub-state for each persona
          state.socialBots[bot.id] = {
            ...bot,
    
            // Profile
            followers: [],
            following: [],
            followersCount: 0,
            followingCount: 0,  
            ranking: 0,
    
            //Posts
            posts: [],
            postsCount: 0, 
            newPost: {},
            newPostResponse: {},
            
            likes: [],
            
    
            replies: [], 
            repliesCount: 0,
            newRely: {},
            newRepliesRespone: {},
    
            deletedPosts: [],
            deletedPostsCount: 0,
            deletedPostsRespone: {},
            
            
            // Add other sub-states as needed (e.g., shares, following, etc.)
          };
        });
    },
    SET_SHOW_BOT_PROFILE(state, showBotProfile) {
        state.showBotProfile = showBotProfile;
    },
    SET_SHOW_BOT(state, showBot) {
        state.showBot = showBot;
    },

    SET_MY_PROFILES(state, profile) {
        console.log('Setting my profiles:', profile);
        
        const { originSocialTradingBotId, ...profileData } = profile.profileData;
    
        if (!state.socialBots[originSocialTradingBotId]) {
            state.socialBots[originSocialTradingBotId] = {
                profileResult: {},
                accountBalance: {},
                profileMessage: {},
                followers: [], // Ensure arrays are properly initialized
                following: [],
                followersCount: 0,
                followingCount: 0,  
                ranking: 0,
                bots: 0,
    
                // Posts
                posts: [],
                postsCount: 0, 
                newPost: {},
                newPostResponse: {},
    
                likes: [],
                replies: [], 
                repliesCount: 0,
                newReply: {},
                newRepliesResponse: {},
    
                deletedPosts: [],
                deletedPostsCount: 0,
                deletedPostsResponse: {},
            };
        }
    
        // Explicitly merge the new profile data instead of spreading
        Object.assign(state.socialBots[originSocialTradingBotId], profileData);
    },
    SET_MY_PROFILES_ERROR(state, { botId, error }) {
        //console.error(`Error setting profile for bot ${botId}:`, error);
    
        if (!state.socialBots[botId]) {
            state.socialBots[botId] = { profileMessage: '' }; // Initialize if not existing
        }
    
        state.socialBots[botId].profileMessage = error; // Store error message
    }
    
};

export const socialBots = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }
