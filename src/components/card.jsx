import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import './style/card.scss'
import suit0Icon from '@/assets/icon/suit-0.svg'
import suit1Icon from '@/assets/icon/suit-1.svg'
import suit2Icon from '@/assets/icon/suit-2.svg'
import suit3Icon from '@/assets/icon/suit-3.svg'

const suits = [suit0Icon, suit1Icon, suit2Icon, suit3Icon];
const dots = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function Card(props) {
  const {w, h, dot, suit} = props;

  return (
    <View className="card" style={{width: Taro.pxTransform(w || 42), height: h || 58}}>
      <View className="dot"><Text style={{color: suit%2===0?'#FF4A0E':'#000'}}>{dots[dot || 0]}</Text></View>
      <View className="suit-wrap"><Image className="suit" src={suits[suit || 0]} /></View>
    </View>
  )
}

export default Card
