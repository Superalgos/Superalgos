import { getSocialEntityList, updateProfile, getProfile, createSocialPersona } from '../../services/ProfileService';

const state = {
  socialPersonasFromStorage: [],                           // My socialPersonas from Storage Repo
  socialPersonas: [],                                      // My socialPersonas from Superalgos Governance Repo
  selectedSocialPersona: {},                               // Changing between social Personas
  
  newPersona: {},
  deletePersona: {},

  socialPersonaProfiles: {},                                // Sub-state for storing profiles
  newProfile: {},                                          // Creating a new Profile and saving it at the Storage Container
  updateProfile: {},   
      
  usersSocialPersonas: [],                                 // Other users socialPersonas from Superalgos Governance Repo
   
  followedUser: [],                                        // Event emitted at social graph and stored at Network Node. ?TODO store the events on users storage container
  addFollowerToSocialPersonasToStorage: {},               //  Stored Follower event on users storage container
  removeFollowing: {},                                     //  Removes Followeing event on users storage container
       
}

const actions = {
  //______________________SUPERALGOS___________________________// 
  async fetchEntities({ commit, dispatch }) {
    // SocialPersonas inside Superalgos User-Profiles Governance Project

        const socialEntitiesResponse = await getSocialEntityList();
        const socialEntities = socialEntitiesResponse.socialEntities;
            
        // Create social personas from social entities
        const socialPersonas = socialEntities.map(entity => {
          const joined = entity.joined ? entity.joined : '';
          return {
            originSocialPersonaId: entity.id,
            handle: entity.handle,
            bio: entity.bio || '',
            avatar: entity.avatar || '',
            joined: joined,
            codeName: entity.codeName,
          };
        });
        
        // Commit mutations for social personas
        commit('SET_SOCIAL_PERSONAS', socialPersonas);
        // Calls the function
        dispatch('getMyProfiles', socialPersonas)
       // dispatch('posts/getSocialPersonasPostsFromStorage', socialPersonas, {root: true})
        await dispatch('socialPersonas/fetchSocialPersonas', socialPersonas, { root: true });
    
      
  },
//______________________SOCIAL PERSONA___________________________// 
  async createSocialPersona({ commit }, socialPersonaData) {
    // Call the API endpoint to create a new social persona using the provided data
    const newSocialPersona = await createSocialPersonaAPI(socialPersonaData);
        
    // Update the state with the new social persona
    commit('ADD_SOCIAL_PERSONA', newSocialPersona);
  },
  async deleteSocialPersona({ commit }, socialPersonaId) {
    // Call the API endpoint to delete the social persona with the provided ID
    await deleteSocialPersonaAPI(socialPersonaId);
      
    // Remove the social persona from the state
    commit('REMOVE_SOCIAL_PERSONA', socialPersonaId);
  },
//______________________PROFILE___________________________//
      /*My Entities Profiles */
      async getMyProfiles({ commit, dispatch, rootState }, socialPersonas) {
        let socialPersonaId;
    
        try {
            const socialPersonasFromStorage = [];
            const socialPersonasNotReturned = []; // Initialize an empty array to track socialPersonas not returned
            const processedIds = []; // Track the processed originSocialPersonaIds
                         
            for (let i = 0; i < socialPersonas.length; i++) {
                socialPersonaId = socialPersonas[i].originSocialPersonaId;
    
                // Check if the social persona has already been processed
                if (processedIds.includes(socialPersonaId)) {
                    continue; // Skip to the next iteration if already processed
                }
    
                const response = await getProfile({ originSocialPersonaId: socialPersonaId });
    
                if (response) {
                    socialPersonasFromStorage.push(response);
                    //  commit('SET_SOCIAL_PERSONA_PROFILE', { personaId: socialPersonaId, profile: response });
                    processedIds.push(socialPersonaId); // Add the processed id to the list
                } else {
                    socialPersonasNotReturned.push(socialPersonas[i]);
                }
    
                commit('SET_MY_PROFILES', socialPersonasFromStorage);
                await dispatch('socialPersonas/fetchSocialPersonasFromStorage', socialPersonasFromStorage, { root: true });
            }
    
            if (socialPersonasNotReturned.length > 0) {
                // Retry fetching socialPersonas that were not returned
                const remainingResponses = await dispatch('getMyProfiles', socialPersonasNotReturned);
                return socialPersonasFromStorage.length + remainingResponses;
            }
            console.log('profile', socialPersonasFromStorage)
            commit('SET_MY_PROFILES', socialPersonasFromStorage);
    
             // Fetch posts for each processed social persona
            for (let i = 0; i < socialPersonas.length; i++) {
              const persona = socialPersonas[i];
              await dispatch('posts/getSocialPersonasPostsFromStorage', persona, { root: true });
            }

            return socialPersonasFromStorage.length; // Return the count of responses

          } catch (e) {
            console.log(e);
          }
    },
  async addNewProfile({ commit }, newProfile) {
    // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
      let body = newProfile

      let newProfileResponse = await createSocialPersona(body);
      console.log('You have newProfileResponse', newProfileResponse)


      newProfile.privateKey = null
      newProfile.address = null
      newProfile.gitToken = null
      // Set the state with the new social persona
      //commit('SET_NEW_PROFILE', newProfile);
    } catch (error) {
      console.log(error)
    }
  },
  async updateSocialPersona({ commit }, newSocialPersonaState) {
    // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
      let profileData = newSocialPersonaState
      let socialPersona = await updateProfile(profileData);
        
      // Update the state with the updated social persona
      commit('UPDATE_SOCIAL_PERSONA', socialPersona);
    } catch (error) {
      console.log(error)
    }
  },

  
