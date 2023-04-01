import React, { Component } from 'react'
import { connect } from "react-redux";
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import cnames from 'classnames';
import { setBalance } from '@/store/user';
import { setRouteName } from '@/store/app';

import { navigateTo, redirectTo, showToast } from '@/utils/application'
import { reqLobbyView, reqJoinTable, reqAccountBalance } from '@/api/wsapi'
import { addMsgListen, removeMsgListener } from '@/api/websocket'
import Title from '@/components/title'
import coin1 from '@/assets/coin-0.svg'
import robotIcon from '@/assets/icon/robot-1.svg'
import plusIcon from '@/assets/icon/plus-2.svg';
import refreshIcon from '@/assets/icon/refresh-fill.svg';
import coinIcon from '@/assets/icon/coin-1.svg';

import './lobby.scss'
import { isIn } from '@/utils/collect';

class Lobby extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tables: [],
      lobbyLoading: false,
      gameType: [
        {value: 1, text: '', checked: false},

      ],
    }
    this.circleEle = [1,2,3,4,5,6,7];
    this.circleElePos = [{x:16,y:8},{x:70,y:-3},{x:110,y:28},{x:115,y:70},{x:80,y:105},{x:20,y:100},{x:-2,y:60}];
  }

  componentWillUnmount() {
    // 取消监听消息
    removeMsgListener('api.ResLobbyFresh');
  }

  componentDidShow() {
    this.props.setRouteName('lobby');
  }

  componentDidMount() {
    // 有新桌面创建消息监听
    addMsgListen('api.ResLobbyFresh', this.handleReqLobbyView);

    // setTimeout(() => {
    this.handleReqLobbyView();
    // }, 1500)
    // fetchLobbyView()
    //   .then(res => {
    //     console.log('lobby', res)
    //     this.setState({tables: res.data})
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   })

    reqAccountBalance()
      .then(res => {
        this.props.setBalance(res.balance)
      })
      .catch(err => {
        console.error('账户余额查询失败：', err)
        showToast({title: err})
      })
  }

  handleReqLobbyView = () => {
    if (this.state.lobbyLoading) {
      showToast({title: '加载中...'})
      return
    }
    this.setState({lobbyLoading: true}, () => {
      setTimeout(() => {
        reqLobbyView()
          .then(res => {
            this.setState({tables: res.tables}, () => {
              // 正在游戏中
              if (res.curTableNo) {
                redirectTo({url: '/pages/table/table'});
              }
            })
          })
          .catch(err => {
            showToast({title: err})
          })
          .finally(() => {
            this.setState({lobbyLoading: false})
          })
      }, 1000)
    })
  }

  async handleJoinTable(table) {
    try {
      const res = await reqJoinTable(table.tableNo)
      redirectTo({url: '/pages/table/table'})
      // console.log('join res...', res)
    }catch(err) {
      showToast({title: err})
      this.handleReqLobbyView();
    }
  }

  render() {
    // const count = useSelector((state) => state.counter.value)
    // const user = useSelector((state) => state.user)

    return (
      <View>
        <Title title={("Lobby","")} bgColor={true} leftSolt={
          <Image className={cnames("refresh-icon", {'refresh-icon-rotate': this.state.lobbyLoading})}
            src={refreshIcon}
            onClick={this.handleReqLobbyView}
          />
        }/>
        <View className="celling"></View>
        <View className="tab">
          {
            this.state.tables.map((table, i) => (
              <View className='tab-box'>
                <View key={table.tableNo} className="tab-wrap" onClick={this.handleJoinTable.bind(this, table)}>
                  <View className="tab-no">#{table.tableNo}</View>
                  <View className="circle-wrap">
                    <View className="circle-inner"><Image className="inner-coin" src={coin1} /></View>
                    {
                      table.players.map((player, j) => (
                        <View key={j} className="circle-item" style={{
                          position: 'absolute',
                          left: Taro.pxTransform(this.circleElePos[j].x),
                          top: Taro.pxTransform(this.circleElePos[j].y)
                        }}>
                          <Image
                            className={cnames("circle-avatar", {'circle-icon': player.robot || !player.id})}
                            src={player.robot ? robotIcon : !player.id ? plusIcon : ((player.avatar && `/api/gm/avatar/${player.avatar}`) || this.props.defaultAvatar)}
                          />
                        </View>
                      ))
                    }
                  </View>
                  <View className="tab-no-wrap">
                    <View className={cnames("tab-sc tab-sc-1", {
                      'tab-sc-1-full': table.playerNum === table.playerLimit,
                      'tab-sc-1-gaming': !isIn(table.stage, 1, 7),
                      })}
                    >{!isIn(table.stage, 1, 7) ? '进行中' : `[${table.playerNum}/${table.playerLimit}]`}</View>
                    <View className={cnames("tab-sc tab-sc-2", {'tab-sc-2-nolimit': table.texasType === 3})}>{table.texasType === 3 ? '无限注' : '限注'}</View>
                    <View className="tab-sc tab-sc-3">
                      <Image className="tab-sc-3-icon" src={coinIcon} />
                      <Text>{table.bigBland}/{table.limitInAmount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          }

          <View key="tab-wrap" className="tab-wrap"></View>
        </View>
        <View className="bottom-btn-wrap">
          <Button className="bottom-btn" onClick={() => navigateTo({url: '/pages/new_table/new_table'})}>新牌桌</Button>
        </View>
      </View>
    )
  }
}

const mapStateToProps = state => ({
  defaultAvatar: state.user.defaultAvatar
});

const mapDispatchToProps = dispatch => ({
  setBalance: b => dispatch(setBalance(b)),
  setRouteName: () => dispatch(setRouteName('lobby')),
});

export default connect(mapStateToProps, mapDispatchToProps)(Lobby)
