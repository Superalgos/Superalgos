import { createPost, timeline, getReplies, createReaction } from '../../services/PostService';
const state = {
  getSocialPersonasPostsFromStorage: [],                   // Retreiving Post at storage container
  addSocialPersonasPostToStorage: {},                      // Storing new Post at storage container
  removePost: {},
  editPost: {},

  addSocialPersonaReplyToStorage: {},                      // Storing new Post reply at storage container
  getRepliesToPostInStorage: [],                           // Retreiving Post replies at storage container

  otherUsersSocialPersonaPost: [],                         // Other user's Profiles at storage container
  otherUsersSocialPersonaReplies: [],                      // Other user's Profiles at storage container
    
      

}
const actions = {
 //______________________POSTS__________________________// 
    // FETCH MY POSTS
    async getSocialPersonasPostsFromStorage({ commit, state, dispatch, rootState }, selectedSocialPersona) {
      console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.handle);
      console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.originSocialPersonaId);
  
      const selectedSocialPersonaId = selectedSocialPersona.originSocialPersonaId;
  
      // First, fetch posts for the selected social persona
      await dispatch('fetchPostsAndLoad', selectedSocialPersonaId);
  
      // Fetch my social personas from rootState
      let mySocialPersonas = rootState.personas && rootState.personas.socialPersonas;
  
      // Check if mySocialPersonas is defined, otherwise wait or fetch it
      if (!Array.isArray(mySocialPersonas) || mySocialPersonas.length === 0) {
          console.log('mySocialPersonas is not available or empty, waiting for 5 seconds...');
          // Optionally dispatch a fetch action if the data isn't loaded yet
          await dispatch('fetchSocialPersonas'); // Example action to load personas
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds
  
          // Try to retrieve mySocialPersonas again after the wait
          mySocialPersonas = rootState.personas && rootState.personas.socialPersonas;
  
          if (!Array.isArray(mySocialPersonas) || mySocialPersonas.length === 0) {
              console.log('mySocialPersonas is still not available, exiting.');
              return; // Exit if the personas are still not available
          }
      }
  
      // Process other social personas (excluding the selected one)
      const otherSocialPersonas = mySocialPersonas.filter((persona) => persona.originSocialPersonaId !== selectedSocialPersonaId);
  
      for (const persona of otherSocialPersonas) {
          await dispatch('getPostsForPersona', persona);
      }
  }
  ,
  
  async fetchPostsAndLoad({ commit, dispatch }, selectedSocialPersonaId) {
      const selectedSocialPersonaPostsResponse = await timeline({ originSocialPersonaId: selectedSocialPersonaId });
  
      console.log("Timeline Response", selectedSocialPersonaPostsResponse);
  
      // Load posts for the selected social persona
      await dispatch('loadPosts', selectedSocialPersonaPostsResponse);
  
      /* Uncomment and adjust the following sections if needed
      if (Array.isArray(selectedSocialPersonaPostsResponse)) {
          const eventsResponse = await events({ originSocialPersonaId: selectedSocialPersonaId });
          if (eventsResponse) {
              await dispatch('loadPosts', eventsResponse);
          }
  
          const replyResponse = await getReplies({ originSocialPersonaId: selectedSocialPersonaId });
          if (replyResponse) {
              console.log("Reply Response in FetchPostAndLoad", replyResponse);
              await dispatch('getRepliesToPostInStorage', replyResponse);
          }
      }
      */
  },
  
  async getPostsForPersona({ commit, dispatch }, persona) {
      const postsResponse = await timeline({ originSocialPersonaId: persona.originSocialPersonaId });
  
      /* Uncomment and adjust the following sections if needed
      if (Array.isArray(postsResponse)) {
          const eventsResponse = await events({ originSocialPersonaId: persona.originSocialPersonaId });
          if (eventsResponse) {
              console.log("Events Response in getPostsForPerson", eventsResponse);
              await dispatch('loadPosts', eventsResponse);
          }
  
          const replyResponse = await getReplies({ originSocialPersonaId: persona.originSocialPersonaId });
          if (replyResponse) {
              console.log("Reply Response in FetchPostAndLoad", replyResponse);
              await dispatch('getRepliesToPostInStorage', replyResponse);
          }
      }
      */
  
      await dispatch('loadOtherPersonaPosts', { postsResponse, persona });
  },
  async loadPosts({ commit, dispatch }, postsResponse, selectedSocialPersona) {
    let user = selectedSocialPersona;
    let Posts = [];
    let Replies = [];

    console.log('post response in posts modules', postsResponse);
    if (postsResponse === '[]') {
      let message = 'Waiting for a Network Node to process your Request';
      return message;
    }
    
    if (postsResponse === undefined) {
      
      let errorMessage = 'Social Entity sending the Query is unrelated to a User Profile.';
      console.log(errorMessage, user);
      //commit('SET_ERROR_MESSAGE', { errorMessage, user });
    }
    
    if (Array.isArray(postsResponse) && postsResponse.length > 0) {
      
      for (let i = 0; i < postsResponse.length; i++) {
        let post = postsResponse[i];
    
        // Check if it's a reply by examining targetSocialPersonaId and targetPostHash
        if (post.targetSocialPersonaId && post.targetPostHash) {
          Replies.push(post);
        } else {
          Posts.push(post);
        }
      }
    
      commit('GET_SOCIAL_PERSONA_POST_FROM_STORAGE', Posts);
      await dispatch('socialPersonas/getSocialPersonasPostsFromStorage', Posts, { root: true });
      commit('GET_SOCIAL_PERSONA_POST_REPLIES_FROM_STORAGE', Replies);
      await dispatch('socialPersonas/getRepliesToPostInStorage', Replies, { root: true });
    }
    else {
      if (postsResponse !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, 15000));
       // console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.handle);
       // console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.originSocialPersonaId);
        
          
        const postsResponse =  await timeline({ originSocialPersonaId: selectedSocialPersona.originSocialPersonaId });
        await dispatch('loadPosts', postsResponse)
      }
    }
  },
  async loadOtherPersonaPosts({ commit, dispatch }, { eventsResponse, persona }) {
    let id = persona.originSocialPersonaId
    let Posts = [];
    let Replies = [];

    console.log('post response in social entities modules', eventsResponse);
    if (eventsResponse === '[]') {
      let message = 'Waiting for a Network Node to process your Request';
      return message;
    }
    
    if (eventsResponse === undefined) {
      
      let errorMessage = 'Social Entity sending the Query is unrelated to a User Profile.'
      console.log(errorMessage)
     // commit('SET_ERROR_MESSAGE', { errorMessage, id })
    }
    
    if (Array.isArray(eventsResponse) && eventsResponse.length > 0) {
      
      for (let i = 0; i < eventsResponse.length; i++) {
        let post = eventsResponse[i];
    
        // Check if it's a reply by examining targetSocialPersonaId and targetPostHash
        if (post.targetSocialPersonaId && post.targetPostHash) {
          Replies.push(post);
        } else {
          Posts.push(post);
        }
      }
    
      commit('GET_SOCIAL_PERSONA_POST_FROM_STORAGE', Posts);
      await dispatch('socialPersonas/getSocialPersonasPostsFromStorage', Posts, { root: true });
      commit('GET_SOCIAL_PERSONA_POST_REPLIES_FROM_STORAGE', Replies);
     // await dispatch('socialPersonas/getRepliesToPostInStorage', Replies, { root: true });
    }
    else {
      if (eventsResponse !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, 15000));
       // console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.handle);
       // console.log('CALLING GET POST in social entities WITH', selectedSocialPersona.originSocialPersonaId);
        
          
        const postsResponse =  await timeline({ originSocialPersonaId: id });
        await dispatch('loadPosts', postsResponse)
      }
    }
  },
   //ADD POST
  async addSocialPersonasPostToStorage({ commit, dispatch }, newPost) {
   
    let body = newPost
    let newPostResponse
     console.log('New Post in the post module:', body);
   // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
     
    newPostResponse = await createPost(body);
      
    console.log('New post response:', newPostResponse)
      if (newPostResponse.statusText === "OK") {
        console.log('Post sent and stored:', body);
      //dispatch('getSocialPersonasPostsFromStorage')
    }
    // Update the state with the updated social persona
    //commit('ADD_SOCIAL_PERSONA_POST_TO_STORAGE', { newPost, newPostResponse });

    return newPostResponse; // Return the response
  } catch (error) {
    console.log(error)
  }
  },
  //EDIT POST
  async editPost({ commit, dispatch }, editedPost) {
    console.log('New State properties:', editedPost);
    
    try {
      if (editedPost) {
        const newPostResponse = await dispatch('socialEntities/addSocialPersonasPostToStorage', editedPost, { root: true });
        commit("EDITED_POST", { editedPost, newPostResponse });
        return {
          editedPost
        };
      }
    } catch (e) {
      console.error(e);
      throw e; // Rethrow the error to handle it in the calling context
    }
  },
  //REMOVE POST
  async removePostInStorage({ commit, state, dispatch }, postToBeRoved) {
   // Call the API endpoint to update the social persona with the provided ID using the provided data
   try {
     
     let body = postToBeRoved
   
     console.log('You have reach the socialEntities removePostInStorage, you going to API endpoint from here: ', body)
     let removePostResponse = await removePost(body);

     console.log('You have removePostResponse: ', removePostResponse)
       /* 
     if(removePostResponse.statusText === "OK") {
       dispatch('getSocialPersonasPostsFromStorage' )
     }

     
     
     // Update the state with the updated social persona
     commit('UPDATE_SOCIAL_PERSONA', body);*/
   } catch(error) {
     console.log(error)
   }
  },
