// Synthetic contract test. Does not use a production account or server.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const path = require('node:path')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1550, height: 1000 } })
  const page = await context.newPage()
  const errors = []
  const copies = []
  const bookEdits = []
  const books = [
    { row_id: 1, peer_row_id: 7, id: 'target-a', user_id: 1, collection_id: 1, alias: 'Псевдоним А', tags: [], platform: 'Windows', hostname: 'fixture-device', collection: { id: 1, name: 'Книга А' } },
    { row_id: 2, peer_row_id: 7, id: 'target-b', user_id: 1, collection_id: 2, alias: 'Псевдоним Б', tags: [], platform: 'Windows', hostname: 'fixture-device', collection: { id: 2, name: 'Книга Б' } },
  ]
  let address = 'fixture-target'
  let hideMyDevices = false
  page.on('pageerror', e => errors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.addInitScript(() => { localStorage.setItem('access_token', 'synthetic-browser-test'); localStorage.setItem('lang', 'ru') })
  await page.route('**/api/admin/**', async route => {
    const req = route.request()
    const endpoint = new URL(req.url()).pathname.replace('/api/admin', '')
    let data = {}
    const peer = { row_id: 7, id: '123456', user_id: 1, connection_address: address, hostname: 'fixture-device', username: 'fixture-user', os: 'windows', alias: 'System name', last_online_time: Math.floor(Date.now() / 1000), book_memberships: [
      { row_id: 1, user_id: 1, collection_id: 1, collection_name: 'Книга А', alias: 'Псевдоним А', connection_address: 'target-a' },
      { row_id: 2, user_id: 1, collection_id: 2, collection_name: 'Книга Б', alias: 'Псевдоним Б', connection_address: 'target-b' },
    ] }
    if (endpoint === '/user/current') data = { username: 'fixture-owner', is_admin: true, route_names: ['*'], token: 'synthetic-browser-test' }
    else if (endpoint === '/config/admin') data = { title: 'RustDesk — тест разработки', hello: '' }
    else if (endpoint === '/config/app') data = { web_client: 0 }
    else if (endpoint === '/config/server') data = { id_server: '', key: '', api_server: '' }
    else if (endpoint === '/user/list') data = { list: [{ id: 1, username: 'fixture-owner' }], total: 1 }
    else if (endpoint.endsWith('/peer/list')) data = { list: hideMyDevices && endpoint.startsWith('/my/') ? [] : [peer], total: hideMyDevices && endpoint.startsWith('/my/') ? 0 : 1 }
    else if (endpoint.endsWith('/peer/connectionAddress')) address = req.postDataJSON().connection_address
    else if (endpoint.endsWith('/address_book_collection/list')) data = { list: [{ id: 1, name: 'Книга А' }, { id: 2, name: 'Книга Б' }], total: 2 }
    else if (endpoint.endsWith('/batchCreateFromPeers')) copies.push(req.postDataJSON())
    else if (endpoint.endsWith('/address_book/list')) data = { list: books, total: books.length }
    else if (endpoint.endsWith('/address_book/update')) {
      const edit = req.postDataJSON(); bookEdits.push(edit)
      Object.assign(books.find(b => b.row_id === edit.row_id), edit)
    }
    else data = { list: [], total: 0 }
    await route.fulfill({ json: { code: 0, message: 'success', data } })
  })
  try {
    await page.goto((process.env.UI_URL || 'http://127.0.0.1:18888') + '/#/user/peer')
    await page.getByText('Псевдоним А', { exact: true }).waitFor()
    assert.equal(await page.getByText('Псевдоним Б', { exact: true }).count(), 1)
    await page.getByRole('button', { name: 'Редактировать', exact: true }).first().click()
    let dialog = page.getByRole('dialog').filter({ hasText: 'Адрес подключения' })
    await dialog.locator('input:not([disabled])').fill('new-device-default')
    await dialog.getByRole('button', { name: 'Сохранить', exact: true }).click()
    await page.getByText('new-device-default', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Добавить в адресную книгу', exact: true }).first().click()
    dialog = page.getByRole('dialog').filter({ hasText: 'RustDesk ID' })
    const editable = dialog.locator('input:not([disabled])')
    assert.equal(await editable.nth(2).inputValue(), 'new-device-default')
    // Select both books in the multiselect, leaving the owner selection intact.
    await dialog.locator('.el-select').nth(1).click()
    await page.locator('.el-select-dropdown:visible').getByText('Книга А', { exact: true }).click()
    await page.locator('.el-select-dropdown:visible').getByText('Книга Б', { exact: true }).click()
    await dialog.locator('input:not([disabled])').last().click()
    await Promise.all([page.waitForResponse(r => r.url().endsWith('/batchCreateFromPeers')), dialog.getByRole('button', { name: 'Добавить в адресную книгу', exact: true }).click()])
    assert.deepEqual(copies[0].collection_ids, [1, 2])
    assert.equal(copies[0].connection_address, 'new-device-default')
    assert.deepEqual(copies[0].peer_ids, [7])
    await page.goto((process.env.UI_URL || 'http://127.0.0.1:18888') + '/#/my/peer')
    await page.getByText('Псевдоним А', { exact: true }).waitFor()
    assert.equal(await page.getByText('Псевдоним Б', { exact: true }).count(), 1)
    await page.screenshot({ path: path.join(process.env.UI_EVIDENCE || '.', 'my-devices.png'), fullPage: true })
    await page.getByRole('button', { name: 'Добавить в адресную книгу', exact: true }).first().click()
    dialog = page.getByRole('dialog').filter({ hasText: 'RustDesk ID' })
    assert.equal(await dialog.locator('.el-select').count(), 1, 'personal form must not select another owner')
    await dialog.locator('.el-select').click()
    await page.locator('.el-select-dropdown:visible').getByText('Моя адресная книга', { exact: true }).click()
    await dialog.locator('input:not([disabled])').last().click()
    await Promise.all([page.waitForResponse(r => r.url().endsWith('/batchCreateFromPeers')), dialog.getByRole('button', { name: 'Добавить в адресную книгу', exact: true }).click()])
    assert.deepEqual(copies[1].collection_ids, [0])
    assert.equal(copies[1].connection_address, 'new-device-default')
    hideMyDevices = true // A linked contact may refer to an unbound/shared device.
    await page.goto((process.env.UI_URL || 'http://127.0.0.1:18888') + '/#/my/address_book')
    await page.getByText('target-a', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Редактировать', exact: true }).first().click()
    dialog = page.getByRole('dialog').filter({ hasText: 'Связанное устройство' })
    await dialog.getByText('fixture-device', { exact: true }).waitFor()
    await dialog.getByLabel('Адрес подключения', { exact: true }).fill('book-only-target')
    await Promise.all([page.waitForResponse(r => r.url().endsWith('/address_book/update')), dialog.getByRole('button', { name: 'Отправить', exact: true }).click()])
    assert.equal(bookEdits[0].peer_row_id, 7)
    assert.equal(books[0].id, 'book-only-target')
    assert.equal(books[1].id, 'target-b')
    assert.equal(address, 'new-device-default')
    assert.deepEqual(errors, [])
    console.log(JSON.stringify({ status: 'pass', synthetic: true, aliases: 2, books_selected: 2, address_edit: true, my_devices: true, personal_copy: true, independent_book_address: true, page_errors: errors }))
  } catch (err) {
    await page.screenshot({ path: path.join(process.env.UI_EVIDENCE || '.', 'failure.png'), fullPage: true })
    throw err
  } finally { await browser.close() }
})().catch(err => { console.error(err); process.exitCode = 1 })
