import { configureStore } from '@reduxjs/toolkit'
import appLoadingSlice from './slices/appLoadingSlice'
import userDetailsSlice from './slices/userDetailsSlice'
import messagesSlice from './slices/messagesSlice'

const store = configureStore({
    reducer: {
        appLoadingSlice,
        userDetailsSlice,
        messagesSlice
    }
})

export default store