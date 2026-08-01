import request from '@/utils/request'

export function list (params) {
  return request({
    url: '/peer_strategy/list',
    params,
  })
}

export function detail (id) {
  return request({
    url: `/peer_strategy/detail/${id}`,
  })
}

export function create (data) {
  return request({
    url: '/peer_strategy/create',
    method: 'post',
    data,
  })
}

export function update (data) {
  return request({
    url: '/peer_strategy/update',
    method: 'post',
    data,
  })
}

export function remove (data) {
  return request({
    url: '/peer_strategy/delete',
    method: 'post',
    data,
  })
}

export function getDefault () {
  return request({
    url: '/peer_strategy/default',
  })
}

export function updateDefault (data) {
  return request({
    url: '/peer_strategy/default/update',
    method: 'post',
    data,
  })
}
