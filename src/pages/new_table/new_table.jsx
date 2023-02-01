import React, { Component, useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Popup, Picker } from '@nutui/nutui-react-taro';
import { useSelector } from 'react-redux'

import { redirectTo } from '@/utils/application'
import './new_table.scss'
import Title from '@/components/title'
import { sendPromise } from '@/api/websocket'
import proto from '@/api/proto';
import { showToast } from '@/utils/application'
import userIcon from '@/assets/icon/user-2.svg'
import robotIcon from '@/assets/icon/robot-1.svg'
import closeIcon from '@/assets/icon/close-1.svg'
import addIcon from '@/assets/icon/add-2.svg'

const { ReqCreateTable } = proto.api

function NewTable() {
  const {username, nickname, avatar} = useSelector(state => state.user);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [choosingPlace, setChoosingPlace] = useState(-1);

  const [players, setPlayers] = useState([0,0,0,0,0,0]); // 0空位,1玩家,2机器人
  const playerRows = players.reduce((arr, item, idx) => {
    const row = parseInt(idx / 2);
    let rowArr = arr[row] || [];
    rowArr[idx % 2] = {index: idx, item};
    arr[row] = rowArr;
    return arr;
  }, []);

  const createTable = async () => {
    if (submitLoading) { return }
    setSubmitLoading(true)

    const req = ReqCreateTable.create({
      players: players.filter(type => type === 1).length,
      robots: players.filter(type => type === 2).length
    })
    try {
      const _ = await sendPromise(req)
      redirectTo({url: '/pages/table/table'})
    }catch(err) {
      showToast({title: err})
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <View className="nt">
      <Title title={"Create New Table"} />
      <View className="nt-wrap">
        {
          playerRows.map((row, i) => (
            <View key={i} className="playerRow">
              {
                row.map((player, j) => (
                  player.item === 0
                  ? <View key={j} onClick={() => setChoosingPlace(player.index)} className='player empty-player'><Image className="empty-icon" src={addIcon} /></View>
                  : <View key={j} className="player-wrap">
                    <View className="player-icon"><Image className="player-icon-img" src={player.item === 1 ? userIcon : robotIcon} /></View>
                    <View className="close-icon" onClick={() => {
                      players[player.index] = 0;
                      setPlayers([...players]);
                    }}><Image className="close-icon-img" src={closeIcon} /></View>
                    <View className="player">
                      <Text className="player-name">{player.item === 1 ? 'Player' : 'Robot'}#{player.index + 1}</Text>
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
          <Button className='submit-btn' loading={submitLoading} onClick={createTable}>CREATE</Button>
        </View>
      </View>

      <Picker
        title=''
        isVisible={choosingPlace > -1}
        listData={[{value: 1, text: 'Player'}, {value: 2, text: 'Robot'}]}
        onConfirm={(values) => {
          players[choosingPlace] = values[0];
          setPlayers([...players]);
        }}
        onClose={() => setChoosingPlace(-1)}
       />
    </View>
  )
}

export default NewTable
