import {createSlice} from '@reduxjs/toolkit'

export const ExampleSlice = createSlice({
    name: 'example',
    initialState: {
        exampleName: '',
        token: ''
    },
    reducers: {
        exampleAction: (state, action) => {
            state.userName = action.payload;
        },
    },
})

// Action creators are generated for each case reducer function
export const {exampleAction} = ExampleSlice.actions

export default ExampleSlice.reducer


