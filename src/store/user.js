import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: 0,
    username: 'Prom',
    nickname: 'PromNick',
    avatar: '',
    defaultAvatar: 'https://img0.baidu.com/it/u=2477829979,2171947490&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
  },
  reducers: {
    setUserInfo: (state, {payload}) => {
      console.log('setUserInfo', state, payload)
      state.id = payload.id;
      state.username = payload.username;
      state.avatar = payload.avatar;
      // return {...state, ...action.payload}
    }
  }
})

export default userSlice

export const { setUserInfo } = userSlice.actions
