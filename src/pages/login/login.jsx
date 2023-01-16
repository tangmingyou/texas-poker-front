import React, { Component, useState } from 'react'
import { View, Text, Input, Image, Button, Label } from '@tarojs/components'
import Taro from '@tarojs/taro';
//import { Progress } from '@nutui/nutui-react-taro';
//import { Form, Input, TextArea, Cell, Button, Row, Col, Image } from '@nutui/nutui-react-taro';
import ws from '@/api/websocket'
import './login.scss'
import { fetchOpMap } from '@/api/api'
import iconUser from '@/assets/icon/user-3-fill.svg'
import iconLock from '@/assets/icon/lock-2-fill.svg'
import abIcon from '@/assets/icon/a-b.svg'

/*
  登录 -> 大厅 -> 新桌面 -> 进桌面 -> profile(弹窗)
*/
function Login(props, ref) {
  // protobuf
  // let msg = message.Proto.create({ver:1, seq:1, op: 1});
  // let buffer = message.Proto.encode(msg).finish();
  // console.log(buffer)
  // let decoded = message.Proto.decode(buffer);
  // console.log(decoded)

    const [state, setState] = useState({
      username: '',
      password: '',
      captcha: '',
    });
    const [captcha, setCaptcha] = useState({
      origin: "/api/auth/captcha", // http://localhost:9999
      src: "/api/auth/captcha",
    })
    const usernameChange = (username, e) => {
      if (!e) return;
      state.username = username;
      console.log(state.username)
    }
    const passwordChange = (password, e) => {
      if (!e) return;
      state.password = password;
      console.log(state.password)
    }
    const handleSubmit = () => {
      console.log('submit', state)
      const token = "AgOjcdf3goeYDX3lwWWwkXtVpcrL-l2rX8csrRKgs3_-BC3JOx0l6nZU0MV25eIn"
      fetchOpMap()
        .then(res => {
          console.log('opMap', res)
          ws.init(token, res.data)
        })
        .catch(err => {
          console.log('err', err)
        })

    }
    return (
      <View className='login'>
        <View className='ceiling'></View>
        <View className='title-line'><Text className='title-1'>Player</Text></View>
        <View className='title-line'><Text className='title-1'>Infomation</Text></View>
        <View className='title-line'><Text className='title-2'>Easily add new account or login the current one.</Text></View>
        {/* <Progress percentage="33" /> */}
        <View className='input-wrap'>
          <Label for="username"><Image className='input-icon' src={iconUser} /></Label>
          <Input className="input-1" id="username" name="username" type="text" defaultValue={state.username}  placeholder="account" leftIcon="dongdong"
              onChange={usernameChange}/>
        </View>
        <View className='input-wrap'>
          <Image className='input-icon' src={iconLock} />
          <Input className='input-1' name="password" type="password" password={true} defaultValue={state.password}  placeholder="password"
            onChange={passwordChange}/>
        </View>
        <View className='input-wrap'>
          <Image className='input-icon' src={abIcon} />
          <Input className='input-2' name="captcha" type="text" defaultValue={state.password}  placeholder="captcha"
            onChange={() => {}}/>
          <Image className='captcha' src={captcha.src} width="107" height="36"
            onClick={() => setCaptcha({...captcha, src: captcha.origin + '?t=' + Math.random()})} />
        </View>
        <View>
          <Button className='submit-btn'>START</Button>
        </View>
        <View style={{display: 'none'}}>
          <Button type="primary" style={{width: '160px'}} onClick={handleSubmit}>提交</Button>
          <Button type="primary" style={{width: '160px'}} onClick={() => {Taro.navigateTo({url:'/pages/lobby/lobby'})}}>跳转</Button>
        </View>
      </View>
    )
}

export default Login
