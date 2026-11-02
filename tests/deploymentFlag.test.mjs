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
