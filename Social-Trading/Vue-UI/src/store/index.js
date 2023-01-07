
import { createStore } from 'vuex'

export default createStore({
  state: {
    newPost: false,
    showCreateProfile: false,
    showProfile: false,
    profile: {
      blockchainAccount: undefined,
      nodeCodeName: undefined,
      nodeId: undefined,
      userProfileHandle: undefined,
      userProfileId: undefined,
      profileImg: 'https://raw.githubusercontent.com/theblockchainarborist/Social_Trading_App/main/Images/Profile_Picture.png',
      followers: 2,
      following: 5,
    },
    posts: [],
    followers: [{username: "theblockchainarborist"},
                {username: "quantum8"},
                {username: "harrel"},
                {username: "Luis"},
                {username: "Nuno"},
                {username: "Julian"},
                {username: "tigers4242"},
                {username: "vraptor75011"},
                {username: "Alex-White"},
                {username: "Gary"}],
    
    following: [{username: "theblockchainarborist"},
                {username: "quantum8"},
                {username: "harrel"},
                {username: "Luis"},
                {username: "Nuno"},
                {username: "Julian"},
                {username: "vraptor75011"}]
  },
  getters: {
    post(state) {
      let thisPost = state.books.find(p => p.postID == state.activePostID)
      return thisPost;
    }
  },
  mutations: {
    ADD_POST(state, post) {
      state.posts = post
    },
    ADD_PROFILE(state, data) {
      state.profile.blockchainAccount = data.blockchainAccount
      state.profile.nodeCodeName = data.nodeCodeName
      state.profile.nodeId = data.nodeId
      state.profile.userProfileHandle = data.userProfileHandle
      state.profile.userProfileId = data.userProfileId
    },
    SHOW_CREATE_PROFILE(state, show) {
      state.showCreateProfile = show;
    },
    SHOW_PROFILE(state, show) {
      state.showProfile = show;
    }
  },
  actions: {
  },
  modules: {
  }
})
