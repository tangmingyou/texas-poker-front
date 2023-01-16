import React, { Component, useState } from 'react'
import { View, Text, Image } from '@tarojs/components'
import { useSelector } from 'react-redux'
import cnames from 'classnames'

import './table.scss'
import Title from '@/components/title'
import Card from '@/components/card'
import coinIcon from '@/assets/icon/coin-1.svg'

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
    </View>
  )
}

export default Table
