import { sendPromise } from './websocket'
import { api } from './proto'

export const aa = msg => sendPromise(msg)

// 大厅桌面预览
export const reqLobbyView = () => sendPromise(api.ReqLobbyView.create());

export const reqGameFullStatus = () => sendPromise(api.ReqGameFullStatus.create({}));

export const reqJoinTable = tableNo => sendPromise(api.ReqJoinTable.create({tableNo}));

export const reqKickOutTable = playerId => sendPromise(api.ReqKickOutTable.create({playerId}));
