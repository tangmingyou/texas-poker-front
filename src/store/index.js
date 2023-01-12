import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit'

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

const store = configureStore({
    reducer: {
        counter: counterSlice.reducer
    }
})

export default store
export const { increment, decrement, incrementByAmount } = counterSlice.actions