//______________________FOLLOWER & FOLLOWING___________________________// 
  //FOLLOW NEW USER
  async  addFollowUserToStorage({ commit, state }, newFollow) {
    // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
     let message = newFollow
     let newFollowResponse = await followSocialPersona(message);
     
    if(newFollowResponse.data === true ) {
      let follower = {
        id: newFollow.targetSocialPersonaId,
        isFollower: newFollowResponse.data
      }
      commit(ADD_FOLLOWER_SOCIAL_PERSONA_TO_STORAGE, follower)
    }
   } catch(error) {
     console.log(error)
   }
  },

  //GET FOLLOWERS
  async getFollowers({ commit, state }) {
    // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
      let message = { originSocialPersonaId: state.selectedSocialPersona.originSocialPersonaId };
      let maxRetries = 5;
      let retryDelay = 15000;
      let currentRetry = 0;
  
      while (currentRetry < maxRetries) {
        console.log(`FETCHING ALL USERS FOLLOWERS (Attempt ${currentRetry + 1}), message:`, message);
        let followersResponse = await fetchFollowers(message);
        
        if ( followersResponse.data.data === '[]' || followersResponse.data.data === undefined ) {

          // If data is empty, wait for the specified retryDelay and then retry.
        await new Promise(resolve => setTimeout(resolve, retryDelay));
  
        // Increment the retry count.
        currentRetry += 1;
          
        }else {
          // If data is not empty or maxRetries is reached, return the response.
          return followersResponse;
        }
  
        
      }
  
      // If all retries fail, you can handle it here.
      console.log(`Max retries reached (${maxRetries}), and no data found.`);
    } catch (error) {
      console.error(error);
    }
  },
  //REMOVE FOLLOWING
  async removeFollowing({ commit, state }) {
    
  },
}

