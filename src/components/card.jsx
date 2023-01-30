import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import cnames from 'classnames'

import './style/card.scss'
import suit0Icon from '@/assets/icon/suit-0.svg'
import suit1Icon from '@/assets/icon/suit-1.svg'
import suit2Icon from '@/assets/icon/suit-2.svg'
import suit3Icon from '@/assets/icon/suit-3.svg'
import cardBack1 from '@/assets/card-back-1.svg'
import cardBack2 from '@/assets/card-back-2.svg'
import cardBack3 from '@/assets/card-back-3.svg'

const suits = [suit0Icon, suit1Icon, suit2Icon, suit3Icon];
const dots = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

function Card(props) {
  const {w, h, dot, suit} = props;
  // dot == -1 牌背面 dot == -2 弃牌背面
  const width = Taro.pxTransform(w || 42);
  const height = Taro.pxTransform(h || 58);
  return (
    <View className={cnames("card", {'card-border': dot >= 0})} style={{width, height}}>
      {
        dot < 0 ? <Image style={{width, height}} src={dot === -1 ? cardBack1 : dot === -2 ? cardBack2 : cardBack3} /> : (
          <View>
            <View className="dot" style={{
              lineHeight: Taro.pxTransform(w / 3),
              left: Taro.pxTransform(w / 8),
            }}>
              <Text style={{
                color: suit % 2 === 0?'#FF4A0E':'#000', fontSize: Taro.pxTransform(w / 3)
              }}>{dots[dot || 0]}</Text>
            </View>
            <View className="suit-wrap">
              <Image className="suit" src={suits[suit || 0]} style={{
                height: Taro.pxTransform((w || 42) / 2.3333)
              }}/>
            </View>
          </View>
        )
      }
    </View>
  )
}

export default Card
