import store from '@/store/index'

import proto from '@/api/proto';
import { fetchOpMap, fetchRouteWs } from '@/api/api'
import { getStorage, removeStorage } from '@/utils/storage';
import { redirectTo, showToast } from '@/utils/application';
import { setUserInfo } from '@/store/user'
import { connecting, connected, disconnect, setTTL } from '@/store/conn'
import { isIn } from '@/utils/collect';

const { api } = proto

const websocket = {
  conn: null,
  status: 0, // 0未初始,1打开,2已认证,3关闭,4连接中,5等待重连
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
  pingInterval: -1,
  closeConn() {
    if (this.conn) {
      const conn = this.conn;
      this.conn = null;
      conn.close();
    }
  },
  init: async function({ offset, opFail, opSuccess, opPathMap, nameOpMap }, { wsAddr }) {
    // this.status = 0;
    this.offset = offset || 0;
    this.opFail = opFail;
    this.opSuccess = opSuccess;
    this.opPathMap = opPathMap || {};
    this.nameOpMap = nameOpMap || {};
    this.wsAddr = wsAddr;
    // window.proto = proto;
    return await this.connect();
  },
  connect: function() {
    return new Promise((resolve, reject) => {
      const token = getStorage('_t');
      if (!token) {
        return reject('storage token not exists!');
      }

      store.dispatch(connecting());
      this.closeConn(); // 关闭之前连接

      const ws = new WebSocket(`ws://${this.wsAddr}/api/conn/ws`);
      this.conn = ws;
      ws.binaryType = 'arraybuffer';
      ws.onopen = e => {
        // 关闭当前定时重连 TODO handle
        // clearInterval(this.reconnectInterval);
        // this.reconnectInterval = -1;
        this.status = 1;
        // 连接后立即认证连接
        const req = api.ReqIdentity.create({ token });
        // const reqBuffer = api.ReqIdentity.encode(req).finish()
        this.send(req, res => {
          this.status = 2;
          store.dispatch(connected());
          store.dispatch(setUserInfo(res.toJSON()));
          // console.log('identity success:', res)

          // 依次发送等待连接的消息队列
          for (let i = 0; i < this.waitInitCalls.length; i++) {
            if (this.waitInitCalls[i]) {
              try {
                this.waitInitCalls[i]();
                this.waitInitCalls[i] = null;
              }catch(e) {
                showToast({title: e});
                console.log('execut wait handler error:', e);
              }
            }
          }
          resolve(res);
        }, err => {
          this.closeConn();
          store.dispatch(disconnect());
          removeStorage('_t');
          showToast({title: err});
          console.error('连接认证失败:', err);
          reject('连接认证失败:' + err);
        })
      }

      ws.onerror = e => {
        this.closeConn();
        if (this.status !== 5) {
          this.status = 3;
          clearInterval(this.reconnectInterval);
        }
        clearInterval(this.pingInterval);

        store.dispatch(disconnect());
        console.log('ws connect failed.');
        reject('ws connect failed!');
      }

      ws.onclose = e => {
        clearInterval(this.pingInterval);
        store.dispatch(disconnect());
        console.log('ws connection close.')

        if (this.status !== 5) {
          this.status = 3;
          if (this.conn === ws) {
            this.reconnectPolicy();
          }
        }
      }

      ws.onmessage = (e) => {
        const wrap = api.ProtoWrap.decode(new Uint8Array(e.data))
        // 解码响应体
        const opPath = this.opPathMap[wrap.op]
        if (!opPath) {
          console.error('unknow res op:', wrap.op)
          return
        }
        const type = proto[opPath[0]][opPath[1]];
        const res = type.decode(wrap.body)
        // const res = api.ResIdentity.decode(wrap.body)
        console.log('res msg:',  res)
        if (wrap.reqMs > 0) {
          const ttl = Date.now() - wrap.reqMs;
          store.dispatch(setTTL(ttl));
          // console.log('ping:', ttl + "ms")

          // 向后延迟10s -> ping
          if (type !== api.Pong) {
            this.runPingInterval();
          }
        }

        if (wrap.seq !== 0) {
          // 对应请求callback
          const caller = this.waitCall[wrap.seq];
          delete this.waitCall[wrap.seq];
          // console.log(waitCall, this.waitCall);
          if (caller) {
            if (wrap.op === this.opFail) {
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
        if (wrap.op === this.opFail) {
          console.error('ResFail:', res)
          showToast({title: res.code + ":" + res.msg})
          if (isIn(res.code, 401, 403)) { // 认证失败,异地登录
            setTimeout(() => redirectTo({url: '/pages/login/login'}), 1200)
          }
          return;
        }

        // 未找到消息对应handler
        console.log('not found msg handler:', wrap.op, res)
      }
    });
  },
  // 重新连接，
  reconnectPolicy() {
    if (this.status !== 3) {
      if (isIn(this.status, 4, 5)) {
        store.dispatch(connecting());
      }
      return;
    }
    this.status = 5;
    store.dispatch(connecting());
    const reconnect = async () => {
      console.log('ws reconnecting...');
      const token = getStorage('_t');
      if (!token) {
        this.status = 3
        clearInterval(this.reconnectInterval);
        this.reconnectInterval = -1;
        // 无token跳转到login
        setTimeout(() => redirectTo({url: '/pages/login/login'}), 500);
        return;
      }

      const res = await this.connect();
      console.log('reconnect success:', res);
      // this.status = 3
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = -1;

      // try {
      // }catch(err) {
      //   console.log('reconnect error:', err);
      // }
    }
    setTimeout(async () => {
      try {
        await reconnect();
      }catch(err) {
        console.log('first reconnect failed try 3s later.', err);

        // 后每3s重连下
        this.reconnectInterval = setInterval(async () => {
          try {
            await reconnect();
          }catch(err) {
            console.log('reconnect failed.', err);
          }
        }, 10000);
      }
      // 首次重连随机时长 2-6s
    }, (parseInt(Math.random() * 5) + 2) * 1000);
  },
  waitCall: {}, // 等待响应的 callback 列表
  runPingInterval() {
    clearInterval(this.pingInterval);
    this.pingInterval = setInterval(async () => {
      this.send(api.Ping.create({ms: Date.now()}),
        pong => {
          const ttl = Date.now() - pong.pingMs;
          store.dispatch(setTTL(ttl));
        },
        err => {
          console.error('ping error:', err);
        }
      );
    }, 10000);
  },
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
    const wrap = api.ProtoWrap.create({ ver: 1, op: op, seq: this.seq++, reqMs: Date.now(), body: msgBufer });
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
  // console.log('add listen...', type)
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

