import store from '@/store/index'

import proto from '@/api/proto';
import { fetchOpMap, fetchRouteWs } from '@/api/api'
import { getStorage, removeStorage } from '@/utils/storage';
import { redirectTo, showToast } from '@/utils/application';
import { setUserInfo } from '@/store/user'
import { isIn } from '@/utils/collect';

const { api } = proto

const websocket = {
  conn: null,
  status: 0, // 0未初始,1打开,2已认证,3关闭,4连接中 TODO 未连接
  token: '',
  seq: 1, // 消息序号,递增
  offset: 0,
  opFail: 0,
  opSuccess: 0,
  opPathMap: {},
  nameOpMap: {},
  wsAddr: '',
  // 消息监听列表
  msgListener: {}, // {op: func}
  waitInitCalls: [],
  reconnectInterval: -1,
  init(token, { offset, opFail, opSuccess, opPathMap, nameOpMap }, { wsAddr }, callback) { // callback 连接失败不一定调用
    this.status = 4;
    callback = callback || (() => {});
    // 连接状态判定
    this.token = token;
    this.offset = offset || 0;
    this.opFail = opFail;
    this.opSuccess = opSuccess;
    this.opPathMap = opPathMap || {};
    this.nameOpMap = nameOpMap || {};
    this.wsAddr = wsAddr;
    // window.proto = proto;

    const ws = new WebSocket(`ws://${wsAddr}/api/conn/ws`)
    if (this.conn) {
      this.conn.close();
    }
    this.conn = ws
    console.log(this)
    ws.binaryType = 'arraybuffer'
    ws.onopen = (e) => {
      // 关闭定时重连
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = -1;

      this.status = 1;
      // 连接后立即认证连接
      const req = api.ReqIdentity.create({ token });
      // const reqBuffer = api.ReqIdentity.encode(req).finish()
      this.send(req, res => {
        this.status = 2;
        // const dispatch = useDispatch();
        // window.res = res;
        // console.log(store, setUserInfo(res))
        store.dispatch(setUserInfo(res.toJSON()));
        console.log('identity success:', res)
        try { callback(null) } catch(e) { console.error('error:', e); }

        // 依次发送等待连接的消息队列
        for (let i = 0; i < this.waitInitCalls.length; i++) {
          if (this.waitInitCalls[i]) {
            this.waitInitCalls[i]();
            this.waitInitCalls[i] = null;
          }
        }
      }, err => {
        removeStorage('_t')
        showToast({title: err})
        console.error('连接认证失败:', err)

        try { callback(err) } catch(e) { console.error('error:', e); }
      })
    }

    ws.onerror = (a, b, c) => {
      this.status = 3;
      console.log('ws error:', a, b, c)

      // this.reconnectInterval = setInterval(() => {
      //   this.reconnect();
      // }, Math.random() * 3 + 3);
    }

    ws.onclose = e => {
      this.status = 3;
      console.log('ws close', e)
      if (this.reconnectInterval < 0) {
        this.reconnectInterval = setInterval(() => {
          this.reconnect();
        }, Math.random() * 3 + 4);
      }
    }

    ws.onmessage = (e) => {
      // console.log('msg:', e.data)
      const wrap = api.ProtoWrap.decode(new Uint8Array(e.data))
      // 解码响应体
      const opPath = this.opPathMap[wrap.op]
      if (!opPath) {
        console.error('res op not exists!', wrap.op)
        return
      }
      const res = proto[opPath[0]][opPath[1]].decode(wrap.body)
      // const res = api.ResIdentity.decode(wrap.body)
      console.log('res msg:',  res)
      if (wrap.seq !== 0) {
        // 对应请求callback
        const caller = this.waitCall[wrap.seq];
        delete this.waitCall[wrap.seq];
        // console.log(waitCall, this.waitCall);
        if (caller) {
          if (wrap.op === opFail) {
            if (res.code === 401) { // 重新登录
              setTimeout(() => redirectTo({url: '/pages/login/login'}), 500);
            }
            caller.onFail(res, wrap);
          } else {
            caller.onRes(res, wrap);
          }
          return;
        }
      }
      // 找消息类型的listen执行
      const listener = this.msgListener[wrap.op];
      if (listener) {
        listener(res);
        return;
      }
      // 错误消息,提示一下
      if (wrap.op === opFail) {
        console.error('ResFail:', res)
        showToast({title: res.code + ":" + res.msg})
        if (isIn(res.code, 401, 403)) { // 认证失败,异地登录
          setTimeout(() => redirectTo({url: '/pages/login/login'}), 1200)
        }
        return;
      }

      console.log('no handler msg:', wrap.op, res)
    }
  },
  // 重新连接，
  reconnect() {
    if (this.status === 4) {
      return;
    }
    console.log('ws reconnecting...');
    // TODO store 状态
    this.init(this.token, this, this, err => {
      console.log('reconnect end:', err)
    });
  },
  waitCall: {}, // 等待响应的 callback 列表
  send(msg, resCall, errCall) {
    window.msg = msg;
    // 不是认证消息且连接未认证，将请求放到等待队列
    if (msg.__proto__.constructor !== api.ReqIdentity && this.status !== 2) {
      this.waitInitCalls.push(() => this.send(msg, resCall, errCall));
      return;
    }
    // 序列化请求消息...
    let typeUrl = msg.constructor.getTypeUrl();
    const idx = typeUrl.lastIndexOf("/");
    typeUrl = idx === -1 ? typeUrl : typeUrl.substring(idx + 1);
    const op = this.nameOpMap[typeUrl];
    console.log('req', typeUrl, op);
    const msgBufer = msg.constructor.encode(msg).finish();
    const wrap = api.ProtoWrap.create({ ver: 1, op: op, seq: this.seq++, body: msgBufer });
    const wrapBuffer = api.ProtoWrap.encode(wrap).finish();
    this.conn.send(wrapBuffer);
    if (resCall) {
      this.waitCall[wrap.seq] = {
        seq: wrap.seq,
        onRes: resCall,
        onFail: errCall,
      }
    }
    // 定时检查是否超时...
  },
}

export default websocket

export const addMsgListen = (type, call) => {
  if (websocket.status !== 2) {
    websocket.waitInitCalls.push(() => addMsgListen(type, call));
    return;
  }
  console.log('add listen...', type)
  const op = websocket.nameOpMap[type];
  if (op === undefined) {
    console.error(`not found listen msg type [${type}] for all type:`, websocket.nameOpMap);
    return;
  }
  websocket.msgListener[op] = call;
}

// 监听消息类型
export const removeMsgListener = type => {
  if (websocket.status !== 2) {
    websocket.waitInitCalls.push(() => removeMsgListener(type));
    return;
  }
  const op = websocket.nameOpMap[type];
  if (op === undefined) {
    console.error(`when remove, not found listen msg type [${type}] for all type:`, websocket.nameOpMap);
    return -1;
  }
  websocket.msgListener[op] = null;
}

export const sendPromise = function(msg) {
  return new Promise((resolve, reject) => {
    websocket.send(msg, resolve, reject)
  })
}

// ;(async function() {
//   // const token = "15PohpTztq4YkMmErI4H71kJWX2pPqnvOZar9HKOfg1KEy0fd8fUNxnBIwuMDcKQEBPG7b9UC7ja_8FtwvYjnA=="
//   const token = getStorage('_t')
//   if (!token) {
//     return;
//   }
//   // console.log('token', token)
//   const [opMap, wsRes] = await Promise.all([fetchOpMap(), fetchRouteWs()]);
//   websocket.init(token, opMap.data, wsRes.data);

//   window.websocket = websocket;
// })()

