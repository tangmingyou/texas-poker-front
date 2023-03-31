import React, { Component } from 'react'
import { connect } from "react-redux";
import { View, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { setBalance } from '@/store/user';

import './lobby.scss'
import { navigateTo, redirectTo, showToast } from '@/utils/application'
import { reqLobbyView, reqJoinTable, reqAccountBalance } from '@/api/wsapi'
import { addMsgListen, removeMsgListener } from '@/api/websocket'
import Title from '@/components/title'
import coin1 from '@/assets/coin-1.png'
import robotIcon from '@/assets/icon/robot-1.svg'
import plusIcon from '@/assets/icon/plus-2.svg';
import refreshIcon from '@/assets/icon/refresh-fill.svg';

import cnames from 'classnames';

class Lobby extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tables: [],
      defaultAvatar: "https://img0.baidu.com/it/u=2477829979,2171947490&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500",
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
              <View key={table.tableNo} className="tab-wrap" onClick={this.handleJoinTable.bind(this, table)}>
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
                        src={player.robot ? robotIcon : !player.id ? plusIcon : ((player.avatar && `/api/gm/avatar/${player.avatar}`) || this.state.defaultAvatar)}
                      />
                    </View>
                  ))
                }
              </View>
              <View className="tab-no-wrap">
                <View className="tab-no">#10013</View>
                <View className="tab-sc">5/7</View>
              </View>
            </View>
            ))
          }

          <View key="tab-wrap" className="tab-wrap"></View>
        </View>
        <View className="bottom-btn-wrap">
          <Button className="bottom-btn" onClick={() => navigateTo({url: '/pages/new_table/new_table'})}>创建新牌桌</Button>
        </View>
      </View>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  setBalance: b => dispatch(setBalance(b))
});

export default connect(() =>({}), mapDispatchToProps)(Lobby)
