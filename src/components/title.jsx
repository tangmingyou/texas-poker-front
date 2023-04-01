import React from 'react';
import cnames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import { switchMenuVisible } from '@/store/app';
import { View, Text, Image, Button } from '@tarojs/components';
// import { Menu, MenuItem } from '@nutui/nutui-react-taro';
import { navigateBack, redirectTo, showToast } from '@/utils/application';
import websocket from '@/api/websocket';
import { reqLeaveTable }  from '@/api/wsapi';
import { isIn } from '@/utils/collect';

import left from '@/assets/icon/left-1.svg';
import coinIcon from '@/assets/icon/coin-3.svg'
import './style/title.scss';
import { removeStorage } from '@/utils/storage';

function Title(props) {
  const {
      username, avatar, defaultAvatar,
     balance, status: netStatus, ttl,
     routeName, menuVisible
  } = useSelector(state => ({
    ...state.user, ...state.conn, ...state.app
  }));

  const { leftSolt, leftIcon, onLeftClick, rightSolt } = props;

  const dispatch = useDispatch();

  function reconnectNet(netStatus) {
    if (netStatus === 1) {
      console.log('reconnect net.')
      websocket.reconnectPolicy();
    }
  }

  function handleLeaveTable() {
    dispatch(switchMenuVisible())
    reqLeaveTable()
      .then(res => {
        console.log('leave', res);
        redirectTo({url: '/pages/lobby/lobby'})
      })
      .catch(err => {
        showToast({title: err})
        console.log('leave err', err)
      })
  }

  function handleLogout() {
    dispatch(switchMenuVisible())
    removeStorage('_t');
    redirectTo({url: '/pages/login/login'});
    websocket.closeConn();
  }

  return (
    <View>
      <View className={props.bgColor ? "page-top bgc" : "page-top"}>
        {/* <View className='topHeight'></View> */}
        <View className='page-title'>
          <View className="title-left">
            {leftSolt || <Image className="icon" src={leftIcon || left} onClick={onLeftClick || navigateBack} />}
            {/*1已断开,2连接中,3已连接*/}
            <View className="net-wrap" onClick={reconnectNet.bind(null, netStatus)}>
              <View className={cnames('', {
                'net-disconnect': netStatus === 1,
                'net-connecting': netStatus === 2,
                'net-connected': netStatus === 3,
                'net-connected-high': netStatus === 3 && ttl > 500,
              })}></View>
              <View className="ttl">{
                netStatus === 3 ? ttl + 'ms'
                : netStatus === 2 ? "连接中..."
                : netStatus === 1 ? "离线(点击重连)" : "未知状态"
              }</View>
            </View>
          </View>
          <View className={props.colorStyle ? "title" : "title1"}>
            <View><Text>{props.title}</Text></View>
          </View>
          <View className="title-right">
            <View className="profile">
              <View className="username"><Text >{username}</Text></View>
              <View className="balance-wrap">
                <Image src={coinIcon}  className="balance-icon"/>
                <Text className="balance">{balance}</Text>
              </View>
            </View>
            {
              rightSolt || <View className='title-avatar-wrap'>
                <View onClick={() => dispatch(switchMenuVisible())}><Image className='avatar' src={avatar || defaultAvatar} /></View>
                <View className={cnames('menus',{'menus-hide': !menuVisible})}>
                  {
                    isIn(routeName, 'table') && <View className="menu-item">
                      <Button onClick={handleLeaveTable} className="menu-item-btn">退出牌桌</Button>
                    </View>
                  }
                  {
                    isIn(routeName, 'lobby', 'new_table') && <View className="menu-item">
                      <Button onClick={handleLogout} className="menu-item-btn">退出登录</Button>
                    </View>
                  }
                </View>
              </View>
            }
          </View>
        </View>
      </View>
      {props.topNull ? '' : <View className='hidden'></View>}
    </View>
  )
}

export default Title
