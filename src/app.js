import { Component } from 'react'
import SDK from 'sr-sdk-h5'

import { Provider } from 'react-redux'
import store from './store'

import './app.scss'
import  { getInstance, redirectTo } from '@/utils/application'
import { getStorage, removeStorage } from '@/utils/storage'
import websocket from '@/api/websocket'
import {fetchOpMap, fetchRouteWs} from '@/api/api'

// IOS Promise finally 兼容
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

/**
   * 有数埋点SDK 默认配置
   * 使用方法请参考文档 https://mp.zhls.qq.com/youshu-docs/develop/sdk/Taro.html
   * 如对有数SDK埋点接入有任何疑问，请联系微信：sr_data_service
   */

window.srt = new SDK({

  /**
   * 有数 - ka‘接入测试用’ 分配的 app_id，对应的业务
   */
  token: 'bi72fccc7184ef45f9',

  /**
   * 传入自定义的后台上报接口，若传入则token将无意义
   */
  // serverUrl: 'aaa.baidu.com',

  /**
   * 开启打印调试信息， 默认 false
   */
  debug: false,

  /**
   * 代理配置，自动代理页面浏览事件、页面离开事件、点击事件，默认 false。建议开启
   */
  autoTrack: false,

  /**
   * 自动开始上报，默认 true。建议开启
   */
  autoStart: false,

  /**
   * 上报返回的钩子函数，返回 false 则代表不通过，SDK不会清除本地记录，会继续重拾
   */
  // onUploaded?: () => {},

  /**
   * 跳过初始化时对  token 的必要检查
   * 满足场景：服务商转发SDK上报数据，在服务端回填appid，解决大量小程序同时接入的问题，默认false
   */
  // skipTokenCheck: false,

  /**
   * 小程序appid
   */
  appid: ''
});

// window.srt.setChan({chan_id: 'xxx'}) // 设置渠道，渠道信息将会被设置在props.chan对象中

// window.srt.setUser({user_id: 'xxx'}) // 设置用户信息，用户信息将会被设置在props.wx_user对象中

class App extends Component {
  componentDidMount() {
  }

  componentDidShow() {
    // console.log('instance', getInstance(), 'app mount')
    // 检查token是否存在
    const isLoginPage = getInstance().router.path.startsWith('/pages/login/login');
    const token = getStorage('_t');
    // console.log('token', isLoginPage, token)
    if (!token) {
      if (!isLoginPage) {
        setTimeout(() => redirectTo({url: '/pages/login/login'}), 500);
      }
    } else {
      // 尝试连接 websocket
      Promise.all([fetchOpMap(), fetchRouteWs()])
        .then(async ([opMapRes, wsRes]) => {
          const res = await websocket.init(opMapRes.data, wsRes.data);
          console.log('ws identity success:', res)
          // window.websocket = websocket;
          setTimeout(() => redirectTo({url: '/pages/lobby/lobby'}), 500);
        })
        .catch(err => {
          console.log('ws conn error:', err)
          removeStorage('_t')
          setTimeout(() => redirectTo({url: '/pages/login/login'}), 500)
        })
    }
  }

  componentDidHide() { }

  // this.props.children 是将要会渲染的页面
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    )

  }
}

export default App
