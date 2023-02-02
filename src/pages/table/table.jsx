import React, { Component, useState } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import cnames from 'classnames'

import { reqGameFullStatus, reqKickOutTable } from '@/api/wsapi'
import { addMsgListen, removeMsgListener } from '@/api/websocket'
import { ifEmpty } from '@/utils/validator'

import './table.scss'
import Title from '@/components/title'
import Card from '@/components/card'
import coinIcon from '@/assets/icon/coin-1.svg'
import coin2Icon from '@/assets/icon/coin-2.svg'
import plus1Icon from '@/assets/icon/plus-1.svg'
import sub1Icon from '@/assets/icon/sub-1.svg'
import closeIcon from '@/assets/icon/close-1.svg'

import Taro from '@tarojs/taro'
import { showToast, redirectTo } from '@/utils/application'
import { isIn } from '@/utils/collect'

function PlayerStatus() {
  return (
    <View>
      <Text>Ready</Text>
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
  return (card && card.suit) || 'D';
}

// 是否空白牌
function existsCard(card) {
  return !!card && !!card.suit;
}

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inGame: false,
      tableNo: 0,
      stage: 0, // 游戏阶段: 1等待玩家准备;2下大盲注;3下小盲注;4发公共牌;5发第四张公共牌,轮流下注;6发第五张公共牌,轮流下注,7比牌结算
      chip: 0,
      roundTimes: 0,
      playerId: 0,

      players: [],
      publicCard: [],
    }
  }

  componentWillUnmount() {
    // 取消监听消息
    removeMsgListener('api.ResGameFullStatus')
    removeMsgListener('api.ResKickOutTable')
  }

  componentDidMount() {
    // setTimeout(() => {
      // 监听状态变化消息
      addMsgListen('api.ResGameFullStatus', res => this.handleResGameFullStatus(res));
      addMsgListen('api.ResKickOutTable', res => {
        console.log('listener level table', res);
        redirectTo({url: '/pages/lobby/lobby', complete() {
          showToast({title: '您被请出牌桌'})
        }});
      });

      // 查询当前牌桌状态
      reqGameFullStatus()
      .then(res => {
        this.handleResGameFullStatus(res);
      })
      .catch(err => {
        showToast({title: err});
        if (err.code === 402) {
          setTimeout(() => redirectTo({url: '/pages/lobby/lobby'}), 800);
        }
      })
    // }, 2000)
  }

  handleResGameFullStatus = res => {
    console.log('res game...++', this, res)
    this.setState({
      playerId: res.playerId,
      inGame: !!res.inGame,
      tableNo: res.tableNo,
      stage: res.gameStage,
      chip: res.chip || 0,
      roundTimes: res.roundTimes || 0,

      players: res.players,
      publicCard: res.publicCard,
    })
    // console.log('res game', res, res.publicCard[0].dot, ifEmpty(res.publicCard[0].dot, -3))
    window.publicCard = res.publicCard
  }

  // 踢人
  handleKickoutPlayer(player) {
    console.log('kickout', player)
    Taro.showModal({
      title: '提示',
      content: `将玩家[${player.username}]移出牌桌？`,
      success: res => {
        if (!res.confirm) {
          return;
        }
        reqKickOutTable(player.id)
          .then(_ => {
            showToast({title: `[${player.username}]已离开牌桌`})
          })
          .catch(err => {
            showToast({title: err})
          })
      }
    })
  }

  render() {
    const { username, nickname, avatar } = this.props.user; // useSelector(state => state.user);
    // const players = [1, 2, 3, 4, 5, 6];
    const players = this.state.players.map((player, index) => ({player, index}));
    const {playerId, tableNo, stage, chip, roundTimes} = this.state;

    // 从玩家中找到自己 TODO 弄到 state, 避免每次render计算
    // console.log('props', this.props);
    const otherPlayers = players.filter(({player}) => player.id !== playerId);
    const self = players.find(({player}) => player.id === playerId);
    const {index: selfIndex , player: selfPlayer} = self || {player: {handCard: []}};
    // console.log(otherPlayers, self)

    const playerRows = otherPlayers.reduce((arr, player, idx) => {
      const row = parseInt(idx / 2);
      let rowArr = arr[row] || [];
      rowArr[idx % 2] = player;
      arr[row] = rowArr;
      return arr;
    }, []);

    return (
      <View className="tab">
        <Title title={`GAME #${tableNo}`} />
        {
          playerRows.map((row, i) => (
            <View key={i} className="playerRow">
              {
                row.map(({index, player}, j) => (
                  <View key={j} className="player-wrap" onClick={(p => {console.log(p)}).bind(this, player)}>
                    {
                      j % 2 === 0 &&
                      <View className={cnames('player-state-wrap', {'state-left': j % 2 === 0})}>
                        <PlayerStatus action={1} />
                      </View>
                    }
                    <View className="player-bar">
                      <View className={cnames("player-no", { "player-no-running": player.index === 0 })}><Text>#{index}</Text></View>
                      {
                        stage === 1 && selfPlayer.master && player.id
                        ? <View className="kickout" onClick={this.handleKickoutPlayer.bind(this, player)}><Image className="kickout-icon" src={closeIcon} /></View>
                        : null
                      }
                      {existsCard(player.handCard[0]) && <View className="card1"><Card w={38} h={48} dot={cardDot(player.handCard[0], player.status === 7 ? -2 : -1)} suit={cardSuit(player.handCard[0])} /></View>}
                      {existsCard(player.handCard[1]) && <View className="card2"><Card w={38} h={48} dot={cardDot(player.handCard[0], player.status === 7 ? -2 : -1)} suit={cardSuit(player.handCard[1])} /></View>}

                      <View className={cnames("player", {'player-wait': !player.id || isIn(player.status, 3, 7)})}>
                        <View className="avatar-wrap">{!player.id ? null : <Image className="avatar" src={player.avatar || avatar} />}</View>
                        <View className="player-name"><Text>{player.username}</Text></View>
                      </View>
                      {
                        !player.id ? null :
                        <View className="wallet-wrap">
                          <View className={cnames("wallet", {'wallet-wait': isIn(player.status, 3, 7)})}>
                            <View className="wallet-icon"><Image className="wallet-icon-img" src={coinIcon} /></View>
                            <View className="wallet-amount"><Text>{player.chip}</Text></View>
                          </View>
                          <View className="pct"><Text>0%</Text></View>
                        </View>
                      }
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
              <View className="d-wallet-amount">{chip}</View>
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
          <View className={cnames("player-no", { "player-no-running": true })}><Text>#{selfIndex}</Text></View>
            {existsCard(selfPlayer.handCard[0]) && <View className="hand-card1"><Card w={38} h={48} dot={cardDot(selfPlayer.handCard[0], -1)} suit={cardSuit(selfPlayer.handCard[0])} /></View>}
            {existsCard(selfPlayer.handCard[1]) && <View className="hand-card2"><Card w={38} h={48} dot={cardDot(selfPlayer.handCard[1], -1)} suit={cardSuit(selfPlayer.handCard[0])} /></View>}
            <View className="hand-five">
              {
                existsCard(selfPlayer.handCard[0]) && [1, 2, 3, 4, 5].map((_, i) => (
                  <View key={i} className="hand-five-item"><Card w={28} h={36} dot={12} suit={2} /></View>
                ))
              }
            </View>
            <View className='u-opt' style={{ display: 'flex' }}>
              <View>
                <View className="s-info-wrap">
                  <View className="s-avatar"><Image className="s-avatar-img" src={selfPlayer.avatar || avatar} /></View>
                  <View className="s-username"><Text>{selfPlayer.username}</Text></View>
                </View>
                <View className="s-wallet-wrap">
                  <View className="s-w-amount-wrap">
                    <View className="s-w-amount-icon"><Image className="s-w-amount-icon-img" src={coin2Icon} /></View>
                    <View className="s-w-amount"><Text>{selfPlayer.chip}</Text></View>
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
                {
                  stage === 1 ? (
                    // 是房主: 关闭牌桌, 开始游戏
                    selfPlayer.master ? <View className="ctl-opt-wrap">
                      <View className="ctl-opt"><Button className={cnames("ctl-opt-btn-4", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>关闭牌桌</Button></View>
                      <View className="ctl-opt"><Button className={cnames("ctl-opt-btn-6", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>开始游戏</Button></View>
                    </View>
                    // 是玩家：退出, 准备
                    : <View className="ctl-opt-wrap">
                      <View className="ctl-opt"><Button style={{display: selfPlayer.status === 2 ? 'none' : 'block'}} className={cnames("ctl-opt-btn-4", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>退出</Button></View>
                      <View className="ctl-opt"><Button className={cnames("ctl-opt-btn-5", {'ctl-opt-btn-5-ready': selfPlayer.status === 2})}>{selfPlayer.status === 2 ? '已准备' : '准备'}</Button></View>
                    </View>
                  )
                  : <View className="ctl-opt-wrap">
                    <View className="ctl-opt"><Button className="ctl-opt-btn-1">让牌</Button></View>
                    <View className="ctl-opt"><Button className="ctl-opt-btn-2">弃牌</Button></View>
                    <View className="ctl-opt"><Button className="ctl-opt-btn-3">跟注</Button></View>
                  </View>
                }
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
