import axios from 'axios'
import request from '@/utils/request'

// Not through `request`: its 403 handling would show an error and reload the page.
export function logout (token) {
  return axios.post('/logout', {}, {
    baseURL: import.meta.env.VITE_SERVER_API,
    headers: { 'api-token': token },
    withCredentials: true,
    timeout: 5000,
  }).catch(() => {})
}

export function login (data) {
  return request({
    url: '/login',
    method: 'post',
    data,
  })
}

export function current () {
  return request({
    url: '/user/current',
    method: 'get',
  })
}

export function list (params) {
  return request({
    url: '/user/list',
    params,
  })
}

export function detail (id) {
  return request({
    url: `/user/detail/${id}`,
  })
}

export function create (data) {
  return request({
    url: '/user/create',
    method: 'post',
    data,
  })
}

export function update (data) {
  return request({
    url: '/user/update',
    method: 'post',
    data,
  })
}

export function remove (data) {
  return request({
    url: '/user/delete',
    method: 'post',
    data,
  })
}

export function changePwd (data) {
  return request({
    url: '/user/changePwd',
    method: 'post',
    data,
  })
}

export function changeCurPwd (data) {
  return request({
    url: '/user/changeCurPwd',
    method: 'post',
    data,
  })
}

export function myOauth () {
  return request({
    url: '/user/myOauth',
    method: 'post',
  })
}

export function myPeer (params) {
  return request({
    url: '/user/myPeer',
    params,
  })
}

export function groupUsers (data) {
  return request({
    url: '/user/groupUsers',
    method: 'post',
    data,
  })
}

export function register (data) {
  return request({
    url: '/user/register',
    method: 'post',
    data,
  })
}
