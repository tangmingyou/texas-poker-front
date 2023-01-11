import React, { Component, useState } from 'react'
import {View, Text} from '@tarojs/components'
import { Progress } from '@nutui/nutui-react-taro';
import { Form, Input, TextArea, Cell, Button, Row, Col, Image } from '@nutui/nutui-react-taro';
import { api } from '../../proto'

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
  console.log(api)

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
      // websocket test
      const ws = new WebSocket("ws://localhost:9999/ws")
      ws.binaryType = 'arraybuffer'
      ws.onopen = (e) => {
        // 连接后立即认证连接
        const token = "AgOjcdf3goeYDX3lwWWwkXtVpcrL-l2rX8csrRKgs3_-BC3JOx0l6nZU0MV25eIn"
        const req = api.ReqIdentity.create({token})
        const reqBuffer = api.ReqIdentity.encode(req).finish()
        const wrap = api.ProtoWrap.create({ver:1, op: 13578 + 3, seq:1, body: reqBuffer})
        const wrapBuffer = api.ProtoWrap.encode(wrap).finish()
        ws.send(wrapBuffer)
        console.log('send', req, wrap)
      }
      ws.onmessage = (e) => {
          console.log('msg:', e.data)
          const wrap = api.ProtoWrap.decode(new Uint8Array(e.data))
          const res = api.ResIdentity.decode(wrap.body)
          console.log(wrap.op, res)
      }
      ws.onerror = (a,b,c) => {
          console.log('error:', a, b, c)
      }
      ws.onclose = e => {
        console.log('close', e)
      }
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