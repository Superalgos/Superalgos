import {createSlice} from '@reduxjs/toolkit'

/* TODO REMOVE HARDCODED VALUES*/
export const ProfileSlice = createSlice({
    name: 'profile',
    initialState: {
        actualUser: {
            nodeCodeName: "Social-Persona-1",
            blockchainAccount: "0x0d0deC8B5d33A353Caf1F62b2772cEA93f63A703",
            userProfileId: "743fba6e-a3c9-4a84-9125-5cc45f219d6d",
            userProfileHandle: "Loui-Molina",
            nodeId: "f9217811-4742-452a-b195-519e24a2de41",
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
            nodeCodeName: "Social-Persona-1",
            blockchainAccount: "0x0d0deC8B5d33A353Caf1F62b2772cEA93f63A703",
            userProfileId: "743fba6e-a3c9-4a84-9125-5cc45f219d6d",
            userProfileHandle: "Loui-Molina",
            nodeId: "f9217811-4742-452a-b195-519e24a2de41",
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
        setActualProfile: (state, action) => {
            Object.assign(state.actualUser, action.payload);
        },
        setOpenedProfile: (state, action) => {
            Object.assign(state.openedUser, action.payload);
        }
    },
})

// Action creators are generated for each case reducer function
export const {setOpenedProfile, setActualProfile} = ProfileSlice.actions

export default ProfileSlice.reducer


