import React, { Component, useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { useSelector } from 'react-redux'

import './new_table.scss'
import Title from '@/components/title'
import userIcon from '@/assets/icon/user-2.svg'
import closeIcon from '@/assets/icon/close-1.svg'
import addIcon from '@/assets/icon/add-2.svg'

function NewTable() {
  const {username, nickname, avatar} = useSelector(state => state.user);

  const players = [1,2,3,4,5,6];
  const playerRows = players.reduce((arr, item, idx) => {
    const row = parseInt(idx / 2);
    let rowArr = arr[row] || [];
    rowArr[idx % 2] = {index: idx, item};
    arr[row] = rowArr;
    parseInt()
    return arr;
  }, []);

  return (
    <View className="nt">
      <Title title={"Create New Table"} />
      <View className="nt-wrap">
        {
          playerRows.map((row, i) => (
            <View key={i} className="playerRow">
              {
                row.map((player, j) => (
                  player.index === 5
                  ? <View key={j} className='player empty-player'><Image className="empty-icon" src={addIcon} /></View>
                  : <View key={j} className="player-wrap">
                    <View className="player-icon"><Image className="player-icon-img" src={userIcon} /></View>
                    <View className="close-icon"><Image className="close-icon-img" src={closeIcon} /></View>
                    <View className="player">
                      <Text className="player-name">Player{player.item}</Text>
                    </View>
                  </View>
                ))
              }
            </View>
          ))
        }

        <View className="self-wrap">
          <View className="self">
            <View className="avatar-wrap"><Image className="avatar" src={avatar} /></View>
            <View className="nickname"><Text>{nickname}</Text></View>
          </View>
        </View>
        <View className='submit-btn-wrap'>
          <Button className='submit-btn'>CREATE</Button>
        </View>
      </View>
    </View>
  )
}

export default NewTable
