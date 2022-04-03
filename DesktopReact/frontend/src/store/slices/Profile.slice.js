import {createSlice} from '@reduxjs/toolkit'
import {cleanObject} from "../../utils/helper";

/* TODO REMOVE HARDCODED VALUES*/
export const ProfileSlice = createSlice({
    name: 'profile',
    initialState: {
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
            Object.assign(state.actualUser, cleanObject(action.payload));
        },
        setSocialPersona: (state, action) => {
            Object.assign(state.socialPersona, action.payload);
        },
        setSelectedProfile: (state, action) => {
            Object.assign(state.selectedUser, cleanObject(action.payload));
        }
    },
})

// Action creators are generated for each case reducer function
export const {setActualProfile, setSocialPersona, setSelectedProfile} = ProfileSlice.actions

export default ProfileSlice.reducer


