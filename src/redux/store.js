import { configureStore } from '@reduxjs/toolkit'
import appLoadingSlice from './slices/appLoadingSlice'
import userDetailsSlice from './slices/userDetailsSlice'
import messagesSlice from './slices/messagesSlice'

import subtleLoaderSlice from './slices/subtleLoaderSlice'

const store = configureStore({
    reducer: {
        appLoadingSlice,
        userDetailsSlice,
        messagesSlice,
        subtleLoaderSlice
    }
})

export default store