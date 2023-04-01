import { configureStore, createSlice } from '@reduxjs/toolkit'

import connSlice from '@/store/conn'
import userSlice from '@/store/user'
import appSlice from '@/store/app'

const counterSlice = createSlice({
    name: 'counter',
    initialState: { value: 0 },
    reducers: {
        increment: state => {
            state.value += 1
        },
        incrementByAmount: (state, action) => {
            state.value += action.payload
        }
    }
})

// redux-toolkit: https://redux-toolkit.js.org/usage/immer-reducers
const store = configureStore({
    reducer: {
        counter: counterSlice.reducer,
        conn: connSlice.reducer,
        user: userSlice.reducer,
        app: appSlice.reducer,
    }
})

export default store
export const { increment, decrement, incrementByAmount } = counterSlice.actions
