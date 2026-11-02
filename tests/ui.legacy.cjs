// Contract test for opt-out, missing capability (old backend), and config errors.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')

;(async () => {
  const browser = await chromium.launch({ headless: true })
  try {
    for (const mode of ['disabled', 'missing', 'error']) {
      const context = await browser.newContext({ viewport: { width: 1550, height: 1000 } })
      await context.addInitScript(() => { localStorage.setItem('access_token', 'synthetic-browser-test'); localStorage.setItem('lang', 'ru') })
      const requests = [], errors = [], writes = []
      const peer = { row_id: 7, id: '123456789', connection_address: 'must-be-ignored', hostname: 'legacy-device', username: 'fixture-user', os: 'windows', alias: 'Legacy alias', last_online_time: Math.floor(Date.now()/1000), book_memberships: [{alias: 'Must be hidden', collection_name:'Book A'}] }
      await context.route('**/api/admin/**', async route => {
        const req = route.request(), endpoint = new URL(req.url()).pathname.replace('/api/admin', '')
        requests.push(endpoint)
        if (req.method() === 'POST') writes.push({endpoint, body: req.postDataJSON()})
        let data = {}
        if (endpoint === '/user/current') data = {username:'fixture-owner',is_admin:true,route_names:['*'],token:'synthetic-browser-test'}
        else if (endpoint === '/config/app') {
          if (mode === 'error') { await route.fulfill({status:503, json:{message:'Synthetic unavailable'}}); return }
          // Delay loading to catch an enhanced component mounted before configuration.
          await new Promise(resolve => setTimeout(resolve, 100))
          data = mode === 'missing' ? {web_client:0} : {web_client:0,device_address_books:false}
        }
        else if (endpoint === '/config/admin') data = {title:'Legacy contract',hello:''}
        else if (endpoint === '/config/server') data = {id_server:'',key:'',api_server:''}
        else if (endpoint === '/user/list') data = {list:[{id:1,username:'fixture-owner'}],total:1}
        else if (endpoint.endsWith('/peer/list')) data = {list:[peer],total:1}
        else if (endpoint.endsWith('/address_book_collection/list')) data = {list:[{id:1,name:'Book A'}],total:1}
        else if (endpoint.endsWith('/address_book/list')) data = {list:[{row_id:1,id:'legacy-target',peer_row_id:7,alias:'Contact',hostname:'legacy-device',platform:'Windows',tags:[],user_id:1,collection_id:1}],total:1}
        else data = {list:[],total:0}
        await route.fulfill({json:{code:0,message:'success',data}})
      })
      const page = await context.newPage()
      page.on('pageerror',e => errors.push(e.message))
      const url = process.env.UI_URL || 'http://127.0.0.1:18888'
      await page.goto(url+'/#/user/peer')
      await page.getByText('legacy-device',{exact:true}).waitFor()
      assert.equal(await page.getByText('must-be-ignored',{exact:true}).count(),0)
      assert.equal(await page.getByText('Must be hidden',{exact:true}).count(),0)
      await page.getByRole('button',{name:'Добавить в адресную книгу',exact:true}).first().click()
      let dialog = page.getByRole('dialog').filter({has:page.getByLabel('ID',{exact:true})})
      await dialog.waitFor()
      assert.equal(await dialog.getByLabel('ID',{exact:true}).inputValue(),'123456789')
      assert.equal(await dialog.getByLabel('ID',{exact:true}).isDisabled(),true)
      await dialog.getByLabel('Псевдоним',{exact:true}).fill('Legacy contact')
      await dialog.locator('.el-select').first().click()
      await page.locator('.el-select-dropdown:visible').getByText('Book A',{exact:true}).click()
      await Promise.all([page.waitForResponse(r => r.url().endsWith('/batchCreate')), dialog.getByRole('button',{name:'Отправить',exact:true}).click()])
      assert.equal(writes[0].body.id,'123456789')
      assert.equal(writes[0].body.collection_id,1)
      assert.equal(writes[0].body.collection_ids,undefined)
      await page.goto(url+'/#/my/peer')
      await page.getByText('legacy-device',{exact:true}).waitFor()
      assert.equal(await page.getByText('must-be-ignored',{exact:true}).count(),0)
      await page.goto(url+'/#/my/address_book')
      await page.getByText('legacy-target',{exact:true}).waitFor()
      const peerCallsBefore = requests.filter(p => p.endsWith('/peer/list')).length
      await page.getByRole('button',{name:'Редактировать',exact:true}).first().click()
      dialog = page.getByRole('dialog').filter({has:page.getByLabel('ID',{exact:true})})
      await dialog.waitFor()
      assert.equal(await dialog.getByText('Связанное устройство',{exact:true}).count(),0)
      assert.equal(requests.filter(p => p.endsWith('/peer/list')).length,peerCallsBefore,'legacy contact form must not load association inventory')
      assert.equal(requests.filter(p => p.endsWith('/connectionAddress')).length,0)
      assert.deepEqual(errors,[])
      await context.close()
      console.log(JSON.stringify({mode,legacy:true,single_book:true,advanced_writes:0,page_errors:0}))
    }
  } finally { await browser.close() }
})().catch(err => {console.error(err);process.exitCode=1})
