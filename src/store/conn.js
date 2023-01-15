import { createSlice } from '@reduxjs/toolkit';

const connSlice = createSlice({
  name: 'conn',
  initialState: {
    status: 0, // 连接状态,0未连接,1,已连接,2已关闭
    ttl: 0, // 延迟ms
  },
  reducers: {
    connected: state => {
      state.status = 1;
    },
    disconnect: state => {
      state.status = 2;
    },
    setTTL: (state, action) => {
      state.ttl = action.playload;
    }
  }
})

export default connSlice

export const { connected, disconnect, setTTL } = connSlice.actions
