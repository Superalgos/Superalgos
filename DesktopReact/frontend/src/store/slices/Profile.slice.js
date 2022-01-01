import {createSlice} from '@reduxjs/toolkit'

export const ProfileSlice = createSlice({
    name: 'profile',
    initialState: {
        name: '',
        username: '',
        profilePic: '',
        bannerPic: '',
        bio: '',
        web: '',
        joined: '',
        location: '',
        userProfileId: ''
    },
    reducers: {
        setProfile: (state, action) => {
            console.log(action.payload)
            Object.assign(state, action.payload);
        },
    },
})

// Action creators are generated for each case reducer function
export const {setProfile} = ProfileSlice.actions

export default ProfileSlice.reducer


