import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit'

import connSlice from '@/store/conn'

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
    }
})

export default store
export const { increment, decrement, incrementByAmount } = counterSlice.actions
