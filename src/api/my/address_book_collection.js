import request from '@/utils/request'

export function list_shared (params) {
  return request({
    url: '/my/address_book_collection/list_shared',
    params,
  })
}

export function list (params) {
  return request({
    url: '/my/address_book_collection/list',
    params,
  })
}

export function create (data) {
  return request({
    url: '/my/address_book_collection/create',
    method: 'post',
    data,
  })
}

export function update (data) {
  return request({
    url: '/my/address_book_collection/update',
    method: 'post',
    data,
  })
}

export function remove (data) {
  return request({
    url: '/my/address_book_collection/delete',
    method: 'post',
    data,
  })
}

