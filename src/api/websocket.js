import proto from '@/api/proto';
import { fetchOpMap } from '@/api/api'
import { getStorage } from '@/utils/storage';
import { showToast } from '@/utils/application';

const { api } = proto

const websocket = {
  conn: null,
  status: 0, // 0未初始,1打开,2已认证,3关闭 TODO 未连接,连接中 方法等待队列
  seq: 1, // 消息序号
  offset: 0,
  opFail: 0,
  opSuccess: 0,
  opPathMap: {},
  nameOpMap: {},
  // 消息监听列表
  msgListener: {}, // {op: func}
  waitInitCalls: [],
  init(token, { offset, opFail, opSuccess, opPathMap, nameOpMap }) {

    // TODO 连接状态判定
    this.offset = offset || 0;
    this.opFail = opFail;
    this.opSuccess = opSuccess;
    this.opPathMap = opPathMap || {};
    this.nameOpMap = nameOpMap || {};
    // window.proto = proto;
    // websocket test

    const ws = new WebSocket("ws://localhost:9999/api/conn/ws")
    this.conn = ws
    console.log(this)
    ws.binaryType = 'arraybuffer'
    ws.onopen = (e) => {
      this.status = 1;
      // 连接后立即认证连接
      const req = api.ReqIdentity.create({ token })
      // const reqBuffer = api.ReqIdentity.encode(req).finish()
      this.send(req, res => {
        this.status = 2;
        console.log('identity success:', res)

        // 依次发送等待连接的消息队列
        for (let i = 0; i < this.waitInitCalls.length; i++) {
          if (this.waitInitCalls[i]) {
            this.waitInitCalls[i]();
            this.waitInitCalls[i] = null;
          }
        }
      }, err => {
        showToast({title: err})
        console.error('连接认证失败:', err)
      })
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
      console.log('no handler msg:', wrap.op, res)
    }

    ws.onerror = (a, b, c) => {
      this.status = 3;
      console.log('ws error:', a, b, c)
      // var interval = setInterval(() => {
      //   this.reconnect();
      // }, Math.random() * 3);
    }

    ws.onclose = e => {
      this.status = 3;
      console.log('ws close', e)
    }
  },
  reconnect() {

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

;(async function() {
  // const token = "15PohpTztq4YkMmErI4H71kJWX2pPqnvOZar9HKOfg1KEy0fd8fUNxnBIwuMDcKQEBPG7b9UC7ja_8FtwvYjnA=="
  const token = getStorage('_t')
  if (!token) {
    return;
  }
  // console.log('token', token)
  const opMap = await fetchOpMap()
  websocket.init(token, opMap.data)

  window.websocket = websocket;
})()

