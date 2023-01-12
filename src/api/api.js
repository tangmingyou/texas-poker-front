import { get, post } from '@/api/http'

export const login = params => post('/api/auth/authorize', params)

export const fetchOpMap = () => get('/api/conn/opMap')
