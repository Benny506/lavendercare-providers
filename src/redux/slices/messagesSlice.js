import { createSlice } from "@reduxjs/toolkit";

const messagesSlice = createSlice({
    name: 'messagesSlice',
    initialState: {
        channelIds: {}
    },
    reducers: {
        setChannelIds: (state, action) => {
            if(action.payload?.channelId){
                const { channelId, messages } = action.payload

                state.channelIds = {
                    ...state.channelIds,
                    [channelId]: messages || []
                }
            }
        },

        clearSavedMsgs: (state) => {
            state.channelIds = {}
        },
    }
})

export const { setChannelIds, clearSavedMsgs } = messagesSlice.actions

export const getMessages = state => state.messagesSlice

export default messagesSlice.reducer