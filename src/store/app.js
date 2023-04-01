import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'conn',
  initialState: {
    routeName: '',
    menuVisible: false, // 是否显示title avatar下的menus
  },
  reducers: {
    setRouteName: (state, {payload}) => {
      state.routeName = payload
    },
    switchMenuVisible: state => {
      state.menuVisible = !state.menuVisible
    },
  }
})

export default appSlice

export const { setRouteName, switchMenuVisible } = appSlice.actions
