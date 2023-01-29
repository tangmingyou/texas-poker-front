import React, { Component, useState } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useSelector, useDispatch } from 'react-redux'

import './lobby.scss'
import { navigateTo } from '@/utils/application'
import { increment } from '@/store/index'
import { fetchOpMap, fetchLobbyView } from '@/api/api'
import Title from '@/components/title'
import coin1 from '@/assets/coin-1.png'
import tabQuestion from '@/assets/tab-question.svg'
import tabX from '@/assets/tab-x.svg'

function Lobby() {
  const count = useSelector((state) => state.counter.value)
  const user = useSelector((state) => state.user)
  console.log(user)
  const dispatch = useDispatch()
  fetchLobbyView()
    .then(res => {
      console.log('lobby', res)
    })
    .catch(err => {
      console.error(err)
    })

  const avatar = "https://img0.baidu.com/it/u=2477829979,2171947490&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500";

  const circleEle = [1,2,3,4,5,6,7];
  const circleElePos = [{x:16,y:8},{x:70,y:-3},{x:110,y:28},{x:115,y:70},{x:80,y:105},{x:20,y:100},{x:-2,y:60}];

  return (
    <View>
      <Title title={"Lobby!!" + count} bgColor={true}  />
      <View className="celling"></View>
      <View className="tab">
        <View className="tab-wrap">
          <View className="circle-wrap">
            <View className="circle-inner"><Image className="inner-coin" src={coin1} /></View>
            {
              circleEle.map((_, idx) => (
                <View key={idx} className="circle-item" style={{
                  position: 'absolute',
                  left: Taro.pxTransform(circleElePos[idx].x),
                  top: Taro.pxTransform(circleElePos[idx].y)
                }}>
                  <Image className="circle-avatar" src={idx === 5 ? tabQuestion : idx === 6 ? tabX : avatar} />
                </View>
              ))
            }
          </View>
          <View className="tab-no-wrap">
            <View className="tab-no">#10013</View>
            <View className="tab-sc">5/7</View>
          </View>
        </View>

        <View className="tab-wrap">
          <View className="circle-wrap">
            <View className="circle-inner"><Image className="inner-coin" src={coin1} /></View>
            {
              circleEle.map((_, idx) => (
                <View key={idx} className="circle-item" style={{
                  position: 'absolute',
                  left: Taro.pxTransform(circleElePos[idx].x),
                  top: Taro.pxTransform(circleElePos[idx].y)
                }}>
                  <Image className="circle-avatar" src={idx === 5 ? tabQuestion : idx === 6 ? tabX : avatar} />
                </View>
              ))
            }
          </View>
          <View className="tab-no-wrap">
            <View className="tab-no">#10013</View>
            <View className="tab-sc">5/7</View>
          </View>
        </View>

        <View className="tab-wrap">
          <View className="circle-wrap">
            <View className="circle-inner"><Image className="inner-coin" src={coin1} /></View>
            {
              circleEle.map((_, idx) => (
                <View key={idx} className="circle-item" style={{
                  position: 'absolute',
                  left: Taro.pxTransform(circleElePos[idx].x),
                  top: Taro.pxTransform(circleElePos[idx].y)
                }}>
                  <Image className="circle-avatar" src={idx === 5 ? tabQuestion : idx === 6 ? tabX : avatar} />
                </View>
              ))
            }
          </View>
          <View className="tab-no-wrap">
            <View className="tab-no">#10013</View>
            <View className="tab-sc">5/7</View>
          </View>
        </View>

        <View className="tab-wrap"></View>
      </View>
      <View className="bottom-btn-wrap">
        <Button className="bottom-btn" onClick={() => navigateTo({url: '/pages/new_table/new_table'})}>Create New Table</Button>
      </View>
    </View>
  )
}

export default Lobby
