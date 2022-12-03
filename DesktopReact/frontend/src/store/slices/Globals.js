import {createSlice} from '@reduxjs/toolkit'

export const Globals = createSlice({
    name: 'globals',
    initialState: {
        UI: {
            projects: {},
            schemas: {projectSchema: undefined},
            environment: undefined,
            clientNode: undefined,
            webApp: undefined
        },
        SA: {projects: {}}
    },
    reducers: {
        exampleAction: (state, action) => {
            state.userName = action.payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const {exampleAction} = Globals.actions

export default Globals.reducer


