import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import { navigateBack } from '@/utils/application'
import left from '@/assets/icon/left-1.svg'
import './style/title.scss'

import { useSelector } from 'react-redux'

function Title(props) {
  const {username, nickname, avatar} = useSelector(state => state.user);
  const { leftSolt, leftIcon, onLeftClick, rightSolt } = props;
  return (
    <View>
      <View className={props.bgColor ? "page-top bgc" : "page-top"}>
        {/* <View className='topHeight'></View> */}
        <View className='page-title'>
          {leftSolt || <Image className="icon" src={leftIcon || left} onClick={onLeftClick || navigateBack} />}
          <View className={props.colorStyle ? "title" : "title1"}><Text>{props.title}</Text></View>
          {rightSolt || <View className='blank'><Image className='avatar' src={avatar} /></View>}
        </View>
      </View>
      {props.topNull ? '' : <View className='hidden'></View>}
    </View>
  )
}

export default Title
