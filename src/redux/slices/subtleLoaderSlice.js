import { createSlice } from '@reduxjs/toolkit'

const subtleLoaderSlice = createSlice({
  name: 'subtleLoader',
  initialState: { count: 0, isRefreshing: false, message: '' },
  reducers: {
    subtleLoadStart: (state, action) => {
      state.count += 1
      state.isRefreshing = true
      if (action?.payload) state.message = action.payload
    },
    subtleLoadStop: (state) => {
      state.count = Math.max(0, state.count - 1)
      state.isRefreshing = state.count > 0
      if (!state.isRefreshing) state.message = ''
    },
    resetSubtleLoader: (state) => {
      state.count = 0
      state.isRefreshing = false
      state.message = ''
    }
  }
})

export const { subtleLoadStart, subtleLoadStop, resetSubtleLoader } = subtleLoaderSlice.actions
export const getSubtleLoaderState = (state) => state.subtleLoader
export default subtleLoaderSlice.reducer
