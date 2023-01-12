import { api } from '@/api/proto'
import { showRedPackage } from '@tarojs/taro-h5';

const websocket = {
  conn: null,
  opMap: {},
  state: 0, // 0未初始,1打开,2关闭
  seq: 1, // 消息序号
  init(token, opMap) {
    if (opMap) {
      this.opMap = opMap;
    }
    // websocket test
    const ws = new WebSocket("ws://localhost:9999/api/conn/ws")
    this.conn = ws
    console.log(this)
    ws.binaryType = 'arraybuffer'
    ws.onopen = (e) => {
      // 连接后立即认证连接
      const req = api.ReqIdentity.create({ token })
      // const reqBuffer = api.ReqIdentity.encode(req).finish()
      this.send(req)
    }
    ws.onmessage = (e) => {
      console.log('msg:', e.data)
      const wrap = api.ProtoWrap.decode(new Uint8Array(e.data))
      const res = api.ResIdentity.decode(wrap.body)
      if (wrap.seq !== 0) {
        // 对应请求callback
        const waitCall = this.waitCall[wrap.req]
        if (waitCall) {
          waitCall.onRes(res)
          return;
        }
      }
      // 找消息类型的listen执行
      const listener = this.msgListener[wrap.op]
      if (listener) {
        listener(res)
      }
      // console.log(wrap.op, res)
    }
    ws.onerror = (a, b, c) => {
      console.log('error:', a, b, c)
    }
    ws.onclose = e => {
      console.log('close', e)
    }
  },

  waitCall: {}, // 等待响应的 callback 列表
  send(msg, resCall, errCall) {
    const msgBufer = msg.constructor.encode(msg).finish();
    const wrap = api.ProtoWrap.create({ ver: 1, op: 13578 + 3, seq: this.seq++, body: msgBufer });
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
