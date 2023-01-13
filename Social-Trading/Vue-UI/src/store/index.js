
import { createStore } from 'vuex'

export default createStore({
  state: {
    showCreateProfile: false,
    showProfile: false,
    showWallet: false,
    showSettings: false,
    showImageUploader: false,
    showEmojiPicker: false,
    showUsersProfile: false,
    selectedEmoji: undefined,
    profile: {
      blockchainAccount: undefined,
      nodeCodeName: undefined,
      nodeId: undefined,
      userProfileHandle: undefined,
      userProfileId: undefined,
      profilePic: '',
      followers: 2,
      following: 5,
    },
    usersProfileToOpen: undefined,
    postImage: undefined,
    users: undefined,
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
      state.profile.profilePic = data.profilePic
    },
    SHOW_CREATE_PROFILE(state, show) {
      state.showCreateProfile = show;
    },
    SHOW_PROFILE(state, show) {
      state.showProfile = show;
    },
    SHOW_WALLET(state, show) {
      state.showWallet = show;
    },
    SHOW_SETTINGS(state, show) {
      state.showSettings = show;
    },
    SHOW_IMAGE_UPLOADER(state, show) {
      state.showImageUploader = show;
    },
    SHOW_EMOJI_PICKER(state, show) {
      state.showEmojiPicker = show;
    },
    SET_SELECTED_EMOJI(state, emoji) {
      state.selectedEmoji = emoji;
    },
    RESET_EMOJI(state) {
      state.selectedEmoji = undefined;
    },
    ADD_POST_IMAGE(state, image) {
      state.postImage = image;
    },
    SET_USER_ARRAY(state, userArray) {
      state.users = userArray
    },
    OPEN_USERS_PROFILE(state) {
      state.showUsersProfile = true;
    },
    CLOSE_USERS_PROFILE(state) {
      state.showUsersProfile = false;
    },
    SET_USERS_PROFILE_TO_OPEN(state, profile) {
      state.usersProfileToOpen = profile;
    },
    /* Updating Our Profile Information */
    UPDATE_NAME(state, name) {
      state.profile.name = name;
    },
    UPDATE_BIO(state, bio) {
      state.profile.bio = bio;
    },
    ADD_PROFILE_IMAGE(state, image) {
      state.profile.profilePic = image;
    },
  },
  actions: {
  },
  modules: {
  }
})
