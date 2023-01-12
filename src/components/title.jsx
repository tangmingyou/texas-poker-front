import React from 'react'
import { View } from '@tarojs/components'
// import { AtIcon } from 'taro-ui'
import { Icon } from '@nutui/nutui-react-taro';
import { navigateBack } from '@/utils/application'
import './style/title.scss'

function Title(props) {
  return (
    <View>
      <View className={props.bgColor ? "page-top bgc" : "page-top"}>
        {/* <View className='topHeight'></View> */}
        <View className='page-title'>
          {
            props.nullBank ?
              <View className='blank'></View> :
              <Icon onClick={() => navigateBack()} className='icon' name='rect-left' color={props.colorStyle ? "#ffffff" : "#000000"} />
          }
          <View className={props.colorStyle ? "title" : "title1"}>{props.title}</View>
          <View className='blank'></View>
        </View>
      </View>
      {props.topNull ? '' : <View className='hidden'></View>}
    </View>
  )
}

export default Title
