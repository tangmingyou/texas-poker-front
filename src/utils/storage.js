import Taro from '@tarojs/taro'

export function setStorage(key, value){
    // return  localStorage.setItem('user_token', token)
    try {
       return Taro.setStorageSync(key, value)
    } catch (e) { }
}

export function getStorage(key){
    // return localStorage.getItem('user_token')
    try {
        return Taro.getStorageSync(key)
    } catch (e) {
    // Do something when catch error
    }
}

export function removeStorage(key){
    try {
        return Taro.removeStorageSync(key)
    } catch (e) {
    }
}
