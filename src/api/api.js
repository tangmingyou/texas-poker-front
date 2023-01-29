import { get, post } from '@/api/http'

export const doLogin = params => post('/api/auth/authorize', params)

export const fetchOpMap = () => get('/api/conn/opMap')

export const fetchLobbyView = () => get('/api/game/lobby')
