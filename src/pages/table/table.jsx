import React, { Component } from 'react'
import { View, Text, Image, Input, Button } from '@tarojs/components'
import { connect } from 'react-redux'
import cnames from 'classnames'

import {
  reqGameFullStatus, reqKickOutTable, reqLeaveTable,
  reqReadyStart, reqDismissGameTable, reqGameStart,
  reqCancelReady, reqBetting
} from '@/api/wsapi'
import { addMsgListen, removeMsgListener } from '@/api/websocket'
import { isEmpty } from '@/utils/validator'

import './table.scss'
import Title from '@/components/title'
import Card from '@/components/card'
import coinIcon from '@/assets/icon/coin-1.svg'
import coin2Icon from '@/assets/icon/coin-2.svg'
import plus1Icon from '@/assets/icon/plus-1.svg'
import sub1Icon from '@/assets/icon/sub-1.svg'
import closeIcon from '@/assets/icon/close-1.svg'

import timeIcon from '@/assets/icon/time-fill.svg'
import crownIcon from '@/assets/icon/crown.svg'
import crownDarkIcon from '@/assets/icon/crown_dark.svg'
import bigBlindIcon from '@/assets/icon/big_blind.svg'
import smallBlindIcon from '@/assets/icon/small_blind.svg'

import Taro from '@tarojs/taro'
import { showToast, redirectTo } from '@/utils/application'
import { isIn } from '@/utils/collect'

