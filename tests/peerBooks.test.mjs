import test from 'node:test'
import assert from 'node:assert/strict'
import { connectionAddress, bookCopyPayload } from '../src/utils/peerBooks.mjs'

test('device default is its ID unless an address override exists', () => {
  assert.equal(connectionAddress({ id: '123' }), '123')
  assert.equal(connectionAddress({ id: '123', connection_address: '100.64.0.2:21118' }), '100.64.0.2:21118')
})

test('copy uses effective address and carries device identity separately', () => {
  const peer = { row_id: 7, id: '123', connection_address: '100.64.0.2:21118', alias: 'Device' }
  const form = { user_id: 2, collection_ids: [0, 4, 4], alias: 'Book alias', id: connectionAddress(peer), tags: ['A'] }
  const result = bookCopyPayload(peer, form)
  assert.deepEqual(result.peer_ids, [7])
  assert.deepEqual(result.collection_ids, [0, 4])
  assert.equal(result.connection_address, '100.64.0.2:21118')
  assert.equal(result.alias, 'Book alias')
  assert.equal(result.user_id, 2)
  result.tags.push('B')
  assert.deepEqual(form.tags, ['A'])
  assert.equal(peer.id, '123')
})

test('per-book destination can override default without rewriting device', () => {
  const peer = { row_id: 7, id: '123', connection_address: 'default-target' }
  const result = bookCopyPayload(peer, { id: 'specific-target', collection_ids: [2], alias: 'Specific' })
  assert.equal(result.connection_address, 'specific-target')
  assert.equal(peer.connection_address, 'default-target')
})
