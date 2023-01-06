import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import { Progress, Icon } from '@nutui/nutui-react-taro';
import './index.scss'
import Taro from '@tarojs/taro';

// UI: https://nutui.jd.com/react/#/zh-CN/component/button

export default class Index extends Component {
  componentDidMount () {
    
  }

  componentWillUnmount () { }

  componentDidShow () { }

  componentDidHide () { }

  render () {
    return (
      <View className='index'>
        <Text onClick={Taro.navigateTo({url: '/pages/login/login'})}>Hello Dear!</Text>
        <Icon name="dongdong"></Icon>
        <Progress percentage="33" />
      </View>
    )
  }
}
