import { sendPromise } from './websocket'
import { api } from './proto'

export const aa = msg => sendPromise(msg)

export const reqCreateTable = ({players, robots, texasType, bigBlind}) =>
  sendPromise(api.ReqCreateTable.create({players, robots, texasType, bigBlind}));

// 大厅桌面预览
export const reqLobbyView = () => sendPromise(api.ReqLobbyView.create());

export const reqGameFullStatus = () => sendPromise(api.ReqGameFullStatus.create({}));

export const reqJoinTable = tableNo => sendPromise(api.ReqJoinTable.create({tableNo}));

export const reqKickOutTable = playerId => sendPromise(api.ReqKickOutTable.create({playerId}));

export const reqLeaveTable = () => sendPromise(api.ReqLeaveTable.create());

// 准备
export const reqReadyStart = () => sendPromise(api.ReqReadyStart.create());
// 取消准备
export const reqCancelReady = () => sendPromise(api.ReqCancelReady.create());
// 解散
export const reqDismissGameTable = () => sendPromise(api.ReqDismissGameTable.create());
// 开始牌局
export const reqGameStart = () => sendPromise(api.ReqGameStart.create());
// 玩家下注
export const reqBetting = (betType, betChip) => sendPromise(api.ReqBetting.create({betType, betChip}));

// 账户余额
export const reqAccountBalance = () => sendPromise(api.ReqAccountBalance.create({}));
