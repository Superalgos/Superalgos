import {configureStore} from '@reduxjs/toolkit';
import ExampleReducer from './slices/Example.slice'
import PostReducer from './slices/post.slice'
import SuggestedUsersReducer from './slices/suggestedUsers.slice'
import ProfileReducer from './slices/Profile.slice'

export default configureStore({
    reducer: {
        example: ExampleReducer,
        post: PostReducer,
        suggestedUsers: SuggestedUsersReducer,
        profile: ProfileReducer
    }
})
