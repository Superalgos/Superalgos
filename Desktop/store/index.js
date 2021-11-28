
import { configureStore } from '@reduxjs/toolkit';
import ExampleReducer from './slices/Example.slice'

export default configureStore({
    reducer:{
        example: ExampleReducer
    }
  })
