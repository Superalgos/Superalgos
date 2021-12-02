
import { configureStore } from '@reduxjs/toolkit';
import ExampleReducer from './slices/Globals'

export default configureStore({
    reducer:{
        example: ExampleReducer
    }
  })
