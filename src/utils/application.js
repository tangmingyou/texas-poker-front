import Taro, { getCurrentInstance as taroInstance } from '@tarojs/taro'

// 滚动条置顶
function returnTop() {
  var ele = document.querySelector('.taro-tabbar__panel')
  // console.log(ele.scrollTop)
  if (ele) {
    ele.scrollTop = 0
  }
}

// 获取当前实例对象，官方文档建议只获取一次
export const getInstance = (function () {
  let $router = null;
  return function () {
    if (!$router) {
      $router = taroInstance();
    }
    return $router;
  }
}());

// 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面 https://taro-docs.jd.com/taro/docs/apis/route/switchTab
export const switchTab = function(option) {
  returnTop()
  return Taro.reLaunch(option);
}

// 关闭所有页面，打开到应用内的某个页面
export const reLaunch = function(option) {
  returnTop()
  return Taro.reLaunch(option);
}

// 关闭当前页面，跳转到应用内的某个页面。但是不允许跳转到 tabbar 页面
export const redirectTo = function(option) {
  returnTop()
  return Taro.redirectTo(option);
}

// 保留当前页面，跳转到应用内的某个页面。但是不能跳到 tabbar 页面。使用 Taro.navigateBack 可以返回到原页面。小程序中页面栈最多十层
export const navigateTo = function(option) {
  returnTop()
  return Taro.navigateTo(option);
}

// 返回之前的页面，如果跳转层数大于路由堆栈
export const navigateBack = function(option = {delta: 1}) {
  const pages = Taro.getCurrentPages();
  console.log('default back', pages)
  if (option.delta > pages.length - 1) {
    return Taro.redirectTo({url: option.url || '/pages/lobby/lobby'});
  }
  return Taro.navigateBack(option);
}

export const showToast = function(option = {title: '', icon: 'none'}) {
  let {title} = option
  if (!title) { return }
  title = typeof(title) === 'string' ? title : title.msg || title.message;
  if (!title) {
    console.log('no title toast:', option.title)
    return
  }
  option.title = title
  option.icon = option.icon || 'none';
  Taro.showToast(option)
}
