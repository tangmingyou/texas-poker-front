import React from 'react';
import cnames from 'classnames';
import { useSelector } from 'react-redux';
import { View, Text, Image } from '@tarojs/components';
import { Menu, MenuItem } from '@nutui/nutui-react-taro';
import { navigateBack } from '@/utils/application';
import left from '@/assets/icon/left-1.svg';
import './style/title.scss';

import coinIcon from '@/assets/icon/coin-3.svg'

function Title(props) {
  const {username, nickname, avatar, defaultAvatar, balance, status: netStatus, ttl} = useSelector(state => ({
    ...state.user, ...state.conn
  }));
  const { leftSolt, leftIcon, onLeftClick, rightSolt } = props;
  return (
    <View>
      <View className={props.bgColor ? "page-top bgc" : "page-top"}>
        {/* <View className='topHeight'></View> */}
        <View className='page-title'>
          <View className="title-left">
            {leftSolt || <Image className="icon" src={leftIcon || left} onClick={onLeftClick || navigateBack} />}
            {/*1已断开,2连接中,3已连接*/}
            <View className="net-wrap">
              <View className={cnames('', {
                'net-disconnect': netStatus === 1,
                'net-connecting': netStatus === 2,
                'net-connected': netStatus === 3,
                'net-connected-high': netStatus === 3 && ttl > 500,
              })}></View>
              <View className="ttl">{ttl + 'ms'}</View>
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
                <Image className='avatar' src={avatar || defaultAvatar} />
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
