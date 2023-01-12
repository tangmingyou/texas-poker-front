import React, { Component, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'

import { useSelector, useDispatch } from 'react-redux'

import './lobby.scss'
import { increment } from '@/store/index'
import { fetchOpMap } from '@/api/api'
import Title from '@/components/title'

// class Lobby extends Component {
//     constructor(props) {
//         super(props)
//         console.log('lobby', props)
//     }
//     render() {
//         return (
//             <View>
//                 <Text>Lobby!!</Text>
//                 <Button>increment</Button>
//             </View>
//         )
//     }
// }

function Lobby() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  fetchOpMap()
    .then(res => { console.log(res) })
    .catch(err => console.log(err))

  return (
    <View>
      <Title title="Lobby" bgColor={true}  />
      <Text>Lobby!! {count}</Text>
      <Button type="primary" onClick={() => dispatch(increment())}>increment</Button>
    </View>
  )
}

export default Lobby
