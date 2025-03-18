const state = {
    isLocalStorageEnabled: false,
    key: 'my-app-state',
  }
  
  const mutations = {
    SET_LOCAL_STORAGE_STATUS(state, status) {
      state.isLocalStorageEnabled = status
    },
    SET_SAVED_STATE(state, savedState) {
        Object.keys(savedState).forEach((key) => {
          state[key] = savedState[key];
        });
      },
  }
  
  const actions = {
    checkLocalStorageSupport({ commit }) {
      try {
        const key = '__test__'
        localStorage.setItem(key, key)
        localStorage.removeItem(key)
        commit('SET_LOCAL_STORAGE_STATUS', true)
      } catch (e) {
        commit('SET_LOCAL_STORAGE_STATUS', false)
      }
    },
    saveStateToLocalStorage({ state, rootState }, newSocialPersonaState) {
        const updatedState = { ...rootState };
        updatedState.socialPersonas.newSocialPersonaState = newSocialPersonaState;
        localStorage.setItem(state.key, JSON.stringify(updatedState));
      },
      
    
  }
  
  export const localStorageModule = {
    namespaced: true,
    state,
    mutations,
    actions
  }
