import { createSlice } from '@reduxjs/toolkit'

export const PostSlice = createSlice({
    name: 'post',
    initialState: {
      postsList:{},
      selectedPost:{}
    },
    reducers: {
      setPostList: (state, action) => {
        state.postsList = action.payload;
      },
      setSelectedPost:(state, action) => {
          state.selectedPost = action.payload
      }
    },
  })
  
  // Action creators are generated for each case reducer function
  export const { setPostList, setSelectedPost } = PostSlice.actions
  
  export default PostSlice.reducer


