
import { createStore } from 'vuex'

export default createStore({
  state: {
    newPost: false,
    profile: {
      id: '2',
      username: 'theblockchainarborist',
      followers: 2,
      following: 5,
    },
    posts: [
      {
        post: {
          postID: 1,
          username: "theblockchainarborist",
          dateTime: "12-3-2022 5:12pm",
          message: "Test1 Message Here For Testing Purposes!",
          comments: [
            {
              username: "TestUser",
              postID: 1,
              commentID: 1,
              dataTime: "12-4-2022 7:12am",
              comment: "This here is a comment on a post. In fact its not just a comment on any post, its a comment on post #1 !"
            },
            {
              username: "TestUser2",
              postID: 1,
              commentID: 2,
              dataTime: "12-4-2022 9:12am",
              comment: "This here is a comment on a post. In fact its not just a comment on any post, its a comment on post #1 !"
            }
          ],
          likes: ["user", "user", "user", "user"]
          }
      },
      {
        post: {
          postID: 2,
          username: "theblockchainarborist",
          dateTime: "12-3-2022 6:12pm",
          message: "Test2 Message Here For Testing Purposes!",
          comments: [
            {
              username: "TestUser",
              postID: 2,
              commentID: 3,
              dataTime: "12-4-2022 6:12am",
              comment: "This here is a comment on a post. In fact its not just a comment on any post, its a comment on post #2 !"
            }
          ],
          likes: ["theblockchainarborist"]
          }
      },
      {
        post: {
          postID: 3,
          username: "theblockchainarborist",
          dateTime: "12-3-2022 7:12pm",
          message: "Test3 Message Here For Testing Purposes!",
          comments: [],
          likes: []
          }
      },
      {
        post: {
          postID: 4,
          username: "theblockchainarborist",
          dateTime: "12-3-2022 8:12pm",
          message: "Test4 Message Here For Testing Purposes! OK greak so how far will this go until its toooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo Longg is this the spot? I sure hope not. Maybe maybe Probably not? A little further we will check to see whats up with this gibrish I'm typing here. Spelling errors and all. Important part here is - This is a post. A post with some content, a post with some words, a post with some information. This is also a post that you can't like. You can't reply to yet. You can't repost it - noo sir-ree.",
          comments: [],
          likes: []
          }
      },
      {
        post: {
          postID: 5,
          username: "theblockchainarborist",
          dateTime: "12-5-2022 7:12pm",
          message: "Test5 Message Here For Testing Purposes!",
          comments: [],
          likes: []
          }
      }
    ],
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
      state.posts.unshift(post)
    }
  },
  actions: {
  },
  modules: {
  }
})
