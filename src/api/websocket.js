import proto from '@/api/proto';
import { fetchOpMap } from '@/api/api'

const { api } = proto

const websocket = {
  conn: null,
  state: 0, // 0未初始,1打开,2关闭
  seq: 1, // 消息序号
  offset: 0,
  opFail: 0,
  opSuccess: 0,
  opPathMap: {},
  nameOpMap: {},
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
      // 连接后立即认证连接
      const req = api.ReqIdentity.create({ token })
      // const reqBuffer = api.ReqIdentity.encode(req).finish()
      this.send(req, res => {
        console.log('call1:', res)
      }, err => {
        console.log('call2:', err)
      })
    }
    ws.onmessage = (e) => {
      console.log('msg:', e.data)
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
        const waitCall = this.waitCall[wrap.seq];
        delete this.waitCall[wrap.seq];
        // console.log(waitCall, this.waitCall);
        if (waitCall) {
          if (wrap.op === opFail) {
            waitCall.onFail(res, wrap);
          } else {
            waitCall.onRes(res, wrap);
          }
          return;
        }
      }
      // 找消息类型的listen执行
      const listener = this.msgListener[wrap.op];
      if (listener) {
        listener(res)
        return;
      }
      console.log('no handler msg:', wrap.op, res)
    }
    ws.onerror = (a, b, c) => {
      console.log('error:', a, b, c)
      // var interval = setInterval(() => {
      //   this.reconnect();
      // }, Math.random() * 3);
    }
    ws.onclose = e => {
      console.log('close', e)
    }
  },
  reconnect() {

  },
  waitCall: {}, // 等待响应的 callback 列表
  send(msg, resCall, errCall) {
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
        onError: errCall,
      }
    }
    // 定时检查是否超时...
  },

  msgListener: {},
  // 监听消息类型
  listen(type, call) {

  },
}

export default websocket

export const sendPromise = function(msg) {
  return new Promise((resolve, reject) => {
    websocket.send(msg, resolve, reject)
  })
}

;(async function() {
  const token = "15PohpTztq4YkMmErI4H71kJWX2pPqnvOZar9HKOfg1KEy0fd8fUNxnBIwuMDcKQEBPG7b9UC7ja_8FtwvYjnA=="
  const opMap = await fetchOpMap()
  websocket.init(token, opMap.data)
})()

