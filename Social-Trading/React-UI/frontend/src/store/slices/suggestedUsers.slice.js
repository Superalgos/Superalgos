import {createSlice} from '@reduxjs/toolkit'

export const SuggestedUsersSlice = createSlice({
    name: 'suggestedUsers',
    initialState: {
        suggestedUsersList: [],
    },
    reducers: {
        setSuggestedUsersList: (state, action) => {
            state.suggestedUsersList = action.payload;
        },
    }
})

// Action creators are generated for each case reducer function
export const {setSuggestedUsersList, addSuggestedUsersList} = SuggestedUsersSlice.actions

export default SuggestedUsersSlice.reducer