const getters = {
    
  socialEntities: state => state.socialEntities,              // My Entities from Superalgos Governance Repo
  socialPersonas: state => state.socialPersonas,              // My socialPersonas from Superalgos Governance Repo
  socialBots: state => state.socialBots,                      // My socialTrading Bots from Superalgos Governance Rep
    
  socialPersonasFromStorage: state => state.socialPersonasFromStorage,
  socialPersonaProfiles: state => state.socialPersonaProfiles,
  usersSocialPersonas: state => state.usersSocialPersonas,
  otherUsersSocialPersonas: state => state.otherUsersSocialPersonas,

  getPersonaStatsById: (state) => (personaId) => {
    const persona = state.socialPersonas[personaId];
    if (persona) {
      return {
        followers: persona.followers,
        following: persona.following,
        rank: persona.ranking,
        bots: persona.bots
      };
    }
    return null; // Persona not found
  },
  getPersonaFollowers: (state) => (personaId) => {
    if (state.socialPersonas[personaId]) {
      return state.socialPersonas[personaId].followers;
    }
    return null; // or a default value
  },
  
  getPersonaFollowings: (state) => (personaId) => {
    if (state.socialPersonas[personaId]) {
      return state.socialPersonas[personaId].following;
    }
    return null; // or a default value
  },
  followedUser: state => state.followedUser,

  selectedSocialPersona: state => state.selectedSocialPersona,
  selectedUser: state => state.selectedUser,
  newProfile: state => state.newProfile,
  
  showUser: state => state.showUser,
  showSelectedSocialPersona: state => state.showSelectedSocialPersona,

  otherUsers: state => state.otherUsers, 
}

const mutations = {
  //SUPERALGOS PERSONA
  SET_SOCIAL_PERSONAS(state, payload) {
      state.socialPersonas = payload
  },
  //SELECT A PERSONA
  SET_SELECTED_SOCIAL_PERSONA(state, socialPersona) {
     state.selectedSocialPersona = socialPersona
  },
  //FETCHED PERSONA PROFILES
  SET_MY_PROFILES(state, socialPersonasFromStorage) {
    state.socialPersonasFromStorage = socialPersonasFromStorage 
  },
  //SELECTED PROFILE
  SET_SELECTED_USER(state, user) {
    state.selectedUser = user
  },
  //CREATE NEW PERSONA
  SET_NEW_SOCIAL_PERSONA_STATE(state, currentEditedCardData) {
    state.newSocialPersonaState = currentEditedCardData;
  },
  SET_SOCIAL_PERSONA_STATE(state, currentEditedCardData) {
    state.newSocialPersonaState = currentEditedCardData;
  },
  //OTHER USERS PROFILES
  GET_OTHER_USERS(state, otherUsers) {
    otherUsers.forEach(user => {
      // Use persona.id as the key to create a sub-state for each persona
      state.otherUsers[user.profileData.originSocialPersonaId] = {
        ...user,
        
        posts: [],
        likes: [],
        profile: {},
        profileResult: {},
        accountBalance: {},
        profileMessage: {},
        replies: 0,
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        ranking: 0,
        bots: 0,
        newPost: {},
        newPostResponse: {},
        repliesCount: 0,
        deletedPostsCount: 0,
        deletedPosts: []
        // Add other sub-states as needed (e.g., shares, following, etc.)
      };
    });

    state.otherUsers = otherUsers
  },

   //CREATE NEW PERSONA
  ADD_SOCIAL_PERSONA(state, socialPersona) {
    state.socialPersonas.push(socialPersona);
  },
   //CREATE NEW PERSONA
  UPDATE_SOCIAL_PERSONA(state, socialPersona) {
    const index = state.socialPersonas.findIndex((p) => p.id === socialPersona.id);
    if (index !== -1) {
      state.socialPersonas.splice(index, 1, socialPersona);
    }
  },
   //DELETE PERSONA + PROFILE
  DELETE_SOCIAL_PERSONA(state, socialPersonaId) {
    state.socialPersonas = state.socialPersonas.filter((p) => p.id !== socialPersonaId);
  },

  ADD_FOLLOWER_SOCIAL_PERSONA_TO_STORAGE(state, follower) {
    state.addFollowerToSocialPersonasToStorage = follower ;
  },
  
}

export const personas = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }
