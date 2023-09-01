import { createStore } from 'vuex';

export default createStore({
  state: {
    /* Visibility Toggles */
    showCreateProfile: false,
    showProfile: false,
    showWallet: false,
    showSettings: false,
    showImageUploader: false,
    showEmojiPicker: false,
    showEmojiPickerNewPost: false,
    showUsersProfile: false,
    showPostComments: false,

    /* Task Triggers */
    updatingProfile: false,
    addProfileBanner: false,

    /* Data Storage */
    profile: {
      blockchainAccount: undefined,
      nodeCodeName: undefined,
      nodeId: undefined,
      userProfileHandle: undefined,
      userProfileId: undefined,
      profilePic: '',
      bannerPic: '',
      blockchainAccountWallet: '',
      balanceSA: undefined,
    },
    postCommentProps: undefined,
    postComments: undefined,
    selectedEmoji: undefined,
    emojiReactionKey: undefined,
    emojiOriginPostHash: undefined,
    usersProfileToOpen: undefined,
    headerProfileData: undefined,
    postImage: undefined,
    users: undefined,
    posts: [],
    followers: [],
    following: [],
    repostData: undefined
  },
  getters: {
    post(state) {
      let thisPost = state.books.find(p => p.postID == state.activePostID)
      return thisPost;
    }
  },
  mutations: {
    /* Visibility Toggles */
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
    SHOW_EMOJI_PICKER_NEW_POST(state, show) {
      state.showEmojiPickerNewPost = show;
    },
    SHOW_POSTS_COMMENTS(state, show) {
      state.showPostComments = show;
    },
    OPEN_USERS_PROFILE(state) {
      state.showUsersProfile = true;
    },
    CLOSE_USERS_PROFILE(state) {
      state.showUsersProfile = false;
    },
    /* Task Triggers */
    UPDATING_PROFILE(state, show) {
      state.updatingProfile = show;
    },
    ADD_PROFILE_BANNER(state, image) {
      state.profile.bannerPic = image;
    },
    /* Data Storage */
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
      state.profile.bannerPic = data.bannerPic
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
      state.users = userArray;
    },
    SET_USERS_PROFILE_TO_OPEN(state, profile) {
      state.usersProfileToOpen = profile;
    },
    SET_BLOCKCHAIN_ACCOUNT(state, blockchainAccount) {
      state.profile.blockchainAccountWallet = blockchainAccount;
    },
    SET_ACCOUNT_SA_BALANCE(state, balance) {
      state.profile.balanceSA = balance;
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
    // Store the props needed to display the selected posts Comments
    SET_POST_COMMENT_PROPS(state, postProps) {
      state.postCommentProps = postProps;
    },
    SET_POST_COMMENTS_ARRAY(state, comments) {
      state.postComments = comments;
    },
    SET_HEADER_PROFILE_DATA(state, profileData) {
      state.headerProfileData = profileData;
    },
    SET_ADD_PROFILE_BANNER(state, show) {
      state.addProfileBanner = show;
    },
    SET_EMOJI_REACTION_KEY(state, keyNum) {
      state.emojiReactionKey = keyNum;
    },
    SET_EMOJI_ORIGIN_POST_HASH(state, hash) {
      state.emojiOriginPostHash = hash;
    },
    // Store the repost information.
    ADD_REPOST_TEXT_NAME(state, repostData) {
      state.repostData = repostData;
    }
    
  },
  actions: {
  },
  modules: {
  }
})
