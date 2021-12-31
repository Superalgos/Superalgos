
import { configureStore } from '@reduxjs/toolkit';
import ExampleReducer from './slices/Example.slice'
import PostReducer from './slices/post.slice'
import SuggestedUsersRedcuer from './slices/suggestedUsers.slice'

export default configureStore({
    reducer:{
        example: ExampleReducer,
        post: PostReducer,
        suggestedUsers: SuggestedUsersRedcuer
    }
  })
