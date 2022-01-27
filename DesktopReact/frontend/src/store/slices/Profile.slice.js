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
        },
        socialPersona: {
            nodeCodeName: '',
            nodeId: '',
            blockchainAccount: '',
            userProfileId: '',
            userProfileHandle: ''
        }

    },
    reducers: {
        setActualProfile: (state, action) => {
            Object.assign(state.actualUser, action.payload);
        },
        setOpenedProfile: (state, action) => {
            Object.assign(state.openedUser, action.payload);
        },
        setSocialPersona: (state, action) => {
            Object.assign( state.socialPersona, action.payload);
        }
    },
})

// Action creators are generated for each case reducer function
export const { setOpenedProfile, setActualProfile, setSocialPersona } = ProfileSlice.actions

export default ProfileSlice.reducer


