import React, { Component, useState } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import { useSelector } from 'react-redux'
import cnames from 'classnames'

import './table.scss'
import Title from '@/components/title'
import Card from '@/components/card'
import coinIcon from '@/assets/icon/coin-1.svg'
import coin2Icon from '@/assets/icon/coin-2.svg'

function Table() {

  const {username, nickname, avatar} = useSelector(state => state.user);

  const players = [1, 2, 3, 4, 5, 6];
  const playerRows = players.reduce((arr, item, idx) => {
    const row = parseInt(idx / 2);
    let rowArr = arr[row] || [];
    rowArr[idx % 2] = { index: idx, item };
    arr[row] = rowArr;
    parseInt()
    return arr;
  }, []);

  return (
    <View className="tab">
      <Title title="GAME" />
      {
        playerRows.map((row, i) => (
          <View key={i} className="playerRow">
            {
              row.map((player, j) => (
                <View key={j} className="player-wrap">
                  <View className={cnames("player-no",{"player-no-running": player.index===1})}><Text>#{player.index}</Text></View>
                  <View className="card1"><Card w={42} h={48} dot={12} suit={2} /></View>
                  <View className="card2"><Card w={42} h={48} dot={12} suit={3} /></View>
                  <View className="player">
                    <View className="avatar-wrap"><Image className="avatar" src={avatar} /></View>
                    <View className="player-name"><Text>Player{player.item}</Text></View>
                  </View>
                  <View className="wallet-wrap">
                    <View className="wallet">
                      <View className="wallet-icon"><Image className="wallet-icon-img" src={coinIcon} /></View>
                      <View className="wallet-amount"><Text>3,000,000</Text></View>
                    </View>
                    <View className="pct"><Text>25%</Text></View>
                  </View>
                </View>
              ))
            }
          </View>
        ))
      }
      <View className="desktop-box">
        <View className="desktop-wrap">
          <View className="desktop-cards">
            {
              [1,2,3,4,5].map((item, i) => (
                <Card key={i} w={42} h={48} dot={12} suit={2} />
              ))
            }
          </View>
          <View className="desktop-wallet">
            <View className="d-wallet-icon">
              <Image className="d-wallet-icon-img" src={coinIcon} />
              <Text className="d-wallet-icon-text">POT</Text>
            </View>
            <View className="d-wallet-amount">22,088,000</View>
          </View>
        </View>
        <View className="chatbox" style={{display: 'none'}}>
          <View className='chat-window'>
            <View className="line">Kelly(#1)进入了游戏</View>
            <View className="line">Apollo(#2)进入了游戏</View>
          </View>
          <View className='chat-panel'>
            <View><Input name="chat" type="text" placeholder="" /></View>
            <View><Button>OK</Button></View>
          </View>
        </View>
      </View>

      <View className="self-box">
        <View className="self-wrap">
            <View className="hand-card1"><Card w={42} h={48} dot={12} suit={3} /></View>
            <View className="hand-card2"><Card w={42} h={48} dot={12} suit={3} /></View>
            <View className="hand-five">
            {
              [1,2,3,4,5].map((_, i) => (
                <View key={i} className="hand-five-item"><Card w={30} h={36} dot={12} suit={2} /></View>
              ))
            }
            </View>
            <View className="s-info-wrap">
              <View className="s-avatar"><Image className="s-avatar-img" src={avatar} /></View>
              <View className="s-username"><Text>Prometheus</Text></View>
            </View>
            <View className="s-wallet-wrap">
              <View className="s-w-amount-wrap">
                <View className="s-w-amount-icon"><Image className="s-w-amount-icon-img" src={coin2Icon}/></View>
                <View className="s-w-amount"><Text>3,000,000</Text></View>
              </View>
              <View className="s-w-pct"><Text>0%</Text></View>
            </View>
        </View>
      </View>
    </View>
  )
}

export default Table
