import {createSlice} from '@reduxjs/toolkit'

/* TODO REMOVE HARDCODED VALUES*/
export const ProfileSlice = createSlice({
    name: 'profile',
    initialState: {
        socialPersona: {
            nodeCodeName: "",
            blockchainAccount: "",
            userProfileId: "",
            userProfileHandle: "",
            nodeId: "",
        },
        actualUser: {
            nodeCodeName: "",
            blockchainAccount: "",
            userProfileId: "",
            userProfileHandle: "",
            nodeId: "",
            name: '',
            username: '',
            profilePic: '',
            bannerPic: '',
            bio: '',
            web: '',
            joined: '',
            location: '',
        },
        selectedUser: {
            nodeCodeName: "",
            blockchainAccount: "",
            userProfileId: "",
            userProfileHandle: "",
            nodeId: "",
            name: '',
            username: '',
            profilePic: '',
            bannerPic: '',
            bio: '',
            web: '',
            joined: '',
            location: '',
        }
    },
    reducers: {
        setSocialPersona: (state, action) => {
            Object.assign(state.socialPersona, action.payload);
        },
        setActualProfile: (state, action) => {
            Object.assign(state.actualUser, action.payload);
        },
        setSelectedProfile: (state, action) => {
            Object.assign(state.selectedUser, action.payload);
        }
    },
})

// Action creators are generated for each case reducer function
export const {setSelectedProfile, setActualProfile, setSocialPersona} = ProfileSlice.actions

export default ProfileSlice.reducer


