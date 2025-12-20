import { createSlice } from "@reduxjs/toolkit"

const appLoadingSlice = createSlice({
    name: 'appLoadingSlice',
    initialState: {
        appLoading: false
    },
    reducers: {
        appLoadStart: (state) => {
            state.appLoading = true
        },
        appLoadStop: (state) => {
            state.appLoading = false
        }
    }
})

export const { appLoadStart, appLoadStop } = appLoadingSlice.actions

export const getAppLoadingSlice = state => state.appLoadingSlice

export default appLoadingSlice.reducer