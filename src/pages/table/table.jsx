import React, { Component, useState } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import cnames from 'classnames'

import { reqGameFullStatus } from '@/api/wsapi'
import { ifEmpty } from '@/utils/validator'

import './table.scss'
import Title from '@/components/title'
import Card from '@/components/card'
import coinIcon from '@/assets/icon/coin-1.svg'
import coin2Icon from '@/assets/icon/coin-2.svg'
import plus1Icon from '@/assets/icon/plus-1.svg'
import sub1Icon from '@/assets/icon/sub-1.svg'
import Taro from '@tarojs/taro'
import { showToast } from '@/utils/application'

function PlayerStatus() {
  return (
    <View>
      <Text>+20</Text>
    </View>
  )
}

function cardDot(card, cardBackCode) {
  if (!card || !card.suit) {
    return cardBackCode;
  }
  return card['dot'];
}

function cardSuit(card) {
  return card.suit || 'D';
}

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inGame: false,
      tableNo: 0,
      stage: 0, // 游戏阶段: 1等待玩家准备;2下大盲注;3下小盲注;4发公共牌;5发第四张公共牌,轮流下注;6发第五张公共牌,轮流下注,7比牌结算
      chip: 0,
      RoundTimes: 0,

      players: [],
      publicCard: [],
    }
  }
  componentDidMount() {
    console.log('table mount')
    setTimeout(() => {
      reqGameFullStatus()
      .then(res => {
        this.setState({
          inGame: !!res.inGame,
          tableNo: res.tableNo,
          stage: res.gameStage,
          chip: res.chip || 0,
          RoundTimes: res.RoundTimes || 0,

          players: res.players,
          publicCard: res.publicCard,
        })
        console.log('res game', res, res.publicCard[0].dot, ifEmpty(res.publicCard[0].dot, -3))
        window.publicCard = res.publicCard
      })
      .catch(err => {
        showToast({title: err})
      })
    }, 2000)
  }

  render() {
    const { username, nickname, avatar } = this.props.user; // useSelector(state => state.user);
    // const players = [1, 2, 3, 4, 5, 6];
    const playerRows = this.state.players.reduce((arr, player, idx) => {
      const row = parseInt(idx / 2);
      let rowArr = arr[row] || [];
      rowArr[idx % 2] = { index: idx, player };
      arr[row] = rowArr;
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
                    {
                      j % 2 === 0 &&
                      <View className={cnames('player-state-wrap', {'state-left': j % 2 === 0})}>
                        <PlayerStatus action={1} />
                      </View>
                    }
                    <View className="player-bar">
                      <View className={cnames("player-no", { "player-no-running": player.index === 0 })}><Text>#{player.index}</Text></View>
                      <View className="card1"><Card w={38} h={48} dot={-1} suit={2} /></View>
                      <View className="card2"><Card w={38} h={48} dot={-1} suit={3} /></View>
                      <View className={cnames("player", {'player-wait': player.index !== 0})}>
                        <View className="avatar-wrap"><Image className="avatar" src={avatar} /></View>
                        <View className="player-name"><Text>Player{player.item}</Text></View>
                      </View>
                      <View className="wallet-wrap">
                        <View className={cnames("wallet", {'wallet-wait': player.index !== 0})}>
                          <View className="wallet-icon"><Image className="wallet-icon-img" src={coinIcon} /></View>
                          <View className="wallet-amount"><Text>3,000,000</Text></View>
                        </View>
                        <View className="pct"><Text>25%</Text></View>
                      </View>
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
                this.state.publicCard.map((card, i) => (
                  <Card key={i} w={38} h={48} dot={cardDot(card, -3)} suit={cardSuit(card)} />
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
          {/* <View className="chatbox" style={{ display: 'none' }}>
            <View className='chat-window'>
              <View className="line">Kelly(#1)进入了游戏</View>
              <View className="line">Apollo(#2)进入了游戏</View>
            </View>
            <View className='chat-panel'>
              <View><Input name="chat" type="text" placeholder="" /></View>
              <View><Button>OK</Button></View>
            </View>
          </View> */}
        </View>

        <View className="self-box">
          <View className="self-wrap">
          <View className={cnames("player-no", { "player-no-running": true })}><Text>#7</Text></View>
            <View className="hand-card1"><Card w={38} h={48} dot={12} suit={3} /></View>
            <View className="hand-card2"><Card w={38} h={48} dot={12} suit={3} /></View>
            <View className="hand-five">
              {
                [1, 2, 3, 4, 5].map((_, i) => (
                  <View key={i} className="hand-five-item"><Card w={28} h={36} dot={12} suit={2} /></View>
                ))
              }
            </View>
            <View className='u-opt' style={{ display: 'flex' }}>
              <View>
                <View className="s-info-wrap">
                  <View className="s-avatar"><Image className="s-avatar-img" src={avatar} /></View>
                  <View className="s-username"><Text>Prometheus</Text></View>
                </View>
                <View className="s-wallet-wrap">
                  <View className="s-w-amount-wrap">
                    <View className="s-w-amount-icon"><Image className="s-w-amount-icon-img" src={coin2Icon} /></View>
                    <View className="s-w-amount"><Text>3,000,000</Text></View>
                  </View>
                  <View className="s-w-pct"><Text>0%</Text></View>
                </View>
              </View>
              <View className="control">
                <View className="ctl-opt-wrap">
                  <View className="amount-input"><Input placeholder='your chip' defaultValue={0} /></View>
                  <View className="amount-sub"><Image className="amount-sub-icon" src={sub1Icon} /></View>
                  <View className="amount-plus"><Image className="amount-plus-icon" src={plus1Icon} /></View>
                </View>
                <View className="ctl-opt-wrap" style={{ marginTop: Taro.pxTransform(10) }}>
                  <View className="ctl-opt"><Button className="ctl-opt-btn-1">让牌</Button></View>
                  <View className="ctl-opt"><Button className="ctl-opt-btn-2">弃牌</Button></View>
                  <View className="ctl-opt"><Button className="ctl-opt-btn-3">跟注</Button></View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {user: state.user}
}

export default connect(mapStateToProps)(Table)
