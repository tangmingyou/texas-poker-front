import { createSlice } from '@reduxjs/toolkit';

const connSlice = createSlice({
  name: 'conn',
  initialState: {
    status: 1, // 连接状态: 1已断开,2连接中,3已连接
    ttl: 0, // 延迟ms
  },
  reducers: {
    connecting: state => {
      state.status = 2
    },
    connected: state => {
      state.status = 3;
    },
    disconnect: state => {
      state.status = 4;
    },
    setTTL: (state, action) => {
      state.ttl = action.payload;
    }
  }
})

export default connSlice

export const { connecting, connected, disconnect, setTTL } = connSlice.actions
