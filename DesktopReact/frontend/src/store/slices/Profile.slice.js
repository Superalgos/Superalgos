import {createSlice} from '@reduxjs/toolkit'

export const ProfileSlice = createSlice({
    name: 'profile',
    initialState: {
        actualUser: {
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
        openedUser: {
            name: '',
            username: '',
            profilePic: '',
            bannerPic: '',
            bio: '',
            web: '',
            joined: '',
            location: '',
            userProfileId: ''
        }
    },
    reducers: {
        setActualProfile: (state, action) => {
            Object.assign(state.actualUser, action.payload);
        },
        setOpenedProfile: (state, action) => {
            Object.assign(state.openedUser, action.payload);
        }
    },
})

// Action creators are generated for each case reducer function
export const {setOpenedProfile,setActualProfile} = ProfileSlice.actions

export default ProfileSlice.reducer


