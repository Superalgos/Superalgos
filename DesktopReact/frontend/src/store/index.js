
import { configureStore } from '@reduxjs/toolkit';
import ExampleReducer from './slices/Example.slice'
import PostReducer from './slices/post.slice'

export default configureStore({
    reducer:{
        example: ExampleReducer,
        post: PostReducer
    }
  })
