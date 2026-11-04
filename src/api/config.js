import request from '@/utils/request'

export function server () {
  return request({
    url: '/config/server',
    method: 'get',
  })
}

export function app () {
  return request({
    url: '/config/app',
    method: 'get',
  })
}

export function admin () {
  return request({
    url: '/config/admin',
    method: 'get',
  })
}

export function sessionPolicy () {
  return request({ url: '/config/session-policy', method: 'get' })
}

export function saveSessionPolicy (data) {
  return request({ url: '/config/session-policy', method: 'post', data })
}