//______________________REPLIES__________________________// 
  
  // FETCH REPLIES
  async  getRepliesToPostInStorage({commit, dispatch}, socialPersonas) {

    const loadReplies = async (repliesResponse) => {
    console.log(' post response in social entities modules', repliesResponse );

    if (Array.isArray(repliesResponse) && repliesResponse.length > 0) {
      let Replies = [];
      for (let i = 0; i < repliesResponse.length; i++) {
        let repliesList = repliesResponse[i];
        Replies.push(repliesList);
      }

      commit('GET_SOCIAL_PERSONA_POST_REPLIES_FROM_STORAGE', Replies);
      await dispatch(
        'socialPersonas/getRepliesToPostInStorage',
        Replies,
        { root: true }
      );
    } else {
      await new Promise(resolve => setTimeout(resolve, 15000));
      await loadReplies(await getReplies());
    }
  }

    const repliesResponse = await getReplies();
    console.log('Replies Response:', repliesResponse)
  await loadReplies(repliesResponse);
  },
  //ADD NEW REPLY
  async  addReplysToPostInStorage({ commit }, newReply) {
    // Call the API endpoint to update the social persona with the provided ID using the provided data
    try {
     let body = newReply

     console.log('You have reach the socialEntities updateSocialPersona, you going to API endpoint from here:', newReply)
     let newReplyResponse = await createReply(body);
     
     console.log('New Reply response:', newReplyResponse)
     // Update the state with the updated social persona
     commit('ADD_REPLY_TO_SOCIAL_PERSONA_POST_IN_STORAGE', newReplyResponse.data);
   } catch(error) {
     console.log(error)
   }
  },
