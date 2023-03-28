import React, { useState } from 'react'
import { View, Text, Image, Button } from '@tarojs/components'
import { Range, Radio } from '@nutui/nutui-react-taro';
import { useSelector } from 'react-redux'
import Taro from '@tarojs/taro';

import { redirectTo } from '@/utils/application'
import './new_table.scss'
import Title from '@/components/title'
import { reqCreateTable } from '@/api/wsapi'
import { showToast } from '@/utils/application'
import userIcon from '@/assets/icon/user-2.svg'
import robotIcon from '@/assets/icon/robot-1.svg'
import closeIcon from '@/assets/icon/close-1.svg'
import addIcon from '@/assets/icon/add-2.svg'

function NewTable() {
  const {username, nickname, avatar} = useSelector(state => state.user);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [choosingPlace, setChoosingPlace] = useState(-1);
  const [texasType, setTexasType] = useState(1);
  const [bigBlind, setBigBlind] = useState(2);

  const [players, setPlayers] = useState([0,0,0,0,0,0]); // 0空位,1玩家,2机器人
  const playerRows = players.reduce((arr, item, idx) => {
    const row = parseInt(idx / 2);
    let rowArr = arr[row] || [];
    rowArr[idx % 2] = {index: idx, item};
    arr[row] = rowArr;
    return arr;
  }, []);

  const choosePlayer = (playerPos) => {
    players[playerPos] = 1;
    setPlayers([...players])
    // setPlayers
  }

  const createTable = async () => {
    if (submitLoading) { return }
    setSubmitLoading(true)

    try {
      const _ = await reqCreateTable({
        texasType, bigBlind,
        players: players.filter(type => type === 1).length,
        robots: players.filter(type => type === 2).length,
      });
      redirectTo({url: '/pages/table/table'})
    }catch(err) {
      showToast({title: err})
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <View className="nt">
      <Title title={""} bgColor={true} />
      <View className="game-props">
        <View className="prop-wrap">
          <View className="prop-k"><Text>牌局类型：</Text></View>
          <View className="prop-v">
            <Radio.RadioGroup value={texasType} direction="horizontal" onChange={setTexasType}>
              <Radio value={1} iconSize={Taro.pxTransform(16)}>限注德州扑克</Radio>
              <Radio disabled value={2} iconSize={Taro.pxTransform(16)}>底池限制德州扑克</Radio>
              <Radio disabled value={3} iconSize={Taro.pxTransform(16)}>无限制德州扑克</Radio>
            </Radio.RadioGroup>
          </View>
        </View>
        <View className="prop-wrap">
          <View className="prop-k"><Text>大盲注额：</Text></View>
          <View className="prop-v">
            <Range modelValue={bigBlind} min={2} max={100} step={2}
              hiddenRange={true} hiddenTag={false}
              activeColor="#1BCE7D" inactiveColor="#D8D8D8"
              button={<View className="range-custom-button"><Text>{bigBlind}</Text></View>}
              onChange={v => setBigBlind(v)}/>
          </View>
        </View>
        <View className="prop-wrap">
          <View className="prop-k"><Text>入场金额：</Text></View>
          <View className="prop-v amount-in"><Text>{bigBlind * 100}</Text></View>
        </View>
      </View>
      <View className="nt-wrap">
        {
          playerRows.map((row, i) => (
            <View key={i} className="playerRow">
              {
                row.map((player, j) => (
                  player.item === 0
                  ? <View key={j} onClick={() => choosePlayer(player.index)} className='player empty-player'><Image className="empty-icon" src={addIcon} /></View>
                  : <View key={j} className="player-wrap">
                      <View className="player-icon"><Image className="player-icon-img" src={player.item === 1 ? userIcon : robotIcon} /></View>
                      <View className="close-icon" onClick={(e) => {
                        e.stopPropagation();
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

      {/* <Picker
        title=''
        isVisible={choosingPlace > -1}
        listData={[{value: 1, text: 'Player'}, {value: 2, text: 'Robot'}]}
        onConfirm={(values) => {
          players[choosingPlace] = values[0];
          setPlayers([...players]);
        }}
        onClose={() => setChoosingPlace(-1)}
       /> */}
    </View>
  )
}

export default NewTable
