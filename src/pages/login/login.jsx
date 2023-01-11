import React, { Component, useState } from 'react'
import {View, Text} from '@tarojs/components'
import { Progress } from '@nutui/nutui-react-taro';
import { Form, Input, TextArea, Cell, Button, Row, Col, Image } from '@nutui/nutui-react-taro';
import { message } from '../../compiled'

import './login.scss'

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
  // console.log(message)

    const [state, setState] = useState({
      username: '',
      password: '',
      captcha: '',
    });
    const [capatcha, setCapatcha] = useState({
      origin: "http://localhost:7788/app/captcha",
      src: "http://localhost:7788/app/captcha",
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
    }
    return (
      <View className='login'>
        <Text>Hello Login Page!</Text>
        <Progress percentage="33" />
        <Row>
          <Col span="4"></Col>
          <Col span="20"><Input name="username" type="text" defaultValue={state.username}  placeholder="文本" leftIcon="dongdong"
            onChange={usernameChange}/></Col>
        </Row>
        <View className='input-1'>
          <Input name="password" type="password" defaultValue={state.password}  placeholder="文本" 
            onChange={passwordChange}/>
        </View>
        <View className='input-1'>
          <Image src={capatcha.src} width="107" height="36" onClick={() => setCapatcha({...capatcha, src: capatcha.origin + '?t=' + Math.random()})} />
        </View>
        <View className='input-1'>
          <Button type="primary" style={{width: '160px'}} onClick={handleSubmit}>提交</Button>
        </View>
      </View>
    )
}

export default Login