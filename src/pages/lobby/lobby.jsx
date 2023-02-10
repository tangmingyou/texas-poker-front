import React, { Component, useState } from 'react'
import { View, Text, Button, Image, Radio, RadioGroup, Label, Slider,Head } from '@tarojs/components'
import Taro from '@tarojs/taro'

import { useSelector, useDispatch } from 'react-redux'

import './lobby.scss'
import { navigateTo, redirectTo, showToast } from '@/utils/application'
import { increment } from '@/store/index'
import { reqLobbyView, reqJoinTable } from '@/api/wsapi'
import proto from '@/api/proto'
import Title from '@/components/title'
import coin1 from '@/assets/coin-1.png'
import robotIcon from '@/assets/icon/robot-1.svg'
import plusIcon from '@/assets/icon/plus-2.svg';
import refreshIcon from '@/assets/icon/refresh-fill.svg';

import cnames from 'classnames';

const {ReqLobbyView} = proto.api;

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
      list: [
        {
          value: '美国',
          text: '美国',
          checked: false
        },
        {
          value: '中国',
          text: '中国',
          checked: true
        },
        {
          value: '巴西',
          text: '巴西',
          checked: false
        },
        {
          value: '日本',
          text: '日本',
          checked: false
        },
        {
          value: '英国',
          text: '英国',
          checked: false
        },
        {
          value: '法国',
          text: '法国',
          checked: false
        }
      ],
    }
    this.circleEle = [1,2,3,4,5,6,7];
    this.circleElePos = [{x:16,y:8},{x:70,y:-3},{x:110,y:28},{x:115,y:70},{x:80,y:105},{x:20,y:100},{x:-2,y:60}];
  }

  componentDidMount() {
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
            console.log('lobby res:', res)
            this.setState({tables: res.tables})
          })
          .catch(err => {
            console.log('lobby err:', err)
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
    }
  }

  render() {
    // const count = useSelector((state) => state.counter.value)
    // const user = useSelector((state) => state.user)

    // console.log('state', this.state)

    // return (
    //   <View className='components-page'>
    //     <Text>设置 step</Text>
    //     <Slider step={1} value={50}/>
    //     <Text>显示当前 value</Text>
    //     <Slider step={1} value={50} showValue/>
    //     <Text>设置最小/最大值</Text>
    //     <Slider step={1} value={100} showValue min={50} max={200}/>
    //   </View>
    // );

    // return (
    //   <View className='container'>
    //     {/* <Head title='Radio' /> */}
    //     <View className='page-body'>
    //       <View className='page-section'>
    //         <Text>默认样式</Text>
    //         <Radio value='选中' checked>选中</Radio>
    //         <Radio style='margin-left: 20rpx' value='未选中'>未选中</Radio>
    //       </View>
    //       <View className='page-section'>
    //         <Text>推荐展示样式</Text>
    //         <View className='radio-list'>
    //           <RadioGroup>
    //             {this.state.list.map((item, i) => {
    //               return (
    //                 <Label className='radio-list__label' for={i} key={i}>
    //                   <Radio className='radio-list__radio' value={item.value} checked={item.checked}>{item.text}</Radio>
    //                 </Label>
    //               )
    //             })}
    //           </RadioGroup>
    //         </View>
    //       </View>
    //     </View>
    //   </View>
    // );

    return (
      <View>
        <Title title={"Lobby!!"} bgColor={true} leftSolt={
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
                        src={player.robot ? robotIcon : !player.id ? plusIcon : (player.avatar || this.state.defaultAvatar)}
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
          <Button className="bottom-btn" onClick={() => navigateTo({url: '/pages/new_table/new_table'})}>Create New Table</Button>
        </View>
      </View>
    )
  }
}

export default Lobby
