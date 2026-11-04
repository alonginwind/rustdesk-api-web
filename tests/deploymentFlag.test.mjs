import test from 'node:test'
import assert from 'node:assert/strict'
import * as books from '../src/utils/peerBooks.mjs'

test('only an explicit server capability enables device address books', () => {
  assert.equal(typeof books.deviceAddressBooksEnabled, 'function')
  for (const config of [undefined, {}, { device_address_books: false }, { device_address_books: 'false' }, { device_address_books: 'true' }]) {
    assert.equal(books.deviceAddressBooksEnabled(config), false)
  }
  assert.equal(books.deviceAddressBooksEnabled({ device_address_books: true }), true)
})

test('only an explicit server capability enables team mode', () => {
  assert.equal(typeof books.teamModeEnabled, 'function')
  for (const config of [undefined, {}, { team_mode: false }, { team_mode: 'true' }, { team_mode: 1 }]) {
    assert.equal(books.teamModeEnabled(config), false)
  }
  assert.equal(books.teamModeEnabled({ team_mode: true }), true)
})