//______________________SHARE & LIKE ___________________________//
  //REPOST
  async addRepost({commit, dispatch}, rePost) {
    try{
      if(rePost) {
        let body = rePost
        console.log('You are REPOSTING')
        let repostResponse = await createRepost(body)

        console.log('New Repost Response', repostResponse)
        commit('ADD_REPOST_RESPONSE', repostResponse)
      }
    } catch(e) {
      console.error(e)
    }
    commit('ADD_REPOST', rePost)
    return rePost
  },
  //ADD REACTION
  async addReaction({commit, dispatch}, newReaction) {
    try {
      if(newReaction) {
        let body = newReaction
        console.log('You are REACTING TO A POST')
        let postReactionResponse = await createReaction(body)

        console.log('New Repost Response', postReactionResponse)
      //  commit('ADD_REACTION_RESPONSE', postReactionResponse)
      }
    } catch(e) {
      console.error(e)
    }
   // commit('ADD_REATCTION', newReaction)
    return postReactionResponse
  },
  //REMOVE REACTION
  async removeReaction({commit, dispatch}, removeReaction) {
    try {
      if(removeReaction) {
        let body = newReaction
        console.log('REMOVING YOUR REACTION FROM SERVER')
        let removePostReactionResponse = await deleteReaction(body)

        console.log('New Repost Response', removePostReactionResponse)
        commit('REMOVE_REACTION_RESPONSE', removePostReactionResponse)
      }
    } catch(e) {
      console.error(e)
    }
    commit('REMOVE_REACTION', removeReaction)
    return removeReaction
  },
  //ADD VIEWER
  async addView({commit, dispatch}, newViewer) {
    try {
      if(newViewer) {
        let body = newViewer
        console.log('You are REPOSTING')
        let postViewerResponse = await createNewViewer(body)

        console.log('New Repost Response', postViewerResponse)
        commit('REMOVE_REACTION_RESPONSE', postViewerResponse)
      }
    } catch(e) {
      console.error(e)
    }
    commit('ADD_VIEW', newViewer)
    return newViewer
  },
  //SHARE POST COUNT
  async sharePost({commit, dispatch}, newShare) {
    try {
      if(newShare) {
        let body = newShare
        console.log('You are REPOSTING')
        let sharePostResponse = await createPostShared(body)

        console.log('New Repost Response', sharePostResponse)
        commit('REMOVE_REACTION_RESPONSE', sharePostResponse)
      }
    } catch(e) {
      console.error(e)
    }
    commit('ADD_SHARE', newShare)
    return newShare
  }, 

}

const getters = {
   // addSocialPersonasPostToStorage: state => state.addSocialPersonasPostToStorage,
  //  addSocialPersonaReplyToStorage: state => state.addSocialPersonaReplyToStorage,

    getSocialPersonasPostsFromStorage: state => state.getSocialPersonasPostsFromStorage,
    getRepliesToPostInStorage: state => state.getRepliesToPostInStorage,

    otherUserSocialPersonaPosts: state => state.otherUsersSocialPersonaPost,
    otherUserSocialPersonaReplies: state => state.otherUsersSocialPersonaReplies,
}

const mutations = {
    
  GET_SOCIAL_PERSONA_POST_FROM_STORAGE(state, Posts) {
    state.getSocialPersonasPostsFromStorage = Posts 
  },

  GET_SOCIAL_PERSONA_POST_REPLIES_FROM_STORAGE(state, Replies) {
    state.getRepliesToPostInStorage = Replies ;
  },
}

export const posts = {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
  }