function PlayerStatus(props) {
  const { text, color } = props;
  return (
    <View className="p-status">
      <Text>{text}</Text>
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
      tableNo: 0,
      stage: 0, // 游戏阶段: 1等待玩家准备;2下大盲注;3下小盲注;4发公共牌;5发第四张公共牌,轮流下注;6发第五张公共牌,轮流下注,7比牌结算
      chip: 0,
      playerId: 0,
      masterId: 0,
      bigBlindPos: -1,
      smallBlindPos: -1,

      players: [],
      publicCard: [],

      otherPlayers: [],
      selfIndex: 0,
      selfPlayer: {handCard: [], betRole: {}},

      betType: 0,
      bettingChip: 0,
      betConfirmText: '下注',
      betSubmitLoading: false,

      // winsChip: {}, // {1:14, 2:-14}
      playerNoticeLines: [], // {line1: "+6",line2: "跟注",playerId: 1}
      playerNotice: null, //{line1: "+108",line2: "加注:12221126",line3: '跟注:6', playerId: 3},
      winsChip: {}, //{7: -20, 8: 40, 3: -20},
    }
  }

  componentWillUnmount() {
    // 取消监听消息
    removeMsgListener('api.ResGameFullStatus');
    removeMsgListener('api.ResKickOutTable');
    removeMsgListener('api.ResDismissGameTable');
    removeMsgListener('api.ResNoticePlayerLine');
    removeMsgListener('api.ResCalcWinnerChip');
  }

  showPlayerNotice() {
    if (this.state.playerNotice) {
      return;
    }
    const playerNotice = this.state.playerNoticeLines.shift();
    if (!playerNotice) {
      return;
    }
    this.setState({playerNotice}, () => {
      // 隔1秒展示下一条
      setTimeout(() => {
        this.setState({
          playerNotice: null
        }, this.showPlayerNotice.bind(this));
      }, 1500);
    });
  }

  componentDidMount() {
    // setTimeout(() => {
      // 监听状态变化消息
      addMsgListen('api.ResGameFullStatus', this.handleResGameFullStatus); // 牌桌状态变化
      // 被房主踢出
      addMsgListen('api.ResKickOutTable', res => {
        showToast({title: '您被请出牌桌'});
        setTimeout(() => redirectTo({url: '/pages/lobby/lobby'}), 800);
      });
      // 牌桌解散
      addMsgListen('api.ResDismissGameTable', res => {
        showToast({title: '牌桌已解散'});
        setTimeout(() => redirectTo({url: '/pages/lobby/lobby'}), 800);
      });
      // 操作通知消息  {line1: "+6",line2: "跟注",playerId: 1}
      addMsgListen('api.ResNoticePlayerLine', res => {
        // 放置消息到通知队列
        this.state.playerNoticeLines.push(res);
        this.showPlayerNotice.call(this);
      });
      // 输赢筹码信息
      addMsgListen('api.ResCalcWinnerChip', res => {
        console.log('winsChip...:', res);
        window.winsChip = res;
        this.setState({winsChip: res.winsChip});
        setTimeout(() => { // 输赢筹码展示一会后消失
          if (this.state.winsChip === res.winsChip) {
            this.setState({winsChip: {}});
          }
        }, 10000);
      });
      // // 扣除大盲注(显示3秒)
      // addMsgListen('api.ResBigBlindChip', res => {
      //   showToast({title: '大盲注:' + res.chip});
      // });
      // // 扣除小盲注(显示3秒)
      // addMsgListen('api.ResSmallBlindChip', res => {
      //   showToast({title: '小盲注:' + res.chip});
      // });

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
    const players = res.players.map((player, index) => ({player, index}));
    const otherPlayers = players.filter(({player}) => player.id !== res.playerId);
    const self = players.find(({player}) => player.id === res.playerId);
    const {index: selfIndex, player: selfPlayer} = self || {player: {handCard: [], betRole: {}}};

    this.setState({
      playerId: res.playerId,
      tableNo: res.tableNo,
      stage: res.gameStage,
      chip: res.chip || 0,
      masterId: res.masterId,
      bigBlindPos: res.bigBlindPos,
      smallBlindPos: res.smallBlindPos,

      players: res.players,
      publicCard: res.publicCard,

      otherPlayers,
      selfIndex,
      selfPlayer,
      bettingChip: this.state.bettingChip !== 0 ? this.state.bettingChip : selfPlayer.betMin
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
    });
  }

  // 退出
  handleLeaveTable() {
    Taro.showModal({
      title: '提示',
      content: "是否离开牌桌？",
      success: res => {
        if (!res.confirm) {
          return;
        }
        reqLeaveTable()
          .then(_ => {
            redirectTo({url: '/pages/lobby/lobby'})
          })
          .catch(err => showToast({title: err}))
      }
    })
  }

  // 准备开始
  handleReadyStart(playerStatus) {
    (playerStatus === 2 ? reqCancelReady() : reqReadyStart())
      .then(res => {
        console.log('ready res:', res);
      })
      .catch(err => showToast({title: err}));
  }

  // 解散牌桌
  handleResDismissGameTable() {
    Taro.showModal({
      title: '提示',
      content: "是否解散牌桌？",
      success: res => {
        if (!res.confirm) {
          return;
        }
        reqDismissGameTable()
          .then(_ => {
            redirectTo({url: '/pages/lobby/lobby'})
          })
          .catch(err => showToast({title: err}));
      }
    })
  }

  // 开始游戏
  handleGameStart() {
    reqGameStart()
    .then(res => {
      console.log('game start...', res)
    })
    .catch(err => showToast({title: err}));
  }

  // 加注
  handleSubPlusBetting(symbol, once) {
    const c = this.state.bettingChip || 0;
    const {betRole: {betMax}} = this.state.selfPlayer;
    if (symbol < 0 && c <= 0) { // 减
      return;
    } else if (symbol > 0 && betMax >= 0 && c >= betMax) { // 加
      return;
    }
    const chip = c + symbol * once;
    this.setState({bettingChip: chip, betType: 2});
  }

  // 跟注,弃牌...操作按钮
  handleBetting(betType) {
    // console.log('betType', betType) betOpts
    const {betRole: {betMin}} = this.state.selfPlayer;
    switch(betType) {
      case 1: // 1跟注,2加注(-[0]+),3All-In,4弃牌,5过牌
        this.setState({betType: 1, bettingChip: betMin, betConfirmText: '跟注'});
        break;
      case 4:
        // , betConfirmText: '弃牌'
        this.setState({betType: 4}, this.handleBetConfirm.bind(this));
        break;
    }
  }

  handleBetConfirm() {
    const {betType, bettingChip} = this.state;
    if (betType === 0) {
      return showToast({title: '请增加下注筹码或其他操作'});
    }

    console.log('confirm', betType, bettingChip)

    this.setState({bettingChip: 0, betSubmitLoading: true}, () => {
      reqBetting(betType, bettingChip || 0)
        .then(res => {
          console.log('betRes', res);
        })
        .catch(err => {
          showToast({title: err})
        })
        .finally(() => {
          this.setState({betSubmitLoading: false, betConfirmText: '下注'})
        })
    })
  }

  handleBettingInput(e) {
    // const value = parseInt(e.target.value);
    // console.log('input', typeof(value), value, this.state.bettingChip);
    // if (typeof(value) !== 'number') {
    //   this.setState({bettingChip: this.state.bettingChip})
    //   return;
    // }
    // if (value < this.state.betMin) {
    //   this.setState({bettingChip: this.state.betRole.bettingChip})
    //   return showToast({title: `当前最小下注额${this.state.betRole.betMin}`})
    // }
    // if (value > this.state.betMax) {
    //   this.setState({bettingChip: this.state.betRole.bettingChip})
    //   return showToast({title: `当前最大下注额${this.state.betMax}`})
    // }
    // console.log('input', value, this.state.betMin, this.state.betRole.betMax);

    this.setState({bettingChip: value})
  }

  render() {
    const { username, nickname, avatar, defaultAvatar } = this.props.user; // useSelector(state => state.user);
    // const players = [1, 2, 3, 4, 5, 6];
    const players = this.state.players.map((player, index) => ({player, index}));
    const {
      playerId, tableNo,
      stage, bigBlindPos, smallBlindPos,
      chip, otherPlayers,
      selfIndex, selfPlayer,
      bettingChip, betConfirmText, betSubmitLoading,
      playerNotice: pn, winsChip,
    } = this.state;
    const {betMin, betMax, betOpts} = selfPlayer.betRole || {};
    // console.log('props', this.props);

    const playerRows = otherPlayers.reduce((arr, player, idx) => {
      const row = parseInt(idx / 2);
      let rowArr = arr[row] || [];
      rowArr[idx % 2] = player;
      arr[row] = rowArr;
      return arr;
    }, []);

    return (
      <View className="tab">
        <Title title={''} leftSolt={(
          <View className="table-no"><Text>#{tableNo}</Text></View>
        )} />
        {
          playerRows.map((row, i) => (
            <View key={i} className="playerRow">
              {
                row.map(({index, player}, j) => (
                  <View key={j} className="player-wrap" onClick={(p => {console.log(p)}).bind(this, player)}>
                    {
                      player.status === 2 && <View className="p-status-ready"><Text>Ready</Text></View>
                    }
                    <View className="player-bar">
                      {
                        // 座位编号
                        !player.id ? null :
                        player.master
                        ? <View className="player-no-crown">
                            <Image className="pnc-bg-icon" src={isIn(player.status,2,4,6) ? crownIcon : crownDarkIcon} />
                            <View className={cnames('', {'pnc-text-running': isIn(player.status,2,4,6)})}><Text>#{index+1}</Text></View>
                          </View>
                        : <View className={cnames("player-no", { "player-no-running": isIn(player.status,2,4,6)})}><Text>#{index+1}</Text></View>
                      }
                      {
                        // 大小盲注图标
                        !player.id ? null : !(isIn(stage, 2,3,4,5) && isIn(index, bigBlindPos, smallBlindPos)) ? null
                        : <View className="blind-icon"><Image src={index === bigBlindPos ? bigBlindIcon : smallBlindIcon} /></View>
                      }
                      {
                        // 等待读秒，下注金额
                        !isIn(stage, 2,3,4,5) || !isIn(player.status, 6) ? null :
                        <View className={cnames({"round-wrap-l": j%2===0,"round-wrap-r": j%2===1})}>
                          <View className="time-wrap">
                            <Image src={timeIcon} />
                            <Text>29</Text>
                          </View>
                          {/* {
                            isIn(player.status, 4, 6)
                            ?
                            : <View className={cnames('filling-chip', {'filling-chip-l': player.chip > 99})}><Text>+{player.chip}</Text></View>
                          } */}
                        </View>
                      }
                      {
                        !pn || pn.playerId !== player.id ? null : <View className={cnames({"notice-wrap-l": j%2===0,"notice-wrap-r": j%2===1})}>
                          {pn.line1 && <View className="line1"><Text>{pn.line1}</Text></View>}
                          {pn.line2 && <View className="line2"><Text>{pn.line2}</Text></View>}
                          {pn.line3 && <View className="line3"><Text>{pn.line3}</Text></View>}
                        </View>
                      }
                      {
                        stage === 7 && typeof(winsChip[player.id]) !== 'number' ? null
                        : <View className="wins-chip-wrap">
                          <View className={cnames("wins-chip", {'lose': winsChip[player.id] < 0, 'win': winsChip[player.id] >= 0})}><Text>{winsChip[player.id] >= 0 ? '+' : ''}{winsChip[player.id]}</Text></View>
                        </View>
                      }
                      {
                        // 踢出牌桌close图标
                        stage === 1 && selfPlayer.master && player.id
                        ? <View className="kickout" onClick={this.handleKickoutPlayer.bind(this, player)}><Image className="kickout-icon" src={closeIcon} /></View>
                        : null
                      }
                      {/* 玩家手牌 */}
                      {player.id && existsCard(selfPlayer.handCard[0]) ? <View className={cnames("card1", {'translate-2l':j%2===0,'translate-2r':j%2===1})}><Card w={38} h={48} dot={cardDot(player.handCard[0], player.status === 7 ? -2 : -1)} suit={cardSuit(player.handCard[0])} /></View>: null}
                      {player.id && existsCard(selfPlayer.handCard[1]) ? <View className={cnames("card2", {'translate-2l':j%2===0,'translate-2r':j%2===1})}><Card w={38} h={48} dot={cardDot(player.handCard[1], player.status === 7 ? -2 : -1)} suit={cardSuit(player.handCard[1])} /></View> : null}
                      {/* 手牌牌型 */}
                      {
                        !(player.handType && player.handType.handZh) ? null : <View className="hand-type">
                          <Text>{player.handType.handZh}</Text>
                        </View>
                      }
                      {/* 头像名称 */}
                      <View className={cnames("player", {'player-wait': !player.id || isIn(player.status, 3, 7) || (player.status === 1 && !player.master)})}>
                        <View className="avatar-wrap">{!player.id ? null : <Image className="avatar" src={(player.avatar ? `/api/gm/avatar/${player.avatar}` : defaultAvatar)} />}</View>
                        <View className="player-name"><Text>{player.username}</Text></View>
                      </View>
                      {
                        // 玩家筹码
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
                !isIn(stage, 2,3,4,5,7) ? null : this.state.publicCard.map((card, i) => (
                  <Card flipIn={-3} key={i} w={38} h={48} dot={isIn(stage,1,2)?-3 : cardDot(card, -3)} suit={cardSuit(card)} />
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
            {
              //
              selfPlayer.master
              ? <View className="player-no-crown">
                  <Image className="pnc-bg-icon" src={isIn(selfPlayer.status,2,4,6) ? crownIcon : crownDarkIcon} />
                  <View className={cnames('', {'pnc-text-running': isIn(selfPlayer.status,2,4,6)})}><Text>#{selfIndex+1}</Text></View>
                </View>
              : <View className={cnames("player-no", { "player-no-running": isIn(selfPlayer.status,2,4,6) })}><Text>#{selfIndex+1}</Text></View>
            }

            {
              // 大小盲注图标
              !(isIn(stage, 2,3,4,5) && isIn(selfIndex, bigBlindPos, smallBlindPos)) ? null
              : <View className="blind-icon blind-icon-self"><Image src={selfIndex === bigBlindPos ? bigBlindIcon : smallBlindIcon} /></View>
            }
            {
              // 等待读秒，下注金额
              <View className={'round-wrap-l round-wrap-self'}>
                {
                  // TODO All In ...
                  !isIn(selfPlayer.status, 4, 6)
                  ? null
                  : <View className="time-wrap time-wrap-self">
                    <Image className="time-icon" src={timeIcon} />
                    <Text>29</Text>
                  </View>
                  // : <View className={cnames('filling-chip filling-chip-self')}><Text>+{selfPlayer.chip}</Text></View>
                  // , {'filling-chip-l': selfPlayer.chip > 99}
                }
              </View>
            }
            {existsCard(selfPlayer.handCard[0]) && <View className="hand-card1 translate-2b"><Card w={38} h={48} dot={cardDot(selfPlayer.handCard[0], -1)} suit={cardSuit(selfPlayer.handCard[0])} /></View>}
            {existsCard(selfPlayer.handCard[1]) && <View className="hand-card2 translate-2b"><Card w={38} h={48} dot={cardDot(selfPlayer.handCard[1], -1)} suit={cardSuit(selfPlayer.handCard[1])} /></View>}
            {/* 手牌牌型 */}
            {
              !(selfPlayer.handType && selfPlayer.handType.handZh) ? null : <View className="self-hand-type">
                <Text>{selfPlayer.handType.handZh}</Text>
              </View>
            }
            {
              !pn || pn.playerId !== selfPlayer.id ? null : <View className="notice-wrap-l notice-wrap-self">
                {pn.line1 && <View className="line1"><Text>{pn.line1}</Text></View>}
                {pn.line2 && <View className="line2"><Text>{pn.line2}</Text></View>}
                {pn.line3 && <View className="line3"><Text>{pn.line3}</Text></View>}
              </View>
            }

            {
              stage === 7 && typeof(winsChip[selfPlayer.id]) !== 'number' ? null
              : <View className="wins-chip-wrap wins-chip-wrap-self">
                <View className={cnames("wins-chip", {'lose': winsChip[selfPlayer.id] < 0, 'win': winsChip[selfPlayer.id] >= 0})}>
                  <Text>{winsChip[selfPlayer.id] >= 0 ? '+' : ''}{winsChip[selfPlayer.id]}</Text>
                </View>
              </View>
            }
            <View className="hand-five" style={{display:'none'}}>
              {
                existsCard(selfPlayer.handCard[0]) && [1, 2, 3, 4, 5].map((_, i) => (
                  <View key={i} className="hand-five-item"><Card w={28} h={35} dot={12} suit={'H'} /></View>
                ))
              }
            </View>
            <View className='u-opt'>
              <View>
                <View className="s-info-wrap">
                  <View className="s-avatar"><Image className="s-avatar-img" src={(selfPlayer.avatar && `/api/gm/avatar/${selfPlayer.avatar}`) || defaultAvatar} /></View>
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
                  {isEmpty(betOpts) ? null : <View className="amount-input"><Input
                    className="amount-input-in"
                    type="numberpad"
                    placeholder='betting chip'
                    value={bettingChip}
                    onInput={this.handleBettingInput.bind(this)}
                  /></View>}
                  {!isIn(2, betOpts) ? null : <View className="amount-sub" onClick={this.handleSubPlusBetting.bind(this, -1, 1)}><Image className="amount-sub-icon" src={sub1Icon} /></View>}
                  {!isIn(2, betOpts) ? null : <View className="amount-plus" onClick={this.handleSubPlusBetting.bind(this, 1, 1)}><Image className="amount-plus-icon" src={plus1Icon} /></View>}
                </View>
                {
                  isIn(stage, 1, 7) ? (
                    // 是房主: 关闭牌桌, 开始游戏
                    selfPlayer.master ? <View className="ctl-opt-wrap">
                      <View className="ctl-opt"><Button onClick={this.handleResDismissGameTable.bind(this)} className={cnames("ctl-opt-btn-4", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>关闭牌桌</Button></View>
                      <View className="ctl-opt"><Button onClick={this.handleGameStart.bind(this)} className={cnames("ctl-opt-btn-6", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>开始游戏</Button></View>
                    </View>
                    // 是玩家：退出, 准备
                    : <View className="ctl-opt-wrap">
                      <View className="ctl-opt"><Button onClick={this.handleLeaveTable.bind(this)} style={{display: selfPlayer.status === 2 ? 'none' : 'block'}} className={cnames("ctl-opt-btn-4", {'ctl-opt-btn-disable': selfPlayer.status === 2})}>退出</Button></View>
                      <View className="ctl-opt"><Button onClick={this.handleReadyStart.bind(this, selfPlayer.status)} className={cnames("ctl-opt-btn-5", {'ctl-opt-btn-5-ready': selfPlayer.status === 2})}>{selfPlayer.status === 2 ? '已准备' : '准备'}</Button></View>
                    </View>
                  )
                  : <View className="">
                      <View className="ctl-opt-wrap">
                        <View className="ctl-opt">{
                          !isIn(4, betOpts) ? <Button className="ctl-opt-btn-2 ctl-opacity0">弃牌</Button>
                          : <Button onClick={this.handleBetting.bind(this, 4)} className="ctl-opt-btn-2">弃牌</Button>
                        }</View>
                        <View className="ctl-opt" style={{opacity: 0}}>{
                          !isIn(5, betOpts)? <Button className="ctl-opt-btn-1 ctl-opacity0">过牌</Button>
                          : <Button onClick={this.handleBetting.bind(this, 5)} className="ctl-opt-btn-1">过牌</Button>
                        }</View>
                        <View className="ctl-opt">{
                          !isIn(1, betOpts)? <Button className="ctl-opt-btn-1 ctl-opacity0">跟注</Button>
                          : <Button onClick={this.handleBetting.bind(this, 1)} className="ctl-opt-btn-1">跟注</Button>
                        }</View>
                      </View>
                      <View className="ctl-opt-wrap-cfm">
                        <View className="ctl-opt">{
                          !isIn(3, betOpts)? <Button className="ctl-opt-btn-3 ctl-opt-btn-ain ctl-opacity0">ALL-IN</Button>
                          : <Button onClick={this.handleBetting.bind(this, 3)} className="ctl-opt-btn-3 ctl-opt-btn-ain">ALL-IN</Button>
                        }</View>
                        <View className="ctl-opt">
                          {isEmpty(betOpts) ? null : <Button loading={betSubmitLoading} onClick={this.handleBetConfirm.bind(this)} className="ctl-opt-btn-3 ctl-opt-btn-cfm">确认{betConfirmText}</Button>}
                        </View>
                      </View>
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
