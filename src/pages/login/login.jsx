import React, { useState } from 'react'
import { View, Text, Input, Image, Button, Label } from '@tarojs/components'
import Taro from '@tarojs/taro';
// import { useDispatch } from 'react-redux';
// import { setRouteName } from '@/store/app';
//import { Progress } from '@nutui/nutui-react-taro';
//import { Form, Input, TextArea, Cell, Button, Row, Col, Image } from '@nutui/nutui-react-taro';
import ws from '@/api/websocket'
import './login.scss'
import { doLogin, fetchOpMap, fetchRouteWs } from '@/api/api'
import { redirectTo, showToast } from '@/utils/application'
import iconUser from '@/assets/icon/user-3-fill.svg'
import iconLock from '@/assets/icon/lock-2-fill.svg'
import iconGithub from '@/assets/icon/github.svg'
import abIcon from '@/assets/icon/a-b.svg'
import { removeStorage, setStorage } from '@/utils/storage';

/*
  登录 -> 大厅 -> 新桌面 -> 进桌面 -> profile(弹窗)
*/
function Login() {
    // useDispatch()(setRouteName('login'));

    const [state, setState] = useState({
      username: '',
      password: '',
      captcha: '',
    });
    const [captcha, setCaptcha] = useState({
      origin: "/api/auth/captcha",
      src: "/api/auth/captcha",
    });
    const [submitLoding, setSubmitLoding] = useState(false)

    const handleSubmit = async () => {
      if (submitLoding) { return; }
      setSubmitLoding(true);

      //const token = "AgOjcdf3goeYDX3lwWWwkXtVpcrL-l2rX8csrRKgs3_-BC3JOx0l6nZU0MV25eIn"
      try {
        const [tokenRes, opMapRes] = await Promise.all([doLogin(state), fetchOpMap()]);
        removeStorage('_t');
        setStorage('_t', tokenRes.data.token);
        const wsRes = await fetchRouteWs();
        // 初始化 websocket 连接
        const res = await ws.init(opMapRes.data, wsRes.data);
        console.log('ws login success:', res)
        showToast({title: tokenRes.msg || '登录成功', duration: 800});
        // 重定向到大厅
        setTimeout(() => redirectTo({url: '/pages/lobby/lobby'}), 800);
      }catch(err) {
        showToast({icon: 'error', title: err})
      } finally {
        setSubmitLoding(false);
      }
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
              onChange={e => setState({...state, username: e.target.value})}/>
        </View>
        <View className='input-wrap'>
          <Image className='input-icon' src={iconLock} />
          <Input className='input-1' name="password" type="password" password={true} defaultValue={state.password}  placeholder="password"
            onChange={e => setState({...state, password: e.target.value})}/>
        </View>
        <View className='input-wrap' style={{display: 'none'}}>
          <Image className='input-icon' src={abIcon} />
          <Input className='input-2' name="captcha" type="text" defaultValue={state.password}  placeholder="captcha"
            onChange={e => setState({...state, captcha: e.target.value})}/>
          <Image className='captcha' src={captcha.src} width="107" height="36"
            onClick={() => setCaptcha({...captcha, src: captcha.origin + '?t=' + Math.random()})} />
        </View>
        <View className="submit-btn-wrap">
          <Button className='submit-btn' loading={submitLoding} onClick={handleSubmit}>START</Button>
        </View>
        <View className="footer-wrap">
          <View className='footer-line'><Text className='title-3'>新用户自动注册</Text></View>
          <View className='footer-line'><Text className='title-3'>{'【仅供娱乐禁止赌博】'}</Text></View>
          <a className='footer-line footer-line-github' href='https://github.com/tangmingyou/texas-poker-bk' target="_blank">
            <Image className="footer-github" src={iconGithub} />
            <Text className='title-3'>github</Text>
          </a>
        </View>
        <View style={{display: 'none'}}>
          <Button type="primary" style={{width: '160px'}} onClick={handleSubmit}>提交</Button>
          <Button type="primary" style={{width: '160px'}} onClick={() => {Taro.navigateTo({url:'/pages/lobby/lobby'})}}>跳转</Button>
        </View>
      </View>
    )
}

export default Login
